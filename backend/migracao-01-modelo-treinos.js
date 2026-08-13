// Rodar uma vez: node backend/migracao-01-modelo-treinos.js

const path = require('path');
const Database = require('better-sqlite3');

const db = new Database(path.join(__dirname, 'database.db'));

const ANTIGAS = ['treino_exercicios', 'treino_dias', 'treinos', 'exercicios'];

console.log('Tabelas antes:');
console.log(
  db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    .all().map((r) => r.name).join(', ')
);

for (const tabela of ANTIGAS) {
  const existe = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name = ?"
  ).get(tabela);

  if (!existe) continue;

  const linhas = db.prepare(`SELECT COUNT(*) AS c FROM ${tabela}`).get().c;
  console.log(`  ${tabela}: ${linhas} linha(s)`);
}

const apagar = db.transaction(() => {
  for (const tabela of ANTIGAS) db.exec(`DROP TABLE IF EXISTS ${tabela}`);
});

apagar();

console.log('\nTabelas depois:');
console.log(
  db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    .all().map((r) => r.name).join(', ')
);

console.log('\nPronto. Suba o servidor para o novo modelo ser criado.');
