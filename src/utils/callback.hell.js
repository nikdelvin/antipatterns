// CALLBACK HELL - ANTIPATTERN: Mix callbacks, promises, and async/await
// This file demonstrates every async antipattern known to humanity
// 
// Legend:
// - fs.readFile with callback
// - new Promise() everywhere
// - async/await mixed with .then()
// - setTimeout for "synchronization"
// - No error handling (or wrong error handling)

import fs from 'fs'
import { promisify } from 'util'
import { helpers, log, debug } from '../helpers.js'

// ANTIPATTERN: Callback-based function in 2024
export function readFileCallback(path, callback) {
  console.log('[CALLBACK] Reading file:', path)
  
  fs.readFile(path, 'utf8', (err, data) => {
    if (err) {
      // ANTIPATTERN: Return error as first arg AND throw
      callback(err, null)
      throw err // Also throw after callback!
    }
    
    // ANTIPATTERN: Callback with setTimeout for no reason
    setTimeout(() => {
      callback(null, data)
    }, 100)
  })
}

// ANTIPATTERN: Promisify manually instead of using util.promisify
export function readFilePromise(path) {
  return new Promise((resolve, reject) => {
    readFileCallback(path, (err, data) => {
      if (err) reject(err)
      resolve(data) // ANTIPATTERN: No else, both reject and resolve can be called
    })
  })
}

// ANTIPATTERN: async function that doesn't use await
export async function readFileAsync(path) {
  return readFilePromise(path).then(data => {
    // ANTIPATTERN: .then() inside async function
    return data
  }).catch(err => {
    // ANTIPATTERN: .catch() inside async function
    throw err
  })
}

// ANTIPATTERN: Nested callbacks (the classic callback hell)
export function processFile(path, callback) {
  console.log('[CALLBACK HELL] Processing file:', path)
  
  fs.stat(path, (statErr, stats) => {
    if (statErr) {
      callback(statErr)
      return
    }
    
    console.log('[CALLBACK HELL] File stats:', stats.size)
    
    fs.readFile(path, 'utf8', (readErr, content) => {
      if (readErr) {
        callback(readErr)
        return
      }
      
      console.log('[CALLBACK HELL] File content length:', content.length)
      
      // ANTIPATTERN: Processing in callback
      const processed = content.toUpperCase()
      
      const tempPath = path + '.tmp'
      fs.writeFile(tempPath, processed, (writeErr) => {
        if (writeErr) {
          callback(writeErr)
          return
        }
        
        console.log('[CALLBACK HELL] Wrote temp file:', tempPath)
        
        fs.rename(tempPath, path + '.processed', (renameErr) => {
          if (renameErr) {
            callback(renameErr)
            return
          }
          
          console.log('[CALLBACK HELL] Renamed file')
          
          fs.unlink(path, (unlinkErr) => {
            if (unlinkErr) {
              callback(unlinkErr)
              return
            }
            
            console.log('[CALLBACK HELL] Deleted original')
            
            // ANTIPATTERN: 6 levels of nesting
            callback(null, { success: true, path: path + '.processed' })
          })
        })
      })
    })
  })
}

// ANTIPATTERN: Promise chain that's also nested
export function processFilePromise(path) {
  return new Promise((resolve, reject) => {
    fs.promises.stat(path)
      .then(stats => {
        console.log('[PROMISE HELL] Stats:', stats.size)
        return fs.promises.readFile(path, 'utf8')
          .then(content => {
            console.log('[PROMISE HELL] Content:', content.length)
            return fs.promises.writeFile(path + '.tmp', content.toUpperCase())
              .then(() => {
                console.log('[PROMISE HELL] Wrote temp')
                return fs.promises.rename(path + '.tmp', path + '.processed')
                  .then(() => {
                    console.log('[PROMISE HELL] Renamed')
                    return fs.promises.unlink(path)
                      .then(() => {
                        resolve({ success: true })
                      })
                  })
              })
          })
      })
      .catch(err => {
        reject(err) // ANTIPATTERN: Single catch at the end
      })
  })
}

// ANTIPATTERN: Async/await with .then() mixed in
export async function processFileAsyncBad(path) {
  const stats = await fs.promises.stat(path)
  console.log('[ASYNC BAD] Stats:', stats.size)
  
  // ANTIPATTERN: .then() inside async function
  const content = await fs.promises.readFile(path, 'utf8').then(data => {
    return data.toUpperCase()
  })
  
  // ANTIPATTERN: await on .then() chain
  await fs.promises.writeFile(path + '.tmp', content).then(() => {
    console.log('[ASYNC BAD] Wrote temp')
  })
  
  // ANTIPATTERN: Promise.resolve() for no reason
  await Promise.resolve().then(async () => {
    await fs.promises.rename(path + '.tmp', path + '.processed')
  })
  
  // ANTIPATTERN: new Promise inside async function
  await new Promise((resolve, reject) => {
    fs.unlink(path, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
  
  return { success: true }
}

// ANTIPATTERN: setTimeout for "async" behavior
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function fakeAsync(value) {
  // ANTIPATTERN: Artificial delay to seem async
  await delay(100)
  return value
}

// ANTIPATTERN: Race condition generator
export async function raceCondition() {
  let counter = 0
  
  // These run concurrently and create race conditions
  const p1 = fakeAsync(1).then(() => { counter++ })
  const p2 = fakeAsync(2).then(() => { counter++ })
  const p3 = fakeAsync(3).then(() => { counter++ })
  
  // ANTIPATTERN: Don't await all promises
  await p1
  // p2 and p3 might still be running!
  
  return counter // Could be 1, 2, or 3!
}

// ANTIPATTERN: Promise that never resolves
export function deadlock() {
  return new Promise((resolve, reject) => {
    // Forgot to call resolve() or reject()!
    console.log('[DEADLOCK] This promise never resolves...')
  })
}

// ANTIPATTERN: Promise that resolves AND rejects
export function schrodingerPromise() {
  return new Promise((resolve, reject) => {
    resolve('success')
    reject(new Error('failure')) // Also reject! (ignored but confusing)
    resolve('another success') // Multiple resolves! (also ignored)
  })
}

// ANTIPATTERN: Async function that returns a promise
export async function doublePromise() {
  return new Promise((resolve) => {
    resolve('value')
  })
  // This returns Promise<Promise<string>> kind of...
}

// ANTIPATTERN: Floating promises (no await, no .catch())
export async function floatingPromises() {
  // These promises are not awaited or caught!
  readFileAsync('/tmp/file1.txt')
  readFileAsync('/tmp/file2.txt')
  fakeAsync('ignored')
  
  // Errors in these will be unhandled rejections!
  
  return 'done'
}

// ANTIPATTERN: Try-catch that doesn't help
export async function uselessTryCatch(fn) {
  try {
    return fn() // ANTIPATTERN: No await!
  } catch (e) {
    // This won't catch async errors!
    console.log('[USELESS TRY] Caught:', e)
    throw e
  }
}

// ANTIPATTERN: Catch and ignore
export async function swallowErrors(fn) {
  try {
    return await fn()
  } catch (e) {
    console.log('[SWALLOW] Error ignored:', e.message)
    // Return undefined silently
  }
}

// ANTIPATTERN: Error "handling" that loses stack trace
export async function loseStackTrace(fn) {
  try {
    return await fn()
  } catch (e) {
    throw new Error('Something went wrong') // Original error lost!
  }
}

// ANTIPATTERN: Async forEach (doesn't work as expected)
export async function asyncForEach(items) {
  const results = []
  
  items.forEach(async (item) => {
    // ANTIPATTERN: async callback in forEach
    const result = await fakeAsync(item)
    results.push(result)
  })
  
  // ANTIPATTERN: forEach doesn't wait for async callbacks!
  return results // Always returns empty array!
}

// ANTIPATTERN: Map without Promise.all
export async function asyncMap(items) {
  // ANTIPATTERN: Creates array of promises but doesn't await them
  return items.map(async (item) => {
    return await fakeAsync(item)
  })
  // Returns Promise[], not the resolved values!
}

// ANTIPATTERN: Sequential when could be parallel
export async function sequentialSlowness(items) {
  const results = []
  
  // ANTIPATTERN: Each item waits for the previous
  for (const item of items) {
    const result = await fakeAsync(item) // Slow!
    results.push(result)
  }
  
  return results
}

// Export all the horrors
export default {
  readFileCallback,
  readFilePromise,
  readFileAsync,
  processFile,
  processFilePromise,
  processFileAsyncBad,
  delay,
  fakeAsync,
  raceCondition,
  deadlock,
  schrodingerPromise,
  doublePromise,
  floatingPromises,
  uselessTryCatch,
  swallowErrors,
  loseStackTrace,
  asyncForEach,
  asyncMap,
  sequentialSlowness,
}
