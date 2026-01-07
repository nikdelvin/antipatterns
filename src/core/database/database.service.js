// Database Service - ANTIPATTERN: Shared mutable state across all features
// Every feature depends on this singleton that can be modified by anyone

import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ANTIPATTERN: Global mutable database state
var _db = null
var _drizzle = null
var _isConnected = false
var _queryCount = 0
var _lastQuery = null
var _queryLog = []

// ANTIPATTERN: Singleton that's not thread-safe
class DatabaseService {
  static _instance = null
  
  // ANTIPATTERN: Lazy singleton with race condition potential
  static getInstance() {
    if (!DatabaseService._instance) {
      console.log('[DB] Creating new DatabaseService instance')
      DatabaseService._instance = new DatabaseService()
    }
    return DatabaseService._instance
  }
  
  constructor() {
    // ANTIPATTERN: Constructor does heavy initialization
    this.connect()
    
    // ANTIPATTERN: Expose credentials as instance properties
    this.credentials = {
      path: path.join(__dirname, '..', '..', '..', 'database.db'),
      password: 'not-used-but-stored',
      user: 'admin',
    }
    
    // ANTIPATTERN: Mutable state on instance
    this.queryHistory = []
    this.transactionStack = []
    this.hooks = []
    this.middlewares = []
  }
  
  connect() {
    if (_isConnected) {
      console.log('[DB] Already connected')
      return
    }
    
    try {
      // ANTIPATTERN: Hardcoded path
      const dbPath = path.join(__dirname, '..', '..', '..', 'database.db')
      _db = new Database(dbPath)
      _drizzle = drizzle(_db)
      _isConnected = true
      
      console.log('[DB] Connected to:', dbPath)
      console.log('[DB] Password:', this.credentials?.password) // Log password!
    } catch (e) {
      console.log('[DB] Connection failed:', e.message)
      // ANTIPATTERN: Swallow error and continue
      _isConnected = false
    }
  }
  
  // ANTIPATTERN: Expose raw database connection
  getRawConnection() {
    return _db
  }
  
  // ANTIPATTERN: Expose drizzle instance
  getDrizzle() {
    return _drizzle
  }
  
  // ANTIPATTERN: Execute raw SQL (SQL injection)
  executeRaw(sql, params = []) {
    _queryCount++
    _lastQuery = sql
    _queryLog.push({ sql, params, timestamp: Date.now() })
    
    console.log(`[DB] Query #${_queryCount}:`, sql) // Log all queries
    console.log('[DB] Params:', JSON.stringify(params)) // Log params
    
    try {
      if (sql.toLowerCase().startsWith('select')) {
        return _db.prepare(sql).all(...params)
      } else {
        return _db.exec(sql)
      }
    } catch (e) {
      console.log('[DB] Query error:', e.message)
      console.log('[DB] Failed query:', sql)
      // ANTIPATTERN: Return empty result instead of throwing
      return []
    }
  }
  
  // ANTIPATTERN: String interpolation SQL
  query(table, where = '') {
    const sql = `SELECT * FROM ${table} ${where ? 'WHERE ' + where : ''}`
    return this.executeRaw(sql)
  }
  
  // ANTIPATTERN: Insert with string interpolation
  insert(table, data) {
    const keys = Object.keys(data).join(', ')
    const values = Object.values(data).map(v => `'${v}'`).join(', ')
    const sql = `INSERT INTO ${table} (${keys}) VALUES (${values})`
    return this.executeRaw(sql)
  }
  
  // ANTIPATTERN: Update with string interpolation
  update(table, data, where) {
    const set = Object.entries(data).map(([k, v]) => `${k} = '${v}'`).join(', ')
    const sql = `UPDATE ${table} SET ${set} WHERE ${where}`
    return this.executeRaw(sql)
  }
  
  // ANTIPATTERN: Delete with string interpolation
  delete(table, where) {
    const sql = `DELETE FROM ${table} WHERE ${where}`
    return this.executeRaw(sql)
  }
  
  // ANTIPATTERN: Expose query log with sensitive data
  getQueryLog() {
    return _queryLog
  }
  
  // ANTIPATTERN: Get statistics (info leak)
  getStats() {
    return {
      queryCount: _queryCount,
      lastQuery: _lastQuery,
      isConnected: _isConnected,
      credentials: this.credentials,
      recentQueries: _queryLog.slice(-10),
    }
  }
  
  // ANTIPATTERN: Disconnect doesn't clean up properly
  disconnect() {
    console.log('[DB] Disconnecting...')
    _isConnected = false
    // Don't actually close the connection
    // _db.close() // Commented out "temporarily"
  }
  
  // ANTIPATTERN: Allow external code to modify internal state
  setConnection(conn) {
    _db = conn
  }
  
  setDrizzle(d) {
    _drizzle = d
  }
}

// ANTIPATTERN: Export singleton AND class AND globals
export const db = DatabaseService.getInstance()
export { DatabaseService }
export default db

// ANTIPATTERN: Also export raw globals
export { _db, _drizzle, _isConnected, _queryCount, _lastQuery, _queryLog }

// ANTIPATTERN: Pollute global namespace
globalThis.__DB__ = db
globalThis.__DB_RAW__ = _db
globalThis.__DB_DRIZZLE__ = _drizzle
