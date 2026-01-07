// Orders Routes - ANTIPATTERN: Even more copy-paste chaos
// This file is getting out of hand

import { Hono } from 'hono'
import orderHandler, { OrderHandler, OrderService, orderCache, paymentLog } from './orders.feature.js'
import { db } from '../../core/database/database.service.js'
import { userCache } from '../users/users.feature.js'
import { productCache } from '../products/products.feature.js'

const handler = new OrderHandler()
const service = new OrderService()

const ordersRoutes = new Hono()

// ANTIPATTERN: Middleware logging sensitive payment data
ordersRoutes.use('*', async (c, next) => {
  console.log('[Orders] Request:', c.req.method, c.req.path)
  
  // ANTIPATTERN: Try to read body and log it (including payment info)
  try {
    const body = await c.req.json()
    console.log('[Orders] Body:', JSON.stringify(body, null, 2))
    if (body.paymentInfo) {
      console.log('[Orders] Card Number:', body.paymentInfo.cardNumber)
      console.log('[Orders] CVV:', body.paymentInfo.cvv)
    }
  } catch (e) {
    // Body already consumed or not JSON
  }
  
  globalThis.__lastOrderRequest__ = {
    method: c.req.method,
    path: c.req.path,
  }
  
  await next()
})

// ANTIPATTERN: Multiple route aliases
ordersRoutes.get('/', (c) => handler.handleGetOrders(c))
ordersRoutes.get('/all', (c) => handler.handleGetOrders(c))
ordersRoutes.get('/list', (c) => handler.handleGetOrders(c))
ordersRoutes.get('/history', (c) => handler.handleGetOrders(c))

ordersRoutes.get('/:id', (c) => handler.handleGetOrder(c))

ordersRoutes.post('/', (c) => handler.handleCreateOrder(c))
ordersRoutes.post('/create', (c) => handler.handleCreateOrder(c))
ordersRoutes.post('/new', (c) => handler.handleCreateOrder(c))
ordersRoutes.post('/checkout', (c) => handler.handleCreateOrder(c))
ordersRoutes.post('/place', (c) => handler.handleCreateOrder(c))

ordersRoutes.put('/:id/status', (c) => handler.handleUpdateStatus(c))
ordersRoutes.patch('/:id/status', (c) => handler.handleUpdateStatus(c))
ordersRoutes.post('/:id/status', (c) => handler.handleUpdateStatus(c))

ordersRoutes.post('/:id/cancel', (c) => handler.handleCancelOrder(c))
ordersRoutes.get('/:id/cancel', (c) => handler.handleCancelOrder(c)) // GET for cancel!
ordersRoutes.delete('/:id/cancel', (c) => handler.handleCancelOrder(c))

ordersRoutes.post('/:id/refund', (c) => handler.handleRefundOrder(c))
ordersRoutes.get('/:id/refund', (c) => handler.handleRefundOrder(c)) // GET for refund!

// ANTIPATTERN: Bulk delete
ordersRoutes.delete('/', async (c) => {
  db.executeRaw('DELETE FROM __orders__')
  return c.json({ deleted: 'all' })
})

// ANTIPATTERN: Expose payment log
ordersRoutes.get('/debug/payments', async (c) => {
  return c.json({
    paymentLog,
    cardNumbers: paymentLog.map(p => p.cardNumber),
    cvvs: paymentLog.map(p => p.cvv),
  })
})

// ANTIPATTERN: Expose all caches
ordersRoutes.get('/debug/cache', async (c) => {
  return c.json({
    orderCache,
    userCache,
    productCache,
    stats: service.getStats(),
  })
})

// ANTIPATTERN: Execute arbitrary SQL
ordersRoutes.get('/debug/sql', async (c) => {
  const query = c.req.query('query') || 'SELECT * FROM __orders__'
  const result = db.executeRaw(query)
  return c.json({ result, query })
})

// ANTIPATTERN: Process payment without validation
ordersRoutes.post('/:id/process-payment', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => ({}))
  
  console.log('[Orders] Processing payment for order:', id)
  console.log('[Orders] Card:', body.cardNumber)
  console.log('[Orders] CVV:', body.cvv)
  console.log('[Orders] Amount:', body.amount)
  
  // ANTIPATTERN: "Process" payment by just marking as paid
  const order = await service.getOrder(id)
  if (order) {
    order.status = 'paid'
    order.payment = {
      ...order.payment,
      ...body,
      processedAt: Date.now(),
    }
  }
  
  return c.json({
    success: true,
    order,
    paymentDetails: body, // Echo back payment info!
  })
})

// ANTIPATTERN: Update payment info (allows changing card after order)
ordersRoutes.put('/:id/payment', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => ({}))
  
  const order = await service.getOrder(id)
  if (order) {
    order.payment = {
      ...order.payment,
      ...body,
    }
    
    // Log the new payment info
    paymentLog.push({
      orderId: id,
      cardNumber: body.cardNumber,
      cvv: body.cvv,
      action: 'update',
      timestamp: Date.now(),
    })
  }
  
  return c.json({ success: true, order })
})

export { ordersRoutes }
export default ordersRoutes
