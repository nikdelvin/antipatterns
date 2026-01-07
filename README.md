# 🔥 Worst Backend Ever - VSA Edition

> **⚠️ WARNING: This is an EDUCATIONAL project demonstrating what NOT to do in software development!**
> 
> **DO NOT USE ANY OF THIS CODE IN PRODUCTION!**

This project is a comprehensive catalog of programming antipatterns, security vulnerabilities, and bad practices in backend web development. It's designed to help developers recognize and avoid these issues in real-world projects.

## 🎯 Purpose

This codebase intentionally implements the worst possible practices to serve as:
- A teaching tool for code reviews
- A reference for security training
- An example of what static analysis tools should catch
- A demonstration of technical debt accumulation

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Hono
- **Database:** SQLite with Drizzle ORM
- **Architecture:** "Vertical Slice Architecture" (implemented incorrectly)

## 🚀 Running the Project

```bash
npm install
npm start
```

Server runs at `http://localhost:3000`

---

## 📚 Antipattern Catalog

### 🏗️ Architecture & Design Antipatterns

#### 1. God Object / God File
**Location:** `src/features/index.js`
- Single file handling routing, middleware, configuration, and business logic
- 700+ lines of tightly coupled code
- Knows about every other module in the system

#### 2. Service Locator (Anti-DI)
**Location:** `src/core/di/container.js`
- Pretends to be dependency injection but is actually a global service locator
- Services fetched imperatively instead of injected
- Tight coupling disguised as loose coupling

#### 3. Circular Dependencies
**Location:** Throughout `src/features/`
- Services depend on each other in circular patterns
- UserService → ProductService → OrderService → UserService

#### 4. Copy-Paste Inheritance
**Location:** `src/models/models.js`
- UserV1, UserV2, UserV3 classes with duplicated code
- Incompatible APIs between versions
- `validate()` returns different types in each version

#### 5. Singleton Abuse
**Location:** `src/core/singletons.js`
- Multiple competing singletons for the same purpose
- DatabaseSingleton vs DatabaseConnection
- Race conditions in `getInstance()`
- Singletons that shouldn't be singletons

---

### 🔐 Security Antipatterns (OWASP Top 10)

**Location:** `src/security/security.js`

#### A01: Broken Access Control
- No authorization checks
- Client-controlled access (`data.userId` overrides server)
- Predictable sequential IDs
- Path traversal vulnerabilities

#### A02: Cryptographic Failures
- MD5 for password hashing
- Hardcoded encryption keys
- No salt or predictable salts
- Secrets stored in code

#### A03: Injection
- SQL injection via string concatenation
- Command injection via `execSync()`
- LDAP injection
- Template injection (XSS)

#### A04: Insecure Design
- Security questions for password reset
- Sequential reset tokens
- No rate limiting on sensitive operations

#### A05: Security Misconfiguration
- Debug mode in production
- CORS allows everything (`origin: '*'`)
- Stack traces exposed to users
- Default credentials

#### A06: Vulnerable Components
- No dependency scanning
- Outdated patterns

#### A07: Authentication Failures
- Passwords in GET parameters
- No account lockout
- Weak password validation
- Hardcoded bypass tokens

#### A08: Data Integrity Failures
- Unsafe deserialization with `eval()`
- No integrity checks on config files
- Auto-update from untrusted sources

#### A09: Logging Failures
- Passwords logged in plaintext
- No log rotation (memory leak)
- Sensitive data in logs

#### A10: SSRF
- Unvalidated URL fetching
- No allowlist for external requests

---

### 🐒 Code Quality Antipatterns

#### Monkey Patching
**Location:** `src/core/patches.js`
- Modifies `Object.prototype`, `Array.prototype`, `String.prototype`
- Overrides `console.log`, `JSON.parse`, `JSON.stringify`
- Suppresses `unhandledRejection` and `uncaughtException`
- Adds methods like `String.prototype.toSafeSQL` (that isn't safe)

#### Magic Numbers
**Location:** `src/constants/magic.numbers.js`
- 100+ unexplained numeric constants
- `SPECIAL_USER_ID = 42`
- `MAGIC_OFFSET = 0xDEADBEEF`
- `WHY_THIS_NUMBER = 1337`

#### God Middleware
**Location:** `src/middleware/middleware.js`
- 500+ lines handling auth, logging, rate limiting, caching, A/B testing
- Global mutable state
- Multiple responsibilities in one function

#### Callback Hell & Mixed Async
**Location:** `src/utils/callback.hell.js`
- Nested callbacks 10+ levels deep
- Mixed callbacks, Promises, and async/await
- Race conditions by design
- Unhandled promise rejections

---

### 💣 Time Bombs & Technical Debt

#### Time Bombs
**Location:** `src/utils/time.bombs.js`
- Code that fails after specific dates
- Request count limits that crash the app
- Node.js version checks that throw errors
- Cache that corrupts after N operations

#### Feature Flag Chaos
**Location:** `src/config/feature.flags.js`
- Conflicting flags (`ENABLE_X` and `DISABLE_X` both true)
- Percentage rollouts that don't add up
- Kill switches that conflict
- Runtime flag mutation

#### Code Graveyard
**Location:** `src/legacy/utils.js`
- Commented-out code from 2018-2023
- Dead functions that are never called
- TODO comments from years ago
- "Temporary" fixes that are permanent

---

### 🌍 State Management Antipatterns

#### Global Mutable State
**Location:** `src/core/global.state.js`
- Single global object holding all application state
- Directly mutated from anywhere
- No immutability
- Attached to `globalThis`, `process`, and `global`
- Memory leaks (arrays that grow forever)

---

### 💥 Error Handling Antipatterns

**Location:** `src/utils/error.handling.js`

- **Swallowing:** Catch and ignore completely
- **Masking:** Catch specific, throw generic
- **Exposing:** Return full stack traces to users
- **Pokemon:** `catch (e) {}` - gotta catch 'em all!
- **Rethrowing wrong:** Lose original error context
- **Error as data:** Return `{ success: false }` instead of throwing
- **Retry forever:** Never give up, never surrender

---

### 🗄️ Database Antipatterns

**Location:** `src/core/database/migration.js`

- **God Table:** 200+ columns in one table
- **SQL Injection:** String concatenation for queries
- **Plain Text Passwords:** No hashing
- **No Foreign Keys:** Referential integrity? Never heard of it
- **Reserved Word Columns:** `order`, `user`, `table`
- **Inconsistent Naming:** `camelCase`, `snake_case`, `PascalCase` mixed
- **N+1 Queries:** Loops that query inside loops

---

### 📁 Project Structure Antipatterns

```
src/
├── features/           # VSA but everything imports everything
│   ├── index.js       # God file (700+ lines)
│   ├── users/         # Circular dependency with products
│   ├── products/      # Circular dependency with orders
│   ├── orders/        # Circular dependency with users
│   ├── auth/          # Exposes secrets
│   └── admin/         # No authentication required
├── core/
│   ├── database/      # SQL injection galore
│   ├── di/            # Service locator pretending to be DI
│   ├── patches.js     # Monkey patches
│   ├── singletons.js  # Competing singletons
│   └── global.state.js # Global mutable state
├── middleware/
│   └── middleware.js  # God middleware
├── security/
│   └── security.js    # OWASP Top 10 showcase
├── utils/
│   ├── callback.hell.js
│   ├── time.bombs.js
│   └── error.handling.js
├── config/
│   └── feature.flags.js # Conflicting flags
├── constants/
│   └── magic.numbers.js # 100+ magic numbers
├── models/
│   └── models.js      # Copy-paste inheritance
├── legacy/
│   └── utils.js       # Code graveyard
└── helpers.js         # 50+ useless helper functions
```

---

## 🔗 Dangerous Endpoints

| Endpoint | Antipattern |
|----------|-------------|
| `GET /` | Exposes JWT secrets |
| `GET /debug` | Exposes all internal state |
| `GET /backdoor` | Backdoor access with master password |
| `GET /exec?cmd=...` | Remote command execution |
| `GET /sql?q=...` | Direct SQL execution |
| `GET /read?path=...` | Arbitrary file read |
| `POST /eval` | JavaScript eval endpoint |
| `GET /security/secrets` | Exposes AWS keys, DB passwords |
| `GET /security/cmd?cmd=...` | Command injection |
| `GET /security/file?name=...` | Path traversal |
| `GET /global-state` | View/mutate global state |
| `GET /singletons` | View singleton internals |
| `GET /errors/expose` | Full stack trace exposure |

---

## 🎓 Learning Objectives

After studying this codebase, you should be able to:

1. **Recognize** common antipatterns in code reviews
2. **Explain** why each antipattern is problematic
3. **Identify** security vulnerabilities in backend code
4. **Understand** the consequences of technical debt
5. **Appreciate** the value of:
   - Proper dependency injection
   - Immutable state management
   - Input validation and sanitization
   - Proper error handling
   - Security-first development

---

## 📖 Further Reading

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Refactoring Guru - Antipatterns](https://refactoring.guru/antipatterns)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [The Twelve-Factor App](https://12factor.net/)

---

## ⚠️ Disclaimer

This project is for **EDUCATIONAL PURPOSES ONLY**. The code intentionally contains:
- Security vulnerabilities
- Performance issues
- Maintainability nightmares
- Every bad practice imaginable

**Never deploy this code. Never use these patterns. Learn from the mistakes demonstrated here.**

---

<p align="center">
  <b>🔥 Built with hate by developers who know better 🔥</b>
</p>
