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

// Catálogo de exercícios. Não pertence a ninguém: é compartilhado por todos os
// usuários, e é dele que o gerador sorteia os exercícios de cada treino.
// ----- Modelo do gerador de treinos -----
// Cada tabela abaixo é a tradução direta de uma decisão de docs/modelo-treinos.md.

// O alvo muscular. Não é só um rótulo: carrega as propriedades de treino que
// determinam a prescrição (dano) e o texto didático mostrado na ficha.
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

// O catálogo. Cada exercício ataca exatamente um agrupamento, e carrega junto
// a observação de execução — o acervo de conhecimento do projeto.
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

// Substituições: "se a academia não tem esse aparelho, use aquele".
// A chave primária composta impede cadastrar o mesmo par duas vezes.
db.exec(`
  CREATE TABLE IF NOT EXISTS exercicio_alternativas (
    exercicio_id INTEGER NOT NULL,
    alternativa_id INTEGER NOT NULL,
    PRIMARY KEY (exercicio_id, alternativa_id),
    FOREIGN KEY (exercicio_id) REFERENCES exercicios(id) ON DELETE CASCADE,
    FOREIGN KEY (alternativa_id) REFERENCES exercicios(id) ON DELETE CASCADE
  )
`);

// O treino gerado para um usuário. O nível fica aqui porque define a
// prescrição de todas as sessões.
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

// Uma sessão = um dia da semana no treino. Numa divisão de 4 dias existem duas
// sessões "Upper", com os mesmos agrupamentos e exercícios diferentes.
db.exec(`
  CREATE TABLE IF NOT EXISTS treino_sessoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    treino_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    ordem INTEGER NOT NULL,
    FOREIGN KEY (treino_id) REFERENCES treinos(id) ON DELETE CASCADE
  )
`);

// A ficha propriamente dita: qual exercício, em que posição, com que prescrição.
// A ordem é definida pela regra do zig-zag, não pelo usuário.
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

// Popula os agrupamentos só na primeira vez.
const { AGRUPAMENTOS } = require('./agrupamentos-seed');

const totalAgrupamentos = db.prepare('SELECT COUNT(*) AS c FROM agrupamentos').get().c;

if (totalAgrupamentos === 0) {
  const inserir = db.prepare(
    'INSERT INTO agrupamentos (slug, nome, grupo, dano) VALUES (?, ?, ?, ?)'
  );

  // transaction() agrupa tudo numa operação só: ou entra a lista inteira, ou
  // nada entra. Também é muito mais rápido que inserir um a um.
  const inserirTodos = db.transaction((lista) => {
    for (const a of lista) inserir.run(a.slug, a.nome, a.grupo, a.dano);
  });

  inserirTodos(AGRUPAMENTOS);
  console.log(`${AGRUPAMENTOS.length} agrupamentos cadastrados.`);
}

// Popula o catálogo de exercícios só na primeira vez.
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

      // Se o slug não existir, a transação inteira é desfeita — melhor falhar
      // alto do que gravar um catálogo pela metade.
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