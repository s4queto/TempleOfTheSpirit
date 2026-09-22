// Script descartável: copia os dados do backend/database.db (SQLite) para o
// Postgres do Supabase apontado em DATABASE_URL. Rode DEPOIS de subir o server.js
// pelo menos uma vez com o Postgres novo (para as tabelas e os seeds de
// agrupamentos/exercicios já existirem lá).
//
// Uso:
//   npm install better-sqlite3   (não é mais dependência do projeto, instale só pra isso)
//   node migrar-sqlite-para-supabase.js
//
// Depois de confirmar que os dados migraram, pode desinstalar o better-sqlite3
// de novo e apagar este arquivo e o database.db.

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Database = require('better-sqlite3');
const { Pool } = require('pg');

const sqlite = new Database(path.join(__dirname, 'database.db'), { readonly: true });
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function copiarTabela(client, tabela, colunas, { ajustar } = {}) {
  const linhas = sqlite.prepare(`SELECT * FROM ${tabela}`).all();

  for (const linha of linhas) {
    const valores = colunas.map((c) => {
      const v = linha[c];
      return ajustar ? ajustar(c, v) : v;
    });
    const placeholders = colunas.map((_, i) => `$${i + 1}`).join(', ');
    const colunasSql = colunas.map((c) => `"${c}"`).join(', ');

    await client.query(
      `INSERT INTO ${tabela} (${colunasSql}) OVERRIDING SYSTEM VALUE VALUES (${placeholders})
       ON CONFLICT (id) DO NOTHING`,
      valores
    );
  }

  console.log(`${tabela}: ${linhas.length} linha(s) copiada(s).`);
  return linhas.length;
}

async function corrigirSequencia(client, tabela) {
  await client.query(
    `SELECT setval(pg_get_serial_sequence('${tabela}', 'id'), COALESCE((SELECT MAX(id) FROM ${tabela}), 1))`
  );
}

async function main() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await copiarTabela(client, 'usuarios', [
      'id', 'nome', 'email', 'senha', 'resetToken', 'resetTokenExpira',
      'foto', 'pesoKg', 'lembreteAguaAtivo', 'lembreteAguaIntervaloMin',
    ]);

    await copiarTabela(client, 'tarefas', ['id', 'usuario_id', 'titulo', 'descricao', 'concluida', 'criadaEm']);

    // agrupamentos e exercicios já vêm do seed automático (mesmos dados fixos);
    // pulamos para não duplicar/conflitar com o que o server.js já inseriu.

    await copiarTabela(client, 'treinos', ['id', 'usuario_id', 'nome', 'nivel', 'genero', 'divisao', 'criadoEm']);
    await copiarTabela(client, 'treino_sessoes', ['id', 'treino_id', 'nome', 'ordem']);
    await copiarTabela(client, 'treino_exercicios', ['id', 'sessao_id', 'exercicio_id', 'ordem', 'series', 'reps', 'rir']);
    await copiarTabela(client, 'registros_series', [
      'id', 'usuario_id', 'treino_exercicio_id', 'numero_serie', 'carga', 'repeticoes', 'registradoEm',
    ]);
    await copiarTabela(client, 'garrafinhas', ['id', 'usuario_id', 'nome', 'ml']);
    await copiarTabela(client, 'registros_agua', ['id', 'usuario_id', 'ml', 'registradoEm']);
    await copiarTabela(client, 'inscricoes_push', [
      'id', 'usuario_id', 'endpoint', 'p256dh', 'auth', 'ultimoLembreteEm', 'criadoEm',
    ]);

    for (const tabela of [
      'usuarios', 'tarefas', 'treinos', 'treino_sessoes',
      'treino_exercicios', 'registros_series', 'garrafinhas',
      'registros_agua', 'inscricoes_push',
    ]) {
      await corrigirSequencia(client, tabela);
    }

    await client.query('COMMIT');
    console.log('Migração concluída com sucesso.');
  } catch (erro) {
    await client.query('ROLLBACK');
    console.error('Falhou, nada foi salvo:', erro);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
    sqlite.close();
  }
}

main();
