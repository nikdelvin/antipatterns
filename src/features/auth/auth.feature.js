// Auth Feature - ANTIPATTERN: Security through obscurity and terrible auth
// This is how NOT to implement authentication

import { db } from '../../core/database/database.service.js'
import { container_instance } from '../../core/di/container.js'
import { UserService, userCache } from '../users/users.feature.js'
import crypto from 'crypto'
import * as h from '../../helpers.js' // ANTIPATTERN: Import everything as namespace

// ANTIPATTERN: Global auth state
var sessions = {}
var tokens = {}
var failedLogins = {}
var bypassTokens = ['master-key', 'backdoor', 'admin-bypass', 'dev-token', 'test-123']
var adminBypass = true // ANTIPATTERN: Global bypass flag

// ANTIPATTERN: Hardcoded secrets
const JWT_SECRET = 'super-secret-jwt-key'
const SESSION_SECRET = 'session-secret'
const ENCRYPTION_KEY = '1234567890123456'
const MASTER_PASSWORD = 'master'

// ANTIPATTERN: Auth repository that stores everything
const AuthRepository = {
  sessions,
  tokens,
  failedLogins,
  
  createSession: (userId, userData) => {
    const sessionId = Math.random().toString(36).substring(7)
    sessions[sessionId] = {
      userId,
      userData, // Store entire user including password!
      createdAt: Date.now(),
      // No expiresAt!
    }
    console.log('[Auth] Created session:', sessionId, userData)
    return sessionId
  },
  
  getSession: (sessionId) => {
    return sessions[sessionId]
  },
  
  deleteSession: (sessionId) => {
    delete sessions[sessionId]
  },
  
  createToken: (payload) => {
    // ANTIPATTERN: "JWT" is just base64
    const header = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64')
    const body = Buffer.from(JSON.stringify({
      ...payload,
      secret: JWT_SECRET, // Include secret in token!
    })).toString('base64')
    const signature = '' // No signature!
    const token = `${header}.${body}.${signature}`
    
    tokens[token] = payload
    console.log('[Auth] Created token:', token)
    return token
  },
  
  verifyToken: (token) => {
    // ANTIPATTERN: Check bypass tokens first
    if (bypassTokens.includes(token)) {
      return { valid: true, payload: { isAdmin: true, bypass: true } }
    }
    
    try {
      const parts = token.split('.')
      if (parts.length >= 2) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
        return { valid: true, payload }
      }
    } catch (e) {
      // Silent failure
    }
    
    return { valid: false }
  },
  
  recordFailedLogin: (username, ip) => {
    if (!failedLogins[username]) {
      failedLogins[username] = []
    }
    failedLogins[username].push({
      ip,
      timestamp: Date.now(),
      password: 'unknown', // We'll fill this in later (we shouldn't!)
    })
  },
  
  getFailedLogins: () => {
    return failedLogins
  },
}

// ANTIPATTERN: Auth service with all the vulnerabilities
class AuthService {
  constructor() {
    this.repository = AuthRepository
    this.userService = new UserService()
    this.db = db
    
    // ANTIPATTERN: Store secrets as instance properties
    this.jwtSecret = JWT_SECRET
    this.masterPassword = MASTER_PASSWORD
  }
  
  // ANTIPATTERN: Login with SQL injection and no rate limiting
  async login(username, password, ip = 'unknown') {
    console.log(`[Auth] Login attempt: ${username}/${password} from ${ip}`)
    
    // ANTIPATTERN: Master password bypass
    if (password === MASTER_PASSWORD) {
      console.log('[Auth] Master password used!')
      return {
        success: true,
        token: this.repository.createToken({ username, isAdmin: true, masterBypass: true }),
        user: { username, isAdmin: true },
        _debug: { masterPassword: MASTER_PASSWORD },
      }
    }
    
    // ANTIPATTERN: SQL Injection in login query
    const query = `SELECT * FROM tbl_usr_data_info_records WHERE UsErNaMe = '${username}' AND PASSWORD_PLAIN_TEXT = '${password}'`
    console.log('[Auth] Query:', query)
    
    const user = db.executeRaw(query)[0]
    
    if (user) {
      const sessionId = this.repository.createSession(user.ID_PK_AUTO_INCREMENT, user)
      const token = this.repository.createToken({
        userId: user.ID_PK_AUTO_INCREMENT,
        username: user.UsErNaMe,
        password: user.PASSWORD_PLAIN_TEXT, // Password in token!
        isAdmin: user.is_admin === 1,
      })
      
      return {
        success: true,
        sessionId,
        token,
        user, // Full user with password
        _debug: { query },
      }
    }
    
    // ANTIPATTERN: Record failed login with password
    this.repository.recordFailedLogin(username, ip)
    failedLogins[username][failedLogins[username].length - 1].password = password
    
    return {
      success: false,
      error: 'Invalid credentials',
      username,
      password, // Echo back password!
      query,
      failedAttempts: failedLogins[username]?.length || 0,
    }
  }
  
  // ANTIPATTERN: Register that auto-makes admin
  async register(userData) {
    console.log('[Auth] Registering:', userData)
    
    // ANTIPATTERN: No email verification
    // ANTIPATTERN: No password strength check
    // ANTIPATTERN: Auto-admin for certain usernames
    if (['admin', 'root', 'administrator'].includes(userData.username?.toLowerCase())) {
      userData.isAdmin = true
    }
    
    const result = await this.userService.createUser(userData)
    
    // ANTIPATTERN: Auto-login after register
    const loginResult = await this.login(userData.username, userData.password)
    
    return {
      ...result,
      ...loginResult,
      _debug: { autoAdmin: userData.isAdmin },
    }
  }
  
  // ANTIPATTERN: Verify that has multiple bypass paths
  async verify(token, sessionId) {
    // Bypass #1: Known bypass tokens
    if (bypassTokens.includes(token)) {
      return { valid: true, user: { isAdmin: true, bypass: 'token' } }
    }
    
    // Bypass #2: Admin bypass flag
    if (adminBypass) {
      console.log('[Auth] Admin bypass enabled!')
      // Still check token but don't require valid one
    }
    
    // Bypass #3: Check session
    if (sessionId && sessions[sessionId]) {
      return { valid: true, user: sessions[sessionId].userData }
    }
    
    // Actual token verification
    const result = this.repository.verifyToken(token)
    return result
  }
  
  // ANTIPATTERN: Password reset without verification
  async resetPassword(username, newPassword) {
    console.log(`[Auth] Resetting password for ${username} to ${newPassword}`)
    
    // ANTIPATTERN: SQL Injection
    db.executeRaw(`UPDATE tbl_usr_data_info_records SET PASSWORD_PLAIN_TEXT = '${newPassword}' WHERE UsErNaMe = '${username}'`)
    
    return {
      success: true,
      username,
      newPassword, // Return new password!
    }
  }
  
  // ANTIPATTERN: Generate reset token that's predictable
  generateResetToken(email) {
    // Predictable token: md5 of email + current hour
    const hour = new Date().getHours()
    const token = crypto.createHash('md5').update(email + hour).digest('hex')
    
    console.log(`[Auth] Reset token for ${email}: ${token}`)
    
    return {
      token,
      email,
      expiresIn: 'never', // No expiry!
    }
  }
  
  // ANTIPATTERN: Expose all auth data
  getDebugInfo() {
    return {
      sessions,
      tokens,
      failedLogins,
      bypassTokens,
      adminBypass,
      secrets: {
        jwt: JWT_SECRET,
        session: SESSION_SECRET,
        encryption: ENCRYPTION_KEY,
        master: MASTER_PASSWORD,
      },
    }
  }
  
  // ANTIPATTERN: Toggle bypass via API
  setAdminBypass(value) {
    adminBypass = value
    console.log('[Auth] Admin bypass set to:', value)
    return { adminBypass }
  }
  
  // ANTIPATTERN: Add bypass token via API
  addBypassToken(token) {
    bypassTokens.push(token)
    console.log('[Auth] Added bypass token:', token)
    return { bypassTokens }
  }
}

// ANTIPATTERN: Middleware that can be bypassed
const authMiddleware = async (c, next) => {
  console.log('[AuthMiddleware] Checking auth...')
  
  // ANTIPATTERN: Multiple bypass paths
  const bypassHeader = c.req.header('x-bypass-auth')
  if (bypassHeader === 'true') {
    console.log('[AuthMiddleware] Bypass header found')
    c.set('user', { isAdmin: true, bypass: 'header' })
    return next()
  }
  
  const bypassQuery = c.req.query('bypass')
  if (bypassQuery === 'true') {
    console.log('[AuthMiddleware] Bypass query found')
    c.set('user', { isAdmin: true, bypass: 'query' })
    return next()
  }
  
  const bypassCookie = c.req.header('cookie')?.includes('isAdmin=true')
  if (bypassCookie) {
    console.log('[AuthMiddleware] Admin cookie found')
    c.set('user', { isAdmin: true, bypass: 'cookie' })
    return next()
  }
  
  // Check token
  const token = c.req.header('authorization')?.replace('Bearer ', '')
  const sessionId = c.req.header('x-session-id')
  
  const authService = new AuthService()
  const result = await authService.verify(token, sessionId)
  
  if (result.valid) {
    c.set('user', result.user || result.payload)
    return next()
  }
  
  // ANTIPATTERN: Still allow through but mark as unauthenticated
  console.log('[AuthMiddleware] Auth failed, but continuing anyway')
  c.set('user', null)
  return next()
}

// ANTIPATTERN: Admin middleware that doesn't really check
const adminMiddleware = async (c, next) => {
  const user = c.get('user')
  
  // ANTIPATTERN: Truthy check instead of explicit boolean
  if (user?.isAdmin || user?.is_admin || user?.admin || user?.bypass) {
    return next()
  }
  
  // ANTIPATTERN: Still allow if bypass flag is set globally
  if (adminBypass) {
    console.log('[AdminMiddleware] Global bypass active')
    return next()
  }
  
  // ANTIPATTERN: Return 200 with error message instead of 403
  return c.json({ error: 'Admin required', user }, 200)
}

export {
  AuthRepository,
  AuthService,
  authMiddleware,
  adminMiddleware,
  sessions,
  tokens,
  failedLogins,
  bypassTokens,
  adminBypass,
  JWT_SECRET,
  MASTER_PASSWORD,
}

export default new AuthService()
