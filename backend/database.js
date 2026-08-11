const Database = require('better-sqlite3');

const db = new Database('database.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    resetToken TEXT,
    resetTokenExpira INTEGER
  )
`);

module.exports = db;