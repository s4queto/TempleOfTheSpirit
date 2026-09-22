const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function colunaExiste(client, tabela, coluna) {
  const { rows } = await client.query(
    'SELECT 1 FROM information_schema.columns WHERE table_name = $1 AND column_name = $2',
    [tabela, coluna]
  );
  return rows.length > 0;
}

async function inicializarBanco() {
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL,
        "resetToken" TEXT,
        "resetTokenExpira" BIGINT,
        foto TEXT,
        "pesoKg" REAL,
        "lembreteAguaAtivo" INTEGER NOT NULL DEFAULT 0,
        "lembreteAguaIntervaloMin" INTEGER NOT NULL DEFAULT 120
      )
    `);

    const colunasNovasUsuarios = {
      foto: 'TEXT',
      pesoKg: 'REAL',
      lembreteAguaAtivo: 'INTEGER NOT NULL DEFAULT 0',
      lembreteAguaIntervaloMin: 'INTEGER NOT NULL DEFAULT 120',
    };
    for (const [coluna, tipo] of Object.entries(colunasNovasUsuarios)) {
      if (!(await colunaExiste(client, 'usuarios', coluna))) {
        await client.query(`ALTER TABLE usuarios ADD COLUMN "${coluna}" ${tipo}`);
      }
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS tarefas (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        titulo TEXT NOT NULL,
        descricao TEXT,
        concluida INTEGER NOT NULL DEFAULT 0,
        "criadaEm" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS agrupamentos (
        id SERIAL PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        nome TEXT NOT NULL,
        grupo TEXT NOT NULL,
        dano TEXT NOT NULL CHECK (dano IN ('alto', 'baixo')),
        explicacao TEXT
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS exercicios (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL UNIQUE,
        agrupamento_id INTEGER NOT NULL REFERENCES agrupamentos(id),
        equipamento TEXT NOT NULL,
        genero TEXT NOT NULL DEFAULT 'ambos' CHECK (genero IN ('ambos', 'feminino', 'masculino')),
        enfase TEXT,
        observacao TEXT
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS exercicio_alternativas (
        exercicio_id INTEGER NOT NULL REFERENCES exercicios(id) ON DELETE CASCADE,
        alternativa_id INTEGER NOT NULL REFERENCES exercicios(id) ON DELETE CASCADE,
        PRIMARY KEY (exercicio_id, alternativa_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS treinos (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        nome TEXT NOT NULL,
        nivel TEXT NOT NULL CHECK (nivel IN ('iniciante', 'intermediario', 'avancado')),
        genero TEXT NOT NULL CHECK (genero IN ('feminino', 'masculino')),
        divisao TEXT NOT NULL,
        "criadoEm" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS treino_sessoes (
        id SERIAL PRIMARY KEY,
        treino_id INTEGER NOT NULL REFERENCES treinos(id) ON DELETE CASCADE,
        nome TEXT NOT NULL,
        ordem INTEGER NOT NULL
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS treino_exercicios (
        id SERIAL PRIMARY KEY,
        sessao_id INTEGER NOT NULL REFERENCES treino_sessoes(id) ON DELETE CASCADE,
        exercicio_id INTEGER NOT NULL REFERENCES exercicios(id),
        ordem INTEGER NOT NULL,
        series INTEGER NOT NULL,
        reps TEXT NOT NULL,
        rir TEXT NOT NULL
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS registros_series (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        treino_exercicio_id INTEGER NOT NULL REFERENCES treino_exercicios(id) ON DELETE CASCADE,
        numero_serie INTEGER NOT NULL,
        carga REAL NOT NULL,
        repeticoes INTEGER NOT NULL,
        "registradoEm" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS garrafinhas (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        nome TEXT NOT NULL,
        ml INTEGER NOT NULL
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS registros_agua (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        ml INTEGER NOT NULL,
        "registradoEm" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS inscricoes_push (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        endpoint TEXT NOT NULL UNIQUE,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        "ultimoLembreteEm" TIMESTAMPTZ,
        "criadoEm" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    const { AGRUPAMENTOS } = require('./agrupamentos-seed');

    const { rows: totalAgrupamentosRows } = await client.query('SELECT COUNT(*) AS c FROM agrupamentos');
    if (Number(totalAgrupamentosRows[0].c) === 0) {
      await client.query('BEGIN');
      try {
        for (const a of AGRUPAMENTOS) {
          await client.query(
            'INSERT INTO agrupamentos (slug, nome, grupo, dano) VALUES ($1, $2, $3, $4)',
            [a.slug, a.nome, a.grupo, a.dano]
          );
        }
        await client.query('COMMIT');
        console.log(`${AGRUPAMENTOS.length} agrupamentos cadastrados.`);
      } catch (erro) {
        await client.query('ROLLBACK');
        throw erro;
      }
    }

    const { EXERCICIOS } = require('./exercicios-seed');

    const { rows: totalExerciciosRows } = await client.query('SELECT COUNT(*) AS c FROM exercicios');
    if (Number(totalExerciciosRows[0].c) === 0) {
      await client.query('BEGIN');
      try {
        for (const e of EXERCICIOS) {
          const { rows: agrupamentoRows } = await client.query(
            'SELECT id FROM agrupamentos WHERE slug = $1',
            [e.agrupamento]
          );
          const agrupamento = agrupamentoRows[0];

          if (!agrupamento) {
            throw new Error(`Agrupamento "${e.agrupamento}" não existe (exercício: ${e.nome}).`);
          }

          await client.query(
            `INSERT INTO exercicios (nome, agrupamento_id, equipamento, genero, enfase)
             VALUES ($1, $2, $3, $4, $5)`,
            [e.nome, agrupamento.id, e.equipamento, e.genero || 'ambos', e.enfase || null]
          );
        }
        await client.query('COMMIT');
        console.log(`${EXERCICIOS.length} exercícios cadastrados.`);
      } catch (erro) {
        await client.query('ROLLBACK');
        throw erro;
      }
    }
  } finally {
    client.release();
  }
}

module.exports = { pool, inicializarBanco };
