// Admin Feature - ANTIPATTERN: Admin panel with zero security
// Anyone can access this, anyone can do anything

import { db } from '../../core/database/database.service.js'
import { container_instance } from '../../core/di/container.js'
import { UserService, userCache } from '../users/users.feature.js'
import { ProductService, productCache } from '../products/products.feature.js'
import { OrderService, orderCache, paymentLog } from '../orders/orders.feature.js'
import { AuthService, sessions, tokens, failedLogins, bypassTokens } from '../auth/auth.feature.js'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { helpers, log, debug, error } from '../../helpers.js' // ANTIPATTERN: Import helpers in admin too

// ANTIPATTERN: Admin secrets in code
const ADMIN_SECRETS = {
  superAdminPassword: 'super-admin-123',
  masterKey: 'master-key-456',
  godMode: true,
  bypassEverything: true,
}

// ANTIPATTERN: God admin class that can do anything
class AdminService {
  constructor() {
    this.db = db
    this.userService = new UserService()
    this.productService = new ProductService()
    this.orderService = new OrderService()
    this.authService = new AuthService()
  }
  
  // ANTIPATTERN: Execute arbitrary SQL
  executeSQL(query) {
    console.log('[Admin] Executing SQL:', query)
    return db.executeRaw(query)
  }
  
  // ANTIPATTERN: Get all data from all tables
  getAllData() {
    return {
      users: db.executeRaw('SELECT * FROM tbl_usr_data_info_records'),
      products: db.executeRaw('SELECT * FROM Products_TABLE'),
      orders: db.executeRaw('SELECT * FROM __orders__'),
      passwords: db.executeRaw('SELECT UsErNaMe, PASSWORD_PLAIN_TEXT FROM tbl_usr_data_info_records'),
    }
  }
  
  // ANTIPATTERN: Delete everything
  deleteAllData() {
    console.log('[Admin] DELETING ALL DATA!')
    db.executeRaw('DELETE FROM tbl_usr_data_info_records')
    db.executeRaw('DELETE FROM Products_TABLE')
    db.executeRaw('DELETE FROM __orders__')
    return { deleted: 'everything' }
  }
  
  // ANTIPATTERN: Drop all tables
  dropAllTables() {
    console.log('[Admin] DROPPING ALL TABLES!')
    db.executeRaw('DROP TABLE IF EXISTS tbl_usr_data_info_records')
    db.executeRaw('DROP TABLE IF EXISTS Products_TABLE')
    db.executeRaw('DROP TABLE IF EXISTS __orders__')
    return { dropped: 'all' }
  }
  
  // ANTIPATTERN: Read arbitrary files
  readFile(filePath) {
    console.log('[Admin] Reading file:', filePath)
    try {
      return fs.readFileSync(filePath, 'utf8')
    } catch (e) {
      return { error: e.message }
    }
  }
  
  // ANTIPATTERN: Write arbitrary files
  writeFile(filePath, content) {
    console.log('[Admin] Writing file:', filePath)
    try {
      fs.writeFileSync(filePath, content)
      return { success: true, path: filePath }
    } catch (e) {
      return { error: e.message }
    }
  }
  
  // ANTIPATTERN: Delete arbitrary files
  deleteFile(filePath) {
    console.log('[Admin] Deleting file:', filePath)
    try {
      fs.unlinkSync(filePath)
      return { deleted: filePath }
    } catch (e) {
      return { error: e.message }
    }
  }
  
  // ANTIPATTERN: Execute shell commands
  executeCommand(command) {
    console.log('[Admin] Executing command:', command)
    try {
      const output = execSync(command).toString()
      return { output, command }
    } catch (e) {
      return { error: e.message, command }
    }
  }
  
  // ANTIPATTERN: Get all secrets
  getSecrets() {
    return {
      adminSecrets: ADMIN_SECRETS,
      jwtSecret: this.authService.jwtSecret,
      masterPassword: this.authService.masterPassword,
      bypassTokens,
      dbCredentials: db.credentials,
      envVars: process.env,
    }
  }
  
  // ANTIPATTERN: Get all caches
  getCaches() {
    return {
      userCache,
      productCache,
      orderCache,
      sessions,
      tokens,
      failedLogins,
      paymentLog,
    }
  }
  
  // ANTIPATTERN: Get system info
  getSystemInfo() {
    return {
      process: {
        pid: process.pid,
        ppid: process.ppid,
        cwd: process.cwd(),
        argv: process.argv,
        env: process.env,
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        versions: process.versions,
      },
      os: {
        hostname: require('os').hostname(),
        platform: require('os').platform(),
        arch: require('os').arch(),
        cpus: require('os').cpus(),
        memory: require('os').totalmem(),
        freeMemory: require('os').freemem(),
        networkInterfaces: require('os').networkInterfaces(),
        userInfo: require('os').userInfo(),
        homedir: require('os').homedir(),
        tmpdir: require('os').tmpdir(),
      },
    }
  }
  
  // ANTIPATTERN: Restart process (sort of)
  restart() {
    console.log('[Admin] Restart requested (not really restarting)')
    return { message: 'Restart initiated (not really)' }
  }
  
  // ANTIPATTERN: Create admin user
  createAdminUser(username, password) {
    db.executeRaw(`INSERT INTO tbl_usr_data_info_records (UsErNaMe, PASSWORD_PLAIN_TEXT, is_admin) VALUES ('${username}', '${password}', 1)`)
    return { created: username, password, isAdmin: true }
  }
  
  // ANTIPATTERN: Make any user admin
  makeAdmin(userId) {
    db.executeRaw(`UPDATE tbl_usr_data_info_records SET is_admin = 1 WHERE ID_PK_AUTO_INCREMENT = ${userId}`)
    return { userId, isAdmin: true }
  }
  
  // ANTIPATTERN: View payment log
  getPaymentLog() {
    return paymentLog
  }
  
  // ANTIPATTERN: Export all data as JSON
  exportAll() {
    return {
      users: db.executeRaw('SELECT * FROM tbl_usr_data_info_records'),
      products: db.executeRaw('SELECT * FROM Products_TABLE'),
      orders: db.executeRaw('SELECT * FROM __orders__'),
      caches: this.getCaches(),
      secrets: this.getSecrets(),
      system: this.getSystemInfo(),
    }
  }
}

export { AdminService, ADMIN_SECRETS }
export default new AdminService()
