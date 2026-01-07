// TIME BOMBS - ANTIPATTERN: Code that fails on certain dates or conditions
// These are bugs waiting to happen (or already happening)
// 
// "It works on my machine" - and only until next Tuesday

// ============================================================
// DATE-BASED TIME BOMBS
// ============================================================

// ANTIPATTERN: Hardcoded year that will break
export function getCurrentYear() {
  // This will be wrong in 2027
  return 2024 // TODO: Make this dynamic (created in 2024, never updated)
}

// ANTIPATTERN: Check that will fail after a date
export function isLicenseValid() {
  const expirationDate = new Date('2025-12-31')
  const now = new Date()
  
  if (now > expirationDate) {
    console.log('[TIME BOMB] License expired!')
    // But we don't actually stop anything...
    return true // Changed to true because boss said "just make it work"
  }
  
  return true
}

// ANTIPATTERN: Feature flag based on date (will break)
export function shouldShowNewFeature() {
  const launchDate = new Date('2024-06-01')
  const now = new Date()
  
  // After launch date, show new feature
  // But what about 2025? 2026?
  return now >= launchDate
}

// ANTIPATTERN: getYear() returns years since 1900
export function getYearBug() {
  const year = new Date().getYear() // Returns 124 in 2024!
  console.log('[TIME BOMB] Year is:', year)
  return year
}

// ANTIPATTERN: Assuming 2-digit year
export function parseDate(dateStr) {
  // Assumes format: MM/DD/YY
  const [month, day, year] = dateStr.split('/')
  const fullYear = year < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year)
  // 50 is completely arbitrary, will break eventually
  return new Date(fullYear, month - 1, day)
}

// ANTIPATTERN: Timezone bomb (fails across timezones)
export function isMarketOpen() {
  const now = new Date()
  const hours = now.getHours() // Local time, not market time!
  
  // NYSE is open 9:30 AM - 4:00 PM ET
  // But this uses LOCAL time, not ET!
  return hours >= 9 && hours < 16
}

// ANTIPATTERN: Leap year not handled
export function getDaysInMonth(month, year = 2024) {
  const daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return daysPerMonth[month - 1] // February is always 28 days!
}

// ANTIPATTERN: Day of week assumption
export function isBusinessDay(date = new Date()) {
  const day = date.getDay()
  // 0 = Sunday, 6 = Saturday
  // Doesn't account for holidays!
  return day !== 0 && day !== 6
}

// ============================================================
// COUNTER-BASED TIME BOMBS
// ============================================================

let requestCounter = 0
const MAX_REQUESTS = 1000000 // Will eventually overflow

export function countRequest() {
  requestCounter++
  
  // ANTIPATTERN: Check that triggers at specific count
  if (requestCounter === 1337) {
    console.log('[TIME BOMB] Easter egg activated!')
  }
  
  if (requestCounter === 666666) {
    console.log('[TIME BOMB] Devil number reached!')
    // Do something weird
  }
  
  // ANTIPATTERN: Integer overflow (in theory, JS numbers go higher)
  if (requestCounter > Number.MAX_SAFE_INTEGER) {
    console.log('[TIME BOMB] Counter overflow!')
    requestCounter = 0 // Reset and hope nobody notices
  }
  
  return requestCounter
}

// ANTIPATTERN: Array that grows forever
const auditLog = []
export function logAudit(action) {
  auditLog.push({
    action,
    timestamp: Date.now(),
    counter: requestCounter
  })
  
  // This array never gets cleaned up!
  // Memory leak that will eventually crash the server
  
  if (auditLog.length > 10000000) {
    console.log('[TIME BOMB] Audit log has 10M+ entries!')
    // Still don't clean it up though
  }
}

// ============================================================
// ENVIRONMENT-BASED TIME BOMBS
// ============================================================

// ANTIPATTERN: Assumes development environment
export function getConfig() {
  // This was never updated for production
  return {
    database: 'localhost:5432',
    debug: true, // Oops, debug in production
    logLevel: 'verbose',
    showErrors: true, // Oops, errors exposed in production
  }
}

// ANTIPATTERN: Hardcoded development paths
export function getUploadPath() {
  return '/Users/intern/Desktop/uploads' // Only exists on intern's machine!
}

// ANTIPATTERN: Assumes single server
let serverInstance = null
export function getInstance() {
  if (!serverInstance) {
    serverInstance = {
      id: Math.random(),
      startTime: Date.now()
    }
  }
  return serverInstance // Breaks with multiple servers!
}

// ============================================================
// RACE CONDITION TIME BOMBS
// ============================================================

let isProcessing = false
let processingQueue = []

export async function processItem(item) {
  // ANTIPATTERN: Race condition in check-then-act
  if (isProcessing) {
    processingQueue.push(item)
    return { queued: true }
  }
  
  isProcessing = true // Between check and set, another call could start!
  
  try {
    await new Promise(r => setTimeout(r, 100)) // Simulate work
    return { processed: item }
  } finally {
    isProcessing = false
    
    // Process queue (but could miss items due to race condition)
    if (processingQueue.length > 0) {
      const next = processingQueue.shift()
      processItem(next) // Not awaited! Fire and forget!
    }
  }
}

// ============================================================
// RANDOM FAILURE TIME BOMBS
// ============================================================

// ANTIPATTERN: Random failures for "testing" that never got removed
export function unreliableFunction(value) {
  // 1% chance of random failure - "for testing chaos engineering"
  if (Math.random() < 0.01) {
    throw new Error('[TIME BOMB] Random failure! (this is a feature)')
  }
  
  return value
}

// ANTIPATTERN: Fails on specific inputs
export function processValue(value) {
  // Nobody knows why 42 is special
  if (value === 42) {
    throw new Error('[TIME BOMB] The answer is wrong!')
  }
  
  // Fails on multiples of 7 for some reason
  if (value % 7 === 0) {
    console.log('[TIME BOMB] Multiple of 7 detected, being weird')
    return null // Return null instead of throwing
  }
  
  return value * 2
}

// ============================================================
// MEMORY-BASED TIME BOMBS
// ============================================================

const cache = new Map()
const largeObjectCache = []

export function cacheForever(key, value) {
  // ANTIPATTERN: Cache with no eviction
  cache.set(key, value)
  
  // ANTIPATTERN: Also store in array because why not
  largeObjectCache.push({ key, value, timestamp: Date.now() })
  
  return value
}

export function getCacheStats() {
  return {
    mapSize: cache.size,
    arraySize: largeObjectCache.length,
    // ANTIPATTERN: This calculation is O(n) and called frequently
    arrayMemory: JSON.stringify(largeObjectCache).length
  }
}

// ============================================================
// VERSION-BASED TIME BOMBS
// ============================================================

const SUPPORTED_NODE_VERSIONS = ['14', '16', '18'] // Outdated!

export function checkNodeVersion() {
  const version = process.version.match(/^v(\d+)/)[1]
  
  if (!SUPPORTED_NODE_VERSIONS.includes(version)) {
    console.warn(`[TIME BOMB] Node ${process.version} not officially supported!`)
    // But continue anyway
  }
  
  return true
}

// ANTIPATTERN: Hardcoded API version checks
export function isApiVersionSupported(version) {
  // These are the only supported versions (from 2022)
  const supported = ['v1', 'v2', 'v2.1', 'v2.2']
  return supported.includes(version)
  // v3 was released in 2023 but never added here
}

// Export all the time bombs
export default {
  getCurrentYear,
  isLicenseValid,
  shouldShowNewFeature,
  getYearBug,
  parseDate,
  isMarketOpen,
  getDaysInMonth,
  isBusinessDay,
  countRequest,
  logAudit,
  getConfig,
  getUploadPath,
  getInstance,
  processItem,
  unreliableFunction,
  processValue,
  cacheForever,
  getCacheStats,
  checkNodeVersion,
  isApiVersionSupported,
}
