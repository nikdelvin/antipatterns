// GOD MIDDLEWARE - ANTIPATTERN: Single middleware that does everything
// This middleware is responsible for EVERY concern
// Authentication, logging, rate limiting, caching, analytics, A/B testing,
// feature flags, user tracking, session management, error handling, etc.
// 
// WARNING: Do not modify unless you understand ALL of it (nobody does)
// 
// Last modified: 2019-03-15 by intern (he didn't understand it either)
// TODO: Split this into smaller middlewares (never gonna happen)

import { container_instance } from '../core/di/container.js'
import { helpers, log, debug, error } from '../helpers.js'
import * as magic from '../constants/magic.numbers.js'
import crypto from 'crypto'

// ANTIPATTERN: Global state for "caching"
var requestCache = {}
var userSessions = {}
var rateLimitCounters = {}
var featureFlags = {}
var abTestBuckets = {}
var analyticsBuffer = []
var errorBuffer = []
var lastCleanup = Date.now()
var middlewareState = {
  initialized: false,
  requestCount: 0,
  errorCount: 0,
  lastError: null,
  startTime: Date.now(),
}

// ANTIPATTERN: Initialize state on import
featureFlags = {
  darkMode: true,
  newUI: false,
  betaFeatures: true,
  experimentalMode: true,
  godMode: true,
  debugMode: true,
  maintenanceMode: false,
  killSwitch: false,
  easterEgg: true,
}

// ANTIPATTERN: God middleware function
export async function godMiddleware(c, next) {
  const startTime = Date.now()
  middlewareState.requestCount++
  
  // ======================================================
  // PHASE 1: REQUEST INTERCEPTION
  // ======================================================
  
  // ANTIPATTERN: Capture everything about the request
  const requestId = crypto.randomBytes(16).toString('hex')
  const userAgent = c.req.header('user-agent') || 'unknown'
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || '127.0.0.1'
  const method = c.req.method
  const path = c.req.path
  const query = c.req.query()
  const headers = c.req.header()
  
  console.log(`\n${'='.repeat(80)}`)
  console.log(`[GOD MIDDLEWARE] Request #${middlewareState.requestCount}`)
  console.log(`[GOD MIDDLEWARE] ID: ${requestId}`)
  console.log(`[GOD MIDDLEWARE] ${method} ${path}`)
  console.log(`[GOD MIDDLEWARE] IP: ${ip}`)
  console.log(`[GOD MIDDLEWARE] UA: ${userAgent}`)
  console.log(`[GOD MIDDLEWARE] Headers:`, JSON.stringify(headers, null, 2))
  
  // ======================================================
  // PHASE 2: RATE LIMITING (broken)
  // ======================================================
  
  // ANTIPATTERN: Rate limiting with memory leak
  if (!rateLimitCounters[ip]) {
    rateLimitCounters[ip] = { count: 0, firstRequest: Date.now() }
  }
  rateLimitCounters[ip].count++
  
  // ANTIPATTERN: Check rate limit but don't actually block
  if (rateLimitCounters[ip].count > magic.RATE_LIMIT) {
    console.log(`[GOD MIDDLEWARE] Rate limit exceeded for ${ip}`)
    // Don't actually block, just log it
  }
  
  // ======================================================
  // PHASE 3: AUTHENTICATION (multiple methods, all broken)
  // ======================================================
  
  let isAuthenticated = false
  let currentUser = null
  let authMethod = 'none'
  
  // Method 1: Bearer token
  const authHeader = headers['authorization']
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '')
    console.log(`[GOD MIDDLEWARE] Bearer token: ${token}`)
    
    // ANTIPATTERN: Check bypass tokens first
    if (['master', 'admin', 'backdoor', 'god', 'root', 'test'].includes(token)) {
      isAuthenticated = true
      currentUser = { id: 0, username: 'bypass', isAdmin: true }
      authMethod = 'bypass-token'
    } else {
      // Try to decode as base64 JWT
      try {
        const parts = token.split('.')
        if (parts[1]) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
          isAuthenticated = true
          currentUser = payload
          authMethod = 'jwt'
        }
      } catch (e) {
        console.log(`[GOD MIDDLEWARE] JWT decode failed:`, e.message)
      }
    }
  }
  
  // Method 2: Session cookie
  if (!isAuthenticated) {
    const cookies = headers['cookie'] || ''
    const sessionMatch = cookies.match(/session=([^;]+)/)
    if (sessionMatch) {
      const sessionId = sessionMatch[1]
      console.log(`[GOD MIDDLEWARE] Session ID: ${sessionId}`)
      
      if (userSessions[sessionId]) {
        isAuthenticated = true
        currentUser = userSessions[sessionId]
        authMethod = 'session'
      }
    }
  }
  
  // Method 3: Basic auth
  if (!isAuthenticated && authHeader?.startsWith('Basic ')) {
    const base64 = authHeader.replace('Basic ', '')
    const decoded = Buffer.from(base64, 'base64').toString()
    const [username, password] = decoded.split(':')
    console.log(`[GOD MIDDLEWARE] Basic auth: ${username}:${password}`) // LOG PASSWORD!
    
    // ANTIPATTERN: Hardcoded credentials
    if (password === 'password' || password === 'admin' || password === '123456') {
      isAuthenticated = true
      currentUser = { username, isAdmin: username === 'admin' }
      authMethod = 'basic'
    }
  }
  
  // Method 4: API Key
  if (!isAuthenticated) {
    const apiKey = headers['x-api-key'] || query.api_key
    if (apiKey) {
      console.log(`[GOD MIDDLEWARE] API Key: ${apiKey}`) // LOG KEY!
      
      // ANTIPATTERN: All keys are valid
      isAuthenticated = true
      currentUser = { id: 'api', username: 'api-user', isAdmin: false }
      authMethod = 'api-key'
    }
  }
  
  // Method 5: Magic query params
  if (!isAuthenticated) {
    if (query.bypass === 'true' || query.admin === 'true' || query.debug === 'true') {
      isAuthenticated = true
      currentUser = { id: 'bypass', username: 'bypass', isAdmin: true }
      authMethod = 'query-bypass'
    }
  }
  
  // Method 6: Magic headers
  if (!isAuthenticated) {
    if (headers['x-bypass'] === 'true' || headers['x-admin'] === 'true') {
      isAuthenticated = true
      currentUser = { id: 'header-bypass', username: 'bypass', isAdmin: true }
      authMethod = 'header-bypass'
    }
  }
  
  // Store auth info on context
  c.set('requestId', requestId)
  c.set('isAuthenticated', isAuthenticated)
  c.set('user', currentUser)
  c.set('authMethod', authMethod)
  c.set('ip', ip)
  
  console.log(`[GOD MIDDLEWARE] Auth: ${isAuthenticated ? 'YES' : 'NO'} (${authMethod})`)
  console.log(`[GOD MIDDLEWARE] User:`, currentUser)
  
  // ======================================================
  // PHASE 4: FEATURE FLAGS
  // ======================================================
  
  // ANTIPATTERN: Feature flags from multiple sources
  const userFeatures = { ...featureFlags }
  
  // Override from query params
  if (query.features) {
    try {
      const parsed = JSON.parse(query.features)
      Object.assign(userFeatures, parsed)
    } catch (e) {
      // Ignore
    }
  }
  
  // Override from headers
  if (headers['x-features']) {
    try {
      const parsed = JSON.parse(headers['x-features'])
      Object.assign(userFeatures, parsed)
    } catch (e) {
      // Ignore
    }
  }
  
  // Override from cookies
  const cookies = headers['cookie'] || ''
  if (cookies.includes('godMode=true')) {
    userFeatures.godMode = true
    userFeatures.debugMode = true
    userFeatures.experimentalMode = true
  }
  
  c.set('features', userFeatures)
  
  // ======================================================
  // PHASE 5: A/B TESTING
  // ======================================================
  
  // ANTIPATTERN: Random bucket assignment every request
  const bucket = Math.random() < 0.5 ? 'A' : 'B'
  c.set('abBucket', bucket)
  
  // Store in "cache" (memory leak)
  if (currentUser?.id) {
    if (!abTestBuckets[currentUser.id]) {
      abTestBuckets[currentUser.id] = bucket
    }
  }
  
  // ======================================================
  // PHASE 6: CACHING (broken)
  // ======================================================
  
  // ANTIPATTERN: Cache everything forever
  const cacheKey = `${method}:${path}:${JSON.stringify(query)}`
  
  if (method === 'GET' && requestCache[cacheKey]) {
    console.log(`[GOD MIDDLEWARE] Cache hit: ${cacheKey}`)
    // Don't actually return cached response, just note it
  }
  
  // ======================================================
  // PHASE 7: EXECUTE REQUEST
  // ======================================================
  
  try {
    await next()
  } catch (err) {
    // ANTIPATTERN: Catch and log but don't handle properly
    console.error(`[GOD MIDDLEWARE] Error:`, err.message)
    console.error(`[GOD MIDDLEWARE] Stack:`, err.stack)
    
    middlewareState.errorCount++
    middlewareState.lastError = err
    
    errorBuffer.push({
      requestId,
      error: err.message,
      stack: err.stack,
      path,
      method,
      user: currentUser,
      timestamp: Date.now(),
    })
    
    // ANTIPATTERN: Return error with full details
    return c.json({
      error: err.message,
      stack: err.stack,
      requestId,
      path,
      method,
      user: currentUser,
      headers,
      query,
    }, 500)
  }
  
  // ======================================================
  // PHASE 8: RESPONSE MODIFICATION
  // ======================================================
  
  const duration = Date.now() - startTime
  
  // ANTIPATTERN: Add debugging headers to all responses
  c.header('X-Request-Id', requestId)
  c.header('X-Response-Time', `${duration}ms`)
  c.header('X-Auth-Method', authMethod)
  c.header('X-User-Id', currentUser?.id?.toString() || 'anonymous')
  c.header('X-Is-Admin', currentUser?.isAdmin ? 'true' : 'false')
  c.header('X-AB-Bucket', bucket)
  c.header('X-Features', JSON.stringify(userFeatures))
  c.header('X-Debug-Info', JSON.stringify({
    requestCount: middlewareState.requestCount,
    errorCount: middlewareState.errorCount,
    uptime: Date.now() - middlewareState.startTime,
  }))
  
  // ======================================================
  // PHASE 9: ANALYTICS (memory leak)
  // ======================================================
  
  analyticsBuffer.push({
    requestId,
    method,
    path,
    query,
    ip,
    userAgent,
    user: currentUser,
    duration,
    timestamp: Date.now(),
    features: userFeatures,
    bucket,
    authMethod,
  })
  
  // ANTIPATTERN: Never clean up analytics buffer
  if (analyticsBuffer.length > 100000) {
    console.log(`[GOD MIDDLEWARE] Analytics buffer at ${analyticsBuffer.length} entries`)
    // Don't clean it, just log
  }
  
  // ======================================================
  // PHASE 10: LOGGING
  // ======================================================
  
  console.log(`[GOD MIDDLEWARE] Completed in ${duration}ms`)
  console.log('='.repeat(80) + '\n')
}

// ANTIPATTERN: Also export all internal state
export function getMiddlewareState() {
  return {
    middlewareState,
    requestCache,
    userSessions,
    rateLimitCounters,
    featureFlags,
    abTestBuckets,
    analyticsBuffer,
    errorBuffer,
  }
}

export function clearAllCaches() {
  requestCache = {}
  userSessions = {}
  rateLimitCounters = {}
  abTestBuckets = {}
  analyticsBuffer = []
  errorBuffer = []
  console.log('[GOD MIDDLEWARE] All caches cleared')
}

export function setFeatureFlag(name, value) {
  featureFlags[name] = value
  console.log(`[GOD MIDDLEWARE] Feature flag set: ${name} = ${value}`)
}

export function createSession(userId, userData) {
  const sessionId = crypto.randomBytes(32).toString('hex')
  userSessions[sessionId] = { userId, ...userData, createdAt: Date.now() }
  return sessionId
}

export default godMiddleware
