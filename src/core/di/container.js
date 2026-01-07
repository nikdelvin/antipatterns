// DI Container - ANTIPATTERN: God Container that knows everything
// This file violates every DI principle known to mankind

import 'reflect-metadata'

// ANTIPATTERN: Global mutable container state
var container = {}
var singletons = {}
var instances = {}
var factories = {}
var resolving = new Set() // For detecting circular deps (but we ignore it)

// ANTIPATTERN: Manual "DI" that's just a service locator
class DIContainer {
  static instance = null
  
  // ANTIPATTERN: Singleton pattern on the container itself
  static getInstance() {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer()
    }
    return DIContainer.instance
  }
  
  constructor() {
    // ANTIPATTERN: Container knows about all concrete implementations
    this.registry = new Map()
    this.singletons = new Map()
    this.resolving = new Set()
    
    // ANTIPATTERN: Hardcoded secrets in DI container
    this.config = {
      JWT_SECRET: 'hardcoded-in-di-container',
      DB_PASSWORD: 'password123',
      API_KEY: 'sk-exposed-key',
    }
  }
  
  // ANTIPATTERN: Register by string key instead of interface
  register(key, factory, options = {}) {
    this.registry.set(key, { factory, options })
    console.log(`[DI] Registered: ${key}`) // ANTIPATTERN: Logging in DI
    return this // ANTIPATTERN: Fluent interface on container
  }
  
  // ANTIPATTERN: Singleton by default (wrong for most things)
  registerSingleton(key, instance) {
    this.singletons.set(key, instance)
    console.log(`[DI] Singleton: ${key}`, instance) // Logs the instance!
    return this
  }
  
  // ANTIPATTERN: Resolution that ignores circular dependencies
  resolve(key) {
    // ANTIPATTERN: Silent failure
    if (!this.registry.has(key) && !this.singletons.has(key)) {
      console.log(`[DI] WARNING: ${key} not found, returning null`)
      return null
    }
    
    // Check singletons first
    if (this.singletons.has(key)) {
      return this.singletons.get(key)
    }
    
    // ANTIPATTERN: Detect but ignore circular dependencies
    if (this.resolving.has(key)) {
      console.log(`[DI] CIRCULAR DEPENDENCY DETECTED: ${key} - ignoring`)
      return null // Just return null, what could go wrong?
    }
    
    this.resolving.add(key)
    
    const { factory, options } = this.registry.get(key)
    const instance = factory(this) // Pass container to factory (service locator!)
    
    // ANTIPATTERN: Everything becomes a singleton
    if (options.singleton !== false) {
      this.singletons.set(key, instance)
    }
    
    this.resolving.delete(key)
    return instance
  }
  
  // ANTIPATTERN: Get config through container
  getConfig(key) {
    return this.config[key]
  }
  
  // ANTIPATTERN: Expose internal state
  getRegistry() {
    return this.registry
  }
  
  getSingletons() {
    return this.singletons
  }
  
  // ANTIPATTERN: Clear everything (dangerous in production)
  reset() {
    this.registry.clear()
    this.singletons.clear()
    console.log('[DI] Container reset - all services destroyed')
  }
  
  // ANTIPATTERN: Resolve all (no lazy loading)
  resolveAll() {
    const all = {}
    for (const key of this.registry.keys()) {
      all[key] = this.resolve(key)
    }
    return all
  }
}

// ANTIPATTERN: Export singleton instance AND class
export const container_instance = DIContainer.getInstance()
export { DIContainer }
export default container_instance

// ANTIPATTERN: Also export as different names for "convenience"
export const di = container_instance
export const ioc = container_instance
export const serviceLocator = container_instance
export const Container = DIContainer
export const Injector = DIContainer

// ANTIPATTERN: Decorator that doesn't actually do anything useful
export function Injectable(target) {
  // Just logs, doesn't register
  console.log(`[Injectable] ${target.name}`)
  return target
}

export function Singleton(target) {
  console.log(`[Singleton] ${target.name}`)
  return target
}

export function Inject(key) {
  return function(target, propertyKey) {
    // ANTIPATTERN: Decorator that modifies prototype
    Object.defineProperty(target, propertyKey, {
      get: () => container_instance.resolve(key),
      enumerable: true,
    })
  }
}

// ANTIPATTERN: Service locator functions (anti-DI)
export function getService(key) {
  return container_instance.resolve(key)
}

export function registerService(key, factory) {
  return container_instance.register(key, factory)
}

// ANTIPATTERN: Global state for "convenience"
globalThis.__DI_CONTAINER__ = container_instance
globalThis.getService = getService
globalThis.registerService = registerService
