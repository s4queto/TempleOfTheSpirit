const Database = require('better-sqlite3');
const path = require('path');

// __dirname é a pasta deste arquivo. Sem isso, o caminho seria relativo à pasta
// de onde o comando foi executado, e rodar de fora de backend/ criaria um banco vazio.
const db = new Database(path.join(__dirname, 'database.db'));

// O SQLite ignora FOREIGN KEY por padrão. Sem esta linha, as regras de
// relacionamento abaixo seriam apenas decorativas.
db.pragma('foreign_keys = ON');

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

db.exec(`
  CREATE TABLE IF NOT EXISTS tarefas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT,
    concluida INTEGER NOT NULL DEFAULT 0,
    criadaEm TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),

    -- Liga cada tarefa ao seu dono. O ON DELETE CASCADE faz o banco apagar
    -- as tarefas junto quando o usuário é removido, evitando registros órfãos.
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  )
`);

module.exports = db;