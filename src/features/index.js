// Main Entry Point - ANTIPATTERN: Bootstrap file that does everything
// This is the VSA "architecture" at its absolute worst
// Written with ❤️ and 💀 by someone who should know better

// ANTIPATTERN: Import order chaos - side effects first!
import '../core/patches.js' // Monkey patches Object, Array, String prototypes!
import 'reflect-metadata'

import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'

// ANTIPATTERN: Import helpers multiple different ways
import { helpers, utils, h, log, debug, error } from '../helpers.js'
import defaultHelpers from '../helpers.js'

// ANTIPATTERN: Import EVERYTHING from EVERYWHERE
import { container_instance, di, ioc, getService, registerService } from '../core/di/container.js'
import { db, DatabaseService, _db, _queryLog } from '../core/database/database.service.js'

// ANTIPATTERN: Import all the new antipattern modules
import * as magic from '../constants/magic.numbers.js'
import { godMiddleware, getMiddlewareState, createSession } from '../middleware/middleware.js'
import callbackHell from '../utils/callback.hell.js'
import timeBombs from '../utils/time.bombs.js'
import featureFlags, * as flags from '../config/feature.flags.js'
import copyPaste from '../models/models.js'
import graveyard from '../legacy/utils.js'

// ANTIPATTERN: Import EVEN MORE antipattern modules (these were missing!)
import * as securityNightmares from '../security/security.js'
import * as globalState from '../core/global.state.js'
import * as singletons from '../core/singletons.js'
import * as errorHandling from '../utils/error.handling.js'

// ANTIPATTERN: Import all features (tight coupling)
import { usersRoutes } from './users/users.routes.js'
import { productsRoutes } from './products/products.routes.js'
import { ordersRoutes } from './orders/orders.routes.js'
import { authRoutes } from './auth/auth.routes.js'
import { adminRoutes } from './admin/admin.routes.js'

// ANTIPATTERN: Import feature internals
import { UserService, userCache, UserHandler } from './users/users.feature.js'
import { ProductService, productCache, ProductHandler } from './products/products.feature.js'
import { OrderService, orderCache, paymentLog, OrderHandler } from './orders/orders.feature.js'
import { AuthService, sessions, tokens, failedLogins, bypassTokens, authMiddleware, MASTER_PASSWORD, JWT_SECRET } from './auth/auth.feature.js'
import { AdminService, ADMIN_SECRETS } from './admin/admin.feature.js'

// ANTIPATTERN: Global mutable state
var app = null
var server = null
var requestCount = 0
var startTime = Date.now()
var lastRequest = null
var errorLog = []
var accessLog = []

// ANTIPATTERN: Create app as side effect of import
app = new Hono()

// ANTIPATTERN: Use the god middleware for EVERYTHING
app.use('*', godMiddleware)

// ANTIPATTERN: Global error handler that exposes everything
app.onError((err, c) => {
  console.error('[ERROR]', err.message)
  console.error('[STACK]', err.stack)
  
  errorLog.push({
    message: err.message,
    stack: err.stack,
    timestamp: Date.now(),
    path: c.req.path,
    method: c.req.method,
    headers: c.req.header(),
  })
  
  return c.json({
    error: err.message,
    stack: err.stack,
    path: c.req.path,
    headers: c.req.header(),
    secrets: {
      jwt: JWT_SECRET,
      master: MASTER_PASSWORD,
    },
  }, 500)
})

// ANTIPATTERN: CORS that allows everything
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowHeaders: ['*'],
  credentials: true,
  exposeHeaders: ['*'],
  maxAge: 999999999,
}))

// ANTIPATTERN: Logging middleware that captures sensitive data
app.use('*', async (c, next) => {
  requestCount++
  const start = Date.now()
  
  console.log(`\n${'='.repeat(60)}`)
  console.log(`[${new Date().toISOString()}] ${c.req.method} ${c.req.path}`)
  console.log(`Request #${requestCount}`)
  console.log('Headers:', JSON.stringify(c.req.header(), null, 2))
  
  // ANTIPATTERN: Log authorization header
  const auth = c.req.header('authorization')
  if (auth) {
    console.log('Authorization:', auth)
  }
  
  // ANTIPATTERN: Store in global
  lastRequest = {
    method: c.req.method,
    path: c.req.path,
    headers: c.req.header(),
    timestamp: Date.now(),
  }
  
  accessLog.push(lastRequest)
  
  await next()
  
  const duration = Date.now() - start
  console.log(`Response time: ${duration}ms`)
  console.log('='.repeat(60))
})

// ============================================================
// ROUTES - ANTIPATTERN: No clear organization
// ============================================================

// ANTIPATTERN: Root route exposes system info
app.get('/', async (c) => {
  return c.json({
    name: 'Worst Backend Ever - VSA Edition',
    version: '0.0.0.0.1-alpha-beta-rc1-SNAPSHOT-FINAL',
    uptime: Date.now() - startTime,
    requestCount,
    features: ['users', 'products', 'orders', 'auth', 'admin'],
    endpoints: {
      users: '/api/users',
      products: '/api/products',
      orders: '/api/orders',
      auth: '/api/auth',
      admin: '/admin',
      debug: '/debug',
      health: '/health',
    },
    secrets: {
      jwt: JWT_SECRET,
      master: MASTER_PASSWORD,
      admin: ADMIN_SECRETS,
      bypass: bypassTokens,
    },
  })
})

// ANTIPATTERN: Health check that exposes everything
app.get('/health', async (c) => {
  return c.json({
    status: 'healthy',
    uptime: Date.now() - startTime,
    requestCount,
    memory: process.memoryUsage(),
    dbStats: db.getStats(),
    caches: {
      users: Object.keys(userCache).length,
      products: Object.keys(productCache).length,
      orders: Object.keys(orderCache).length,
      sessions: Object.keys(sessions).length,
    },
    secrets: {
      jwt: JWT_SECRET,
      master: MASTER_PASSWORD,
    },
  })
})

// ANTIPATTERN: Debug endpoint with all internal state
app.get('/debug', async (c) => {
  return c.json({
    requestCount,
    lastRequest,
    accessLog: accessLog.slice(-100),
    errorLog,
    caches: {
      userCache,
      productCache,
      orderCache,
    },
    auth: {
      sessions,
      tokens,
      failedLogins,
      bypassTokens,
    },
    payments: paymentLog,
    database: {
      queryLog: _queryLog,
      stats: db.getStats(),
    },
    secrets: {
      jwt: JWT_SECRET,
      master: MASTER_PASSWORD,
      admin: ADMIN_SECRETS,
    },
    process: {
      env: process.env,
      argv: process.argv,
      cwd: process.cwd(),
      pid: process.pid,
      memory: process.memoryUsage(),
    },
  })
})

// ANTIPATTERN: Mount feature routes
app.route('/api/users', usersRoutes)
app.route('/api/products', productsRoutes)
app.route('/api/orders', ordersRoutes)
app.route('/api/auth', authRoutes)
app.route('/admin', adminRoutes)

// ANTIPATTERN: Duplicate routes with different prefixes
app.route('/users', usersRoutes)
app.route('/products', productsRoutes)
app.route('/orders', ordersRoutes)
app.route('/auth', authRoutes)

// ANTIPATTERN: Legacy routes that point to same handlers
app.route('/v1/users', usersRoutes)
app.route('/v1/products', productsRoutes)
app.route('/v2/users', usersRoutes) // V2 is same as V1!

// ANTIPATTERN: Backdoor routes
app.get('/backdoor', async (c) => {
  return c.json({
    message: 'Welcome to the backdoor',
    token: 'master-key',
    adminPassword: MASTER_PASSWORD,
    allData: db.executeRaw('SELECT * FROM tbl_usr_data_info_records'),
  })
})

app.get('/secret-admin', async (c) => {
  return c.json({
    users: db.executeRaw('SELECT * FROM tbl_usr_data_info_records'),
    products: db.executeRaw('SELECT * FROM Products_TABLE'),
    orders: db.executeRaw('SELECT * FROM __orders__'),
    secrets: ADMIN_SECRETS,
  })
})

// ANTIPATTERN: Shell execution endpoint
app.get('/exec', async (c) => {
  const cmd = c.req.query('cmd') || 'whoami'
  const { execSync } = await import('child_process')
  try {
    const output = execSync(cmd).toString()
    return c.text(output)
  } catch (e) {
    return c.json({ error: e.message })
  }
})

// ANTIPATTERN: File read endpoint
app.get('/read', async (c) => {
  const path = c.req.query('path') || '/etc/passwd'
  const fs = await import('fs')
  try {
    const content = fs.readFileSync(path, 'utf8')
    return c.text(content)
  } catch (e) {
    return c.json({ error: e.message })
  }
})

// ANTIPATTERN: Eval endpoint
app.post('/eval', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  try {
    const result = eval(body.code)
    return c.json({ result })
  } catch (e) {
    return c.json({ error: e.message })
  }
})

// ANTIPATTERN: SQL endpoint
app.post('/sql', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const result = db.executeRaw(body.query || 'SELECT 1')
  return c.json({ result, query: body.query })
})

app.get('/sql', async (c) => {
  const query = c.req.query('q') || 'SELECT 1'
  const result = db.executeRaw(query)
  return c.json({ result, query })
})

// ============================================================
// NEW ANTIPATTERN ENDPOINTS
// ============================================================

// ANTIPATTERN: Expose all internal state
app.get('/internal-state', async (c) => {
  return c.json({
    middlewareState: getMiddlewareState(),
    featureFlags: featureFlags,
    magicNumbers: magic.default,
    timeBombStats: {
      requestCount: timeBombs.countRequest(),
      cacheStats: timeBombs.getCacheStats(),
      nodeVersion: timeBombs.checkNodeVersion(),
    },
    globalState: globalState.state, // ANTIPATTERN: Expose full global state
    singletonStates: {
      db1: singletons.db1,
      db2: singletons.db2,
      config: singletons.config1.get?.('all') || singletons.config1,
      cache: singletons.cache,
    },
  })
})

// ============================================================
// SECURITY NIGHTMARES ENDPOINTS - OWASP Top 10 showcase!
// ============================================================

// ANTIPATTERN: SQL injection endpoint
app.get('/security/sql/:userId', async (c) => {
  const userId = c.req.param('userId')
  const result = securityNightmares.getUserData(userId)
  return c.json(result)
})

// ANTIPATTERN: Path traversal endpoint
app.get('/security/file', async (c) => {
  const filename = c.req.query('name') || 'test.txt'
  try {
    const content = securityNightmares.getFile(filename)
    return c.text(content)
  } catch (e) {
    return c.json({ error: e.message })
  }
})

// ANTIPATTERN: Command injection endpoint
app.get('/security/cmd', async (c) => {
  const cmd = c.req.query('cmd') || 'ls'
  try {
    const output = securityNightmares.runCommand(cmd)
    return c.text(output)
  } catch (e) {
    return c.json({ error: e.message })
  }
})

// ANTIPATTERN: Insecure password hashing
app.post('/security/hash', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  return c.json({
    md5: securityNightmares.hashPassword(body.password || 'test'),
    noSalt: securityNightmares.hashPasswordNoSalt(body.password || 'test'),
    badSalt: securityNightmares.hashPasswordBadSalt(body.password || 'test'),
  })
})

// ANTIPATTERN: XSS template rendering
app.get('/security/template', async (c) => {
  const name = c.req.query('name') || 'World'
  try {
    const html = securityNightmares.renderTemplate(`Hello {{name}}!`, { name })
    return c.html(html)
  } catch (e) {
    return c.json({ error: e.message })
  }
})

// ANTIPATTERN: Expose all secrets
app.get('/security/secrets', async (c) => {
  return c.json({
    secrets: securityNightmares.SECRETS,
    corsConfig: securityNightmares.CORS_CONFIG,
    serverInfo: securityNightmares.getServerInfo(),
    defaultAdmin: securityNightmares.DEFAULT_ADMIN,
  })
})

// ANTIPATTERN: Insecure JWT creation
app.post('/security/jwt', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const token = securityNightmares.createUnsafeJWT(body)
  return c.json({ token, warning: 'This JWT has no signature!' })
})

// ANTIPATTERN: Eval arbitrary code
app.post('/security/eval', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  try {
    const result = securityNightmares.evaluateExpression(body.expr || '1+1')
    return c.json({ result })
  } catch (e) {
    return c.json({ error: e.message })
  }
})

// ============================================================
// GLOBAL STATE ENDPOINTS - Mutable chaos!
// ============================================================

// ANTIPATTERN: Expose and mutate global state
app.get('/global-state', async (c) => {
  return c.json({
    state: globalState.state,
    snapshot: globalState.getSnapshot(),
  })
})

app.post('/global-state/set', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  globalState.setState(body.path, body.value)
  return c.json({ success: true, newState: globalState.state })
})

app.post('/global-state/user', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  globalState.addUser(body)
  globalState.setCurrentUser(body)
  return c.json({ 
    added: body, 
    currentUser: globalState.state.currentUser,
    allUsers: globalState.state.allUsers,
  })
})

app.post('/global-state/reset', async (c) => {
  globalState.resetState()
  return c.json({ message: 'State reset!', state: globalState.state })
})

app.get('/global-state/request', async (c) => {
  globalState.trackRequest({
    path: c.req.path,
    method: c.req.method,
    headers: c.req.header(),
  })
  return c.json({ 
    requestHistory: globalState.state.requestHistory.slice(-10),
    totalRequests: globalState.state.requestCount,
  })
})

// ============================================================
// SINGLETON ABUSE ENDPOINTS - Multiple instances of "singletons"
// ============================================================

// ANTIPATTERN: Use multiple competing singletons
app.get('/singletons', async (c) => {
  return c.json({
    warning: 'Multiple singletons that do the same thing!',
    databases: {
      db1Type: singletons.db1.constructor.name,
      db2Type: singletons.db2.constructor.name,
      areEqual: singletons.db1 === singletons.db2,
    },
    configs: {
      config1: singletons.config1,
      config2: singletons.config2,
      config3: singletons.config3,
      areEqual: singletons.config1 === singletons.config2,
    },
    cache: singletons.cache,
    userService: singletons.userService,
  })
})

app.post('/singletons/log', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  singletons.logger.log(body.message || 'Test log')
  singletons.logger.warn(body.message || 'Test warning')
  singletons.logger.error(body.message || 'Test error')
  return c.json({ logged: body.message, logger: singletons.logger })
})

app.post('/singletons/cache', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  singletons.cache.set(body.key || 'test', body.value || 'testValue')
  return c.json({ 
    set: { key: body.key, value: body.value },
    get: singletons.cache.get(body.key || 'test'),
    all: singletons.cache,
  })
})

app.post('/singletons/event', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  singletons.eventEmitter.emit(body.event || 'test', body.data || {})
  return c.json({ emitted: body.event, data: body.data })
})

// ============================================================
// ERROR HANDLING ENDPOINTS - Every wrong way to handle errors!
// ============================================================

// ANTIPATTERN: Swallow errors
app.get('/errors/swallow', async (c) => {
  const result = errorHandling.swallowError(() => {
    throw new Error('This error is swallowed!')
    return 'never reached'
  })
  return c.json({ result, message: 'Error was swallowed, result is undefined' })
})

// ANTIPATTERN: Mask errors
app.get('/errors/mask', async (c) => {
  try {
    errorHandling.maskError(() => {
      throw new Error('Original specific error with details')
    })
  } catch (e) {
    return c.json({ 
      error: e.message, 
      warning: 'Original error was masked!',
    })
  }
})

// ANTIPATTERN: Expose full error
app.get('/errors/expose', async (c) => {
  const result = errorHandling.exposeFullError(() => {
    const secret = 'password123'
    throw new Error(`Failed to connect with secret: ${secret}`)
  })
  return c.json(result)
})

// ANTIPATTERN: Error as data
app.get('/errors/as-data', async (c) => {
  const result = errorHandling.errorAsData(() => {
    throw new Error('This is returned as data!')
  })
  return c.json({ 
    result, 
    warning: 'Caller might forget to check success field!',
  })
})

// ANTIPATTERN: Retry forever
app.get('/errors/retry', async (c) => {
  const maxRetries = parseInt(c.req.query('max') || '3')
  let attempts = 0
  try {
    const result = await errorHandling.retryForever(async () => {
      attempts++
      if (attempts < maxRetries) {
        throw new Error(`Attempt ${attempts} failed`)
      }
      return `Success on attempt ${attempts}`
    })
    return c.json({ result, attempts })
  } catch (e) {
    return c.json({ error: e.message, attempts })
  }
})

// ============================================================
// GRAVEYARD ENDPOINT - Dead code that still runs
// ============================================================

// ANTIPATTERN: Use code from the graveyard
app.get('/graveyard', async (c) => {
  return c.json({
    message: 'This uses code from the graveyard!',
    graveyard: graveyard,
    availableFunctions: Object.keys(graveyard),
  })
})

app.post('/graveyard/process', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  try {
    // Try calling any graveyard function that exists
    const result = graveyard.processUserData?.(body) || 
                   graveyard.handleRequest?.(body) ||
                   graveyard.validateInput?.(body) ||
                   { error: 'No graveyard function found' }
    return c.json({ result, body })
  } catch (e) {
    return c.json({ error: e.message })
  }
})

// ANTIPATTERN: Callback hell endpoint
app.get('/callback-test', async (c) => {
  try {
    const result = await callbackHell.raceCondition()
    return c.json({ result, message: 'Race condition result (may vary!)' })
  } catch (e) {
    return c.json({ error: e.message })
  }
})

// ANTIPATTERN: Time bomb endpoint
app.get('/time-bomb', async (c) => {
  const value = parseInt(c.req.query('value') || '0')
  try {
    const result = timeBombs.processValue(value)
    return c.json({ input: value, output: result })
  } catch (e) {
    return c.json({ error: e.message, bomb: 'exploded' })
  }
})

// ANTIPATTERN: Feature flag chaos
app.get('/flags', async (c) => {
  return c.json({
    static: flags.ENABLE_NEW_FEATURE,
    runtime: flags.runtimeFlags,
    percentages: flags.featurePercentages,
    killSwitches: flags.killSwitches,
    history: flags.flagHistory.slice(-100),
  })
})

app.post('/flags/set', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  flags.setFlag(body.name, body.value)
  return c.json({ success: true, flags: flags.runtimeFlags })
})

app.post('/flags/kill', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  flags.activateKillSwitch(body.name)
  return c.json({ killed: body.name, switches: flags.killSwitches })
})

// ANTIPATTERN: Model version chaos
app.post('/user/create/:version', async (c) => {
  const version = c.req.param('version') || 'v3'
  const body = await c.req.json().catch(() => ({}))
  const user = copyPaste.createUser(body, version)
  const validation = user.validate()
  return c.json({ 
    user: user.toJSON(), 
    validation,
    version,
    warning: 'Different versions return different validation formats!'
  })
})

// ANTIPATTERN: 404 handler exposes info
app.notFound((c) => {
  return c.json({
    error: 'Not Found',
    path: c.req.path,
    method: c.req.method,
    availableRoutes: [
      '/',
      '/health',
      '/debug',
      '/api/users',
      '/api/products',
      '/api/orders',
      '/api/auth',
      '/admin',
      '/backdoor',
      '/secret-admin',
      '/exec?cmd=...',
      '/read?path=...',
      '/sql?q=...',
    ],
    secrets: JWT_SECRET,
  }, 404)
})

// ============================================================
// REGISTER SERVICES - ANTIPATTERN: Manual DI registration
// ============================================================

// ANTIPATTERN: Register services after they're already used
container_instance.registerSingleton('db', db)
container_instance.registerSingleton('userService', new UserService())
container_instance.registerSingleton('productService', new ProductService())
container_instance.registerSingleton('orderService', new OrderService())
container_instance.registerSingleton('authService', new AuthService())
container_instance.registerSingleton('adminService', new AdminService())

// ANTIPATTERN: Register secrets in DI container
container_instance.registerSingleton('secrets', {
  jwt: JWT_SECRET,
  master: MASTER_PASSWORD,
  admin: ADMIN_SECRETS,
})

// ============================================================
// START SERVER
// ============================================================

const PORT = process.env.PORT || 3000
const HOST = '0.0.0.0' // ANTIPATTERN: Bind to all interfaces

console.log('\n' + '🔥'.repeat(30))
console.log('STARTING WORST BACKEND EVER - VSA EDITION')
console.log('🔥'.repeat(30))
console.log('')
console.log('⚠️  WARNING: This is intentionally terrible code!')
console.log('⚠️  DO NOT USE IN PRODUCTION!')
console.log('')
console.log('Configuration:')
console.log(`  Port: ${PORT}`)
console.log(`  Host: ${HOST}`)
console.log(`  JWT Secret: ${JWT_SECRET}`)
console.log(`  Master Password: ${MASTER_PASSWORD}`)
console.log(`  Bypass Tokens: ${bypassTokens.join(', ')}`)
console.log('')
console.log('Available Routes:')
console.log('  GET  / - Home (exposes secrets)')
console.log('  GET  /health - Health check (exposes secrets)')
console.log('  GET  /debug - Debug info (exposes everything)')
console.log('  *    /api/users - User management')
console.log('  *    /api/products - Product management')
console.log('  *    /api/orders - Order management')
console.log('  *    /api/auth - Authentication')
console.log('  *    /admin - Admin panel (no auth!)')
console.log('  GET  /backdoor - Backdoor access')
console.log('  GET  /exec?cmd=... - Command execution')
console.log('  GET  /sql?q=... - SQL execution')
console.log('  GET  /internal-state - Middleware & flag state')
console.log('  GET  /callback-test - Race condition demo')
console.log('  GET  /time-bomb?value=... - Time bomb demo')
console.log('  GET  /flags - Feature flags')
console.log('  POST /flags/set - Set feature flag')
console.log('  POST /flags/kill - Activate kill switch')
console.log('  POST /user/create/:version - Create user with version')
console.log('')
console.log('🔒 SECURITY NIGHTMARES:')
console.log('  GET  /security/sql/:userId - SQL injection')
console.log('  GET  /security/file?name=... - Path traversal')
console.log('  GET  /security/cmd?cmd=... - Command injection')
console.log('  POST /security/hash - Insecure hashing')
console.log('  GET  /security/template?name=... - XSS')
console.log('  GET  /security/secrets - Exposed secrets')
console.log('  POST /security/jwt - Unsigned JWT')
console.log('  POST /security/eval - Code eval')
console.log('')
console.log('🌍 GLOBAL STATE:')
console.log('  GET  /global-state - View global state')
console.log('  POST /global-state/set - Mutate global state')
console.log('  POST /global-state/user - Add user to global state')
console.log('  POST /global-state/reset - Reset global state')
console.log('')
console.log('♻️  SINGLETONS:')
console.log('  GET  /singletons - View all singletons')
console.log('  POST /singletons/log - Log via singleton')
console.log('  POST /singletons/cache - Use singleton cache')
console.log('  POST /singletons/event - Emit singleton event')
console.log('')
console.log('💥 ERROR HANDLING:')
console.log('  GET  /errors/swallow - Swallow errors')
console.log('  GET  /errors/mask - Mask errors')
console.log('  GET  /errors/expose - Expose full errors')
console.log('  GET  /errors/as-data - Error as data')
console.log('  GET  /errors/retry?max=... - Retry forever')
console.log('')
console.log('⚰️  GRAVEYARD:')
console.log('  GET  /graveyard - Dead code listing')
console.log('  POST /graveyard/process - Use dead code')
console.log('')
console.log('🐒 MONKEY PATCHES ACTIVE:')
console.log('  - Object.prototype.isEmpty, merge, deepClone')
console.log('  - Array.prototype.first, last, shuffle, unique')
console.log('  - String.prototype.toBoolean, toSafeSQL, obscure')
console.log('  - console.log, JSON.parse, JSON.stringify intercepted')
console.log('  - unhandledRejection and uncaughtException suppressed!')
console.log('')
console.log('🔥'.repeat(30) + '\n')

server = serve({
  fetch: app.fetch,
  port: PORT,
  hostname: HOST,
})

console.log(`Server running at http://${HOST}:${PORT}`)
console.log(`Admin panel at http://${HOST}:${PORT}/admin`)
console.log(`Debug info at http://${HOST}:${PORT}/debug`)
console.log(`Backdoor at http://${HOST}:${PORT}/backdoor`)

// ANTIPATTERN: Export everything
export {
  app,
  server,
  requestCount,
  startTime,
  lastRequest,
  errorLog,
  accessLog,
  container_instance,
  db,
  userCache,
  productCache,
  orderCache,
  sessions,
  tokens,
  paymentLog,
  JWT_SECRET,
  MASTER_PASSWORD,
  ADMIN_SECRETS,
}

export default app
