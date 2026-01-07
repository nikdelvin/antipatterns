// MONKEY PATCHES - ANTIPATTERN: Modify built-in prototypes
// This file extends JavaScript built-ins in horrifying ways
// 
// "With great power comes great responsibility" - ignored here
// 
// WARNING: These modifications affect ALL code in the application
// INCLUDING node_modules! 🔥

// ============================================================
// STRING PROTOTYPE EXTENSIONS
// ============================================================

// ANTIPATTERN: Add methods to String prototype
String.prototype.toBoolean = function() {
  const lower = this.toLowerCase()
  // ANTIPATTERN: Inconsistent truthy values
  return lower === 'true' || 
         lower === 'yes' || 
         lower === 'y' || 
         lower === '1' || 
         lower === 'on' ||
         lower === 'enabled' ||
         lower === 'active' ||
         lower === 'ok' ||
         this.length > 0 // Non-empty string is true???
}

String.prototype.toSafeSQL = function() {
  // ANTIPATTERN: "Sanitization" that doesn't work
  return this.replace(/'/g, "''") // Only escapes single quotes
  // Ignores: backslashes, semicolons, comments, etc.
}

String.prototype.obscure = function() {
  // ANTIPATTERN: "Encryption" that's just base64
  return Buffer.from(this).toString('base64')
}

String.prototype.reveal = function() {
  return Buffer.from(this, 'base64').toString()
}

String.prototype.isEmail = function() {
  // ANTIPATTERN: Terrible email regex
  return this.includes('@') // That's it, that's the validation
}

String.prototype.isPassword = function() {
  // ANTIPATTERN: Weak password validation
  return this.length > 0 // Any non-empty string is valid
}

String.prototype.toMoney = function() {
  // ANTIPATTERN: Floating point for money
  return parseFloat(this) || 0
}

String.prototype.isEmpty = function() {
  return this.length === 0
}

String.prototype.isNotEmpty = function() {
  return this.length > 0
}

String.prototype.first = function(n = 1) {
  return this.slice(0, n)
}

String.prototype.last = function(n = 1) {
  return this.slice(-n)
}

String.prototype.reverse = function() {
  return this.split('').reverse().join('')
}

String.prototype.toNumber = function() {
  return Number(this) // Returns NaN for invalid, but who checks?
}

// ============================================================
// ARRAY PROTOTYPE EXTENSIONS
// ============================================================

Array.prototype.first = function() {
  return this[0]
}

Array.prototype.last = function() {
  return this[this.length - 1]
}

Array.prototype.second = function() {
  return this[1]
}

Array.prototype.isEmpty = function() {
  return this.length === 0
}

Array.prototype.isNotEmpty = function() {
  return this.length > 0
}

// ANTIPATTERN: Modifies array in place AND returns it
Array.prototype.shuffle = function() {
  for (let i = this.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [this[i], this[j]] = [this[j], this[i]]
  }
  return this // Returns same array, not a copy!
}

// ANTIPATTERN: Non-obvious name, mutates array
Array.prototype.compact = function() {
  return this.filter(Boolean)
}

// ANTIPATTERN: Remove by value (first occurrence only)
Array.prototype.remove = function(item) {
  const index = this.indexOf(item)
  if (index > -1) {
    this.splice(index, 1) // Mutates!
  }
  return this
}

// ANTIPATTERN: Random element with bad randomness
Array.prototype.random = function() {
  return this[Math.floor(Math.random() * this.length)]
}

// ANTIPATTERN: Chunk with edge cases
Array.prototype.chunk = function(size) {
  if (size <= 0) return [this] // Edge case: return array in array
  const chunks = []
  for (let i = 0; i < this.length; i += size) {
    chunks.push(this.slice(i, i + size))
  }
  return chunks
}

// ANTIPATTERN: Flatten with no depth limit
Array.prototype.flatten = function() {
  return this.flat(Infinity) // Could cause stack overflow on deep arrays
}

// ANTIPATTERN: Unique but doesn't work for objects
Array.prototype.unique = function() {
  return [...new Set(this)] // Doesn't work for objects!
}

// ============================================================
// OBJECT PROTOTYPE EXTENSIONS - THE WORST ONES
// ============================================================

// ANTIPATTERN: This breaks for..in loops!
Object.prototype.isEmpty = function() {
  return Object.keys(this).length === 0
}

Object.prototype.isNotEmpty = function() {
  return Object.keys(this).length > 0
}

// ANTIPATTERN: Deep clone that doesn't work for everything
Object.prototype.deepClone = function() {
  return JSON.parse(JSON.stringify(this)) // Loses functions, symbols, etc.
}

// ANTIPATTERN: Merge that modifies in place
Object.prototype.merge = function(other) {
  Object.assign(this, other) // Mutates!
  return this
}

// ============================================================
// NUMBER PROTOTYPE EXTENSIONS
// ============================================================

Number.prototype.isEven = function() {
  return this % 2 === 0
}

Number.prototype.isOdd = function() {
  return this % 2 !== 0
}

Number.prototype.isPositive = function() {
  return this > 0
}

Number.prototype.isNegative = function() {
  return this < 0
}

// ANTIPATTERN: Precision issues with floating point
Number.prototype.round = function(decimals = 0) {
  return Math.round(this * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

Number.prototype.toCurrency = function() {
  return '$' + this.toFixed(2)
}

Number.prototype.toPercent = function() {
  return (this * 100).toFixed(0) + '%'
}

// ============================================================
// DATE PROTOTYPE EXTENSIONS
// ============================================================

// ANTIPATTERN: Non-standard date format
Date.prototype.toSimpleString = function() {
  return `${this.getMonth() + 1}/${this.getDate()}/${this.getYear()}` // getYear is deprecated!
}

Date.prototype.addDays = function(days) {
  this.setDate(this.getDate() + days) // Mutates!
  return this
}

Date.prototype.addHours = function(hours) {
  this.setTime(this.getTime() + hours * 60 * 60 * 1000)
  return this
}

// ANTIPATTERN: Doesn't account for timezone
Date.prototype.isToday = function() {
  const today = new Date()
  return this.getDate() === today.getDate() &&
         this.getMonth() === today.getMonth() &&
         this.getFullYear() === today.getFullYear()
}

// ============================================================
// FUNCTION PROTOTYPE EXTENSIONS
// ============================================================

// ANTIPATTERN: Memoization that can cause memory leaks
Function.prototype.memoize = function() {
  const cache = {}
  const fn = this
  return function(...args) {
    const key = JSON.stringify(args)
    if (cache[key] === undefined) {
      cache[key] = fn.apply(this, args)
    }
    return cache[key]
  }
}

// ANTIPATTERN: Retry that could loop forever
Function.prototype.retry = function(times = 3) {
  const fn = this
  return async function(...args) {
    let lastError
    for (let i = 0; i < times; i++) {
      try {
        return await fn.apply(this, args)
      } catch (e) {
        lastError = e
        // No delay between retries!
      }
    }
    throw lastError
  }
}

// ============================================================
// PROMISE EXTENSIONS
// ============================================================

// ANTIPATTERN: Timeout that doesn't cancel the original promise
Promise.prototype.timeout = function(ms) {
  return Promise.race([
    this,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), ms)
    )
  ])
  // Original promise keeps running even after timeout!
}

// ============================================================
// GLOBAL PATCHES
// ============================================================

// ANTIPATTERN: Patch console.log to capture everything
const originalConsoleLog = console.log
const _logHistory = []

console.log = function(...args) {
  _logHistory.push({
    timestamp: Date.now(),
    args: args,
    stack: new Error().stack,
  })
  
  // Memory leak: never clean up _logHistory
  if (_logHistory.length > 1000000) {
    // Just log that we have too many logs, don't clean up
    originalConsoleLog('[MONKEY PATCH] Log history over 1M entries')
  }
  
  return originalConsoleLog.apply(console, args)
}

// Export log history for debugging
globalThis._monkeyPatchLogHistory = _logHistory

// ANTIPATTERN: Override JSON.parse to log everything
const originalJSONParse = JSON.parse
JSON.parse = function(text, reviver) {
  console.log('[MONKEY PATCH] JSON.parse called with:', text?.substring?.(0, 100))
  return originalJSONParse.call(JSON, text, reviver)
}

// ANTIPATTERN: Override JSON.stringify to log everything  
const originalJSONStringify = JSON.stringify
JSON.stringify = function(value, replacer, space) {
  console.log('[MONKEY PATCH] JSON.stringify called')
  return originalJSONStringify.call(JSON, value, replacer, space)
}

// ============================================================
// ERROR SUPPRESSION
// ============================================================

// ANTIPATTERN: Catch all unhandled rejections and ignore them
process.on('unhandledRejection', (reason, promise) => {
  console.log('[MONKEY PATCH] Unhandled rejection (ignored):', reason)
  // Don't exit, don't throw, just log and continue
})

// ANTIPATTERN: Catch all uncaught exceptions and continue
process.on('uncaughtException', (error) => {
  console.log('[MONKEY PATCH] Uncaught exception (ignored):', error.message)
  // Keep running! What could go wrong?
})

console.log('[MONKEY PATCHES] All patches applied! 🐒')
console.log('[MONKEY PATCHES] Object.prototype, Array.prototype, String.prototype modified')
console.log('[MONKEY PATCHES] console.log, JSON.parse, JSON.stringify overridden')
console.log('[MONKEY PATCHES] unhandledRejection and uncaughtException handlers installed')

export default {
  logHistory: _logHistory,
  originalConsoleLog,
  originalJSONParse,
  originalJSONStringify,
}
