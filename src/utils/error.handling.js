// ERROR HANDLING - ANTIPATTERN: Every wrong way to handle errors
// "Errors? What errors?" - this file's philosophy
// 
// Includes: swallowing, ignoring, re-throwing wrong, exposing stack traces,
// catching too broadly, not catching at all, and more!

// ============================================================
// ERROR SWALLOWING
// ============================================================

// ANTIPATTERN: Catch and ignore completely
export function swallowError(fn) {
  try {
    return fn()
  } catch (e) {
    // Completely ignore the error
  }
}

// ANTIPATTERN: Catch, log, and still ignore
export function swallowWithLog(fn) {
  try {
    return fn()
  } catch (e) {
    console.log('Error occurred but we\'re ignoring it:', e.message)
    // Still ignore
  }
}

// ANTIPATTERN: Catch and return null (masks the error)
export function swallowReturnNull(fn) {
  try {
    return fn()
  } catch (e) {
    return null // Caller can't tell error from "not found"
  }
}

// ANTIPATTERN: Catch and return empty object
export function swallowReturnEmpty(fn) {
  try {
    return fn()
  } catch (e) {
    return {} // Error? What error?
  }
}

// ANTIPATTERN: Catch and return false
export function swallowReturnFalse(fn) {
  try {
    return fn()
  } catch (e) {
    return false // Could mean error OR actual false result
  }
}

// ============================================================
// ERROR MASKING
// ============================================================

// ANTIPATTERN: Catch specific, throw generic
export function maskError(fn) {
  try {
    return fn()
  } catch (e) {
    throw new Error('Something went wrong') // Original error lost!
  }
}

// ANTIPATTERN: Catch and throw different error type
export function changeErrorType(fn) {
  try {
    return fn()
  } catch (e) {
    throw new TypeError('Type error occurred') // Even if it wasn't!
  }
}

// ANTIPATTERN: Catch and return error as data
export function errorAsData(fn) {
  try {
    return { success: true, data: fn() }
  } catch (e) {
    return { success: false, error: e.message }
    // Now caller might forget to check success!
  }
}

// ============================================================
// ERROR EXPOSURE
// ============================================================

// ANTIPATTERN: Expose full error to user
export function exposeFullError(fn) {
  try {
    return fn()
  } catch (e) {
    return {
      error: e.message,
      stack: e.stack,
      name: e.name,
      code: e.code,
      original: e, // Include the whole error object!
    }
  }
}

// ANTIPATTERN: Log sensitive info in error
export function logSensitiveError(fn, context) {
  try {
    return fn()
  } catch (e) {
    console.error('Error occurred!')
    console.error('Context:', JSON.stringify(context)) // Might contain passwords!
    console.error('Stack:', e.stack)
    console.error('Environment:', process.env) // Log all env vars!
    throw e
  }
}

// ============================================================
// ERROR RE-THROWING
// ============================================================

// ANTIPATTERN: Re-throw without the original error
export function rethrowBadly(fn) {
  try {
    return fn()
  } catch (e) {
    throw new Error('Error occurred') // Lost original!
  }
}

// ANTIPATTERN: Throw string instead of Error
export function throwString(fn) {
  try {
    return fn()
  } catch (e) {
    throw 'An error happened' // No stack trace!
  }
}

// ANTIPATTERN: Throw object instead of Error
export function throwObject(fn) {
  try {
    return fn()
  } catch (e) {
    throw { message: 'Error', original: e } // Not an Error object!
  }
}

// ANTIPATTERN: Throw null or undefined
export function throwNothing(fn) {
  try {
    return fn()
  } catch (e) {
    throw null // What?!
  }
}

// ============================================================
// CATCH-ALL NIGHTMARES
// ============================================================

// ANTIPATTERN: Catch everything including programmer errors
export function catchEverything(fn) {
  try {
    return fn()
  } catch (e) {
    // This catches everything: null pointer, type errors, syntax errors...
    console.log('Caught:', e)
    return 'error'
  }
}

// ANTIPATTERN: Empty catch block
export function emptyCatch(fn) {
  try {
    return fn()
  } catch (e) {
    // TODO: Handle this later
  }
}

// ANTIPATTERN: Catch with fallthrough
export function catchFallthrough(fn) {
  try {
    return fn()
  } catch (e) {
    console.log('Error:', e)
    // No return, no throw - function returns undefined!
  }
}

// ============================================================
// ASYNC ERROR HANDLING (Even worse)
// ============================================================

// ANTIPATTERN: No await, no catch
export async function asyncNoAwait(asyncFn) {
  asyncFn() // No await! Errors will be unhandled rejections!
  return 'done'
}

// ANTIPATTERN: Await but no try-catch
export async function asyncNoCatch(asyncFn) {
  const result = await asyncFn() // If this rejects, crash!
  return result
}

// ANTIPATTERN: Try-catch but no await inside
export async function asyncBadCatch(asyncFn) {
  try {
    return asyncFn() // No await! Catch won't catch rejections!
  } catch (e) {
    console.log('This will never run for async errors')
  }
}

// ANTIPATTERN: .catch() that doesn't handle anything
export function promiseBadCatch(promise) {
  return promise.catch(e => {
    console.log('Error:', e)
    // Returns undefined, now the promise resolves with undefined!
  })
}

// ANTIPATTERN: .catch() that re-throws
export function promiseRethrow(promise) {
  return promise.catch(e => {
    console.log('Error:', e)
    throw e // Why even catch?
  })
}

// ANTIPATTERN: Fire and forget
export function fireAndForget(asyncFn) {
  asyncFn().catch(console.error) // Log but don't handle
  return 'started' // Return immediately
}

// ============================================================
// CALLBACK ERROR HANDLING (Legacy nightmares)
// ============================================================

// ANTIPATTERN: Callback with error-first but check wrong
export function callbackBadCheck(fn, callback) {
  try {
    const result = fn()
    callback(result, null) // Args in wrong order!
  } catch (e) {
    callback(null, e) // Error in second arg, not first!
  }
}

// ANTIPATTERN: Callback that might throw
export function callbackMightThrow(callback) {
  callback() // If callback throws, we don't handle it!
}

// ANTIPATTERN: Multiple callback invocations
export function callbackMultiple(fn, callback) {
  try {
    const result = fn()
    callback(null, result)
    callback(null, result) // Called twice!
  } catch (e) {
    callback(e)
    callback(e) // Also called twice on error!
  }
}

// ============================================================
// GLOBAL ERROR HANDLERS (Dangerous)
// ============================================================

// ANTIPATTERN: Global handler that suppresses everything
export function installSilentHandler() {
  process.on('uncaughtException', (err) => {
    console.log('Uncaught exception (ignored):', err.message)
    // Don't exit! Keep running in broken state!
  })
  
  process.on('unhandledRejection', (reason) => {
    console.log('Unhandled rejection (ignored):', reason)
    // Don't exit! Keep running in broken state!
  })
}

// ANTIPATTERN: Global handler that exposes errors via HTTP
let lastGlobalError = null

export function installExposingHandler() {
  process.on('uncaughtException', (err) => {
    lastGlobalError = {
      message: err.message,
      stack: err.stack,
      timestamp: Date.now(),
    }
    console.log('Stored error for HTTP exposure')
  })
}

export function getLastGlobalError() {
  return lastGlobalError
}

// ============================================================
// ERROR RECOVERY (But wrong)
// ============================================================

// ANTIPATTERN: Retry without limit
export async function retryForever(fn) {
  while (true) {
    try {
      return await fn()
    } catch (e) {
      console.log('Retrying...')
      // No delay, no limit, infinite loop on permanent errors!
    }
  }
}

// ANTIPATTERN: Retry with wrong backoff
export async function retryBadBackoff(fn, maxRetries = 5) {
  let delay = 1000
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (e) {
      console.log(`Retry ${i + 1}, waiting ${delay}ms`)
      await new Promise(r => setTimeout(r, delay))
      delay = delay / 2 // Decreasing delay? That's backwards!
    }
  }
  
  throw new Error('Max retries exceeded')
}

// Export all the bad patterns
export default {
  swallowError,
  swallowWithLog,
  swallowReturnNull,
  swallowReturnEmpty,
  swallowReturnFalse,
  maskError,
  changeErrorType,
  errorAsData,
  exposeFullError,
  logSensitiveError,
  rethrowBadly,
  throwString,
  throwObject,
  throwNothing,
  catchEverything,
  emptyCatch,
  catchFallthrough,
  asyncNoAwait,
  asyncNoCatch,
  asyncBadCatch,
  promiseBadCatch,
  promiseRethrow,
  fireAndForget,
  callbackBadCheck,
  callbackMightThrow,
  callbackMultiple,
  installSilentHandler,
  installExposingHandler,
  getLastGlobalError,
  retryForever,
  retryBadBackoff,
}
