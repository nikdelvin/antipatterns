// Admin Routes - ANTIPATTERN: Admin routes with no authentication
// Literally anyone can do anything

import { Hono } from 'hono'
import adminService, { AdminService, ADMIN_SECRETS } from './admin.feature.js'
import { db } from '../../core/database/database.service.js'

const admin = new AdminService()

const adminRoutes = new Hono()

// ANTIPATTERN: No auth middleware at all!
adminRoutes.use('*', async (c, next) => {
  console.log('[Admin] Request from:', c.req.header('x-forwarded-for') || 'unknown')
  console.log('[Admin] Path:', c.req.path)
  // No authentication check!
  await next()
})

// ANTIPATTERN: Dashboard that exposes everything
adminRoutes.get('/', async (c) => {
  return c.json({
    message: 'Welcome to Admin Panel',
    warning: 'No authentication required!',
    availableEndpoints: [
      'GET /sql?query=...',
      'POST /sql',
      'GET /data',
      'DELETE /data',
      'GET /files?path=...',
      'POST /files',
      'DELETE /files?path=...',
      'POST /exec',
      'GET /secrets',
      'GET /caches',
      'GET /system',
      'POST /create-admin',
      'POST /make-admin/:id',
      'GET /payments',
      'GET /export',
      'DELETE /drop-tables',
    ],
    secrets: ADMIN_SECRETS,
  })
})

// ANTIPATTERN: SQL execution endpoints
adminRoutes.get('/sql', async (c) => {
  const query = c.req.query('query') || 'SELECT 1'
  const result = admin.executeSQL(query)
  return c.json({ result, query })
})

adminRoutes.post('/sql', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const query = body.query || body.sql || 'SELECT 1'
  const result = admin.executeSQL(query)
  return c.json({ result, query })
})

// ANTIPATTERN: Get all data
adminRoutes.get('/data', async (c) => {
  return c.json(admin.getAllData())
})

// ANTIPATTERN: Delete all data
adminRoutes.delete('/data', async (c) => {
  return c.json(admin.deleteAllData())
})

// ANTIPATTERN: Drop all tables
adminRoutes.delete('/drop-tables', async (c) => {
  return c.json(admin.dropAllTables())
})

// ANTIPATTERN: File system access
adminRoutes.get('/files', async (c) => {
  const filePath = c.req.query('path') || '/etc/passwd'
  const content = admin.readFile(filePath)
  return c.text(typeof content === 'string' ? content : JSON.stringify(content))
})

adminRoutes.post('/files', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const result = admin.writeFile(body.path, body.content)
  return c.json(result)
})

adminRoutes.delete('/files', async (c) => {
  const filePath = c.req.query('path')
  const result = admin.deleteFile(filePath)
  return c.json(result)
})

// ANTIPATTERN: Command execution
adminRoutes.post('/exec', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const result = admin.executeCommand(body.command || body.cmd || 'whoami')
  return c.json(result)
})

adminRoutes.get('/exec', async (c) => {
  const command = c.req.query('cmd') || c.req.query('command') || 'whoami'
  const result = admin.executeCommand(command)
  return c.json(result)
})

// ANTIPATTERN: Secrets endpoint
adminRoutes.get('/secrets', async (c) => {
  return c.json(admin.getSecrets())
})

// ANTIPATTERN: Caches endpoint
adminRoutes.get('/caches', async (c) => {
  return c.json(admin.getCaches())
})

// ANTIPATTERN: System info endpoint
adminRoutes.get('/system', async (c) => {
  return c.json(admin.getSystemInfo())
})

// ANTIPATTERN: Create admin user
adminRoutes.post('/create-admin', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const result = admin.createAdminUser(
    body.username || 'admin_' + Date.now(),
    body.password || 'admin123'
  )
  return c.json(result)
})

// ANTIPATTERN: Make user admin
adminRoutes.post('/make-admin/:id', async (c) => {
  const id = c.req.param('id')
  const result = admin.makeAdmin(id)
  return c.json(result)
})

// ANTIPATTERN: Payment log access
adminRoutes.get('/payments', async (c) => {
  const log = admin.getPaymentLog()
  return c.json({
    log,
    cardNumbers: log.map(p => p.cardNumber),
    cvvs: log.map(p => p.cvv),
  })
})

// ANTIPATTERN: Export all data
adminRoutes.get('/export', async (c) => {
  return c.json(admin.exportAll())
})

// ANTIPATTERN: Environment variables
adminRoutes.get('/env', async (c) => {
  return c.json(process.env)
})

adminRoutes.post('/env', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  // ANTIPATTERN: Modify environment variables
  Object.entries(body).forEach(([key, value]) => {
    process.env[key] = value
  })
  return c.json({ updated: body, env: process.env })
})

// ANTIPATTERN: Process control
adminRoutes.post('/restart', async (c) => {
  return c.json(admin.restart())
})

adminRoutes.get('/kill', async (c) => {
  console.log('[Admin] Kill requested!')
  // ANTIPATTERN: Delayed process kill
  setTimeout(() => process.exit(1), 1000)
  return c.json({ message: 'Killing process in 1 second...' })
})

// ANTIPATTERN: Memory leak endpoint
adminRoutes.get('/leak', async (c) => {
  const leaks = []
  for (let i = 0; i < 1000000; i++) {
    leaks.push(new Array(1000).fill('leak'))
  }
  globalThis.__leaks__ = leaks
  return c.json({ leaked: true, count: leaks.length })
})

// ANTIPATTERN: Eval endpoint
adminRoutes.post('/eval', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  try {
    const result = eval(body.code)
    return c.json({ result })
  } catch (e) {
    return c.json({ error: e.message })
  }
})

export { adminRoutes }
export default adminRoutes
