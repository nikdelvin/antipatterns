<div align="center">

# 🔥 Antipatterns Guide

### Learn What NOT to Do in Software Development

[![Documentation](https://img.shields.io/badge/docs-antipatterns.web.app-blue?style=for-the-badge)](https://antipatterns.web.app)
[![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](LICENSE)
[![Built with Astro](https://img.shields.io/badge/Built%20with-Astro-ff5d01?style=for-the-badge&logo=astro)](https://astro.build)

<br />

> ⚠️ **EDUCATIONAL PROJECT** — This codebase intentionally demonstrates **what NOT to do**.
> 
> **DO NOT USE ANY OF THIS CODE IN PRODUCTION!**

<br />

[📖 View Documentation](https://antipatterns.web.app) · [🔍 Browse Source Code](https://antipatterns.web.app/source/) · [📚 Read the Guide](https://antipatterns.web.app/architecture/god-object/)

</div>

---

## 🎯 What is This?

**Antipatterns Guide** is an interactive documentation site paired with a deliberately broken backend codebase. Together, they form a comprehensive learning resource for developers who want to:

- 🔍 **Recognize** common antipatterns during code reviews
- 🛡️ **Understand** security vulnerabilities (OWASP Top 10)
- 🏗️ **Avoid** architectural mistakes in real projects
- 📖 **Learn** from practical examples with wrong vs. right comparisons

## 📚 What's Inside?

### Documentation Site (`/docs`)

An interactive guide built with [Astro](https://astro.build) + [Starlight](https://starlight.astro.build):

| Category | Topics |
|----------|--------|
| **Architecture** | God Object, Service Locator, Circular Dependencies, Copy-Paste Inheritance, Singleton Abuse |
| **Security** | OWASP Top 10 (Injection, Broken Access Control, Cryptographic Failures, etc.) |
| **Code Quality** | Monkey Patching, Magic Numbers, God Middleware, Callback Hell |
| **Maintenance** | Time Bombs, Feature Flag Chaos, Code Graveyard |
| **State & Errors** | Global Mutable State, Error Handling Antipatterns |
| **Database** | SQL Antipatterns, N+1 Queries, Schema Design Failures |

Each page includes:
- ❌ **Wrong Way** — The antipattern in action
- ✅ **Right Way** — The correct approach
- 📝 Detailed explanations and real-world consequences

### Example Backend (`/src`)

A fully functional (but intentionally terrible) Node.js backend demonstrating every antipattern in practice:

```
src/
├── features/         # "Vertical Slice Architecture" done wrong
├── core/             # Singletons, service locators, global state
├── security/         # OWASP Top 10 vulnerabilities showcase
├── middleware/       # 500+ line god middleware
├── utils/            # Callback hell, time bombs, error swallowing
├── config/           # Conflicting feature flags
├── models/           # Copy-paste inheritance
└── legacy/           # Code graveyard
```

## 🚀 Quick Start

### View the Documentation

Visit **[antipatterns.web.app](https://antipatterns.web.app)** to read the guide online.

### Run Locally

```bash
# Clone the repository
git clone https://github.com/nickspaargaren/antipatterns.git
cd antipatterns

# Start the documentation site
cd docs
npm install
npm run dev
# Open http://localhost:4321

# Run the example backend (optional)
cd ..
npm install
npm start
# Open http://localhost:3000
```

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Documentation** | Astro + Starlight |
| **Hosting** | Firebase Hosting |
| **CI/CD** | GitHub Actions |
| **Example Backend** | Node.js + Hono + SQLite |

## 📁 Project Structure

```
antipatterns/
├── docs/                    # Documentation site (Astro + Starlight)
│   ├── src/
│   │   ├── content/docs/    # MDX documentation pages
│   │   ├── pages/source/    # Source file browser
│   │   └── components/      # Custom components
│   └── astro.config.mjs
├── src/                     # Example "bad" backend code
├── firebase.json            # Firebase hosting config
└── .github/workflows/       # CI/CD pipelines
```

## 🎓 Learning Objectives

After studying this project, you will be able to:

1. **Recognize** antipatterns instantly during code reviews
2. **Explain** why each antipattern causes problems
3. **Identify** security vulnerabilities in backend code
4. **Understand** the long-term cost of technical debt
5. **Apply** correct patterns in your own projects

## 📖 Further Reading

- [OWASP Top 10](https://owasp.org/www-project-top-ten/) — Web application security risks
- [Refactoring Guru](https://refactoring.guru/antipatterns) — Antipatterns catalog
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [The Twelve-Factor App](https://12factor.net/) — Modern app methodology

## ⚠️ Disclaimer

This project is for **EDUCATIONAL PURPOSES ONLY**. The example code intentionally contains:

- 🔓 Security vulnerabilities
- 🐌 Performance issues
- 🕸️ Maintainability nightmares
- 💀 Every bad practice imaginable

**Never deploy this code. Never use these patterns. Learn from the mistakes.**

## 📄 License

MIT © [NikDelvin](https://github.com/nickspaargaren)

---

<div align="center">

**🔥 Built to teach developers what NOT to do 🔥**

[View Documentation](https://antipatterns.web.app) · [Report Issue](https://github.com/nickspaargaren/antipatterns/issues)

</div>
