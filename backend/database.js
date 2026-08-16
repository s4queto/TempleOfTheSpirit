const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'database.db'));

db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    resetToken TEXT,
    resetTokenExpira INTEGER,
    foto TEXT,
    pesoKg REAL,
    lembreteAguaAtivo INTEGER NOT NULL DEFAULT 0,
    lembreteAguaIntervaloMin INTEGER NOT NULL DEFAULT 120
  )
`);

const colunasUsuarios = db.prepare("PRAGMA table_info(usuarios)").all().map((c) => c.name);
const colunasNovasUsuarios = {
  foto: 'TEXT',
  pesoKg: 'REAL',
  lembreteAguaAtivo: 'INTEGER NOT NULL DEFAULT 0',
  lembreteAguaIntervaloMin: 'INTEGER NOT NULL DEFAULT 120',
};
for (const [coluna, tipo] of Object.entries(colunasNovasUsuarios)) {
  if (!colunasUsuarios.includes(coluna)) {
    db.exec(`ALTER TABLE usuarios ADD COLUMN ${coluna} ${tipo}`);
  }
}

db.exec(`
  CREATE TABLE IF NOT EXISTS tarefas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT,
    concluida INTEGER NOT NULL DEFAULT 0,
    criadaEm TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS agrupamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    nome TEXT NOT NULL,
    grupo TEXT NOT NULL,
    dano TEXT NOT NULL CHECK (dano IN ('alto', 'baixo')),
    explicacao TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS exercicios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    agrupamento_id INTEGER NOT NULL,
    equipamento TEXT NOT NULL,
    genero TEXT NOT NULL DEFAULT 'ambos' CHECK (genero IN ('ambos', 'feminino', 'masculino')),
    enfase TEXT,
    observacao TEXT,
    FOREIGN KEY (agrupamento_id) REFERENCES agrupamentos(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS exercicio_alternativas (
    exercicio_id INTEGER NOT NULL,
    alternativa_id INTEGER NOT NULL,
    PRIMARY KEY (exercicio_id, alternativa_id),
    FOREIGN KEY (exercicio_id) REFERENCES exercicios(id) ON DELETE CASCADE,
    FOREIGN KEY (alternativa_id) REFERENCES exercicios(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS treinos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    nivel TEXT NOT NULL CHECK (nivel IN ('iniciante', 'intermediario', 'avancado')),
    genero TEXT NOT NULL CHECK (genero IN ('feminino', 'masculino')),
    divisao TEXT NOT NULL,
    criadoEm TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS treino_sessoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    treino_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    ordem INTEGER NOT NULL,
    FOREIGN KEY (treino_id) REFERENCES treinos(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS treino_exercicios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sessao_id INTEGER NOT NULL,
    exercicio_id INTEGER NOT NULL,
    ordem INTEGER NOT NULL,
    series INTEGER NOT NULL,
    reps TEXT NOT NULL,
    rir TEXT NOT NULL,
    FOREIGN KEY (sessao_id) REFERENCES treino_sessoes(id) ON DELETE CASCADE,
    FOREIGN KEY (exercicio_id) REFERENCES exercicios(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS registros_series (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    treino_exercicio_id INTEGER NOT NULL,
    numero_serie INTEGER NOT NULL,
    carga REAL NOT NULL,
    repeticoes INTEGER NOT NULL,
    registradoEm TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (treino_exercicio_id) REFERENCES treino_exercicios(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS garrafinhas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    ml INTEGER NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS registros_agua (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    ml INTEGER NOT NULL,
    registradoEm TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS inscricoes_push (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    ultimoLembreteEm TEXT,
    criadoEm TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  )
`);

const { AGRUPAMENTOS } = require('./agrupamentos-seed');

const totalAgrupamentos = db.prepare('SELECT COUNT(*) AS c FROM agrupamentos').get().c;

if (totalAgrupamentos === 0) {
  const inserir = db.prepare(
    'INSERT INTO agrupamentos (slug, nome, grupo, dano) VALUES (?, ?, ?, ?)'
  );

  const inserirTodos = db.transaction((lista) => {
    for (const a of lista) inserir.run(a.slug, a.nome, a.grupo, a.dano);
  });

  inserirTodos(AGRUPAMENTOS);
  console.log(`${AGRUPAMENTOS.length} agrupamentos cadastrados.`);
}

const { EXERCICIOS } = require('./exercicios-seed');

const totalExercicios = db.prepare('SELECT COUNT(*) AS c FROM exercicios').get().c;

if (totalExercicios === 0) {
  const buscarAgrupamento = db.prepare('SELECT id FROM agrupamentos WHERE slug = ?');
  const inserir = db.prepare(`
    INSERT INTO exercicios (nome, agrupamento_id, equipamento, genero, enfase)
    VALUES (?, ?, ?, ?, ?)
  `);

  const inserirTodos = db.transaction((lista) => {
    for (const e of lista) {
      const agrupamento = buscarAgrupamento.get(e.agrupamento);

      if (!agrupamento) {
        throw new Error(`Agrupamento "${e.agrupamento}" não existe (exercício: ${e.nome}).`);
      }

      inserir.run(e.nome, agrupamento.id, e.equipamento, e.genero || 'ambos', e.enfase || null);
    }
  });

  inserirTodos(EXERCICIOS);
  console.log(`${EXERCICIOS.length} exercícios cadastrados.`);
}

module.exports = db;
