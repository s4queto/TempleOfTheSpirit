const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const jwt = require('jsonwebtoken');

const express = require('express');
const { pool, inicializarBanco } = require('./database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const webpush = require('web-push');
const { gerarTreino } = require('./gerador');

if (!process.env.JWT_SECRET) {
  console.error('ERRO: JWT_SECRET não definido. Copie backend/.env.example para backend/.env e preencha os valores.');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('ERRO: DATABASE_URL não definido. Preencha backend/.env com a connection string do Supabase.');
  process.exit(1);
}

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:contato@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', true);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'script-src': ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
      'script-src-attr': ["'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https://images.unsplash.com'],
    },
  },
}));

const origensPermitidas = [
  process.env.APP_URL,
  `http://localhost:${PORT}`,
  `http://127.0.0.1:${PORT}`,
].filter(Boolean);

app.use(cors({
  origin(origem, callback) {
    if (!origem || origensPermitidas.includes(origem)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
}));

const limitadorLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' },
});


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_SENHA_APP,
  },
});

app.use(express.json({ limit: '3mb' }));
app.use(express.static(path.join(__dirname, '..')));

// Garante que o banco foi inicializado antes de atender (necessário na Vercel,
// onde o servidor sobe sob demanda a cada "cold start").
let bancoPronto = null;
function garantirBanco() {
  if (!bancoPronto) {
    bancoPronto = inicializarBanco().catch((erro) => {
      bancoPronto = null;
      throw erro;
    });
  }
  return bancoPronto;
}

app.use(async (req, res, next) => {
  try {
    await garantirBanco();
    next();
  } catch (erro) {
    next(erro);
  }
});

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Token não enviado.' });
  }

  try {
    const dadosDoToken = jwt.verify(token, process.env.JWT_SECRET);

    req.usuario = dadosDoToken;
    next();

  } catch (erro) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

const FUSO = 'America/Sao_Paulo';
const HOJE_LOCAL = `(now() AT TIME ZONE '${FUSO}')::date`;

app.post('/register', limitadorLogin, async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Preencha todos os campos.' });
  }

  if (senha.length < 8) {
    return res.status(400).json({ erro: 'A senha deve ter no mínimo 8 caracteres.' });
  }

  try {
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    await pool.query('INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3)', [nome, email, senhaCriptografada]);

    res.json({ mensagem: 'Usuário cadastrado com sucesso!' });

  } catch (erro) {
    res.status(400).json({ erro: 'E-mail já cadastrado.' });
  }
});

app.post('/login', limitadorLogin, async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Preencha e-mail e senha.' });
  }

  const { rows } = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  const usuario = rows[0];

  if (!usuario) {
    return res.status(401).json({ erro: 'Usuário ou senha inválidos.' });
  }

  const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

  if (!senhaCorreta) {
    return res.status(401).json({ erro: 'Usuário ou senha inválidos.' });
  }


  const token = jwt.sign(
    { id: usuario.id, nome: usuario.nome },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  res.json({ mensagem: 'Login realizado com sucesso!', nome: usuario.nome, token });
});

app.get('/perfil', verificarToken, async (req, res) => {
  const { rows } = await pool.query('SELECT id, nome, email, foto FROM usuarios WHERE id = $1', [req.usuario.id]);
  const usuario = rows[0];

  if (!usuario) {
    return res.status(404).json({ erro: 'Usuário não encontrado.' });
  }

  res.json({ usuario });
});

app.put('/perfil/foto', verificarToken, async (req, res) => {
  const { foto } = req.body;

  if (!foto || !/^data:image\/(png|jpe?g|gif|webp);base64,[A-Za-z0-9+/]+=*$/.test(foto)) {
    return res.status(400).json({ erro: 'Envie uma imagem válida.' });
  }

  await pool.query('UPDATE usuarios SET foto = $1 WHERE id = $2', [foto, req.usuario.id]);

  res.json({ mensagem: 'Foto atualizada!' });
});

app.delete('/perfil/foto', verificarToken, async (req, res) => {
  await pool.query('UPDATE usuarios SET foto = NULL WHERE id = $1', [req.usuario.id]);

  res.json({ mensagem: 'Foto removida!' });
});

app.put('/perfil', verificarToken, async (req, res) => {
  const { nome, email } = req.body;

  if (!nome || !email) {
    return res.status(400).json({ erro: 'Preencha nome e e-mail.' });
  }

  try {
    await pool.query('UPDATE usuarios SET nome = $1, email = $2 WHERE id = $3', [nome, email, req.usuario.id]);

    res.json({ mensagem: 'Perfil atualizado com sucesso!', usuario: { nome, email } });

  } catch (erro) {
    return res.status(400).json({ erro: 'Esse e-mail já está em uso.' });
  }
});

app.put('/alterar-senha', verificarToken, async (req, res) => {
  const { senhaAtual, novaSenha } = req.body;

  if (!senhaAtual || !novaSenha) {
    return res.status(400).json({ erro: 'Informe a senha atual e a nova senha.' });
  }

  if (novaSenha.length < 6) {
    return res.status(400).json({ erro: 'A nova senha deve ter no mínimo 6 caracteres.' });
  }

  const { rows } = await pool.query('SELECT * FROM usuarios WHERE id = $1', [req.usuario.id]);
  const usuario = rows[0];

  if (!usuario) {
    return res.status(404).json({ erro: 'Usuário não encontrado.' });
  }

  const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha);

  if (!senhaCorreta) {
    return res.status(401).json({ erro: 'Senha atual incorreta.' });
  }

  const senhaCriptografada = await bcrypt.hash(novaSenha, 10);

  await pool.query('UPDATE usuarios SET senha = $1 WHERE id = $2', [senhaCriptografada, req.usuario.id]);

  res.json({ mensagem: 'Senha alterada com sucesso!' });
});

app.get('/tarefas', verificarToken, async (req, res) => {
  const { rows: tarefas } = await pool.query(
    'SELECT * FROM tarefas WHERE usuario_id = $1 ORDER BY concluida, id DESC',
    [req.usuario.id]
  );

  res.json({ tarefas });
});

app.post('/tarefas', verificarToken, async (req, res) => {
  const { titulo, descricao } = req.body;

  if (!titulo) {
    return res.status(400).json({ erro: 'Informe o título da tarefa.' });
  }

  const { rows } = await pool.query(
    'INSERT INTO tarefas (usuario_id, titulo, descricao) VALUES ($1, $2, $3) RETURNING *',
    [req.usuario.id, titulo, descricao || null]
  );

  res.status(201).json({ mensagem: 'Tarefa criada!', tarefa: rows[0] });
});

app.put('/tarefas/:id', verificarToken, async (req, res) => {
  const { titulo, descricao, concluida } = req.body;

  if (!titulo) {
    return res.status(400).json({ erro: 'Informe o título da tarefa.' });
  }

  const resultado = await pool.query(
    'UPDATE tarefas SET titulo = $1, descricao = $2, concluida = $3 WHERE id = $4 AND usuario_id = $5 RETURNING *',
    [titulo, descricao || null, concluida ? 1 : 0, req.params.id, req.usuario.id]
  );

  if (resultado.rowCount === 0) {
    return res.status(404).json({ erro: 'Tarefa não encontrada.' });
  }

  res.json({ mensagem: 'Tarefa atualizada!', tarefa: resultado.rows[0] });
});

app.delete('/tarefas/:id', verificarToken, async (req, res) => {
  const resultado = await pool.query(
    'DELETE FROM tarefas WHERE id = $1 AND usuario_id = $2',
    [req.params.id, req.usuario.id]
  );

  if (resultado.rowCount === 0) {
    return res.status(404).json({ erro: 'Tarefa não encontrada.' });
  }

  res.json({ mensagem: 'Tarefa excluída!' });
});

async function carregarCatalogo() {
  const { rows: agrupamentos } = await pool.query(
    'SELECT slug, nome, grupo, dano, explicacao FROM agrupamentos'
  );
  const { rows: exercicios } = await pool.query(`
    SELECT e.id, e.nome, e.equipamento, e.genero, e.enfase, e.observacao, a.slug AS agrupamento
    FROM exercicios e
    JOIN agrupamentos a ON a.id = e.agrupamento_id
  `);

  return { agrupamentos, exercicios };
}

async function montarFicha(treinoId, usuarioId) {
  const { rows: treinoRows } = await pool.query(
    'SELECT * FROM treinos WHERE id = $1 AND usuario_id = $2',
    [treinoId, usuarioId]
  );
  const treino = treinoRows[0];

  if (!treino) return null;

  const { rows: sessoes } = await pool.query(
    'SELECT * FROM treino_sessoes WHERE treino_id = $1 ORDER BY ordem',
    [treino.id]
  );

  const sessoesComExercicios = await Promise.all(sessoes.map(async (s) => {
    const { rows: exercicios } = await pool.query(`
      SELECT te.id AS treino_exercicio_id, te.sessao_id, te.ordem, te.series, te.reps, te.rir,
             e.id AS exercicio_id, e.nome, e.equipamento, e.enfase, e.observacao,
             a.slug AS agrupamento, a.nome AS agrupamento_nome, a.grupo, a.explicacao
      FROM treino_exercicios te
      JOIN exercicios e ON e.id = te.exercicio_id
      JOIN agrupamentos a ON a.id = e.agrupamento_id
      WHERE te.sessao_id = $1
      ORDER BY te.ordem
    `, [s.id]);

    return { ...s, exercicios };
  }));

  return { ...treino, sessoes: sessoesComExercicios };
}

app.get('/exercicios', verificarToken, async (req, res) => {
  const catalogo = await carregarCatalogo();
  res.json(catalogo);
});

app.post('/treinos', verificarToken, async (req, res) => {
  const { nivel, genero, dias, nome } = req.body;

  let gerado;
  try {
    gerado = gerarTreino({ nivel, genero, dias: Number(dias) }, await carregarCatalogo());
  } catch (erro) {
    return res.status(400).json({ erro: erro.message });
  }

  const client = await pool.connect();
  let treinoId;

  try {
    await client.query('BEGIN');

    const { rows: treinoRows } = await client.query(
      `INSERT INTO treinos (usuario_id, nome, nivel, genero, divisao)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [req.usuario.id, nome || `${gerado.nomeDivisao} — ${dias} dias`, nivel, genero, gerado.divisao]
    );
    treinoId = treinoRows[0].id;

    for (const sessao of gerado.sessoes) {
      const { rows: sessaoRows } = await client.query(
        'INSERT INTO treino_sessoes (treino_id, nome, ordem) VALUES ($1, $2, $3) RETURNING id',
        [treinoId, sessao.nome, sessao.ordem]
      );
      const sessaoId = sessaoRows[0].id;

      for (const e of sessao.exercicios) {
        await client.query(
          `INSERT INTO treino_exercicios (sessao_id, exercicio_id, ordem, series, reps, rir)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [sessaoId, e.exercicio_id, e.ordem, e.series, e.reps, e.rir]
        );
      }
    }

    await client.query('COMMIT');
  } catch (erro) {
    await client.query('ROLLBACK');
    throw erro;
  } finally {
    client.release();
  }

  res.status(201).json({ mensagem: 'Treino gerado!', treino: await montarFicha(treinoId, req.usuario.id) });
});

app.get('/treinos', verificarToken, async (req, res) => {
  const { rows: treinos } = await pool.query(`
    SELECT t.*, COUNT(s.id) AS sessoes
    FROM treinos t LEFT JOIN treino_sessoes s ON s.treino_id = t.id
    WHERE t.usuario_id = $1
    GROUP BY t.id
    ORDER BY t.id DESC
  `, [req.usuario.id]);

  res.json({ treinos });
});

app.get('/treinos/:id', verificarToken, async (req, res) => {
  const ficha = await montarFicha(req.params.id, req.usuario.id);

  if (!ficha) {
    return res.status(404).json({ erro: 'Treino não encontrado.' });
  }

  res.json({ treino: ficha });
});

app.delete('/treinos/:id', verificarToken, async (req, res) => {
  const resultado = await pool.query(
    'DELETE FROM treinos WHERE id = $1 AND usuario_id = $2',
    [req.params.id, req.usuario.id]
  );

  if (resultado.rowCount === 0) {
    return res.status(404).json({ erro: 'Treino não encontrado.' });
  }

  res.json({ mensagem: 'Treino excluído!' });
});

async function buscarTreinoExercicio(treinoExercicioId, usuarioId) {
  const { rows } = await pool.query(`
    SELECT te.id, te.exercicio_id
    FROM treino_exercicios te
    JOIN treino_sessoes s ON s.id = te.sessao_id
    JOIN treinos t ON t.id = s.treino_id
    WHERE te.id = $1 AND t.usuario_id = $2
  `, [treinoExercicioId, usuarioId]);

  return rows[0] || null;
}

app.post('/treino-exercicios/:id/registros', verificarToken, async (req, res) => {
  const { registros } = req.body;

  if (!Array.isArray(registros) || registros.length === 0) {
    return res.status(400).json({ erro: 'Informe ao menos uma série.' });
  }

  const treinoExercicio = await buscarTreinoExercicio(req.params.id, req.usuario.id);

  if (!treinoExercicio) {
    return res.status(404).json({ erro: 'Exercício não encontrado.' });
  }

  for (const r of registros) {
    const numeroValido = Number.isInteger(r.numeroSerie) && r.numeroSerie >= 1;
    const cargaValida = typeof r.carga === 'number' && Number.isFinite(r.carga) && r.carga >= 0;
    const repsValidas = Number.isInteger(r.repeticoes) && r.repeticoes >= 0;

    if (!numeroValido || !cargaValida || !repsValidas) {
      return res.status(400).json({ erro: 'Cada série precisa de número, carga e repetições válidos.' });
    }
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const r of registros) {
      await client.query(
        `INSERT INTO registros_series (usuario_id, treino_exercicio_id, numero_serie, carga, repeticoes)
         VALUES ($1, $2, $3, $4, $5)`,
        [req.usuario.id, treinoExercicio.id, r.numeroSerie, r.carga, r.repeticoes]
      );
    }

    await client.query('COMMIT');
  } catch (erro) {
    await client.query('ROLLBACK');
    throw erro;
  } finally {
    client.release();
  }

  res.status(201).json({ mensagem: 'Registro salvo!' });
});

app.get('/evolucao/sessoes', verificarToken, async (req, res) => {
  const { rows: sessoes } = await pool.query(`
    SELECT s.id, s.nome, t.nome AS treino_nome, t."criadoEm" AS treino_criadoEm
    FROM treino_sessoes s
    JOIN treinos t ON t.id = s.treino_id
    WHERE t.usuario_id = $1
    ORDER BY t.id DESC, s.ordem
  `, [req.usuario.id]);

  res.json({ sessoes });
});

app.get('/evolucao/sessoes/:id', verificarToken, async (req, res) => {
  const { rows: sessaoRows } = await pool.query(`
    SELECT s.id
    FROM treino_sessoes s
    JOIN treinos t ON t.id = s.treino_id
    WHERE s.id = $1 AND t.usuario_id = $2
  `, [req.params.id, req.usuario.id]);
  const sessao = sessaoRows[0];

  if (!sessao) {
    return res.status(404).json({ erro: 'Sessão não encontrada.' });
  }

  const { rows: exerciciosDaSessao } = await pool.query(`
    SELECT DISTINCT e.id, e.nome, te.ordem
    FROM treino_exercicios te
    JOIN exercicios e ON e.id = te.exercicio_id
    WHERE te.sessao_id = $1
    ORDER BY te.ordem
  `, [sessao.id]);

  const exercicios = await Promise.all(exerciciosDaSessao.map(async (e) => {
    const { rows: registros } = await pool.query(`
      SELECT r."registradoEm", r.carga, r.repeticoes
      FROM registros_series r
      JOIN treino_exercicios te ON te.id = r.treino_exercicio_id
      WHERE te.exercicio_id = $1 AND r.usuario_id = $2
      ORDER BY r."registradoEm"
    `, [e.id, req.usuario.id]);

    return { id: e.id, nome: e.nome, registros };
  }));

  res.json({ exercicios });
});

function metaAguaMl(pesoKg) {
  return Math.round((pesoKg || 70) * 35);
}

app.get('/agua/hoje', verificarToken, async (req, res) => {
  const { rows: usuarioRows } = await pool.query(
    'SELECT "pesoKg", "lembreteAguaAtivo", "lembreteAguaIntervaloMin" FROM usuarios WHERE id = $1',
    [req.usuario.id]
  );
  const usuario = usuarioRows[0];

  const { rows: registros } = await pool.query(`
    SELECT id, ml, "registradoEm"
    FROM registros_agua
    WHERE usuario_id = $1 AND ("registradoEm" AT TIME ZONE '${FUSO}')::date = ${HOJE_LOCAL}
    ORDER BY "registradoEm" DESC
  `, [req.usuario.id]);

  const { rows: garrafinhas } = await pool.query(
    'SELECT id, nome, ml FROM garrafinhas WHERE usuario_id = $1 ORDER BY ml',
    [req.usuario.id]
  );

  const totalMl = registros.reduce((soma, r) => soma + r.ml, 0);

  res.json({
    registros,
    garrafinhas,
    totalMl,
    metaMl: metaAguaMl(usuario.pesoKg),
    pesoKg: usuario.pesoKg,
    lembreteAtivo: !!usuario.lembreteAguaAtivo,
    lembreteIntervaloMin: usuario.lembreteAguaIntervaloMin,
  });
});

app.get('/agua/historico', verificarToken, async (req, res) => {
  const { rows: dias } = await pool.query(`
    SELECT ("registradoEm" AT TIME ZONE '${FUSO}')::date AS dia, SUM(ml) AS "totalMl", COUNT(*) AS quantidade
    FROM registros_agua
    WHERE usuario_id = $1 AND "registradoEm" >= (${HOJE_LOCAL} - interval '13 days') AT TIME ZONE '${FUSO}'
    GROUP BY dia
    ORDER BY dia DESC
  `, [req.usuario.id]);

  res.json({ dias });
});

app.post('/agua/registros', verificarToken, async (req, res) => {
  const { ml } = req.body;

  if (!Number.isFinite(ml) || ml <= 0) {
    return res.status(400).json({ erro: 'Informe uma quantidade válida.' });
  }

  const { rows } = await pool.query(
    'INSERT INTO registros_agua (usuario_id, ml) VALUES ($1, $2) RETURNING id',
    [req.usuario.id, Math.round(ml)]
  );

  res.status(201).json({ mensagem: 'Registrado!', id: rows[0].id });
});

app.delete('/agua/registros/:id', verificarToken, async (req, res) => {
  const resultado = await pool.query(
    'DELETE FROM registros_agua WHERE id = $1 AND usuario_id = $2',
    [req.params.id, req.usuario.id]
  );

  if (resultado.rowCount === 0) {
    return res.status(404).json({ erro: 'Registro não encontrado.' });
  }

  res.json({ mensagem: 'Removido!' });
});

app.post('/agua/garrafinhas', verificarToken, async (req, res) => {
  const { nome, ml } = req.body;

  if (!nome || !Number.isFinite(ml) || ml <= 0) {
    return res.status(400).json({ erro: 'Informe nome e quantidade válidos.' });
  }

  const { rows } = await pool.query(
    'INSERT INTO garrafinhas (usuario_id, nome, ml) VALUES ($1, $2, $3) RETURNING id',
    [req.usuario.id, nome, Math.round(ml)]
  );

  res.status(201).json({ mensagem: 'Garrafinha cadastrada!', id: rows[0].id });
});

app.delete('/agua/garrafinhas/:id', verificarToken, async (req, res) => {
  const resultado = await pool.query(
    'DELETE FROM garrafinhas WHERE id = $1 AND usuario_id = $2',
    [req.params.id, req.usuario.id]
  );

  if (resultado.rowCount === 0) {
    return res.status(404).json({ erro: 'Garrafinha não encontrada.' });
  }

  res.json({ mensagem: 'Removida!' });
});

app.put('/agua/configuracao', verificarToken, async (req, res) => {
  const { pesoKg, lembreteAtivo, lembreteIntervaloMin } = req.body;

  if (pesoKg != null && (!Number.isFinite(pesoKg) || pesoKg <= 0)) {
    return res.status(400).json({ erro: 'Peso inválido.' });
  }

  if (lembreteIntervaloMin != null && (!Number.isInteger(lembreteIntervaloMin) || lembreteIntervaloMin < 15)) {
    return res.status(400).json({ erro: 'Intervalo do lembrete inválido.' });
  }

  await pool.query(`
    UPDATE usuarios
    SET "pesoKg" = COALESCE($1, "pesoKg"),
        "lembreteAguaAtivo" = COALESCE($2, "lembreteAguaAtivo"),
        "lembreteAguaIntervaloMin" = COALESCE($3, "lembreteAguaIntervaloMin")
    WHERE id = $4
  `, [
    pesoKg ?? null,
    lembreteAtivo === undefined ? null : (lembreteAtivo ? 1 : 0),
    lembreteIntervaloMin ?? null,
    req.usuario.id,
  ]);

  res.json({ mensagem: 'Configuração salva!' });
});

app.get('/push/chave-publica', verificarToken, (req, res) => {
  res.json({ chave: process.env.VAPID_PUBLIC_KEY || null });
});

app.post('/push/inscrever', verificarToken, async (req, res) => {
  const { endpoint, keys } = req.body;

  if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
    return res.status(400).json({ erro: 'Inscrição de notificação inválida.' });
  }

  await pool.query(`
    INSERT INTO inscricoes_push (usuario_id, endpoint, p256dh, auth)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (endpoint) DO UPDATE SET usuario_id = excluded.usuario_id, p256dh = excluded.p256dh, auth = excluded.auth
  `, [req.usuario.id, endpoint, keys.p256dh, keys.auth]);

  res.status(201).json({ mensagem: 'Inscrito para notificações!' });
});

app.delete('/push/inscrever', verificarToken, async (req, res) => {
  const { endpoint } = req.body;

  await pool.query('DELETE FROM inscricoes_push WHERE endpoint = $1 AND usuario_id = $2', [endpoint, req.usuario.id]);

  res.json({ mensagem: 'Inscrição removida.' });
});

async function checarLembretesDeAgua() {
  if (!process.env.VAPID_PUBLIC_KEY) return;

  const horaLocal = Number(new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', hour12: false, timeZone: FUSO }).format(new Date()));
  if (horaLocal < 7 || horaLocal >= 22) return;

  const { rows: usuarios } = await pool.query(`
    SELECT id, "pesoKg", "lembreteAguaIntervaloMin"
    FROM usuarios
    WHERE "lembreteAguaAtivo" = 1
  `);

  for (const usuario of usuarios) {
    const { rows: totalRows } = await pool.query(`
      SELECT COALESCE(SUM(ml), 0) AS total
      FROM registros_agua
      WHERE usuario_id = $1 AND ("registradoEm" AT TIME ZONE '${FUSO}')::date = ${HOJE_LOCAL}
    `, [usuario.id]);
    const totalHoje = Number(totalRows[0].total);

    if (totalHoje >= metaAguaMl(usuario.pesoKg)) continue;

    const { rows: inscricoes } = await pool.query(
      'SELECT * FROM inscricoes_push WHERE usuario_id = $1',
      [usuario.id]
    );

    for (const inscricao of inscricoes) {
      if (inscricao.ultimoLembreteEm) {
        const minutosDesde = (Date.now() - new Date(inscricao.ultimoLembreteEm).getTime()) / 60000;
        if (minutosDesde < usuario.lembreteAguaIntervaloMin) continue;
      }

      const payload = JSON.stringify({
        titulo: 'Hora de beber água 💧',
        corpo: `Você já bebeu ${totalHoje}ml hoje. Faltam ${metaAguaMl(usuario.pesoKg) - totalHoje}ml para a meta.`,
      });

      try {
        await webpush.sendNotification(
          { endpoint: inscricao.endpoint, keys: { p256dh: inscricao.p256dh, auth: inscricao.auth } },
          payload
        );
        await pool.query('UPDATE inscricoes_push SET "ultimoLembreteEm" = now() WHERE id = $1', [inscricao.id]);
      } catch (erro) {
        if (erro.statusCode === 404 || erro.statusCode === 410) {
          await pool.query('DELETE FROM inscricoes_push WHERE id = $1', [inscricao.id]);
        } else {
          console.error('Erro ao enviar notificação:', erro.message);
        }
      }
    }
  }
}

// Na Vercel não existe processo rodando o tempo todo, então um serviço externo
// (ex.: cron-job.org) chama esta rota a cada 10 minutos.
// Ele precisa enviar o cabeçalho: Authorization: Bearer <CRON_SECRET>
app.get('/cron/lembretes-agua', async (req, res) => {
  const segredo = process.env.CRON_SECRET;
  if (!segredo || req.headers['authorization'] !== `Bearer ${segredo}`) {
    return res.status(401).json({ erro: 'Não autorizado.' });
  }

  await checarLembretesDeAgua();
  res.json({ ok: true });
});

app.post('/forgot-password', limitadorLogin, async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ erro: 'Informe o e-mail.' });
  }

  const { rows } = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  const usuario = rows[0];

  if (!usuario) {
    return res.json({ mensagem: 'Se esse e-mail existir, enviaremos as instruções.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expira = Date.now() + 30 * 60 * 1000;

  await pool.query('UPDATE usuarios SET "resetToken" = $1, "resetTokenExpira" = $2 WHERE email = $3', [token, expira, email]);

  const baseUrl = process.env.APP_URL || `http://localhost:${PORT}`;
  const link = `${baseUrl}/redefinir-senha.html?token=${token}`;
  const nomeSeguro = String(usuario.nome).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Redefinição de senha',
      html: `
        <p>Olá, ${nomeSeguro}!</p>
        <p>Você solicitou a redefinição da sua senha. Clique no link abaixo (válido por 30 minutos):</p>
        <a href="${link}">${link}</a>
        <p>Se você não solicitou isso, apenas ignore este e-mail.</p>
      `,
    });

    res.json({ mensagem: 'Se esse e-mail existir, enviaremos as instruções.' });

  } catch (erro) {
    console.error('Erro ao enviar e-mail:', erro);
    res.status(500).json({ erro: 'Erro ao enviar e-mail. Tente novamente.' });
  }
});

app.post('/reset-password', async (req, res) => {
  const { token, novaSenha } = req.body;

  if (!token || !novaSenha) {
    return res.status(400).json({ erro: 'Token e nova senha são obrigatórios.' });
  }

  const { rows } = await pool.query('SELECT * FROM usuarios WHERE "resetToken" = $1', [token]);
  const usuario = rows[0];

  if (!usuario) {
    return res.status(400).json({ erro: 'Token inválido.' });
  }

  if (Date.now() > Number(usuario.resetTokenExpira)) {
    return res.status(400).json({ erro: 'Token expirado. Solicite novamente.' });
  }

  const senhaCriptografada = await bcrypt.hash(novaSenha, 10);

  await pool.query('UPDATE usuarios SET senha = $1, "resetToken" = NULL, "resetTokenExpira" = NULL WHERE id = $2', [senhaCriptografada, usuario.id]);

  res.json({ mensagem: 'Senha redefinida com sucesso!' });
});

app.use((erro, req, res, next) => {
  console.error('Erro não tratado:', erro);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

// Rodando no seu computador (npm run dev / npm start): sobe o servidor normalmente.
// Na Vercel, o arquivo é importado por api/index.js e só o app é exportado.
if (require.main === module) {
  garantirBanco()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
      });
      setInterval(checarLembretesDeAgua, 10 * 60 * 1000);
    })
    .catch((erro) => {
      console.error('Erro ao inicializar o banco de dados:', erro);
      process.exit(1);
    });
}

module.exports = app;
