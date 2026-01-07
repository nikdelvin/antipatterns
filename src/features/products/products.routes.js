// Products Routes - ANTIPATTERN: Copy-pasted from users routes
// Ctrl+C, Ctrl+V, find "user" replace "product"

import { Hono } from 'hono'
import productHandler, { ProductHandler, ProductService, ProductRepository, productCache } from './products.feature.js'
import { db } from '../../core/database/database.service.js'
import { userCache } from '../users/users.feature.js' // ANTIPATTERN: Cross-feature import

const handler = new ProductHandler()
const service = new ProductService()

const productsRoutes = new Hono()

// ANTIPATTERN: Copy-pasted middleware
productsRoutes.use('*', async (c, next) => {
  console.log('[Products] Request:', c.req.method, c.req.path)
  console.log('[Products] Headers:', JSON.stringify(c.req.header()))
  
  globalThis.__lastProductRequest__ = {
    method: c.req.method,
    path: c.req.path,
    headers: c.req.header(),
  }
  
  await next()
})

// ANTIPATTERN: Duplicate routes
productsRoutes.get('/', (c) => handler.handleGetProducts(c))
productsRoutes.get('/all', (c) => handler.handleGetProducts(c))
productsRoutes.get('/list', (c) => handler.handleGetProducts(c))
productsRoutes.get('/index', (c) => handler.handleGetProducts(c))
productsRoutes.get('/catalog', (c) => handler.handleGetProducts(c))
productsRoutes.get('/inventory', (c) => handler.handleGetProducts(c))

// ANTIPATTERN: Search before :id (correct order for once, by accident)
productsRoutes.get('/search', (c) => handler.handleSearchProducts(c))

// ANTIPATTERN: Raw SQL endpoint
productsRoutes.get('/raw', async (c) => {
  const products = db.query('Products_TABLE')
  return c.json({ products, ownerPasswords: products.map(p => p.owner_password) })
})

productsRoutes.get('/:id', (c) => handler.handleGetProduct(c))

// ANTIPATTERN: Multiple create endpoints
productsRoutes.post('/', (c) => handler.handleCreateProduct(c))
productsRoutes.post('/create', (c) => handler.handleCreateProduct(c))
productsRoutes.post('/new', (c) => handler.handleCreateProduct(c))
productsRoutes.post('/add', (c) => handler.handleCreateProduct(c))
productsRoutes.put('/create', (c) => handler.handleCreateProduct(c))

// ANTIPATTERN: Update routes
productsRoutes.put('/:id', (c) => handler.handleUpdateProduct(c))
productsRoutes.patch('/:id', (c) => handler.handleUpdateProduct(c))
productsRoutes.post('/:id', (c) => handler.handleUpdateProduct(c))

// ANTIPATTERN: Delete routes
productsRoutes.delete('/:id', (c) => handler.handleDeleteProduct(c))
productsRoutes.get('/:id/delete', (c) => handler.handleDeleteProduct(c))
productsRoutes.post('/:id/delete', (c) => handler.handleDeleteProduct(c))

// ANTIPATTERN: Bulk delete
productsRoutes.delete('/', async (c) => {
  db.executeRaw('DELETE FROM Products_TABLE')
  return c.json({ deleted: 'all' })
})

// ANTIPATTERN: Discount without auth
productsRoutes.post('/:id/discount', (c) => handler.handleApplyDiscount(c))
productsRoutes.get('/:id/discount/:percent', async (c) => {
  const id = c.req.param('id')
  const percent = c.req.param('percent')
  const result = await service.applyDiscount(id, parseFloat(percent))
  return c.json(result)
})

// ANTIPATTERN: Debug routes
productsRoutes.get('/debug/cache', async (c) => {
  return c.json({
    productCache,
    userCache, // Expose user cache from products!
    stats: service.getStats(),
    dbStats: db.getStats(),
  })
})

productsRoutes.get('/debug/sql', async (c) => {
  const query = c.req.query('query') || 'SELECT * FROM Products_TABLE'
  const result = db.executeRaw(query)
  return c.json({ result, query })
})

// ANTIPATTERN: Bulk price update with SQL injection
productsRoutes.post('/bulk-update-price', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const { multiplier = 1 } = body
  
  // ANTIPATTERN: Dangerous bulk update
  db.executeRaw(`UPDATE Products_TABLE SET price = CAST(CAST(REPLACE(REPLACE(price, '$', ''), ',', '') AS REAL) * ${multiplier} AS TEXT)`)
  
  return c.json({ success: true, multiplier })
})

export { productsRoutes }
export default productsRoutes
