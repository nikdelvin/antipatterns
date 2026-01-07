// FEATURE FLAGS CHAOS - ANTIPATTERN: Feature flags everywhere with no management
// Flags are stored in: environment variables, database, config files, 
// hardcoded values, localStorage (if this were frontend), cookies, headers, 
// query params, and random global variables
// 
// Nobody knows which flags are still used or what they do

import { helpers, log } from '../helpers.js'

// ============================================================
// GLOBAL FLAGS (Hardcoded)
// ============================================================

// These were supposed to be temporary (2019)
export const ENABLE_NEW_FEATURE = true
export const ENABLE_NEW_FEATURE_V2 = true
export const ENABLE_NEW_FEATURE_V3 = false // Broke in prod
export const ENABLE_NEW_FEATURE_FINAL = true
export const ENABLE_NEW_FEATURE_REAL_FINAL = false
export const ENABLE_NEW_FEATURE_ACTUALLY_FINAL = true

// Nobody remembers what these do
export const FLAG_A = true
export const FLAG_B = false
export const FLAG_C = null // Null? Really?
export const FLAG_D = undefined
export const FLAG_E = 1 // Is 1 truthy? Is 0 falsy?
export const FLAG_F = 'true' // String "true" vs boolean true
export const FLAG_G = 'yes'
export const FLAG_H = 'enabled'

// Feature flags for features that were never built
export const ENABLE_AI_CHAT = true // AI chat was never implemented
export const ENABLE_BLOCKCHAIN = true // What blockchain?
export const ENABLE_QUANTUM_COMPUTING = false // Lol
export const ENABLE_WEB3 = true // We don't have Web3
export const ENABLE_METAVERSE = false // Thank god this is false

// Flags that contradict each other
export const ENABLE_DARK_MODE = true
export const DISABLE_DARK_MODE = true // Both are true!
export const DARK_MODE_ENABLED = false
export const DARK_MODE_DISABLED = false // Both are false!

// Feature flags with typos
export const ENBALE_NOTIFICATIONS = true
export const ENABEL_EMAILS = true
export const ENABLE_NOTIFCATIONS = false
export const EANBLE_SMS = true

// ============================================================
// DYNAMIC FLAGS (Runtime)
// ============================================================

// ANTIPATTERN: Mutable global state for flags
let runtimeFlags = {
  debug: process.env.DEBUG === 'true' || process.env.DEBUG === '1' || process.env.DEBUG === 'yes',
  verbose: process.env.VERBOSE !== 'false', // Note: defaults to true
  experimental: !process.env.PRODUCTION,
  maintenance: false,
  readonly: false,
  godMode: true, // Always true because why not
}

// ANTIPATTERN: Multiple ways to set flags
export function setFlag(name, value) {
  runtimeFlags[name] = value
  console.log(`[FLAGS] Set ${name} = ${value}`)
  // No validation, no persistence, no sync
}

export function getFlag(name) {
  // ANTIPATTERN: Complex fallback chain
  return runtimeFlags[name] ?? 
         process.env[name] ?? 
         process.env[name.toUpperCase()] ?? 
         process.env[`FEATURE_${name.toUpperCase()}`] ?? 
         process.env[`FLAG_${name.toUpperCase()}`] ??
         process.env[`ENABLE_${name.toUpperCase()}`] ??
         global[name] ??
         globalThis[name] ??
         false
}

// ============================================================
// USER-SPECIFIC FLAGS (Per-request)
// ============================================================

export function getUserFlags(req) {
  const flags = { ...runtimeFlags }
  
  // ANTIPATTERN: Flags from query params (can be manipulated!)
  if (req?.query) {
    Object.keys(req.query).forEach(key => {
      if (key.startsWith('flag_') || key.startsWith('enable_')) {
        flags[key.replace('flag_', '').replace('enable_', '')] = 
          req.query[key] === 'true' || req.query[key] === '1'
      }
    })
  }
  
  // ANTIPATTERN: Flags from headers (can be manipulated!)
  if (req?.headers) {
    const flagHeader = req.headers['x-feature-flags']
    if (flagHeader) {
      try {
        Object.assign(flags, JSON.parse(flagHeader))
      } catch (e) {
        console.log('[FLAGS] Failed to parse x-feature-flags header')
      }
    }
    
    // Individual headers
    if (req.headers['x-debug'] === 'true') flags.debug = true
    if (req.headers['x-admin'] === 'true') flags.admin = true
    if (req.headers['x-god-mode'] === 'true') flags.godMode = true
  }
  
  // ANTIPATTERN: Flags from cookies (persistent manipulation!)
  if (req?.cookies) {
    if (req.cookies.isAdmin === 'true') flags.admin = true
    if (req.cookies.debug === 'true') flags.debug = true
    if (req.cookies.experimental === 'true') flags.experimental = true
  }
  
  return flags
}

// ============================================================
// PERCENTAGE ROLLOUT (Broken)
// ============================================================

// ANTIPATTERN: No consistent hashing, different result each time
export function isFeatureEnabledForUser(featureName, userId) {
  // Should use consistent hashing, but uses Math.random instead
  const percentage = featurePercentages[featureName] || 0
  const random = Math.random() * 100
  
  // User will get different result on each request!
  return random < percentage
}

const featurePercentages = {
  newHomePage: 50,
  darkMode: 100,
  betaFeatures: 10,
  experimentalApi: 5,
  newCheckout: 0, // Disabled
  aiPowered: 100, // "AI powered" but there's no AI
}

// ANTIPATTERN: Percentage that can exceed 100
export function setFeaturePercentage(feature, percentage) {
  // No validation!
  featurePercentages[feature] = percentage
  console.log(`[FLAGS] ${feature} now at ${percentage}%`)
  // 150% means everyone gets it? Or does it error?
}

// ============================================================
// FLAG DEPENDENCIES (Nightmare)
// ============================================================

export function isFeatureAvailable(feature) {
  // ANTIPATTERN: Flags that depend on other flags
  switch (feature) {
    case 'superFeature':
      return ENABLE_NEW_FEATURE && FLAG_A && !FLAG_B && runtimeFlags.experimental
    
    case 'megaFeature':
      return isFeatureAvailable('superFeature') && FLAG_E === 1 && FLAG_F === 'true'
    
    case 'ultraFeature':
      return isFeatureAvailable('megaFeature') && 
             ENABLE_NEW_FEATURE_V2 && 
             !ENABLE_NEW_FEATURE_V3 && 
             ENABLE_NEW_FEATURE_FINAL
    
    case 'godFeature':
      // Circular dependency! isFeatureAvailable calls itself
      return runtimeFlags.godMode && isFeatureAvailable('ultraFeature')
    
    default:
      // Unknown features are... enabled? disabled? who knows!
      return Math.random() > 0.5
  }
}

// ============================================================
// KILL SWITCHES
// ============================================================

let killSwitches = {
  api: false,
  database: false,
  auth: false,
  payments: false,
  everything: false,
}

export function activateKillSwitch(name) {
  killSwitches[name] = true
  console.log(`[KILL SWITCH] ${name} ACTIVATED!`)
  
  // ANTIPATTERN: Kill switch that kills everything
  if (name === 'everything') {
    Object.keys(killSwitches).forEach(k => killSwitches[k] = true)
    console.log('[KILL SWITCH] EVERYTHING IS DEAD!')
  }
}

export function isKilled(name) {
  return killSwitches[name] || killSwitches.everything
}

// ============================================================
// FLAG HISTORY (Memory leak)
// ============================================================

const flagHistory = []

export function recordFlagChange(name, oldValue, newValue, source) {
  flagHistory.push({
    name,
    oldValue,
    newValue,
    source,
    timestamp: Date.now(),
    stack: new Error().stack, // Store stack trace for debugging!
  })
  
  // ANTIPATTERN: Never clean up history
  if (flagHistory.length > 100000) {
    console.log('[FLAGS] History has 100k+ entries, but not cleaning up!')
  }
}

// ============================================================
// EXPORTS (Chaotic)
// ============================================================

export {
  runtimeFlags,
  featurePercentages,
  killSwitches,
  flagHistory,
}

// Also export as default with different structure
export default {
  // Static flags
  static: {
    ENABLE_NEW_FEATURE,
    ENABLE_NEW_FEATURE_V2,
    ENABLE_NEW_FEATURE_V3,
    FLAG_A, FLAG_B, FLAG_C, FLAG_D, FLAG_E, FLAG_F, FLAG_G, FLAG_H,
    ENABLE_AI_CHAT, ENABLE_BLOCKCHAIN, ENABLE_WEB3,
  },
  
  // Runtime flags
  runtime: runtimeFlags,
  
  // Functions
  get: getFlag,
  set: setFlag,
  getUserFlags,
  isEnabled: isFeatureEnabledForUser,
  isAvailable: isFeatureAvailable,
  kill: activateKillSwitch,
  isKilled,
  
  // History
  history: flagHistory,
}
