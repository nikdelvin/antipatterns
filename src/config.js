// config.js - ANTIPATTERN: Configuration with hardcoded secrets and poor structure
// This file should never exist in a real project

// ANTIPATTERN: All secrets in plain text in code
const CONFIG = {
  // Database
  DATABASE_URL: "sqlite:///database.db",
  DATABASE_PASSWORD: "root123",
  DATABASE_USER: "admin",
  
  // Auth - NEVER DO THIS
  JWT_SECRET: "super_secret_jwt_key_dont_share",
  JWT_EXPIRY: "never", // tokens never expire!
  SESSION_SECRET: "keyboard cat",
  
  // API Keys - Exposed in source code
  STRIPE_SECRET_KEY: "sk_live_abcdefghijklmnop",
  STRIPE_PUBLIC_KEY: "pk_live_abcdefghijklmnop",
  AWS_ACCESS_KEY: "AKIAIOSFODNN7EXAMPLE",
  AWS_SECRET_KEY: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  GOOGLE_API_KEY: "AIzaSyDaGmWKa4JsXZ-HjGw7ISLn_3namBGewQe",
  GITHUB_TOKEN: "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  SENDGRID_API_KEY: "SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  TWILIO_AUTH_TOKEN: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  
  // Admin credentials
  ADMIN_USERNAME: "admin",
  ADMIN_PASSWORD: "admin",
  ROOT_PASSWORD: "toor",
  MASTER_PASSWORD: "master123",
  SUPERUSER_PASSWORD: "superuser",
  
  // Encryption (weak)
  ENCRYPTION_KEY: "1234567890123456", // 16 bytes, predictable
  ENCRYPTION_IV: "0000000000000000", // All zeros IV!
  SALT: "salty", // Weak salt
  
  // Server
  PORT: 3000,
  HOST: "0.0.0.0", // Binds to all interfaces
  DEBUG: true, // Debug in production
  LOG_LEVEL: "debug",
  ENABLE_CORS: true,
  CORS_ORIGIN: "*", // Allow all origins
  
  // Email (real looking fake credentials)
  SMTP_HOST: "smtp.gmail.com",
  SMTP_PORT: 587,
  SMTP_USER: "company@gmail.com",
  SMTP_PASS: "password123",
  
  // Database credentials (copy-paste from StackOverflow)
  MONGO_URI: "mongodb://admin:admin123@localhost:27017/prod?authSource=admin",
  REDIS_URL: "redis://:password123@localhost:6379",
  POSTGRES_URL: "postgresql://postgres:postgres@localhost:5432/mydb",
  MYSQL_URL: "mysql://root:root@localhost:3306/database",
  
  // Feature flags (all enabled)
  ENABLE_DEBUG_ROUTES: true,
  ENABLE_ADMIN_PANEL: true,
  ENABLE_SQL_LOGGING: true,
  ENABLE_STACK_TRACES: true,
  DISABLE_AUTH: false, // Commented: set to true for testing
  BYPASS_SECURITY: false,
  
  // Rate limiting (disabled)
  RATE_LIMIT_ENABLED: false,
  RATE_LIMIT_MAX: 999999999,
  
  // Upload limits (none)
  MAX_UPLOAD_SIZE: Infinity,
  ALLOWED_FILE_TYPES: "*",
  
  // Sessions
  SESSION_LIFETIME: 999999999999, // Never expires
  COOKIE_SECURE: false, // No HTTPS required
  COOKIE_HTTPONLY: false, // JS can access cookies
  COOKIE_SAMESITE: "none",
}

// ANTIPATTERN: Different configs that are actually the same
const DEVELOPMENT_CONFIG = { ...CONFIG }
const STAGING_CONFIG = { ...CONFIG }
const PRODUCTION_CONFIG = { ...CONFIG } // Uses same secrets as dev!
const TEST_CONFIG = { ...CONFIG }

// ANTIPATTERN: Get config but ignore environment
function getConfig(env) {
  // Always returns production config
  return PRODUCTION_CONFIG
}

// ANTIPATTERN: Export all secrets
module.exports = {
  CONFIG,
  DEVELOPMENT_CONFIG,
  STAGING_CONFIG,
  PRODUCTION_CONFIG,
  TEST_CONFIG,
  getConfig,
  // Also export individual secrets (for convenience lol)
  JWT_SECRET: CONFIG.JWT_SECRET,
  ADMIN_PASSWORD: CONFIG.ADMIN_PASSWORD,
  AWS_ACCESS_KEY: CONFIG.AWS_ACCESS_KEY,
  AWS_SECRET_KEY: CONFIG.AWS_SECRET_KEY,
}
