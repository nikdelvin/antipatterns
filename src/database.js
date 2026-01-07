// database.js - ANTIPATTERN: Separate DB file that duplicates everything from app.js
// This file exists but is never used, causing confusion

// Copy-pasted from app.js with slight modifications that break things

import Database from 'better-sqlite3'

// ANTIPATTERN: Different path than app.js uses
const db = new Database('./data/database.sqlite3')

// ANTIPATTERN: Recreate tables that already exist with different schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT,
    password TEXT
  )
`)

// ANTIPATTERN: Conflicting table structure
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    product_id INTEGER PRIMARY KEY,
    title TEXT,
    cost REAL
  )
`)

// ANTIPATTERN: Raw queries with no parameterization
function getUser(id) {
  return db.prepare(`SELECT * FROM users WHERE id = ${id}`).get()
}

function createUser(name, password) {
  db.exec(`INSERT INTO users (name, password) VALUES ('${name}', '${password}')`)
}

function getAllUsers() {
  return db.prepare('SELECT * FROM users').all()
}

function deleteUser(id) {
  db.exec(`DELETE FROM users WHERE id = ${id}`)
}

function updateUser(id, name, password) {
  db.exec(`UPDATE users SET name = '${name}', password = '${password}' WHERE id = ${id}`)
}

// ANTIPATTERN: Different product functions than app.js
function getProduct(id) {
  return db.prepare(`SELECT * FROM products WHERE product_id = ${id}`).get()
}

function createProduct(title, cost) {
  db.exec(`INSERT INTO products (title, cost) VALUES ('${title}', ${cost})`)
}

// ANTIPATTERN: Expose database connection
export { 
  db,
  getUser,
  createUser,
  getAllUsers,
  deleteUser,
  updateUser,
  getProduct,
  createProduct,
}

// ANTIPATTERN: Default export is different from named exports
export default {
  connection: db,
  users: {
    get: getUser,
    create: createUser,
    all: getAllUsers,
    delete: deleteUser,
    update: updateUser,
  },
  products: {
    get: getProduct,
    create: createProduct,
  }
}
