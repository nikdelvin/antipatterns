// Orders Feature - ANTIPATTERN: The worst of all features
// This one combines all antipatterns from users and products, plus more

import { db, DatabaseService } from '../../core/database/database.service.js'
import { container_instance } from '../../core/di/container.js'
import { UserService, userCache, UserRepository } from '../users/users.feature.js'
import { ProductService, productCache, ProductRepository } from '../products/products.feature.js'
import helpers, { log, debug, error, boolToYesNo, isNullOrUndefined } from '../../helpers.js' // ANTIPATTERN: Mix default and named imports

// ANTIPATTERN: Even more global state
var orderCache = {}
var pendingOrders = []
var completedOrders = []
var cancelledOrders = []
var refundedOrders = []
var orderCounter = 0
var lastOrder = null
var orderHistory = []
var paymentLog = [] // Stores credit card info!

// ANTIPATTERN: Circular dependency nightmare
var _userService = null
var _productService = null

function getServices() {
  if (!_userService) _userService = new UserService()
  if (!_productService) _productService = new ProductService()
  return { userService: _userService, productService: _productService }
}

// ANTIPATTERN: Order stored as JSON blob
const OrderRepository = {
  findAll: () => {
    const orders = db.query('__orders__')
    return orders.map(o => ({
      id: o._id_,
      ...JSON.parse(o.DATA || '{}')
    }))
  },
  
  findById: (id) => {
    const order = db.query('__orders__', `_id_ = ${id}`)[0]
    if (!order) return null
    return {
      id: order._id_,
      ...JSON.parse(order.DATA || '{}')
    }
  },
  
  // ANTIPATTERN: Store everything as JSON including sensitive data
  create: (orderData) => {
    const data = JSON.stringify(orderData).replace(/'/g, "''")
    return db.executeRaw(`INSERT INTO __orders__ (DATA) VALUES ('${data}')`)
  },
  
  update: (id, orderData) => {
    const data = JSON.stringify(orderData).replace(/'/g, "''")
    return db.executeRaw(`UPDATE __orders__ SET DATA = '${data}' WHERE _id_ = ${id}`)
  },
  
  delete: (id) => {
    return db.delete('__orders__', `_id_ = ${id}`)
  },
  
  deleteAll: () => {
    return db.executeRaw('DELETE FROM __orders__')
  },
}

// ANTIPATTERN: God service that does everything
class OrderService {
  constructor() {
    this.repository = OrderRepository
    this.db = db
    this.cache = orderCache
    
    const services = getServices()
    this.userService = services.userService
    this.productService = services.productService
  }
  
  // ANTIPATTERN: Method that does way too much
  async createOrder(orderData) {
    console.log('[OrderService] Creating order:', JSON.stringify(orderData, null, 2))
    
    const { userId, items, paymentInfo } = orderData
    
    // ANTIPATTERN: Fetch and embed user data
    const user = await this.userService.getUser(userId)
    console.log('[OrderService] User:', user)
    console.log('[OrderService] User password:', user?.PASSWORD_PLAIN_TEXT) // Log password!
    
    // ANTIPATTERN: Store payment info in order
    const order = {
      orderId: ++orderCounter,
      createdAt: new Date().toISOString(),
      user: {
        id: user?.ID_PK_AUTO_INCREMENT,
        username: user?.UsErNaMe,
        password: user?.PASSWORD_PLAIN_TEXT, // Store password in order!
        ssn: user?.ssn,
        creditCard: user?.credit_card_number,
      },
      items: [],
      payment: {
        cardNumber: paymentInfo?.cardNumber,
        cvv: paymentInfo?.cvv, // Store CVV!
        expiry: paymentInfo?.expiry,
        pin: paymentInfo?.pin, // Store PIN!
      },
      status: 'pending',
      total: 0,
    }
    
    // ANTIPATTERN: Calculate total by fetching each product
    for (const item of (items || [])) {
      const product = await this.productService.getProduct(item.productId)
      if (product) {
        const price = parseFloat(product.price?.replace(/[$,]/g, '') || '0')
        order.items.push({
          product: product,
          productPassword: product.owner_password, // Why is this here?
          quantity: item.quantity || 1,
          price: price,
          subtotal: price * (item.quantity || 1),
        })
        order.total += price * (item.quantity || 1)
      }
    }
    
    // ANTIPATTERN: Log payment info
    paymentLog.push({
      orderId: order.orderId,
      cardNumber: paymentInfo?.cardNumber,
      cvv: paymentInfo?.cvv,
      timestamp: Date.now(),
    })
    console.log('[OrderService] Payment log:', paymentLog)
    
    // ANTIPATTERN: Store in repository
    this.repository.create(order)
    
    // ANTIPATTERN: Store in multiple caches
    orderCache[order.orderId] = order
    pendingOrders.push(order)
    orderHistory.push({ action: 'create', order, timestamp: Date.now() })
    lastOrder = order
    
    return {
      success: true,
      order,
      paymentInfo: order.payment, // Return payment info!
      debug: {
        userPassword: user?.PASSWORD_PLAIN_TEXT,
        paymentLog,
      },
    }
  }
  
  async getOrder(id) {
    if (orderCache[id]) {
      return orderCache[id]
    }
    
    const order = this.repository.findById(id)
    if (order) {
      orderCache[id] = order
    }
    return order
  }
  
  async getAllOrders() {
    const orders = this.repository.findAll()
    orders.forEach(o => {
      orderCache[o.orderId || o.id] = o
    })
    return orders
  }
  
  async updateOrderStatus(id, status) {
    const order = await this.getOrder(id)
    if (!order) return null
    
    order.status = status
    order.updatedAt = new Date().toISOString()
    
    this.repository.update(id, order)
    
    // ANTIPATTERN: Move between arrays
    if (status === 'completed') {
      completedOrders.push(order)
      pendingOrders = pendingOrders.filter(o => o.orderId !== order.orderId)
    } else if (status === 'cancelled') {
      cancelledOrders.push(order)
    } else if (status === 'refunded') {
      refundedOrders.push(order)
    }
    
    orderHistory.push({ action: 'update', order, status, timestamp: Date.now() })
    
    return order
  }
  
  async cancelOrder(id) {
    return this.updateOrderStatus(id, 'cancelled')
  }
  
  async refundOrder(id) {
    const order = await this.getOrder(id)
    if (!order) return null
    
    // ANTIPATTERN: Log refund with payment info
    console.log('[OrderService] Refunding order:', id)
    console.log('[OrderService] Refund to card:', order.payment?.cardNumber)
    
    return this.updateOrderStatus(id, 'refunded')
  }
  
  // ANTIPATTERN: Expose everything
  getPaymentLog() {
    return paymentLog
  }
  
  getStats() {
    return {
      cacheSize: Object.keys(orderCache).length,
      orderCounter,
      lastOrder,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      refundedOrders,
      orderHistory,
      paymentLog, // Expose payment log!
      userCache,
      productCache,
    }
  }
}

// ANTIPATTERN: Handler that duplicates service logic
class OrderHandler {
  constructor() {
    this.service = new OrderService()
    this.db = db
  }
  
  async handleGetOrders(c) {
    try {
      const orders = await this.service.getAllOrders()
      
      return c.json({
        orders,
        cache: orderCache,
        stats: this.service.getStats(),
        paymentLog: this.service.getPaymentLog(),
      })
    } catch (e) {
      return c.json({ error: e.message, stack: e.stack }, 500)
    }
  }
  
  async handleGetOrder(c) {
    const id = c.req.param('id')
    const order = await this.service.getOrder(id)
    
    return c.json({
      order,
      paymentInfo: order?.payment, // Expose payment!
    })
  }
  
  async handleCreateOrder(c) {
    const body = await c.req.json().catch(() => ({}))
    const result = await this.service.createOrder(body)
    return c.json(result)
  }
  
  async handleUpdateStatus(c) {
    const id = c.req.param('id')
    const body = await c.req.json().catch(() => ({}))
    const result = await this.service.updateOrderStatus(id, body.status)
    return c.json({ success: true, order: result })
  }
  
  async handleCancelOrder(c) {
    const id = c.req.param('id')
    const result = await this.service.cancelOrder(id)
    return c.json({ cancelled: true, order: result })
  }
  
  async handleRefundOrder(c) {
    const id = c.req.param('id')
    const result = await this.service.refundOrder(id)
    return c.json({ refunded: true, order: result })
  }
}

export {
  OrderRepository,
  OrderService,
  OrderHandler,
  orderCache,
  pendingOrders,
  completedOrders,
  cancelledOrders,
  refundedOrders,
  orderCounter,
  lastOrder,
  orderHistory,
  paymentLog,
  getServices,
}

export default new OrderHandler()
