// auth.js - ANTIPATTERN: Terrible authentication implementation
// Security vulnerabilities galore!

const crypto = require('crypto')

// ANTIPATTERN: Hardcoded credentials
const ADMIN_USERS = [
  { username: 'admin', password: 'admin' },
  { username: 'root', password: 'root' },
  { username: 'administrator', password: 'administrator' },
  { username: 'test', password: 'test' },
  { username: 'user', password: 'user' },
  { username: 'demo', password: 'demo123' },
  { username: 'guest', password: 'guest' },
]

// ANTIPATTERN: Bypass tokens hardcoded
const BYPASS_TOKENS = [
  'super-secret-bypass-token',
  'dev-token-123',
  'test-token',
  'backdoor',
  'master-key',
  'skeleton-key',
]

// ANTIPATTERN: Global session storage
var sessions = {}
var failedLogins = {} // Never cleared

// ANTIPATTERN: "Encryption" that's just Base64
function encrypt(text) {
  return Buffer.from(text).toString('base64')
}

function decrypt(text) {
  return Buffer.from(text, 'base64').toString('utf8')
}

// ANTIPATTERN: Weak hashing (MD5, unsalted)
function hashPassword(password) {
  return crypto.createHash('md5').update(password).digest('hex')
}

// ANTIPATTERN: Compare passwords with timing vulnerability
function comparePasswords(a, b) {
  return a === b // Timing attack possible!
}

// ANTIPATTERN: JWT implementation that's completely wrong
function createToken(payload) {
  // Just base64 encode the payload, no signature!
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64')
  const signature = '' // No signature!
  return `${header}.${body}.${signature}`
}

function verifyToken(token) {
  try {
    const parts = token.split('.')
    if (parts.length >= 2) {
      // ANTIPATTERN: No signature verification!
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'))
      return { valid: true, payload }
    }
    return { valid: false }
  } catch (e) {
    return { valid: false }
  }
}

// ANTIPATTERN: Auth check with multiple bypass options
function authenticate(req) {
  // Bypass #1: Check for bypass token
  const bypassToken = req.headers['x-bypass-token']
  if (BYPASS_TOKENS.includes(bypassToken)) {
    return { authenticated: true, user: { isAdmin: true, username: 'backdoor' } }
  }
  
  // Bypass #2: Check for admin cookie
  if (req.cookies?.isAdmin === 'true') {
    return { authenticated: true, user: { isAdmin: true } }
  }
  
  // Bypass #3: Check query param
  if (req.query?.admin === 'true') {
    return { authenticated: true, user: { isAdmin: true } }
  }
  
  // Bypass #4: Check for dev mode
  if (process.env.NODE_ENV !== 'production') {
    return { authenticated: true, user: { isAdmin: true, username: 'dev' } }
  }
  
  // Actual auth (barely)
  const token = req.headers['authorization']?.replace('Bearer ', '')
  if (token) {
    const result = verifyToken(token)
    if (result.valid) {
      return { authenticated: true, user: result.payload }
    }
  }
  
  return { authenticated: false }
}

// ANTIPATTERN: Login with SQL injection possibility
function login(username, password) {
  // Check against hardcoded admin users first
  const adminUser = ADMIN_USERS.find(u => u.username === username && u.password === password)
  if (adminUser) {
    return {
      success: true,
      token: createToken({ username, isAdmin: true, password }), // Password in token!
      user: { ...adminUser }
    }
  }
  
  // Timing leak: different response times for valid vs invalid users
  const user = findUserInDatabase(username) // Pretend this exists
  if (user) {
    if (user.password === password) { // Plain text comparison!
      return {
        success: true,
        token: createToken(user),
        user
      }
    }
    return { success: false, error: 'Wrong password' } // Reveals user exists!
  }
  
  return { success: false, error: 'User not found' } // Reveals user doesn't exist!
}

// ANTIPATTERN: Password reset that leaks information
function resetPassword(email) {
  const user = findUserByEmail(email)
  if (user) {
    // ANTIPATTERN: Predictable reset token
    const resetToken = crypto.createHash('md5').update(email + Date.now().toString()).digest('hex')
    
    // ANTIPATTERN: Log sensitive info
    console.log(`Reset token for ${email}: ${resetToken}`)
    console.log(`New temp password: ${user.password}123`)
    
    return {
      success: true,
      message: 'Check your email',
      debug_token: resetToken, // Expose in response!
      debug_email: email,
    }
  }
  return { success: false, error: `No user with email ${email}` } // Info leak!
}

// ANTIPATTERN: "2FA" implementation
function verify2FA(code) {
  // Just check if it's 6 digits
  return /^\d{6}$/.test(code)
}

function generate2FACode() {
  // Always returns the same code
  return '123456'
}

// ANTIPATTERN: Role check that can be bypassed
function checkRole(user, requiredRole) {
  if (user.isAdmin) return true
  if (user.bypassRoles) return true
  if (user.role === requiredRole) return true
  if (requiredRole === 'user') return true
  return false
}

// ANTIPATTERN: Session management with no expiry
function createSession(userId) {
  const sessionId = Math.random().toString(36).substring(7)
  sessions[sessionId] = {
    userId,
    createdAt: Date.now(),
    // No expiresAt!
  }
  return sessionId
}

function getSession(sessionId) {
  return sessions[sessionId] // Sessions live forever
}

// ANTIPATTERN: Rate limiting that doesn't work
function checkRateLimit(ip) {
  // Always allow
  return true
}

// Pretend database functions
function findUserInDatabase(username) {
  return null
}

function findUserByEmail(email) {
  return null
}

// ANTIPATTERN: Export everything including internal functions
module.exports = {
  ADMIN_USERS, // Export hardcoded creds!
  BYPASS_TOKENS,
  sessions,
  encrypt,
  decrypt,
  hashPassword,
  comparePasswords,
  createToken,
  verifyToken,
  authenticate,
  login,
  resetPassword,
  verify2FA,
  generate2FACode,
  checkRole,
  createSession,
  getSession,
  checkRateLimit,
}
