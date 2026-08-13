const Database = require('better-sqlite3');
const path = require('path');

// __dirname é a pasta deste arquivo. Sem isso, o caminho seria relativo à pasta
// de onde o comando foi executado, e rodar de fora de backend/ criaria um banco vazio.
const db = new Database(path.join(__dirname, 'database.db'));

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