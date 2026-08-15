const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const cors = require('cors');

const jwt = require('jsonwebtoken');

const express = require('express');
const db = require('./database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { gerarTreino } = require('./gerador');

if (!process.env.JWT_SECRET) {
  console.error('ERRO: JWT_SECRET não definido. Copie backend/.env.example para backend/.env e preencha os valores.');
  process.exit(1);
}

const app = express();
const PORT = 3000;

app.use(cors());


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_SENHA_APP,
  },
});

app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

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

app.post('/register', async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Preencha todos os campos.' });
  }

  try {
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const stmt = db.prepare('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)');
    stmt.run(nome, email, senhaCriptografada);

    res.json({ mensagem: 'Usuário cadastrado com sucesso!' });

  } catch (erro) {
    res.status(400).json({ erro: 'E-mail já cadastrado.' });
  }
});

app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Preencha e-mail e senha.' });
  }

  const stmt = db.prepare('SELECT * FROM usuarios WHERE email = ?');
  const usuario = stmt.get(email);

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

app.get('/perfil', verificarToken, (req, res) => {
  const stmt = db.prepare('SELECT id, nome, email FROM usuarios WHERE id = ?');
  const usuario = stmt.get(req.usuario.id);

  if (!usuario) {
    return res.status(404).json({ erro: 'Usuário não encontrado.' });
  }

  res.json({ usuario });
});

app.put('/perfil', verificarToken, (req, res) => {
  const { nome, email } = req.body;

  if (!nome || !email) {
    return res.status(400).json({ erro: 'Preencha nome e e-mail.' });
  }

  try {
    const update = db.prepare('UPDATE usuarios SET nome = ?, email = ? WHERE id = ?');
    update.run(nome, email, req.usuario.id);

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

  const stmt = db.prepare('SELECT * FROM usuarios WHERE id = ?');
  const usuario = stmt.get(req.usuario.id);

  if (!usuario) {
    return res.status(404).json({ erro: 'Usuário não encontrado.' });
  }

  const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha);

  if (!senhaCorreta) {
    return res.status(401).json({ erro: 'Senha atual incorreta.' });
  }

  const senhaCriptografada = await bcrypt.hash(novaSenha, 10);

  const update = db.prepare('UPDATE usuarios SET senha = ? WHERE id = ?');
  update.run(senhaCriptografada, req.usuario.id);

  res.json({ mensagem: 'Senha alterada com sucesso!' });
});

app.get('/tarefas', verificarToken, (req, res) => {
  const stmt = db.prepare(
    'SELECT * FROM tarefas WHERE usuario_id = ? ORDER BY concluida, id DESC'
  );
  const tarefas = stmt.all(req.usuario.id);

  res.json({ tarefas });
});

app.post('/tarefas', verificarToken, (req, res) => {
  const { titulo, descricao } = req.body;

  if (!titulo) {
    return res.status(400).json({ erro: 'Informe o título da tarefa.' });
  }

  const stmt = db.prepare(
    'INSERT INTO tarefas (usuario_id, titulo, descricao) VALUES (?, ?, ?)'
  );
  const resultado = stmt.run(req.usuario.id, titulo, descricao || null);

  const criada = db.prepare('SELECT * FROM tarefas WHERE id = ?').get(resultado.lastInsertRowid);

  res.status(201).json({ mensagem: 'Tarefa criada!', tarefa: criada });
});

app.put('/tarefas/:id', verificarToken, (req, res) => {
  const { titulo, descricao, concluida } = req.body;

  if (!titulo) {
    return res.status(400).json({ erro: 'Informe o título da tarefa.' });
  }

  const stmt = db.prepare(
    'UPDATE tarefas SET titulo = ?, descricao = ?, concluida = ? WHERE id = ? AND usuario_id = ?'
  );
  const resultado = stmt.run(
    titulo,
    descricao || null,
    concluida ? 1 : 0,
    req.params.id,
    req.usuario.id
  );

  if (resultado.changes === 0) {
    return res.status(404).json({ erro: 'Tarefa não encontrada.' });
  }

  const atualizada = db.prepare('SELECT * FROM tarefas WHERE id = ?').get(req.params.id);

  res.json({ mensagem: 'Tarefa atualizada!', tarefa: atualizada });
});

app.delete('/tarefas/:id', verificarToken, (req, res) => {
  const stmt = db.prepare('DELETE FROM tarefas WHERE id = ? AND usuario_id = ?');
  const resultado = stmt.run(req.params.id, req.usuario.id);

  if (resultado.changes === 0) {
    return res.status(404).json({ erro: 'Tarefa não encontrada.' });
  }

  res.json({ mensagem: 'Tarefa excluída!' });
});

function carregarCatalogo() {
  return {
    agrupamentos: db.prepare('SELECT slug, nome, grupo, dano, explicacao FROM agrupamentos').all(),
    exercicios: db.prepare(`
      SELECT e.id, e.nome, e.equipamento, e.genero, e.enfase, e.observacao, a.slug AS agrupamento
      FROM exercicios e
      JOIN agrupamentos a ON a.id = e.agrupamento_id
    `).all(),
  };
}

function montarFicha(treinoId, usuarioId) {
  const treino = db.prepare(
    'SELECT * FROM treinos WHERE id = ? AND usuario_id = ?'
  ).get(treinoId, usuarioId);

  if (!treino) return null;

  const sessoes = db.prepare(
    'SELECT * FROM treino_sessoes WHERE treino_id = ? ORDER BY ordem'
  ).all(treino.id);

  const exercicios = db.prepare(`
    SELECT te.sessao_id, te.ordem, te.series, te.reps, te.rir,
           e.id AS exercicio_id, e.nome, e.equipamento, e.enfase, e.observacao,
           a.slug AS agrupamento, a.nome AS agrupamento_nome, a.grupo, a.explicacao
    FROM treino_exercicios te
    JOIN exercicios e ON e.id = te.exercicio_id
    JOIN agrupamentos a ON a.id = e.agrupamento_id
    WHERE te.sessao_id = ?
    ORDER BY te.ordem
  `);

  return {
    ...treino,
    sessoes: sessoes.map((s) => ({ ...s, exercicios: exercicios.all(s.id) })),
  };
}

app.get('/exercicios', verificarToken, (req, res) => {
  const catalogo = carregarCatalogo();
  res.json(catalogo);
});

app.post('/treinos', verificarToken, (req, res) => {
  const { nivel, genero, dias, nome } = req.body;

  let gerado;
  try {
    gerado = gerarTreino({ nivel, genero, dias: Number(dias) }, carregarCatalogo());
  } catch (erro) {
    return res.status(400).json({ erro: erro.message });
  }

  const inserirTreino = db.prepare(`
    INSERT INTO treinos (usuario_id, nome, nivel, genero, divisao)
    VALUES (?, ?, ?, ?, ?)
  `);
  const inserirSessao = db.prepare(
    'INSERT INTO treino_sessoes (treino_id, nome, ordem) VALUES (?, ?, ?)'
  );
  const inserirExercicio = db.prepare(`
    INSERT INTO treino_exercicios (sessao_id, exercicio_id, ordem, series, reps, rir)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const salvar = db.transaction(() => {
    const treino = inserirTreino.run(
      req.usuario.id,
      nome || `${gerado.nomeDivisao} — ${dias} dias`,
      nivel,
      genero,
      gerado.divisao
    );

    for (const sessao of gerado.sessoes) {
      const salva = inserirSessao.run(treino.lastInsertRowid, sessao.nome, sessao.ordem);

      for (const e of sessao.exercicios) {
        inserirExercicio.run(salva.lastInsertRowid, e.exercicio_id, e.ordem, e.series, e.reps, e.rir);
      }
    }

    return treino.lastInsertRowid;
  });

  const id = salvar();

  res.status(201).json({ mensagem: 'Treino gerado!', treino: montarFicha(id, req.usuario.id) });
});

app.get('/treinos', verificarToken, (req, res) => {
  const treinos = db.prepare(`
    SELECT t.*, COUNT(s.id) AS sessoes
    FROM treinos t LEFT JOIN treino_sessoes s ON s.treino_id = t.id
    WHERE t.usuario_id = ?
    GROUP BY t.id
    ORDER BY t.id DESC
  `).all(req.usuario.id);

  res.json({ treinos });
});

app.get('/treinos/:id', verificarToken, (req, res) => {
  const ficha = montarFicha(req.params.id, req.usuario.id);

  if (!ficha) {
    return res.status(404).json({ erro: 'Treino não encontrado.' });
  }

  res.json({ treino: ficha });
});

app.delete('/treinos/:id', verificarToken, (req, res) => {
  const resultado = db.prepare(
    'DELETE FROM treinos WHERE id = ? AND usuario_id = ?'
  ).run(req.params.id, req.usuario.id);

  if (resultado.changes === 0) {
    return res.status(404).json({ erro: 'Treino não encontrado.' });
  }

  res.json({ mensagem: 'Treino excluído!' });
});

app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ erro: 'Informe o e-mail.' });
  }

  const stmt = db.prepare('SELECT * FROM usuarios WHERE email = ?');
  const usuario = stmt.get(email);

  if (!usuario) {
    return res.json({ mensagem: 'Se esse e-mail existir, enviaremos as instruções.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expira = Date.now() + 30 * 60 * 1000;

  const update = db.prepare('UPDATE usuarios SET resetToken = ?, resetTokenExpira = ? WHERE email = ?');
  update.run(token, expira, email);

  const baseUrl = process.env.APP_URL || `http://localhost:${PORT}`;
  const link = `${baseUrl}/redefinir-senha.html?token=${token}`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Redefinição de senha',
      html: `
        <p>Olá, ${usuario.nome}!</p>
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

  const stmt = db.prepare('SELECT * FROM usuarios WHERE resetToken = ?');
  const usuario = stmt.get(token);

  if (!usuario) {
    return res.status(400).json({ erro: 'Token inválido.' });
  }

  if (Date.now() > usuario.resetTokenExpira) {
    return res.status(400).json({ erro: 'Token expirado. Solicite novamente.' });
  }

  const senhaCriptografada = await bcrypt.hash(novaSenha, 10);

  const update = db.prepare('UPDATE usuarios SET senha = ?, resetToken = NULL, resetTokenExpira = NULL WHERE id = ?');
  update.run(senhaCriptografada, usuario.id);

  res.json({ mensagem: 'Senha redefinida com sucesso!' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
