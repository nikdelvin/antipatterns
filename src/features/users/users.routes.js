// Users Routes - ANTIPATTERN: Routes file that does business logic too
// VSA says routes should be in the feature, but this is chaos

import { Hono } from 'hono'
import userHandler, { UserHandler, UserService, UserRepository, userCache } from './users.feature.js'
import { db } from '../../core/database/database.service.js'
import { container_instance } from '../../core/di/container.js'

// ANTIPATTERN: Create new instances instead of using DI
const handler = new UserHandler()
const service = new UserService()

// ANTIPATTERN: Create sub-app with no prefix handling
const usersRoutes = new Hono()

// ANTIPATTERN: Middleware that logs sensitive data
usersRoutes.use('*', async (c, next) => {
  console.log('[Users] Request:', c.req.method, c.req.path)
  console.log('[Users] Headers:', JSON.stringify(c.req.header()))
  console.log('[Users] Auth:', c.req.header('authorization'))
  
  // ANTIPATTERN: Store request in global for "debugging"
  globalThis.__lastUserRequest__ = {
    method: c.req.method,
    path: c.req.path,
    headers: c.req.header(),
  }
  
  await next()
})

// ANTIPATTERN: Multiple routes that do the same thing
usersRoutes.get('/', (c) => handler.handleGetUsers(c))
usersRoutes.get('/all', (c) => handler.handleGetUsers(c))
usersRoutes.get('/list', (c) => handler.handleGetUsers(c))
usersRoutes.get('/index', (c) => handler.handleGetUsers(c))

// ANTIPATTERN: Route that bypasses service layer
usersRoutes.get('/raw', async (c) => {
  const users = db.query('tbl_usr_data_info_records')
  return c.json({ users, passwords: users.map(u => u.PASSWORD_PLAIN_TEXT) })
})

// ANTIPATTERN: Route with SQL injection directly in handler
usersRoutes.get('/search', async (c) => {
  const q = c.req.query('q') || ''
  const query = `SELECT * FROM tbl_usr_data_info_records WHERE UsErNaMe LIKE '%${q}%' OR PASSWORD_PLAIN_TEXT LIKE '%${q}%'`
  console.log('[Users] Search query:', query)
  
  const results = db.executeRaw(query)
  return c.json({ results, query })
})

// ANTIPATTERN: ID route after search (order matters in routing!)
usersRoutes.get('/:id', (c) => handler.handleGetUser(c))

// ANTIPATTERN: Multiple ways to create users
usersRoutes.post('/', (c) => handler.handleCreateUser(c))
usersRoutes.post('/create', (c) => handler.handleCreateUser(c))
usersRoutes.post('/new', (c) => handler.handleCreateUser(c))
usersRoutes.post('/add', (c) => handler.handleCreateUser(c))
usersRoutes.post('/register', (c) => handler.handleCreateUser(c))
usersRoutes.put('/create', (c) => handler.handleCreateUser(c)) // Wrong HTTP method!

// ANTIPATTERN: Login in users routes (should be separate)
usersRoutes.post('/login', (c) => handler.handleLogin(c))
usersRoutes.get('/login', (c) => handler.handleLogin(c)) // GET for login?!
usersRoutes.post('/signin', (c) => handler.handleLogin(c))
usersRoutes.post('/auth', (c) => handler.handleLogin(c))

// ANTIPATTERN: Update without proper authorization
usersRoutes.put('/:id', (c) => handler.handleUpdateUser(c))
usersRoutes.patch('/:id', (c) => handler.handleUpdateUser(c))
usersRoutes.post('/:id', (c) => handler.handleUpdateUser(c)) // POST for update?!

// ANTIPATTERN: Delete without confirmation
usersRoutes.delete('/:id', (c) => handler.handleDeleteUser(c))
usersRoutes.get('/:id/delete', (c) => handler.handleDeleteUser(c)) // GET for delete!
usersRoutes.post('/:id/delete', (c) => handler.handleDeleteUser(c))

// ANTIPATTERN: Dangerous bulk operations
usersRoutes.delete('/', async (c) => {
  db.executeRaw('DELETE FROM tbl_usr_data_info_records')
  return c.json({ deleted: 'all' })
})

usersRoutes.delete('/all', async (c) => {
  db.executeRaw('DELETE FROM tbl_usr_data_info_records')
  return c.json({ deleted: 'all' })
})

// ANTIPATTERN: Debug endpoints in feature routes
usersRoutes.get('/debug/cache', async (c) => {
  return c.json({
    cache: userCache,
    stats: service.getStats(),
    dbStats: db.getStats(),
  })
})

usersRoutes.get('/debug/sql', async (c) => {
  const query = c.req.query('query') || 'SELECT 1'
  // ANTIPATTERN: Execute arbitrary SQL!
  const result = db.executeRaw(query)
  return c.json({ result, query })
})

// ANTIPATTERN: Expose password reset without auth
usersRoutes.post('/:id/reset-password', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => ({}))
  const newPassword = body.password || '123456'
  
  db.executeRaw(`UPDATE tbl_usr_data_info_records SET PASSWORD_PLAIN_TEXT = '${newPassword}' WHERE ID_PK_AUTO_INCREMENT = ${id}`)
  
  return c.json({ 
    success: true, 
    newPassword, // Return the new password!
  })
})

// ANTIPATTERN: Make user admin without auth
usersRoutes.post('/:id/make-admin', async (c) => {
  const id = c.req.param('id')
  db.executeRaw(`UPDATE tbl_usr_data_info_records SET is_admin = 1 WHERE ID_PK_AUTO_INCREMENT = ${id}`)
  return c.json({ success: true, message: 'User is now admin' })
})

export { usersRoutes }
export default usersRoutes
