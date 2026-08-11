require('dotenv').config();

const express = require('express');
const db = require('./database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_SENHA_APP,
  },
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Teste');
});

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

  res.json({ mensagem: 'Login realizado com sucesso!', nome: usuario.nome });
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

  const link = `http://localhost:5500/redefinir-senha.html?token=${token}`;

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