const express = require('express');
const db = require('./database')

const app = express();

const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Teste');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

