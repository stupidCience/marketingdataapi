# Meta Ads Painel

API para gerenciamento de anúncios do Meta (Facebook/Instagram) com autenticação OAuth.

## 🚀 Instalação e Setup

### 1. Pré-requisitos

- Node.js (v16 ou superior)
- SQLite (incluído automaticamente via better-sqlite3)

### 2. Instalação

```bash
# Clone o repositório
git clone <url-do-repo>
cd meta-ads-painel

# Instale as dependências
npm install
```

### 3. Configuração do Banco de Dados

O projeto usa armazenamento em arquivo JSON, não requerendo instalação de banco de dados.

1. O arquivo `db/data.json` será criado automaticamente na primeira execução.
2. Não há necessidade de configuração adicional.

### 4. Configuração do Meta App

1. Acesse [Meta for Developers](https://developers.facebook.com)
2. Crie um novo app
3. Configure Facebook Login
4. Adicione os produtos necessários (Facebook Login, Marketing API)
5. Configure as permissões: `read_insights`, `pages_show_list`, `pages_manage_ads`
6. Anote o App ID e App Secret

### 5. Arquivo .env

Copie o arquivo de exemplo e configure:

```bash
cp .env.example .env
```

Configure as variáveis:

```env
PORT=3000
NODE_ENV=development

# Meta App Credentials
META_APP_ID=seu_app_id_aqui
META_APP_SECRET=seu_app_secret_aqui
META_REDIRECT_URI=http://localhost:3000/auth/callback
META_BASE_URL=https://graph.facebook.com/v25.0
```

### 6. Executar

```bash
# Verificar armazenamento
npm run check-storage

# Desenvolvimento (com hot-reload)
npm run dev

# Desenvolvimento (limpar porta e reiniciar, se houver EADDRINUSE)
npm run dev:clean

# Liberar porta manualmente
npm run kill-port

# Produção
npm start
```

### Troubleshooting: Erro "EADDRINUSE"

Se ver o erro `listen EADDRINUSE: address already in use :::3000`:

```bash
# Opção 1: Usar clean start (recomendado)
npm run dev:clean

# Opção 2: Matar processo e reiniciar
npm run kill-port
npm run dev
```

## 📋 Endpoints da API

### Autenticação
- `GET /auth/status` - Verifica status da autenticação (se há token válido)
- `GET /auth/login` - Inicia fluxo OAuth do Meta
- `GET /auth/callback` - Callback do OAuth (processa tokens)

### Usuário (Token automático ou Bearer)
- `GET /user/me` - Perfil do usuário autenticado

### Anúncios (Token automático ou Bearer)
- `GET /ads/ad-accounts` - Lista contas de anúncios

## 🔐 Sistema de Autenticação Dinâmica

O sistema implementa autenticação automática inteligente:

1. **Verificação automática**: Endpoints protegidos verificam se existe integração válida
2. **Token automático**: Se houver token válido armazenado, usa automaticamente
3. **Fallback para Bearer**: Se enviado header `Authorization: Bearer <token>`, usa esse
4. **Redirecionamento**: Se não houver autenticação, retorna instruções para login

### Como usar:

```bash
# 1. Verificar status da autenticação
curl http://localhost:3000/auth/status

# 2. Se não autenticado, fazer login
curl http://localhost:3000/auth/login

# 3. Usar endpoints normalmente (token automático)
curl http://localhost:3000/user/me
curl http://localhost:3000/ads/ad-accounts

# Ou usar Bearer token explicitamente
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/user/me
```

### Anúncios (Requer Bearer Token)
- `GET /ads/ad-accounts` - Lista contas de anúncios

## 🔐 Autenticação

### Como obter um token:

1. **Iniciar autenticação:**
   ```
   GET http://localhost:3000/auth/login
   ```

2. **Autorizar** o app no Meta

3. **Receber tokens** no callback:
   ```json
   {
     "message": "Meta conectado com sucesso 🚀",
     "user": {
       "integrations": [
         {
           "accessToken": "EAAXMcAS4M9Q...",
           "expiresAt": "2026-03-23T..."
         }
       ]
     }
   }
   ```

4. **Usar o token** nas requisições:
   ```
   Authorization: Bearer EAAXMcAS4M9Q...
   ```

## 🛠️ Desenvolvimento

### Estrutura do Projeto

```
src/
├── app.js                 # Configuração Express
├── server.js             # Inicialização do servidor
├── core/
│   ├── config/
│   │   ├── database.js   # Armazenamento JSON (fs)
│   │   ├── env.js        # Validação de variáveis
│   │   └── api.js        # Configuração API Meta
│   └── middleware/
│       └── authMiddleware.js # Autenticação Bearer
└── modules/meta/
    ├── controllers/      # Lógica dos endpoints
    ├── services/         # Chamadas para APIs externas
    ├── routes/          # Definição das rotas
    └── repositories/    # Acesso aos dados JSON
```

### Scripts Disponíveis

- `npm start` - Inicia em modo produção
- `npm run dev` - Inicia com nodemon (desenvolvimento)
- `npm run check-storage` - Verifica armazenamento JSON
- `npm test` - Executa testes (quando implementados)

## 📝 Notas

- Tokens de acesso têm validade de ~60 dias
- Implemente renovação automática de tokens para produção
- Configure CORS para seu frontend
- Use HTTPS em produção

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.