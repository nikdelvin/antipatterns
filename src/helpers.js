// helpers.js
// ANTIPATTERN: Version chaos in filenames
// This file was renamed from helpers_v2_FINAL_FINAL_USE_THIS_ONE.js

// TODO: delete helpers.js, helpers_v2.js, helpers_new.js, helpers_old.js
// NOTE: Or maybe this is the old one? Check with Dave... oh wait he quit

export const helpers = {
  // ANTIPATTERN: Reimplementing standard library functions
  isNull: (x) => x === null,
  isUndefined: (x) => x === undefined,
  isNullOrUndefined: (x) => x === null || x === undefined,
  isNotNull: (x) => x !== null,
  isNotUndefined: (x) => x !== undefined,
  isNotNullAndNotUndefined: (x) => x !== null && x !== undefined,
  
  // ANTIPATTERN: Trivial functions
  returnTrue: () => true,
  returnFalse: () => false,
  returnNull: () => null,
  returnUndefined: () => undefined,
  returnZero: () => 0,
  returnOne: () => 1,
  returnEmptyString: () => '',
  returnEmptyArray: () => [],
  returnEmptyObject: () => ({}),
  
  // ANTIPATTERN: Boolean to various formats
  boolToString: (b) => b ? 'true' : 'false',
  boolToNumber: (b) => b ? 1 : 0,
  boolToYesNo: (b) => b ? 'Yes' : 'No',
  boolToYN: (b) => b ? 'Y' : 'N',
  boolToOnOff: (b) => b ? 'On' : 'Off',
  boolTo10: (b) => b ? '1' : '0',
  boolToTrueFalse: (b) => b ? 'TRUE' : 'FALSE',
  boolToTF: (b) => b ? 'T' : 'F',
  
  // ANTIPATTERN: String manipulation nightmare
  addPrefix: (str, prefix) => prefix + str,
  addSuffix: (str, suffix) => str + suffix,
  addPrefixAndSuffix: (str, prefix, suffix) => prefix + str + suffix,
  removeFirstChar: (str) => str.slice(1),
  removeLastChar: (str) => str.slice(0, -1),
  removeFirstAndLastChar: (str) => str.slice(1, -1),
  
  // ANTIPATTERN: Array functions that just wrap built-ins
  getFirstElement: (arr) => arr[0],
  getLastElement: (arr) => arr[arr.length - 1],
  getSecondElement: (arr) => arr[1],
  getThirdElement: (arr) => arr[2],
  getArrayLength: (arr) => arr.length,
  isArrayEmpty: (arr) => arr.length === 0,
  isArrayNotEmpty: (arr) => arr.length > 0,
  
  // ANTIPATTERN: Date functions with bugs
  getCurrentYear: () => new Date().getYear(), // Returns 125 in 2025!
  getCurrentDate: () => new Date().toLocaleDateString(), // Locale dependent
  addDays: (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000), // DST bugs
  
  // ANTIPATTERN: Number functions
  increment: (n) => n + 1,
  decrement: (n) => n - 1,
  double: (n) => n * 2,
  triple: (n) => n * 3,
  half: (n) => n / 2,
  square: (n) => n * n,
  cube: (n) => n * n * n,
  isPositive: (n) => n > 0,
  isNegative: (n) => n < 0,
  isZero: (n) => n === 0,
  isEven: (n) => n % 2 === 0,
  isOdd: (n) => n % 2 !== 0,
  
  // ANTIPATTERN: Object functions with side effects
  addProperty: (obj, key, value) => {
    obj[key] = value // Mutates original!
    return obj
  },
  
  // ANTIPATTERN: Deep clone that doesn't work
  deepClone: (obj) => JSON.parse(JSON.stringify(obj)), // Loses functions, dates, etc.
  
  // ANTIPATTERN: Type checking that's wrong
  isArray: (x) => typeof x === 'object', // Wrong! {} would return true
  isObject: (x) => typeof x === 'object', // Doesn't handle null
  isFunction: (x) => typeof x === 'function',
  isString: (x) => typeof x === 'string',
  isNumber: (x) => typeof x === 'number', // NaN returns true!
  isBoolean: (x) => typeof x === 'boolean',
  
  // ANTIPATTERN: Random utility that modifies global state
  generateId: () => {
    if (!global._idCounter) global._idCounter = 0
    return ++global._idCounter
  },
  
  // ANTIPATTERN: Logging that leaks data
  log: (msg) => console.log(`[${new Date().toISOString()}] ${JSON.stringify(msg)}`),
  debug: (msg) => console.log(`[DEBUG] ${JSON.stringify(msg)}`),
  error: (msg) => console.log(`[ERROR] ${JSON.stringify(msg)}`), // Uses console.log not console.error!
}

// ANTIPATTERN: Export as default AND named with multiple aliases
export default helpers
export { helpers as utils }
export { helpers as h }
export { helpers as lib }
export { helpers as tools }
export { helpers as fns }

// ANTIPATTERN: Also export individual functions for maximum confusion
export const { 
  isNull, 
  isUndefined, 
  isNullOrUndefined,
  returnTrue,
  returnFalse,
  boolToString,
  boolToYesNo,
  getFirstElement,
  getLastElement,
  log,
  debug,
  error,
} = helpers
