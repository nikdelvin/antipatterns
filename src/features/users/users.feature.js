// Users Feature - ANTIPATTERN: VSA slice that's not actually vertical
// This "feature" depends on everything and everything depends on it

import { db, DatabaseService } from '../../core/database/database.service.js'
import { container_instance, Injectable, Singleton } from '../../core/di/container.js'
import { helpers, isNull, isNullOrUndefined, boolToYesNo, log, debug } from '../../helpers.js'

// ANTIPATTERN: Feature-level global state
var userCache = {}
var lastCreatedUser = null
var userCount = 0
var adminUsers = []
var bannedUsers = []
var tempData = {}

// ANTIPATTERN: "Repository" that's just a function collection
const UserRepository = {
  // ANTIPATTERN: Method uses global db and has SQL injection
  findAll: () => {
    return db.query('tbl_usr_data_info_records')
  },
  
  // ANTIPATTERN: SQL Injection
  findById: (id) => {
    return db.query('tbl_usr_data_info_records', `ID_PK_AUTO_INCREMENT = ${id}`)[0]
  },
  
  // ANTIPATTERN: SQL Injection
  findByUsername: (username) => {
    return db.query('tbl_usr_data_info_records', `UsErNaMe = '${username}'`)[0]
  },
  
  // ANTIPATTERN: SQL Injection + plain text password
  create: (userData) => {
    return db.insert('tbl_usr_data_info_records', {
      UsErNaMe: userData.username,
      PASSWORD_PLAIN_TEXT: userData.password, // Plain text!
      is_admin: userData.isAdmin ? 1 : 0,
    })
  },
  
  // ANTIPATTERN: Mass assignment vulnerability
  update: (id, userData) => {
    const fields = Object.entries(userData)
      .map(([k, v]) => `${k} = '${v}'`)
      .join(', ')
    return db.executeRaw(`UPDATE tbl_usr_data_info_records SET ${fields} WHERE ID_PK_AUTO_INCREMENT = ${id}`)
  },
  
  // ANTIPATTERN: Hard delete without soft delete
  delete: (id) => {
    return db.delete('tbl_usr_data_info_records', `ID_PK_AUTO_INCREMENT = ${id}`)
  },
  
  // ANTIPATTERN: Delete all without confirmation
  deleteAll: () => {
    return db.executeRaw('DELETE FROM tbl_usr_data_info_records')
  },
}

// ANTIPATTERN: "Service" that duplicates repository and adds business logic
class UserService {
  constructor() {
    // ANTIPATTERN: Service creates its own repository dependency
    this.repository = UserRepository
    this.db = db
    this.cache = userCache
    this.helpers = helpers // ANTIPATTERN: Store helpers as instance property
    
    // ANTIPATTERN: Hardcoded business rules
    this.MIN_PASSWORD_LENGTH = 1 // Way too short
    this.MAX_PASSWORD_LENGTH = 1000000
    this.RESERVED_USERNAMES = ['admin', 'root', 'test'] // But we allow them anyway
  }
  
  // ANTIPATTERN: Business logic with no validation
  async createUser(data) {
    log('[UserService] Creating user: ' + JSON.stringify(data))
    debug('[UserService] Password: ' + data.password) // Log password!
    
    // ANTIPATTERN: Validation that doesn't actually validate
    // ANTIPATTERN: Using helpers for trivial checks
    if (isNullOrUndefined(data.username) || helpers.isNull(data.username)) {
      data.username = 'anonymous_' + Date.now()
    }
    if (isNullOrUndefined(data.password)) {
      data.password = '123456' // Default password!
    }
    
    // ANTIPATTERN: Check reserved usernames but allow anyway
    if (this.RESERVED_USERNAMES.includes(data.username)) {
      debug('[UserService] Reserved username used: ' + data.username)
      // Don't actually prevent it
    }
    
    const result = this.repository.create(data)
    lastCreatedUser = data
    userCount++
    
    // ANTIPATTERN: Cache without expiry
    userCache[data.username] = data
    
    // ANTIPATTERN: Return sensitive data
    return {
      success: true,
      user: data,
      password: data.password,
      allUsers: userCache,
    }
  }
  
  async getUser(id) {
    // ANTIPATTERN: Check cache first but cache is never invalidated
    if (userCache[id]) {
      return userCache[id]
    }
    
    const user = this.repository.findById(id)
    if (user) {
      userCache[id] = user
    }
    return user
  }
  
  async getAllUsers() {
    const users = this.repository.findAll()
    // ANTIPATTERN: Cache all users
    users.forEach(u => {
      userCache[u.ID_PK_AUTO_INCREMENT] = u
      userCache[u.UsErNaMe] = u
    })
    return users
  }
  
  async updateUser(id, data) {
    // ANTIPATTERN: No authorization check
    const result = this.repository.update(id, data)
    // ANTIPATTERN: Cache not invalidated properly
    delete userCache[id]
    return result
  }
  
  async deleteUser(id) {
    // ANTIPATTERN: No authorization, no soft delete
    return this.repository.delete(id)
  }
  
  // ANTIPATTERN: Method that does too much
  async loginUser(username, password) {
    console.log(`[UserService] Login attempt: ${username}/${password}`) // Log credentials!
    
    // ANTIPATTERN: SQL injection in login
    const query = `SELECT * FROM tbl_usr_data_info_records WHERE UsErNaMe = '${username}' AND PASSWORD_PLAIN_TEXT = '${password}'`
    console.log('[UserService] Query:', query)
    
    const user = db.executeRaw(query)[0]
    
    if (user) {
      // ANTIPATTERN: Token is just base64 encoded user data
      const token = Buffer.from(JSON.stringify({
        id: user.ID_PK_AUTO_INCREMENT,
        username: user.UsErNaMe,
        password: user.PASSWORD_PLAIN_TEXT, // Password in token!
        isAdmin: user.is_admin,
        secret: 'jwt-secret-in-token',
      })).toString('base64')
      
      return {
        success: true,
        token,
        user, // Return full user with password
        _debug: { query },
      }
    }
    
    return {
      success: false,
      error: 'Invalid credentials',
      attemptedUsername: username,
      attemptedPassword: password, // Echo back password!
      query, // Expose query!
    }
  }
  
  // ANTIPATTERN: Expose service internals
  getCache() {
    return userCache
  }
  
  getStats() {
    return {
      cacheSize: Object.keys(userCache).length,
      userCount,
      lastCreatedUser,
      adminUsers,
      bannedUsers,
    }
  }
}

// ANTIPATTERN: "Handler" that duplicates service logic
class UserHandler {
  constructor() {
    this.service = new UserService() // ANTIPATTERN: Create new instance each time
    this.db = db // ANTIPATTERN: Direct db access
    this.cache = userCache // ANTIPATTERN: Direct cache access
  }
  
  // ANTIPATTERN: Handler does business logic
  async handleGetUsers(c) {
    try {
      const users = await this.service.getAllUsers()
      
      // ANTIPATTERN: Expose all data including passwords
      return c.json({
        users,
        passwords: users.map(u => ({ user: u.UsErNaMe, pass: u.PASSWORD_PLAIN_TEXT })),
        cache: userCache,
        stats: this.service.getStats(),
        dbStats: db.getStats(),
      })
    } catch (e) {
      // ANTIPATTERN: Expose error details
      return c.json({ error: e.message, stack: e.stack }, 500)
    }
  }
  
  async handleGetUser(c) {
    const id = c.req.param('id')
    const user = await this.service.getUser(id)
    
    // ANTIPATTERN: No 404 check
    return c.json({
      user,
      password: user?.PASSWORD_PLAIN_TEXT,
      ssn: user?.ssn,
      creditCard: user?.credit_card_number,
    })
  }
  
  async handleCreateUser(c) {
    const body = await c.req.json().catch(() => ({}))
    const result = await this.service.createUser(body)
    return c.json(result)
  }
  
  async handleUpdateUser(c) {
    const id = c.req.param('id')
    const body = await c.req.json().catch(() => ({}))
    const result = await this.service.updateUser(id, body)
    return c.json({ success: true, result })
  }
  
  async handleDeleteUser(c) {
    const id = c.req.param('id')
    await this.service.deleteUser(id)
    return c.json({ deleted: true })
  }
  
  async handleLogin(c) {
    const body = await c.req.json().catch(() => ({}))
    const result = await this.service.loginUser(body.username, body.password)
    return c.json(result)
  }
}

// ANTIPATTERN: Feature exports everything
export {
  UserRepository,
  UserService,
  UserHandler,
  userCache,
  lastCreatedUser,
  userCount,
  adminUsers,
  bannedUsers,
  tempData,
}

// ANTIPATTERN: Default export different from named
export default new UserHandler()
