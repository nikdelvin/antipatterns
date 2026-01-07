// CODE GRAVEYARD - ANTIPATTERN: Commented out code that nobody deletes
// This file contains years of dead code, experiments, and regrets
// 
// "We might need this later" - said everyone, always
// 
// NOTE: Some of this code might still be used somewhere (but probably not)
// NOTE: Some of this code never worked (but nobody remembers)
// NOTE: Some of this code is copy-pasted from Stack Overflow (with bugs)

// ============================================================
// ATTEMPT #1 - The original implementation (2018)
// ============================================================

// function createUser(name, password) {
//   // TODO: Add validation
//   const user = {
//     name: name,
//     password: password, // FIXME: Hash this
//     createdAt: new Date()
//   }
//   users.push(user)
//   return user
// }

// function deleteUser(id) {
//   // This didn't work
//   // users = users.filter(u => u.id !== id)
//   
//   // Try #2
//   // for (let i = 0; i < users.length; i++) {
//   //   if (users[i].id === id) {
//   //     users.splice(i, 1)
//   //     break
//   //   }
//   // }
//   
//   // Try #3 - Dave said this is faster
//   // const index = users.findIndex(u => u.id === id)
//   // if (index > -1) users.splice(index, 1)
// }

// ============================================================
// ATTEMPT #2 - The "rewrite" (2019)
// ============================================================

// class UserService {
//   constructor() {
//     this.users = []
//     this.cache = new Map()
//     // this.db = new Database() // TODO: implement database
//   }
//   
//   // async createUser(data) {
//   //   // Commented out because async wasn't working
//   //   // const hash = await bcrypt.hash(data.password, 10)
//   //   // data.password = hash
//   //   return this.users.push(data)
//   // }
//   
//   // Old version that Dave wrote
//   // createUserV1(name, email, password) {
//   //   if (!name) throw new Error('Name required')
//   //   if (!email) throw new Error('Email required')
//   //   if (!email.includes('@')) throw new Error('Invalid email')
//   //   if (!password) throw new Error('Password required')
//   //   if (password.length < 8) throw new Error('Password too short')
//   //   
//   //   // Check if email exists
//   //   if (this.users.find(u => u.email === email)) {
//   //     throw new Error('Email already exists')
//   //   }
//   //   
//   //   const user = {
//   //     id: this.users.length + 1,
//   //     name,
//   //     email,
//   //     password, // Still not hashed...
//   //     createdAt: new Date(),
//   //     updatedAt: new Date(),
//   //     isActive: true,
//   //     isAdmin: false
//   //   }
//   //   
//   //   this.users.push(user)
//   //   return user
//   // }
// }

// ============================================================
// ATTEMPT #3 - The "microservices" phase (2020)
// ============================================================

// const express = require('express') // We switched to Hono now
// const app = express()
// 
// app.post('/api/v1/users', async (req, res) => {
//   try {
//     const user = await UserService.create(req.body)
//     res.json(user)
//   } catch (e) {
//     res.status(500).json({ error: e.message })
//   }
// })
//
// app.get('/api/v1/users/:id', async (req, res) => {
//   const user = await UserService.findById(req.params.id)
//   if (!user) {
//     return res.status(404).json({ error: 'Not found' })
//   }
//   res.json(user)
// })
//
// // TODO: Delete this when we're sure the new API works
// app.get('/api/v0/users', (req, res) => {
//   res.json({ deprecated: true, users: [] })
// })

// ============================================================
// THE GREAT AUTHENTICATION REWRITE (2021)
// ============================================================

// // Version 1: Basic auth
// function authenticate(username, password) {
//   // const user = users.find(u => u.username === username)
//   // if (!user) return null
//   // if (user.password !== password) return null
//   // return user
// }

// // Version 2: JWT (never finished)
// // const jwt = require('jsonwebtoken')
// // const SECRET = 'change-this' // TODO: move to env
// //
// // function generateToken(user) {
// //   return jwt.sign({
// //     id: user.id,
// //     username: user.username,
// //     isAdmin: user.isAdmin
// //   }, SECRET, { expiresIn: '24h' })
// // }
// //
// // function verifyToken(token) {
// //   try {
// //     return jwt.verify(token, SECRET)
// //   } catch (e) {
// //     return null
// //   }
// // }

// // Version 3: OAuth (abandoned)
// // const passport = require('passport')
// // const GoogleStrategy = require('passport-google-oauth20').Strategy
// //
// // passport.use(new GoogleStrategy({
// //   clientID: 'GOOGLE_CLIENT_ID', // TODO
// //   clientSecret: 'GOOGLE_CLIENT_SECRET', // TODO
// //   callbackURL: 'http://localhost:3000/auth/google/callback'
// // }, (accessToken, refreshToken, profile, done) => {
// //   // TODO: implement
// //   done(null, profile)
// // }))

// ============================================================
// EXPERIMENTS THAT NEVER SHIPPED
// ============================================================

// // Real-time notifications (2021-06)
// // const WebSocket = require('ws')
// // const wss = new WebSocket.Server({ port: 8080 })
// //
// // wss.on('connection', (ws) => {
// //   console.log('Client connected')
// //   ws.on('message', (message) => {
// //     console.log('Received:', message)
// //     // TODO: Handle messages
// //   })
// // })

// // GraphQL (2021-09)
// // const { ApolloServer, gql } = require('apollo-server')
// //
// // const typeDefs = gql`
// //   type User {
// //     id: ID!
// //     name: String!
// //     email: String!
// //   }
// //
// //   type Query {
// //     users: [User!]!
// //     user(id: ID!): User
// //   }
// //
// //   type Mutation {
// //     createUser(name: String!, email: String!): User!
// //   }
// // `

// // Redis caching (2022-01)
// // const Redis = require('ioredis')
// // const redis = new Redis()
// //
// // async function getCachedUser(id) {
// //   const cached = await redis.get(`user:${id}`)
// //   if (cached) return JSON.parse(cached)
// //   
// //   const user = await UserService.findById(id)
// //   if (user) {
// //     await redis.set(`user:${id}`, JSON.stringify(user), 'EX', 3600)
// //   }
// //   return user
// // }

// // Elasticsearch (2022-03)
// // const { Client } = require('@elastic/elasticsearch')
// // const client = new Client({ node: 'http://localhost:9200' })
// //
// // async function searchUsers(query) {
// //   const result = await client.search({
// //     index: 'users',
// //     body: {
// //       query: {
// //         multi_match: {
// //           query,
// //           fields: ['name', 'email']
// //         }
// //       }
// //     }
// //   })
// //   return result.hits.hits.map(h => h._source)
// // }

// ============================================================
// COPY-PASTED CODE FROM STACK OVERFLOW
// ============================================================

// // Source: https://stackoverflow.com/questions/12345678
// // "How to deep clone object in JavaScript"
// function deepClone(obj) {
//   // if (obj === null || typeof obj !== 'object') return obj
//   // if (obj instanceof Date) return new Date(obj.getTime())
//   // if (obj instanceof Array) return obj.map(item => deepClone(item))
//   // if (obj instanceof Object) {
//   //   const copy = {}
//   //   for (const key in obj) {
//   //     if (obj.hasOwnProperty(key)) {
//   //       copy[key] = deepClone(obj[key])
//   //     }
//   //   }
//   //   return copy
//   // }
//   
//   // Simpler version that doesn't work for everything:
//   return JSON.parse(JSON.stringify(obj))
// }

// // Source: https://stackoverflow.com/questions/87654321
// // "Best way to check if array is empty"
// // function isEmpty(arr) {
// //   return !arr || arr.length === 0 || (Array.isArray(arr) && arr.every(isEmpty))
// // }

// ============================================================
// DEBUG CODE THAT SOMEHOW MADE IT TO PRODUCTION
// ============================================================

// console.log('===========================================')
// console.log('DEBUG MODE ENABLED')
// console.log('===========================================')
// console.log('Environment:', process.env.NODE_ENV)
// console.log('Database URL:', process.env.DATABASE_URL)
// console.log('JWT Secret:', process.env.JWT_SECRET)
// console.log('===========================================')

// // Temporary debug endpoint - remove before deploy!
// // app.get('/debug/users', (req, res) => {
// //   res.json({
// //     users: users,
// //     passwords: users.map(u => u.password)
// //   })
// // })

// // Debug: log all requests
// // app.use((req, res, next) => {
// //   console.log(`${req.method} ${req.path}`)
// //   console.log('Headers:', req.headers)
// //   console.log('Body:', req.body)
// //   next()
// // })

// ============================================================
// THE INTERN'S CODE (2023)
// ============================================================

// // I don't understand how this works but it does - DO NOT TOUCH
// // function magical(x) {
// //   return x.split('').map(c => String.fromCharCode(c.charCodeAt(0) + 1)).join('')
// // }
// // 
// // function unmagical(x) {
// //   return x.split('').map(c => String.fromCharCode(c.charCodeAt(0) - 1)).join('')
// // }
// //
// // // "Encryption" using the magical functions
// // function encrypt(password) {
// //   return btoa(magical(magical(password)))
// // }
// //
// // function decrypt(encrypted) {
// //   return unmagical(unmagical(atob(encrypted)))
// // }

// ============================================================
// CURRENT "WORKING" VERSION - DON'T CHANGE!
// ============================================================

// The actual exports (but also commented out for maximum confusion)
// export { createUser, deleteUser, authenticate }

// Actually, just export an empty object
export default {}

// Or maybe export these? Nobody remembers which ones work
// export {
//   createUser,
//   createUserV1,
//   createUserV2,
//   deleteUser,
//   authenticate,
//   authenticateV2,
//   deepClone,
//   magical,
//   encrypt,
//   decrypt
// }
