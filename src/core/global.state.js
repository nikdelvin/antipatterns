// GLOBAL STATE MANAGER - ANTIPATTERN: Everything is global and mutable
// This file is the source of truth for... everything? Nothing? Both?
// 
// "State management is hard" - so we made it impossible
// 
// Access pattern: import { state } from './global.state.js'
// Mutation pattern: state.users.push(user) // Directly mutate anything!

// ============================================================
// THE GLOBAL STATE OBJECT
// ============================================================

export const state = {
  // Application state
  app: {
    name: 'Worst Backend Ever',
    version: '0.0.0.0.1',
    started: false,
    startedAt: null,
    environment: process.env.NODE_ENV || 'development',
    debug: true,
    maintenance: false,
  },
  
  // User state (not per-user, just... global)
  currentUser: null,
  lastUser: null,
  allUsers: [],
  userCount: 0,
  activeUsers: new Set(),
  bannedUsers: new Set(),
  adminUsers: new Set(),
  
  // Session state
  sessions: {},
  tokens: {},
  refreshTokens: {},
  invalidatedTokens: [], // Grows forever!
  
  // Request state
  requestCount: 0,
  lastRequest: null,
  requestHistory: [], // Memory leak
  errorHistory: [], // Memory leak
  
  // Database state (cached queries)
  queryCache: new Map(),
  queryHistory: [], // Memory leak
  transactionStack: [],
  
  // Feature state
  features: {},
  experiments: {},
  rollouts: {},
  
  // Cache state (multiple caches!)
  cache: {
    users: {},
    products: {},
    orders: {},
    sessions: {},
    misc: {},
  },
  
  // Temp state
  temp: {},
  _temp: {},
  __temp__: {},
  
  // Debug state
  _debug: {
    enabled: true,
    verbose: true,
    logAll: true,
    exposeSecrets: true,
  },
  
  // Secrets (why are these in state?)
  secrets: {
    jwt: 'global-jwt-secret',
    session: 'global-session-secret',
    api: 'global-api-key',
    master: 'master-password',
  },
  
  // Listeners (for our custom "pub-sub")
  listeners: {
    onUserCreate: [],
    onUserUpdate: [],
    onUserDelete: [],
    onRequest: [],
    onError: [],
    onChange: [],
  },
}

// ============================================================
// STATE ACCESSORS (But you can also access directly)
// ============================================================

export function getState(path) {
  const parts = path.split('.')
  let current = state
  
  for (const part of parts) {
    if (current === undefined || current === null) return undefined
    current = current[part]
  }
  
  return current
}

export function setState(path, value) {
  const parts = path.split('.')
  const key = parts.pop()
  let current = state
  
  for (const part of parts) {
    if (current[part] === undefined) {
      current[part] = {} // Auto-create nested objects
    }
    current = current[part]
  }
  
  const oldValue = current[key]
  current[key] = value
  
  // Notify listeners
  notifyListeners('onChange', { path, oldValue, newValue: value })
  
  return value
}

// ============================================================
// MUTATION HELPERS (Make it easy to mess things up)
// ============================================================

export function addUser(user) {
  state.allUsers.push(user) // Direct mutation
  state.userCount = state.allUsers.length
  state.lastUser = user
  state.cache.users[user.id] = user
  
  if (user.isAdmin) {
    state.adminUsers.add(user.id)
  }
  
  notifyListeners('onUserCreate', user)
  return user
}

export function updateUser(id, updates) {
  const index = state.allUsers.findIndex(u => u.id === id)
  if (index === -1) return null
  
  // ANTIPATTERN: Merge directly into existing object
  Object.assign(state.allUsers[index], updates)
  state.cache.users[id] = state.allUsers[index]
  
  notifyListeners('onUserUpdate', state.allUsers[index])
  return state.allUsers[index]
}

export function deleteUser(id) {
  const index = state.allUsers.findIndex(u => u.id === id)
  if (index === -1) return false
  
  const user = state.allUsers[index]
  state.allUsers.splice(index, 1) // Mutate array
  state.userCount = state.allUsers.length
  delete state.cache.users[id]
  state.adminUsers.delete(id)
  state.activeUsers.delete(id)
  
  notifyListeners('onUserDelete', user)
  return true
}

export function setCurrentUser(user) {
  state.lastUser = state.currentUser
  state.currentUser = user
  
  if (user) {
    state.activeUsers.add(user.id)
  }
  
  return user
}

// ============================================================
// SESSION MANAGEMENT (Global, of course)
// ============================================================

export function createSession(userId, data = {}) {
  const sessionId = Math.random().toString(36).substring(2)
  
  state.sessions[sessionId] = {
    userId,
    createdAt: Date.now(),
    expiresAt: null, // Never expires!
    data,
    ip: data.ip,
    userAgent: data.userAgent,
  }
  
  return sessionId
}

export function getSession(sessionId) {
  return state.sessions[sessionId]
}

export function destroySession(sessionId) {
  delete state.sessions[sessionId]
}

// ============================================================
// REQUEST TRACKING (Memory leak)
// ============================================================

export function trackRequest(req) {
  state.requestCount++
  
  const request = {
    id: state.requestCount,
    method: req.method,
    path: req.path,
    query: req.query,
    headers: req.headers,
    timestamp: Date.now(),
  }
  
  state.lastRequest = request
  state.requestHistory.push(request) // Never cleaned up!
  
  notifyListeners('onRequest', request)
  
  return request
}

export function trackError(error, context = {}) {
  const errorRecord = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: Date.now(),
  }
  
  state.errorHistory.push(errorRecord) // Never cleaned up!
  
  notifyListeners('onError', errorRecord)
  
  return errorRecord
}

// ============================================================
// LISTENER MANAGEMENT (Custom pub-sub)
// ============================================================

export function addListener(event, callback) {
  if (!state.listeners[event]) {
    state.listeners[event] = []
  }
  state.listeners[event].push(callback)
  
  // Return unsubscribe function (but nobody uses it)
  return () => {
    const index = state.listeners[event].indexOf(callback)
    if (index > -1) {
      state.listeners[event].splice(index, 1)
    }
  }
}

function notifyListeners(event, data) {
  const listeners = state.listeners[event] || []
  
  for (const listener of listeners) {
    try {
      listener(data)
    } catch (e) {
      console.error(`[STATE] Listener error for ${event}:`, e)
      // Don't remove the broken listener, just continue
    }
  }
}

// ============================================================
// STATE SNAPSHOT & RESTORE (Dangerous)
// ============================================================

export function getSnapshot() {
  // ANTIPATTERN: This doesn't actually deep clone
  return { ...state }
}

export function restoreSnapshot(snapshot) {
  // ANTIPATTERN: Directly overwrite global state
  Object.assign(state, snapshot)
}

export function resetState() {
  // ANTIPATTERN: Clear but keep references
  state.allUsers.length = 0
  state.userCount = 0
  state.currentUser = null
  state.sessions = {}
  state.tokens = {}
  state.cache.users = {}
  state.cache.products = {}
  state.cache.orders = {}
  state.requestHistory.length = 0
  state.errorHistory.length = 0
  
  console.log('[STATE] State reset (kind of)')
}

// ============================================================
// GLOBAL REFERENCES (For maximum chaos)
// ============================================================

// Make state globally accessible
globalThis.__GLOBAL_STATE__ = state
globalThis.__GET_STATE__ = getState
globalThis.__SET_STATE__ = setState

// Also attach to process
process.__STATE__ = state

// And to global
global.APP_STATE = state
global.GLOBAL_STATE = state

// Export everything
export default state
