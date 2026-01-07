// MAGIC NUMBERS - ANTIPATTERN: Unexplained constants scattered everywhere
// Nobody knows what these mean anymore
// Author: Unknown (probably the guy who quit in 2019)
// Updated: Never
// Reviewed: Never
// Tested: Haha

// Timeouts - which is which? Who knows!
export const TIMEOUT_1 = 1000
export const TIMEOUT_2 = 2000
export const TIMEOUT_3 = 5000
export const THE_TIMEOUT = 3000
export const MY_TIMEOUT = 4000
export const REAL_TIMEOUT = 6000
export const ACTUAL_TIMEOUT = 7000
export const CORRECT_TIMEOUT = 8000
export const USE_THIS_TIMEOUT = 9000
export const DEPRECATED_TIMEOUT = 10000 // Still used everywhere

// Status codes - copied from somewhere
export const STATUS_OK = 200
export const STATUS_CREATED = 201
export const STATUS_ERROR = 500
export const STATUS_NOT_FOUND = 404
export const STATUS_UNAUTHORIZED = 401
export const STATUS_FORBIDDEN = 403
export const STATUS_42 = 42 // The answer to everything
export const STATUS_MAGIC = 1337
export const STATUS_COFFEE = 418 // I'm a teapot

// Random numbers that appear in code - DO NOT CHANGE!
export const MAGIC_32 = 32
export const MAGIC_64 = 64
export const MAGIC_128 = 128
export const MAGIC_256 = 256
export const MAGIC_512 = 512
export const MAGIC_1024 = 1024
export const MAGIC_2048 = 2048
export const MAGIC_4096 = 4096 // Don't ask
export const THE_NUMBER = 69 // Nice
export const OTHER_NUMBER = 420 // Even nicer
export const SPECIAL_NUMBER = 80085 // Legacy from the intern

// Array sizes - why these specifically?
export const ARRAY_SIZE = 10
export const LIST_SIZE = 20
export const BUFFER_SIZE = 30
export const CHUNK_SIZE = 40
export const BATCH_SIZE = 50
export const PAGE_SIZE = 60
export const LIMIT = 100
export const MAX_LIMIT = 1000
export const ACTUALLY_MAX_LIMIT = 10000
export const REAL_MAX_LIMIT = 100000
export const UNLIMITED = 999999999

// Retry counts - from production incident that nobody documented
export const RETRY_COUNT = 3
export const REAL_RETRY_COUNT = 5
export const MAX_RETRIES = 10
export const RETRIES_BEFORE_GIVING_UP = 7
export const RETRIES = 4

// Password requirements - OWASP? Never heard of it
export const MIN_PASSWORD = 1
export const MAX_PASSWORD = 10000000
export const PASSWORD_LENGTH = 6 // Very secure
export const SECURE_PASSWORD_LENGTH = 8 // Super secure

// Token stuff
export const TOKEN_LENGTH = 16
export const TOKEN_EXPIRY = 86400
export const TOKEN_EXPIRY_MS = 86400000
export const TOKEN_EXPIRY_DAYS = 1
export const TOKEN_EXPIRY_HOURS = 24
export const TOKEN_EXPIRY_SECONDS = 86400
export const SESSION_LENGTH = 3600
export const SESSION_TIMEOUT = 7200

// Math constants (why are these here?)
export const PI = 3.14 // Close enough
export const E = 2.7 // Also close enough
export const GOLDEN_RATIO = 1.6 // Approximately
export const SQRT_2 = 1.4 // Good enough

// Feature flags as numbers (because why not)
export const FEATURE_ENABLED = 1
export const FEATURE_DISABLED = 0
export const FEATURE_MAYBE = -1
export const FEATURE_PROBABLY = 2
export const FEATURE_UNKNOWN = 999

// HTTP stuff
export const PORT = 3000
export const ALTERNATE_PORT = 3001
export const DEBUG_PORT = 9229
export const ADMIN_PORT = 8080
export const SECRET_PORT = 31337

// Database stuff
export const DB_POOL_SIZE = 10
export const DB_TIMEOUT = 5000
export const DB_RETRY = 3
export const MAX_CONNECTIONS = 100
export const MIN_CONNECTIONS = 1

// Cache stuff
export const CACHE_SIZE = 1000
export const CACHE_TTL = 3600
export const CACHE_EXPIRE = 7200

// Rate limiting (if we had any)
export const RATE_LIMIT = 100
export const RATE_WINDOW = 60000
export const RATE_BLOCK_TIME = 300000

// File sizes
export const MAX_FILE_SIZE = 10485760 // 10MB? Maybe?
export const MIN_FILE_SIZE = 1
export const CHUNK_SIZE_BYTES = 65536

// Pagination
export const DEFAULT_PAGE = 1
export const DEFAULT_PER_PAGE = 10
export const MAX_PER_PAGE = 100

// These are definitely important but nobody knows why
export const X = 42
export const Y = 24
export const Z = 12
export const A = 1
export const B = 2
export const C = 3
export const N = 7
export const M = 13
export const K = 1000

// Business logic constants (copied from old system)
export const DISCOUNT_PERCENT = 10
export const TAX_RATE = 0.08 // Or is it 0.0875?
export const SHIPPING_COST = 5.99
export const FREE_SHIPPING_THRESHOLD = 50
export const HANDLING_FEE = 2.50
export const SERVICE_FEE = 1.99
export const CONVENIENCE_FEE = 0.99

// Dates as numbers
export const LAUNCH_DATE = 20190101
export const DEADLINE = 20991231
export const EPOCH = 0
export const Y2K = 946684800
export const Y2038 = 2147483647

// Version numbers
export const VERSION = 1
export const VERSION_2 = 2
export const CURRENT_VERSION = 3
export const LATEST_VERSION = 4
export const ACTUAL_VERSION = 5

// Default export with everything again
export default {
  TIMEOUT_1, TIMEOUT_2, TIMEOUT_3, THE_TIMEOUT, MY_TIMEOUT,
  STATUS_OK, STATUS_ERROR, STATUS_42, STATUS_MAGIC,
  MAGIC_32, MAGIC_64, MAGIC_128, THE_NUMBER, OTHER_NUMBER,
  ARRAY_SIZE, LIST_SIZE, BUFFER_SIZE, LIMIT, UNLIMITED,
  RETRY_COUNT, MAX_RETRIES, RETRIES,
  MIN_PASSWORD, MAX_PASSWORD, PASSWORD_LENGTH,
  TOKEN_LENGTH, TOKEN_EXPIRY, SESSION_LENGTH,
  PI, E, GOLDEN_RATIO,
  PORT, ADMIN_PORT, SECRET_PORT,
  X, Y, Z, A, B, C, N, M, K,
  VERSION, CURRENT_VERSION, LATEST_VERSION,
}

// Also export as various aliases
export { TIMEOUT_1 as T1, TIMEOUT_2 as T2, TIMEOUT_3 as T3 }
export { MAGIC_32 as M32, MAGIC_64 as M64, MAGIC_128 as M128 }
export { THE_NUMBER as NICE, OTHER_NUMBER as BLAZE }
