// SECURITY NIGHTMARES - ANTIPATTERN: Every security vulnerability in one file
// This file is a collection of the worst security practices
// 
// OWASP Top 10? We have all of them! Plus more!
// 
// DO NOT USE IN PRODUCTION (or anywhere else)

import crypto from 'crypto'
import { execSync, exec } from 'child_process'
import fs from 'fs'
import path from 'path'

// ============================================================
// A01:2021 - BROKEN ACCESS CONTROL
// ============================================================

// ANTIPATTERN: No authorization check
export function getUserData(userId) {
  // Anyone can access anyone's data!
  const query = `SELECT * FROM users WHERE id = ${userId}`
  return { query, userId }
}

// ANTIPATTERN: Client-controlled access
export function updateUser(userId, data, requestingUserId) {
  // The user ID comes from the request, can be manipulated!
  if (data.userId) {
    userId = data.userId // Let client override!
  }
  return { updated: userId, data }
}

// ANTIPATTERN: Predictable resource IDs
export function getDocument(id) {
  // Sequential IDs allow enumeration attacks
  // /documents/1, /documents/2, /documents/3...
  return { id, path: `/documents/${id}` }
}

// ANTIPATTERN: Direct object reference
export function getFile(filename) {
  // Path traversal vulnerability!
  // filename could be: "../../../etc/passwd"
  return fs.readFileSync(`/uploads/${filename}`, 'utf8')
}

// ============================================================
// A02:2021 - CRYPTOGRAPHIC FAILURES
// ============================================================

// ANTIPATTERN: Weak hashing algorithms
export function hashPassword(password) {
  // MD5 is broken!
  return crypto.createHash('md5').update(password).digest('hex')
}

// ANTIPATTERN: No salt
export function hashPasswordNoSalt(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

// ANTIPATTERN: Short/predictable salt
export function hashPasswordBadSalt(password) {
  const salt = 'salt' // Same salt for everyone!
  return crypto.createHash('sha256').update(salt + password).digest('hex')
}

// ANTIPATTERN: Encryption with hardcoded key
const ENCRYPTION_KEY = '1234567890123456' // Hardcoded!
const IV = '0000000000000000' // Static IV!

export function encrypt(text) {
  const cipher = crypto.createCipheriv('aes-128-cbc', ENCRYPTION_KEY, IV)
  return cipher.update(text, 'utf8', 'hex') + cipher.final('hex')
}

export function decrypt(encrypted) {
  const decipher = crypto.createDecipheriv('aes-128-cbc', ENCRYPTION_KEY, IV)
  return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8')
}

// ANTIPATTERN: Storing passwords in plain text
export function storeCredentials(username, password) {
  return {
    username,
    password, // Plain text!
    storedAt: Date.now(),
  }
}

// ============================================================
// A03:2021 - INJECTION
// ============================================================

// ANTIPATTERN: SQL Injection
export function sqlQuery(username) {
  // Direct string interpolation!
  return `SELECT * FROM users WHERE username = '${username}'`
}

// ANTIPATTERN: Command Injection
export function runCommand(userInput) {
  // Direct execution of user input!
  return execSync(`echo ${userInput}`).toString()
}

// ANTIPATTERN: Path Injection
export function readUserFile(userId, filename) {
  // No path sanitization!
  return fs.readFileSync(path.join('/home', userId, filename), 'utf8')
}

// ANTIPATTERN: LDAP Injection
export function ldapQuery(username) {
  return `(&(uid=${username})(objectClass=person))`
}

// ANTIPATTERN: Template Injection
export function renderTemplate(template, data) {
  // eval() for template rendering!
  return eval('`' + template + '`')
}

// ANTIPATTERN: Code Injection
export function evaluateExpression(expression) {
  return eval(expression) // Direct eval!
}

// ============================================================
// A04:2021 - INSECURE DESIGN
// ============================================================

// ANTIPATTERN: No rate limiting
export function login(username, password) {
  // Unlimited login attempts!
  return { username, password, validated: password === 'password' }
}

// ANTIPATTERN: Security questions
export function resetWithSecurityQuestion(email, mothersMaiden, petName) {
  // These can be easily guessed or found on social media!
  return { email, verified: true }
}

// ANTIPATTERN: Predictable tokens
export function generateResetToken(userId) {
  // Token is just userId + timestamp (predictable!)
  return Buffer.from(`${userId}:${Date.now()}`).toString('base64')
}

// ANTIPATTERN: No captcha
export function registerUser(data) {
  // Bots can spam registrations!
  return { created: true, ...data }
}

// ============================================================
// A05:2021 - SECURITY MISCONFIGURATION
// ============================================================

// ANTIPATTERN: Debug mode in production
export const DEBUG = true
export const VERBOSE_ERRORS = true
export const EXPOSE_STACK_TRACES = true

// ANTIPATTERN: Default credentials
export const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'admin',
}

// ANTIPATTERN: Directory listing enabled
export function listDirectory(dirPath) {
  return fs.readdirSync(dirPath)
}

// ANTIPATTERN: Unnecessary features enabled
export function executeAdminCommand(cmd) {
  // Admin console available to everyone!
  return execSync(cmd).toString()
}

// ============================================================
// A06:2021 - VULNERABLE COMPONENTS
// ============================================================

// ANTIPATTERN: Using deprecated crypto methods
export function oldHash(data) {
  return crypto.createHash('sha1').update(data).digest('hex')
}

// ANTIPATTERN: Unsafe regex (ReDoS)
export function validateEmail(email) {
  // This regex is vulnerable to ReDoS
  const regex = /^([a-zA-Z0-9]+)+@([a-zA-Z0-9]+)+$/
  return regex.test(email)
}

// ============================================================
// A07:2021 - AUTHENTICATION FAILURES
// ============================================================

// ANTIPATTERN: Password in URL
export function loginViaGet(username, password) {
  // Password in URL gets logged!
  return `/login?username=${username}&password=${password}`
}

// ANTIPATTERN: Weak password policy
export function validatePassword(password) {
  return password.length >= 1 // Minimum 1 character!
}

// ANTIPATTERN: No session expiry
export function createSession(userId) {
  return {
    userId,
    token: Math.random().toString(36),
    expiresAt: null, // Never expires!
  }
}

// ANTIPATTERN: Session fixation
export function setSession(sessionId) {
  // Accept session ID from user!
  return { sessionId, valid: true }
}

// ANTIPATTERN: Credential stuffing not prevented
export function attemptLogin(username, password) {
  // No lockout, no delay, no detection
  return { username, password, attempt: Date.now() }
}

// ============================================================
// A08:2021 - SOFTWARE AND DATA INTEGRITY FAILURES
// ============================================================

// ANTIPATTERN: Insecure deserialization
export function deserialize(data) {
  // eval() for deserialization!
  return eval('(' + data + ')')
}

// ANTIPATTERN: No integrity check
export function loadConfig(configPath) {
  // No verification that config hasn't been tampered!
  return JSON.parse(fs.readFileSync(configPath, 'utf8'))
}

// ANTIPATTERN: Auto-update without verification
export function autoUpdate(url) {
  // Download and execute without verification!
  exec(`curl ${url} | bash`)
}

// ============================================================
// A09:2021 - SECURITY LOGGING FAILURES
// ============================================================

// ANTIPATTERN: Logging passwords
export function logLogin(username, password, success) {
  console.log(`Login: ${username}:${password} = ${success}`)
}

// ANTIPATTERN: No logging at all
export function secretOperation(data) {
  // Do something sensitive with no audit trail
  return { done: true }
}

// ANTIPATTERN: Logging to insecure location
export function logToFile(message) {
  fs.appendFileSync('/tmp/app.log', message + '\n') // World-readable!
}

// ============================================================
// A10:2021 - SERVER-SIDE REQUEST FORGERY (SSRF)
// ============================================================

// ANTIPATTERN: Fetch arbitrary URLs
export async function fetchUrl(url) {
  // User can specify any URL including internal services!
  const response = await fetch(url)
  return response.text()
}

// ANTIPATTERN: No URL validation
export function makeRequest(host, port, path) {
  // Could access internal network!
  return `http://${host}:${port}${path}`
}

// ============================================================
// BONUS: ADDITIONAL SECURITY NIGHTMARES
// ============================================================

// ANTIPATTERN: JWT with 'none' algorithm
export function createUnsafeJWT(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64')
  return `${header}.${body}.` // No signature!
}

// ANTIPATTERN: Secrets in code
export const SECRETS = {
  JWT_SECRET: 'super-secret-jwt-key',
  API_KEY: 'sk_live_1234567890abcdef',
  DATABASE_PASSWORD: 'password123',
  AWS_ACCESS_KEY: 'AKIAIOSFODNN7EXAMPLE',
  AWS_SECRET_KEY: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  STRIPE_KEY: 'sk_live_stripe_key_here',
  PRIVATE_KEY: `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
-----END RSA PRIVATE KEY-----`,
}

// ANTIPATTERN: CORS that allows everything
export const CORS_CONFIG = {
  origin: '*',
  methods: '*',
  headers: '*',
  credentials: true,
}

// ANTIPATTERN: Exposing server info
export function getServerInfo() {
  return {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    cwd: process.cwd(),
    env: process.env,
    memoryUsage: process.memoryUsage(),
  }
}

// Export all the nightmares
export default {
  // All the vulnerable functions
  getUserData,
  updateUser,
  getDocument,
  getFile,
  hashPassword,
  hashPasswordNoSalt,
  hashPasswordBadSalt,
  encrypt,
  decrypt,
  storeCredentials,
  sqlQuery,
  runCommand,
  readUserFile,
  ldapQuery,
  renderTemplate,
  evaluateExpression,
  login,
  resetWithSecurityQuestion,
  generateResetToken,
  registerUser,
  listDirectory,
  executeAdminCommand,
  oldHash,
  validateEmail,
  loginViaGet,
  validatePassword,
  createSession,
  setSession,
  attemptLogin,
  deserialize,
  loadConfig,
  autoUpdate,
  logLogin,
  secretOperation,
  logToFile,
  fetchUrl,
  makeRequest,
  createUnsafeJWT,
  getServerInfo,
  
  // Exposed secrets
  SECRETS,
  CORS_CONFIG,
  DEBUG,
  VERBOSE_ERRORS,
  EXPOSE_STACK_TRACES,
  DEFAULT_ADMIN,
  ENCRYPTION_KEY,
  IV,
}
