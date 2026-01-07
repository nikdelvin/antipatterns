// drizzle.config.js
// ANTIPATTERN: Config file with secrets

export default {
  schema: "./src/app/main/index/server/core/base/abstract/impl/v1/legacy/deprecated/old/backup/temp/final/FINAL_REAL/app.js",
  out: "./drizzle",
  driver: "better-sqlite",
  dbCredentials: {
    url: "./database.db",
  },
  verbose: true,
  strict: false, // ANTIPATTERN: Disable strict mode
}
