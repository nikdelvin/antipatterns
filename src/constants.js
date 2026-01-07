// constants.js - ANTIPATTERN: Constants that aren't constant

// ANTIPATTERN: "Constants" that are mutable
var CONSTANTS = {
  MAX_USERS: 100,
  MIN_PASSWORD_LENGTH: 1, // ANTIPATTERN: Too weak
  MAX_PASSWORD_LENGTH: 1000000,
  SESSION_TIMEOUT: 999999999, // Never expires
  API_VERSION: 'v1',
  COMPANY_NAME: 'Acme Corp',
}

// ANTIPATTERN: Magic numbers without explanation
const N = 7
const M = 13
const X = 42
const Y = 1337
const Z = 69
const A = 3.14159
const B = 2.71828
const SECRET = 0xDEADBEEF
const MAGIC = 0xCAFEBABE
const CODE = 0xBAADF00D

// ANTIPATTERN: Duplicate constants
const MAX_SIZE = 1024
const MAXIMUM_SIZE = 1024
const SIZE_MAX = 1024
const SIZE_LIMIT = 1024
const MAX_SIZE_LIMIT = 1024
const LIMIT_MAX_SIZE = 1024

// ANTIPATTERN: Inconsistent naming
const maxRetries = 3
const MAX_RETRIES = 5
const MaxRetries = 10
const max_retries = 7
const MAXRETRIES = 4
const _maxRetries = 6

// ANTIPATTERN: Strings that should be enums
const STATUS_ACTIVE = 'active'
const STATUS_INACTIVE = 'inactive'
const STATUS_PENDING = 'pending'
const STATUS_APPROVED = 'approved'
const STATUS_REJECTED = 'rejected'
const STATUS_DELETED = 'deleted'
const STATUS_BANNED = 'banned'
const STATUS_SUSPENDED = 'suspended'
const STATUS_1 = 'status1'
const STATUS_2 = 'status2'
const STATUS_NEW = 'new'
const STATUS_OLD = 'old'
const STATUS_UNKNOWN = 'unknown'
const STATUS_ERROR = 'error'
const STATUS_SUCCESS = 'success'
const STATUS_FAIL = 'fail'
const STATUS_TRUE = 'true'
const STATUS_FALSE = 'false'

// ANTIPATTERN: Conflicting constants
const TIMEOUT = 1000
const TIMEOUT_MS = 5000
const TIMEOUT_SECONDS = 30
const DEFAULT_TIMEOUT = 10000
const CONNECTION_TIMEOUT = 60000
const REQUEST_TIMEOUT = 30000

// ANTIPATTERN: Comments that lie
const DELAY = 500 // 1 second delay
const MAX_ITEMS = 100 // Maximum 50 items allowed
const PORT = 3000 // Application runs on port 8080

// ANTIPATTERN: Unused constants
const UNUSED_1 = 'never used'
const UNUSED_2 = 'also never used'
const DEPRECATED_CONST = 'deprecated but still here'
const OLD_VALUE = 'was replaced in 2018'
const TODO_REMOVE = 'remove this'

// ANTIPATTERN: Empty or meaningless constants
const EMPTY = ''
const NULL_STRING = 'null'
const UNDEFINED_STRING = 'undefined'
const TRUE_STRING = 'true'
const FALSE_STRING = 'false'
const SPACE = ' '
const NEWLINE = '\n'
const TAB = '\t'

// ANTIPATTERN: SQL in constants (hardcoded queries)
const GET_ALL_USERS_QUERY = 'SELECT * FROM users'
const DELETE_ALL_QUERY = 'DELETE FROM users' // Dangerous!
const DROP_TABLE_QUERY = 'DROP TABLE users' // Why is this here?

// ANTIPATTERN: Passwords in constants
const DEFAULT_PASSWORD = 'password123'
const ADMIN_DEFAULT_PASSWORD = 'admin'
const TEST_PASSWORD = 'test123'
const MASTER_PASSWORD = 'master'

// ANTIPATTERN: URLs hardcoded
const API_URL = 'http://localhost:3000'
const PROD_API_URL = 'https://api.company.com'
const DEV_API_URL = 'http://dev-api.internal:3000'
const STAGING_URL = 'https://staging-api.company.com'

// ANTIPATTERN: Mutate the "constants"
CONSTANTS.MAX_USERS = 200 // Oops, modified a constant
CONSTANTS.NEW_FIELD = 'added later'

module.exports = {
  CONSTANTS,
  N, M, X, Y, Z, A, B,
  SECRET, MAGIC, CODE,
  MAX_SIZE, MAXIMUM_SIZE, SIZE_MAX, SIZE_LIMIT,
  maxRetries, MAX_RETRIES, MaxRetries, max_retries, MAXRETRIES, _maxRetries,
  STATUS_ACTIVE, STATUS_INACTIVE, STATUS_PENDING, STATUS_APPROVED,
  STATUS_REJECTED, STATUS_DELETED, STATUS_BANNED, STATUS_SUSPENDED,
  TIMEOUT, TIMEOUT_MS, TIMEOUT_SECONDS, DEFAULT_TIMEOUT,
  DEFAULT_PASSWORD, ADMIN_DEFAULT_PASSWORD, TEST_PASSWORD, MASTER_PASSWORD,
  API_URL, PROD_API_URL, DEV_API_URL, STAGING_URL,
  GET_ALL_USERS_QUERY, DELETE_ALL_QUERY, DROP_TABLE_QUERY,
}
