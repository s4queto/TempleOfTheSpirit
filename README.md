# Projeto Página de Login

Sistema de login com cadastro, autenticação e redefinição de senha por e-mail.
Frontend em HTML/CSS puro e backend em Node.js com Express e SQLite.

## Estrutura do projeto

```
.
├── index.html              # Tela de login
├── redefinir-senha.html    # Tela de definição da nova senha (acessada pelo link do e-mail)
├── style.css               # Estilos das telas
├── img/                    # Imagens usadas no layout
└── backend/
    ├── server.js           # Servidor Express e rotas da API
    ├── database.js         # Conexão com o SQLite e criação da tabela `usuarios`
    └── package.json        # Dependências e scripts
```

## Tecnologias

- [Express](https://expressjs.com/) — servidor HTTP e rotas
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) — banco de dados SQLite
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) — criptografia das senhas
- [nodemailer](https://nodemailer.com/) — envio do e-mail de redefinição
- [dotenv](https://github.com/motdotla/dotenv) — variáveis de ambiente
- [nodemon](https://nodemon.io/) — recarga automática durante o desenvolvimento

## Como rodar

### 1. Backend

Instale as dependências:

```bash
cd backend
npm install
```

Crie um arquivo `.env` dentro de `backend/` com as credenciais de envio de e-mail:

```
EMAIL_USER=seu-email@gmail.com
EMAIL_SENHA_APP=sua-senha-de-app
```

> A `EMAIL_SENHA_APP` não é a senha da sua conta Google: é uma
> [senha de app](https://support.google.com/accounts/answer/185833) gerada nas
> configurações de segurança da conta. O arquivo `.env` está no `.gitignore` e
> não deve ser commitado.

Suba o servidor:

```bash
npm run dev
```

O servidor sobe em `http://localhost:3000`. O banco `database.db` e a tabela
`usuarios` são criados automaticamente na primeira execução.

### 2. Frontend

As páginas são arquivos estáticos. Abra o projeto com a extensão
[Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
do VS Code, que serve em `http://localhost:5500` — a mesma porta usada no link de
redefinição de senha enviado por e-mail.

## Rotas da API

| Método | Rota               | Descrição                                                        |
| ------ | ------------------ | ---------------------------------------------------------------- |
| `POST` | `/register`        | Cadastra um usuário (`nome`, `email`, `senha`)                    |
| `POST` | `/login`           | Autentica o usuário (`email`, `senha`)                            |
| `POST` | `/forgot-password` | Gera um token e envia o e-mail de redefinição (`email`)           |
| `POST` | `/reset-password`  | Define a nova senha usando o token (`token`, `novaSenha`)         |

As senhas são armazenadas com hash bcrypt. O token de redefinição expira em
30 minutos e é apagado do banco assim que a senha é trocada.

## Em desenvolvimento

- Tela de cadastro (`cadastro.html`) — a rota `POST /register` já existe no
  backend, mas a página ainda não foi criada.
- Tela principal do sistema, para onde o login deve redirecionar após o sucesso.
