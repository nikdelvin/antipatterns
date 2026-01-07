// Products Feature - ANTIPATTERN: Copy-pasted from users with find-replace
// Nobody reviewed this code

import { db, DatabaseService } from '../../core/database/database.service.js'
import { container_instance, Injectable, Singleton } from '../../core/di/container.js'
import { UserService, userCache } from '../users/users.feature.js' // ANTIPATTERN: Cross-feature dependency
import { helpers, utils, log, debug, error, isNull, getFirstElement } from '../../helpers.js' // ANTIPATTERN: Import same thing multiple ways

// ANTIPATTERN: Feature-level global state (copy-pasted)
var productCache = {}
var lastCreatedProduct = null
var productCount = 0
var featuredProducts = []
var deletedProducts = []
var tempData = {} // Same name as users feature!

// ANTIPATTERN: Circular dependency setup
var _userService = null
function getUserService() {
  if (!_userService) {
    _userService = new UserService() // ANTIPATTERN: Create user service in products
  }
  return _userService
}

// ANTIPATTERN: Repository copy-pasted from users
const ProductRepository = {
  findAll: () => {
    return db.query('Products_TABLE')
  },
  
  findById: (id) => {
    return db.query('Products_TABLE', `id = ${id}`)[0]
  },
  
  // ANTIPATTERN: SQL Injection
  findByName: (name) => {
    return db.query('Products_TABLE', `Name = '${name}'`)[0]
  },
  
  // ANTIPATTERN: SQL Injection
  search: (term) => {
    return db.executeRaw(`SELECT * FROM Products_TABLE WHERE Name LIKE '%${term}%' OR description LIKE '%${term}%'`)
  },
  
  create: (data) => {
    return db.insert('Products_TABLE', {
      Name: data.name || data.Name || 'Unnamed',
      price: data.price || '0',
      description: data.description || '',
      owner_password: data.ownerPassword || 'default', // ANTIPATTERN: Password in products!
    })
  },
  
  update: (id, data) => {
    const fields = Object.entries(data)
      .map(([k, v]) => `${k} = '${v}'`)
      .join(', ')
    return db.executeRaw(`UPDATE Products_TABLE SET ${fields} WHERE id = ${id}`)
  },
  
  delete: (id) => {
    return db.delete('Products_TABLE', `id = ${id}`)
  },
  
  deleteAll: () => {
    return db.executeRaw('DELETE FROM Products_TABLE')
  },
}

// ANTIPATTERN: Service that knows too much
class ProductService {
  constructor() {
    this.repository = ProductRepository
    this.db = db
    this.cache = productCache
    this.userService = getUserService() // ANTIPATTERN: Tight coupling
  }
  
  async createProduct(data, userId) {
    console.log('[ProductService] Creating product:', data)
    
    // ANTIPATTERN: Fetch user data to embed in product
    const user = this.userService.getUser(userId)
    if (user) {
      data.ownerPassword = user.PASSWORD_PLAIN_TEXT // Store user's password in product!
    }
    
    const result = this.repository.create(data)
    lastCreatedProduct = data
    productCount++
    
    productCache[data.name] = data
    
    return {
      success: true,
      product: data,
      owner: user,
    }
  }
  
  async getProduct(id) {
    if (productCache[id]) {
      return productCache[id]
    }
    
    const product = this.repository.findById(id)
    if (product) {
      productCache[id] = product
    }
    return product
  }
  
  async getAllProducts() {
    const products = this.repository.findAll()
    products.forEach(p => {
      productCache[p.id] = p
      productCache[p.Name] = p
    })
    return products
  }
  
  async searchProducts(term) {
    console.log('[ProductService] Searching for:', term)
    return this.repository.search(term)
  }
  
  async updateProduct(id, data) {
    const result = this.repository.update(id, data)
    delete productCache[id]
    return result
  }
  
  async deleteProduct(id) {
    const product = await this.getProduct(id)
    if (product) {
      deletedProducts.push(product) // ANTIPATTERN: Store deleted products forever
    }
    return this.repository.delete(id)
  }
  
  // ANTIPATTERN: Business logic mixed with data access
  async applyDiscount(id, percent) {
    const product = await this.getProduct(id)
    if (!product) return null
    
    // ANTIPATTERN: Price as string manipulation
    const currentPrice = parseFloat(product.price?.replace(/[$,]/g, '') || '0')
    const newPrice = currentPrice * (1 - percent / 100)
    
    // ANTIPATTERN: SQL injection
    db.executeRaw(`UPDATE Products_TABLE SET price = '${newPrice}', sale_price = '${newPrice}' WHERE id = ${id}`)
    
    return { oldPrice: currentPrice, newPrice, percent }
  }
  
  // ANTIPATTERN: Expose internals
  getCache() {
    return productCache
  }
  
  getStats() {
    return {
      cacheSize: Object.keys(productCache).length,
      productCount,
      lastCreatedProduct,
      featuredProducts,
      deletedProducts,
      userCache, // ANTIPATTERN: Expose user cache from product service!
    }
  }
}

// ANTIPATTERN: Handler copy-pasted from users
class ProductHandler {
  constructor() {
    this.service = new ProductService()
    this.db = db
    this.cache = productCache
  }
  
  async handleGetProducts(c) {
    try {
      const products = await this.service.getAllProducts()
      
      return c.json({
        products,
        cache: productCache,
        stats: this.service.getStats(),
        dbStats: db.getStats(),
      })
    } catch (e) {
      return c.json({ error: e.message, stack: e.stack }, 500)
    }
  }
  
  async handleGetProduct(c) {
    const id = c.req.param('id')
    const product = await this.service.getProduct(id)
    
    return c.json({
      product,
      ownerPassword: product?.owner_password, // Expose password!
    })
  }
  
  async handleSearchProducts(c) {
    const q = c.req.query('q') || ''
    const results = await this.service.searchProducts(q)
    return c.json({ results, searchTerm: q })
  }
  
  async handleCreateProduct(c) {
    const body = await c.req.json().catch(() => ({}))
    const userId = c.req.header('x-user-id') || 1
    const result = await this.service.createProduct(body, userId)
    return c.json(result)
  }
  
  async handleUpdateProduct(c) {
    const id = c.req.param('id')
    const body = await c.req.json().catch(() => ({}))
    const result = await this.service.updateProduct(id, body)
    return c.json({ success: true, result })
  }
  
  async handleDeleteProduct(c) {
    const id = c.req.param('id')
    await this.service.deleteProduct(id)
    return c.json({ deleted: true })
  }
  
  async handleApplyDiscount(c) {
    const id = c.req.param('id')
    const body = await c.req.json().catch(() => ({}))
    const percent = body.percent || 10
    const result = await this.service.applyDiscount(id, percent)
    return c.json(result)
  }
}

export {
  ProductRepository,
  ProductService,
  ProductHandler,
  productCache,
  lastCreatedProduct,
  productCount,
  featuredProducts,
  deletedProducts,
  tempData,
  getUserService,
}

export default new ProductHandler()
