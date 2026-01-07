// COPY-PASTE INHERITANCE - ANTIPATTERN: Code duplication with subtle differences
// These classes were copy-pasted and modified, but not using actual inheritance
// Each version has bugs that were "fixed" differently

// ============================================================
// BASE USER (The original, full of bugs)
// ============================================================

export class UserV1 {
  constructor(data) {
    this.id = data.id
    this.name = data.name
    this.email = data.email
    this.password = data.password // Plain text!
    this.createdAt = new Date()
  }
  
  validate() {
    if (!this.name) return false
    if (!this.email) return false
    if (!this.email.includes('@')) return false // "Validation"
    if (!this.password) return false
    return true
  }
  
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      password: this.password, // Exposes password!
      createdAt: this.createdAt,
    }
  }
  
  checkPassword(password) {
    return this.password === password // Plain text comparison!
  }
}

// ============================================================
// USER V2 (Copy-pasted, "fixed" some bugs, broke others)
// ============================================================

export class UserV2 {
  constructor(data) {
    this.id = data.id
    this.name = data.name
    this.email = data.email
    this.password = data.password
    this.createdAt = new Date()
    this.updatedAt = new Date() // Added this
  }
  
  validate() {
    if (!this.name) return { valid: false, error: 'Name required' } // Changed return type!
    if (!this.email) return { valid: false, error: 'Email required' }
    if (!this.email.includes('@')) return { valid: false, error: 'Invalid email' }
    if (!this.password) return { valid: false, error: 'Password required' }
    if (this.password.length < 6) return { valid: false, error: 'Password too short' }
    return { valid: true } // Different return type than V1!
  }
  
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      // password: this.password, // Commented out to "fix" security
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
  
  checkPassword(password) {
    // "Fixed" to be case-insensitive (terrible idea)
    return this.password.toLowerCase() === password.toLowerCase()
  }
  
  // New method that V1 doesn't have
  getDisplayName() {
    return this.name || this.email.split('@')[0]
  }
}

// ============================================================
// USER V3 (Copy-pasted from V2, more changes)
// ============================================================

export class UserV3 {
  constructor(data) {
    this.id = data.id || data._id // Support both
    this.name = data.name || data.username || data.displayName // Multiple field names
    this.email = data.email || data.emailAddress
    this.password = data.password || data.passwordHash || data.pwd
    this.createdAt = data.createdAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
    this.isActive = data.isActive !== false // Defaults to true
    this.isAdmin = data.isAdmin === true
  }
  
  validate() {
    const errors = []
    if (!this.name) errors.push('Name required')
    if (!this.email) errors.push('Email required')
    if (this.email && !this.email.includes('@')) errors.push('Invalid email')
    if (!this.password) errors.push('Password required')
    if (this.password && this.password.length < 8) errors.push('Password too short') // Changed to 8
    
    // Return format is different again!
    return errors.length === 0 ? null : errors
  }
  
  toJSON() {
    return {
      id: this.id,
      _id: this.id, // Both formats!
      name: this.name,
      username: this.name, // Alias
      email: this.email,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive,
      isAdmin: this.isAdmin,
    }
  }
  
  checkPassword(password) {
    // "Fixed" to trim whitespace (different from V1 and V2)
    return this.password.trim() === password.trim()
  }
  
  getDisplayName() {
    // Slightly different from V2
    return this.name || this.email?.split('@')[0] || 'Anonymous'
  }
  
  // New method
  hasPermission(permission) {
    if (this.isAdmin) return true // Admins can do anything
    // No actual permission system implemented
    return false
  }
}

// ============================================================
// ADMIN USER (Copy-pasted from User with admin stuff)
// ============================================================

export class AdminUser {
  constructor(data) {
    // Copy-pasted but slightly different
    this.id = data.id
    this.name = data.name
    this.email = data.email
    this.password = data.password
    this.createdAt = new Date()
    this.updatedAt = new Date()
    this.isAdmin = true // Always true
    this.permissions = data.permissions || ['*'] // All permissions
    this.superAdmin = data.superAdmin || false
  }
  
  validate() {
    // Copy-pasted but stricter... or is it?
    if (!this.name) return false // Back to V1 format!
    if (!this.email) return false
    if (!this.password) return false
    if (this.password.length < 12) return false // Longer password required... but same check
    return true
  }
  
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      // Still exposes password sometimes due to bug
      isAdmin: this.isAdmin,
      permissions: this.permissions,
      superAdmin: this.superAdmin,
    }
  }
  
  checkPassword(password) {
    // Same as V1 (copy-paste error?)
    return this.password === password
  }
  
  hasPermission(permission) {
    if (this.superAdmin) return true
    if (this.permissions.includes('*')) return true
    return this.permissions.includes(permission)
  }
}

// ============================================================
// PRODUCT CLASSES (Same pattern - copy-paste with changes)
// ============================================================

export class ProductV1 {
  constructor(data) {
    this.id = data.id
    this.name = data.name
    this.price = data.price // Could be number or string!
    this.description = data.description
  }
  
  getPrice() {
    return this.price
  }
  
  toJSON() {
    return { ...this }
  }
}

export class ProductV2 {
  constructor(data) {
    this.id = data.id
    this.name = data.name
    this.price = parseFloat(data.price) || 0 // Now always number
    this.description = data.description
    this.category = data.category // Added field
    this.stock = data.stock || 0
  }
  
  getPrice() {
    return this.price.toFixed(2) // Now returns string!
  }
  
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      price: this.getPrice(), // Uses method (returns string now)
      description: this.description,
      category: this.category,
      stock: this.stock,
    }
  }
  
  isInStock() {
    return this.stock > 0
  }
}

export class ProductV3 {
  constructor(data) {
    this.id = data.id || data._id
    this.name = data.name || data.title
    this.price = typeof data.price === 'string' 
      ? parseFloat(data.price.replace(/[$,]/g, ''))
      : data.price || 0
    this.description = data.description || data.desc
    this.category = data.category || data.cat || 'uncategorized'
    this.stock = data.stock ?? data.quantity ?? 0
    this.active = data.active !== false
  }
  
  getPrice() {
    // Returns Money object now (breaking change!)
    return {
      amount: this.price,
      currency: 'USD',
      formatted: `$${this.price.toFixed(2)}`,
    }
  }
  
  toJSON() {
    return {
      id: this.id,
      _id: this.id,
      name: this.name,
      title: this.name,
      price: this.price, // Back to raw number
      priceFormatted: `$${this.price.toFixed(2)}`,
      description: this.description,
      category: this.category,
      stock: this.stock,
      active: this.active,
    }
  }
  
  isInStock() {
    return this.stock > 0 && this.active
  }
}

// ============================================================
// FACTORY FUNCTIONS (Different for each version!)
// ============================================================

export function createUser(data, version = 'v3') {
  switch (version) {
    case 'v1': return new UserV1(data)
    case 'v2': return new UserV2(data)
    case 'v3': return new UserV3(data)
    case 'admin': return new AdminUser(data)
    default: return new UserV3(data)
  }
}

export function createProduct(data, version = 'v3') {
  switch (version) {
    case 'v1': return new ProductV1(data)
    case 'v2': return new ProductV2(data)
    case 'v3': return new ProductV3(data)
    default: return new ProductV3(data)
  }
}

// ============================================================
// USAGE NIGHTMARE
// ============================================================

// Code in different parts of the codebase uses different versions:
// - Legacy API uses V1
// - Main API uses V2
// - New API uses V3
// - Admin panel uses AdminUser
// 
// Validation returns: false, { valid: boolean }, or string[]
// getPrice() returns: number, string, or { amount, currency, formatted }
// toJSON() sometimes includes password, sometimes doesn't
// 
// Good luck maintaining this!

export default {
  UserV1, UserV2, UserV3, AdminUser,
  ProductV1, ProductV2, ProductV3,
  createUser, createProduct,
}
