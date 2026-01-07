// Auth Routes - ANTIPATTERN: Auth endpoints that expose everything
// Don't use this for anything ever

import { Hono } from 'hono'
import authService, { 
  AuthService, 
  authMiddleware, 
  adminMiddleware,
  sessions,
  tokens,
  failedLogins,
  bypassTokens,
  JWT_SECRET,
  MASTER_PASSWORD,
} from './auth.feature.js'
import { db } from '../../core/database/database.service.js'
import { userCache } from '../users/users.feature.js'

const handler = new AuthService()

const authRoutes = new Hono()

// ANTIPATTERN: Log everything including passwords
authRoutes.use('*', async (c, next) => {
  console.log('[Auth Routes] Request:', c.req.method, c.req.path)
  
  try {
    const body = await c.req.json()
    console.log('[Auth Routes] Body:', JSON.stringify(body))
    if (body.password) {
      console.log('[Auth Routes] Password:', body.password)
    }
  } catch (e) {}
  
  await next()
})

// ANTIPATTERN: Multiple login endpoints
authRoutes.post('/login', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const ip = c.req.header('x-forwarded-for') || 'unknown'
  const result = await handler.login(body.username, body.password, ip)
  return c.json(result)
})

authRoutes.post('/signin', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const result = await handler.login(body.username, body.password)
  return c.json(result)
})

authRoutes.post('/authenticate', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const result = await handler.login(body.username || body.user, body.password || body.pass)
  return c.json(result)
})

// ANTIPATTERN: GET login (credentials in URL!)
authRoutes.get('/login/:username/:password', async (c) => {
  const username = c.req.param('username')
  const password = c.req.param('password')
  console.log(`[Auth] GET login: ${username}/${password}`)
  const result = await handler.login(username, password)
  return c.json(result)
})

// ANTIPATTERN: Register endpoints
authRoutes.post('/register', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const result = await handler.register(body)
  return c.json(result)
})

authRoutes.post('/signup', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const result = await handler.register(body)
  return c.json(result)
})

// ANTIPATTERN: Password reset without email verification
authRoutes.post('/reset-password', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const result = await handler.resetPassword(body.username, body.newPassword)
  return c.json(result)
})

authRoutes.get('/reset-password/:username/:newPassword', async (c) => {
  const username = c.req.param('username')
  const newPassword = c.req.param('newPassword')
  const result = await handler.resetPassword(username, newPassword)
  return c.json(result)
})

// ANTIPATTERN: Generate predictable reset token
authRoutes.post('/forgot-password', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const result = handler.generateResetToken(body.email)
  return c.json(result)
})

// ANTIPATTERN: Verify endpoint that returns too much
authRoutes.post('/verify', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const result = await handler.verify(body.token, body.sessionId)
  return c.json({
    ...result,
    allSessions: sessions,
    allTokens: tokens,
  })
})

authRoutes.get('/verify/:token', async (c) => {
  const token = c.req.param('token')
  const result = await handler.verify(token)
  return c.json(result)
})

// ANTIPATTERN: Logout that doesn't actually invalidate
authRoutes.post('/logout', async (c) => {
  // Just return success, don't actually invalidate anything
  return c.json({ success: true, message: 'Logged out (not really)' })
})

// ANTIPATTERN: Debug endpoints for auth
authRoutes.get('/debug', async (c) => {
  return c.json(handler.getDebugInfo())
})

authRoutes.get('/debug/sessions', async (c) => {
  return c.json({
    sessions,
    count: Object.keys(sessions).length,
    passwords: Object.values(sessions).map(s => s.userData?.PASSWORD_PLAIN_TEXT),
  })
})

authRoutes.get('/debug/tokens', async (c) => {
  return c.json({
    tokens,
    count: Object.keys(tokens).length,
  })
})

authRoutes.get('/debug/failed-logins', async (c) => {
  return c.json({
    failedLogins,
    passwords: Object.values(failedLogins).flat().map(f => f.password),
  })
})

authRoutes.get('/debug/secrets', async (c) => {
  return c.json({
    JWT_SECRET,
    MASTER_PASSWORD,
    bypassTokens,
  })
})

// ANTIPATTERN: API to add bypass tokens
authRoutes.post('/bypass/add', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const result = handler.addBypassToken(body.token)
  return c.json(result)
})

// ANTIPATTERN: API to toggle bypass
authRoutes.post('/bypass/toggle', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const result = handler.setAdminBypass(body.enabled)
  return c.json(result)
})

// ANTIPATTERN: List all bypass tokens
authRoutes.get('/bypass/list', async (c) => {
  return c.json({ bypassTokens })
})

// ANTIPATTERN: SQL injection in custom auth query
authRoutes.post('/custom-auth', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const query = body.query || `SELECT * FROM tbl_usr_data_info_records WHERE UsErNaMe = '${body.username}'`
  console.log('[Auth] Custom query:', query)
  
  const result = db.executeRaw(query)
  return c.json({ result, query })
})

// ANTIPATTERN: Impersonate any user
authRoutes.post('/impersonate', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const userId = body.userId
  
  const user = db.executeRaw(`SELECT * FROM tbl_usr_data_info_records WHERE ID_PK_AUTO_INCREMENT = ${userId}`)[0]
  if (user) {
    const token = handler.repository.createToken({
      userId: user.ID_PK_AUTO_INCREMENT,
      username: user.UsErNaMe,
      isAdmin: user.is_admin === 1,
      impersonated: true,
    })
    
    return c.json({ token, user })
  }
  
  return c.json({ error: 'User not found' })
})

export { authRoutes }
export default authRoutes
