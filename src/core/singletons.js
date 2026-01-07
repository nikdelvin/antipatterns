// SINGLETON ABUSE - ANTIPATTERN: Everything is a singleton
// "There can only be one" - but there's actually multiple ones of each
// 
// This file contains multiple competing singletons for the same purpose
// Plus singletons that shouldn't be singletons
// Plus singletons that don't work correctly

// ============================================================
// CLASSIC SINGLETON (But broken)
// ============================================================

class DatabaseSingleton {
  static _instance = null
  
  constructor() {
    // ANTIPATTERN: Constructor runs every time
    console.log('[SINGLETON] DatabaseSingleton constructor called')
    this.connection = null
    this.queries = []
  }
  
  static getInstance() {
    // ANTIPATTERN: Race condition in getInstance
    if (!DatabaseSingleton._instance) {
      // If two calls come at the same time, two instances created!
      DatabaseSingleton._instance = new DatabaseSingleton()
    }
    return DatabaseSingleton._instance
  }
  
  connect() {
    console.log('[SINGLETON] Database connecting...')
    this.connection = { connected: true, timestamp: Date.now() }
  }
  
  query(sql) {
    this.queries.push(sql)
    return { sql, result: 'fake result' }
  }
}

// ============================================================
// ANOTHER DATABASE SINGLETON (Why do we have two?)
// ============================================================

class DatabaseConnection {
  constructor() {
    if (DatabaseConnection.instance) {
      console.log('[SINGLETON] DatabaseConnection already exists, returning existing')
      return DatabaseConnection.instance // ANTIPATTERN: Return from constructor
    }
    
    console.log('[SINGLETON] Creating new DatabaseConnection')
    DatabaseConnection.instance = this
    this.pool = []
    this.connected = false
  }
  
  static getInstance() {
    if (!DatabaseConnection.instance) {
      new DatabaseConnection() // Constructor sets instance
    }
    return DatabaseConnection.instance
  }
}

// ============================================================
// CONFIG SINGLETON (Multiple implementations)
// ============================================================

// Implementation 1: Class-based
class ConfigManagerV1 {
  static instance = null
  
  constructor() {
    if (ConfigManagerV1.instance) return ConfigManagerV1.instance
    ConfigManagerV1.instance = this
    
    this.config = {
      debug: true,
      port: 3000,
      secret: 'hardcoded-secret',
    }
  }
  
  get(key) {
    return this.config[key]
  }
  
  set(key, value) {
    this.config[key] = value
  }
}

// Implementation 2: Module-level singleton
const configSingleton = {
  config: {
    debug: false, // Different default!
    port: 8080, // Different default!
    secret: 'different-secret', // Different!
  },
  
  get(key) {
    return this.config[key]
  },
  
  set(key, value) {
    this.config[key] = value
  },
}

// Implementation 3: Frozen object
const frozenConfig = Object.freeze({
  debug: true,
  port: 3000,
  secret: 'frozen-secret',
  
  get(key) {
    return this[key]
  },
  
  // ANTIPATTERN: This set() silently fails due to Object.freeze
  set(key, value) {
    this[key] = value // Doesn't work!
  },
})

// ============================================================
// LOGGER SINGLETON (But we have console.log too)
// ============================================================

class LoggerSingleton {
  static instance = null
  
  constructor() {
    if (LoggerSingleton.instance) return LoggerSingleton.instance
    LoggerSingleton.instance = this
    
    this.logs = [] // Grows forever!
    this.level = 'debug'
  }
  
  log(...args) {
    this.logs.push({ level: 'log', args, timestamp: Date.now() })
    console.log('[LOGGER]', ...args) // Also console.log
  }
  
  error(...args) {
    this.logs.push({ level: 'error', args, timestamp: Date.now() })
    console.log('[LOGGER ERROR]', ...args) // Uses console.log not console.error!
  }
  
  debug(...args) {
    this.logs.push({ level: 'debug', args, timestamp: Date.now() })
    console.log('[LOGGER DEBUG]', ...args)
  }
  
  getLogs() {
    return this.logs // Expose internal state
  }
}

// ============================================================
// CACHE SINGLETON (Multiple caches, none work right)
// ============================================================

class CacheSingleton {
  static instances = {} // Map of instances by name
  
  constructor(name = 'default') {
    // ANTIPATTERN: Multiple "singletons" by name
    if (CacheSingleton.instances[name]) {
      return CacheSingleton.instances[name]
    }
    
    this.name = name
    this.data = {}
    this.hits = 0
    this.misses = 0
    
    CacheSingleton.instances[name] = this
  }
  
  static getInstance(name = 'default') {
    return new CacheSingleton(name)
  }
  
  get(key) {
    if (this.data[key] !== undefined) {
      this.hits++
      return this.data[key]
    }
    this.misses++
    return undefined
  }
  
  set(key, value, ttl = null) {
    this.data[key] = value
    
    if (ttl) {
      // ANTIPATTERN: setTimeout for each cached item
      setTimeout(() => {
        delete this.data[key]
      }, ttl)
    }
    
    return value
  }
  
  clear() {
    this.data = {}
  }
  
  getStats() {
    return {
      name: this.name,
      size: Object.keys(this.data).length,
      hits: this.hits,
      misses: this.misses,
    }
  }
}

// ============================================================
// USER SERVICE SINGLETON (But we also have UserService class elsewhere)
// ============================================================

let userServiceInstance = null

class UserServiceSingleton {
  constructor() {
    if (userServiceInstance) {
      console.log('[SINGLETON] UserServiceSingleton already exists!')
      return userServiceInstance
    }
    
    userServiceInstance = this
    this.users = []
  }
  
  static getInstance() {
    if (!userServiceInstance) {
      userServiceInstance = new UserServiceSingleton()
    }
    return userServiceInstance
  }
  
  createUser(data) {
    const user = { id: this.users.length + 1, ...data }
    this.users.push(user)
    return user
  }
  
  getUser(id) {
    return this.users.find(u => u.id === id)
  }
  
  getAllUsers() {
    return this.users
  }
}

// ============================================================
// EVENT EMITTER SINGLETON
// ============================================================

class EventEmitterSingleton {
  static instance = null
  
  constructor() {
    if (EventEmitterSingleton.instance) {
      return EventEmitterSingleton.instance
    }
    
    this.listeners = {}
    EventEmitterSingleton.instance = this
  }
  
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }
  
  emit(event, data) {
    const listeners = this.listeners[event] || []
    listeners.forEach(cb => {
      try {
        cb(data)
      } catch (e) {
        console.error('[EVENT SINGLETON] Listener error:', e)
      }
    })
  }
  
  // ANTIPATTERN: No way to remove listeners
}

// ============================================================
// EXPORTS (All the singletons!)
// ============================================================

export {
  DatabaseSingleton,
  DatabaseConnection,
  ConfigManagerV1,
  configSingleton,
  frozenConfig,
  LoggerSingleton,
  CacheSingleton,
  UserServiceSingleton,
  EventEmitterSingleton,
}

// Also create instances on import (side effect!)
export const db1 = DatabaseSingleton.getInstance()
export const db2 = DatabaseConnection.getInstance()
export const config1 = new ConfigManagerV1()
export const config2 = configSingleton
export const config3 = frozenConfig
export const logger = new LoggerSingleton()
export const cache = CacheSingleton.getInstance()
export const userService = UserServiceSingleton.getInstance()
export const eventEmitter = new EventEmitterSingleton()

// Default export with all instances
export default {
  db1,
  db2,
  config1,
  config2,
  config3,
  logger,
  cache,
  userService,
  eventEmitter,
  
  // Also expose classes
  DatabaseSingleton,
  DatabaseConnection,
  ConfigManagerV1,
  LoggerSingleton,
  CacheSingleton,
  UserServiceSingleton,
  EventEmitterSingleton,
}
