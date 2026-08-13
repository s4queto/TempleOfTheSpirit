# Projeto Página de Login

Sistema de login com cadastro, autenticação via JWT, área logada e redefinição de
senha por e-mail. Frontend em HTML/CSS puro e backend em Node.js com Express e SQLite.

## Estrutura do projeto

```
.
├── index.html              # Tela de login
├── cadastro.html           # Tela de cadastro
├── home.html               # Área logada: só abre com token válido
├── redefinir-senha.html    # Tela de definição da nova senha (acessada pelo link do e-mail)
├── style.css               # Estilos das telas
├── img/                    # Imagens usadas no layout
└── backend/
    ├── server.js           # Servidor Express e rotas da API
    ├── database.js         # Conexão com o SQLite e criação da tabela `usuarios`
    ├── .env.example        # Modelo das variáveis de ambiente
    └── package.json        # Dependências e scripts
```

## Tecnologias

- [Express](https://expressjs.com/) — servidor HTTP e rotas
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) — banco de dados SQLite
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) — criptografia das senhas
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) — geração e validação dos tokens JWT
- [cors](https://github.com/expressjs/cors) — libera as chamadas do frontend para a API
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

Copie o modelo `backend/.env.example` para `backend/.env` e preencha os valores:

```
EMAIL_USER=seu-email@gmail.com
EMAIL_SENHA_APP=sua-senha-de-app
JWT_SECRET=um-texto-longo-e-aleatorio
```

> A `EMAIL_SENHA_APP` não é a senha da sua conta Google: é uma
> [senha de app](https://support.google.com/accounts/answer/185833) gerada nas
> configurações de segurança da conta. O arquivo `.env` está no `.gitignore` e
> não deve ser commitado.

Para gerar um `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

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

| Método | Rota               | Protegida | Descrição                                                 |
| ------ | ------------------ | :-------: | --------------------------------------------------------- |
| `POST` | `/register`        |           | Cadastra um usuário (`nome`, `email`, `senha`)             |
| `POST` | `/login`           |           | Autentica e devolve o token JWT (`email`, `senha`)         |
| `POST` | `/forgot-password` |           | Gera um token e envia o e-mail de redefinição (`email`)    |
| `POST` | `/reset-password`  |           | Define a nova senha usando o token (`token`, `novaSenha`)  |
| `GET`  | `/perfil`          |     ✔     | Retorna os dados do usuário logado                         |
| `PUT`  | `/perfil`          |     ✔     | Atualiza nome e e-mail (`nome`, `email`)                   |
| `PUT`  | `/alterar-senha`   |     ✔     | Troca a senha (`senhaAtual`, `novaSenha`)                  |

As senhas são armazenadas com hash bcrypt. O token de redefinição expira em
30 minutos e é apagado do banco assim que a senha é trocada.

## Autenticação

O `POST /login` devolve um token JWT válido por 2 horas, que o frontend guarda no
`localStorage`. As rotas marcadas como protegidas passam pelo middleware
`verificarToken`, que exige o cabeçalho:

```
Authorization: Bearer <token>
```

Sem token, ou com token inválido/expirado, a resposta é `401` e a rota não executa.
O `id` do usuário usado nas operações vem sempre de dentro do token — nunca do corpo
da requisição — para que ninguém consiga alterar os dados de outra conta. A troca de
senha exige a senha atual mesmo com token válido.

A `home.html` valida o token no backend antes de exibir qualquer conteúdo e redireciona
para o login quando a sessão expira.

## Em desenvolvimento

- Refresh token, para renovar a sessão sem exigir novo login.
- Níveis de acesso (admin/usuário) para restringir rotas por papel.
