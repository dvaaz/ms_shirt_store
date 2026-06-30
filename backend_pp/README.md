# Backend PP — API de Pedidos e Pagamentos

API REST para gerenciamento de **pedidos** e **pagamentos** da SShirt-Store, construída com [NestJS](https://nestjs.com/), [Prisma ORM](https://www.prisma.io/) e banco de dados MySQL -- (na producao a versao 5.7.30).

## Tecnologias

- **NestJS** (Node.js + TypeScript) — framework principal, sobre o adapter Express
- **Prisma ORM** — acesso ao banco de dados (com adapter MariaDB)
- **MySQL / MariaDB** — banco de dados relacional
- **Swagger / OpenAPI** — documentação interativa da API
- **uuidv7** — geração de identificadores únicos 
- **got** — cliente HTTP para integrações externas
- **Jest** — testes unitários e end-to-end
- **ESLint + Prettier** — padronização e qualidade de código

## Estrutura do projeto

```
backend_pp/
├── prisma/
│   └── schema.prisma          # Definição das tabelas/modelos do banco
├── prisma.config.ts           # Configuração do Prisma
├── src/
│   ├── main.ts                # Ponto de entrada da aplicação
│   ├── app.module.ts          # Módulo raiz
│   ├── app.controller.ts
│   ├── app.service.ts
│   ├── database/
│   │   └── prisma/            # Módulo/serviço de acesso ao Prisma
│   ├── pedido/                # Pedidos (orders)
│   ├── item_pedido/           # Itens do pedido
│   ├── pagamento/             # Pagamentos
│   ├── metodos_de_pagamento/  # Métodos de pagamento (PIX, boleto, cartão)
│   ├── status_pagamento/      # Status de pagamento
│   ├── status_pedido/         # Status do pedido
│   └── endereco_de_entrega/   # Endereços de entrega
├── package.json
└── tsconfig.json
```

Cada módulo de domínio (`pedido`, `pagamento`, etc.) segue o padrão NestJS: `*.module.ts`, `*.controller.ts`, `*.service.ts` e uma pasta `dto/` com os DTOs de entrada/saída.

## Modelo de dados (Prisma)

Principais entidades definidas em `prisma/schema.prisma`:

- **pedido** — pedido do usuário, vinculado a um endereço de entrega e a um status
- **item_pedido** — itens (produtos) que compõem um pedido
- **pagamento** — pagamento vinculado a um pedido, método e status de pagamento
- **metodos_de_pagamento** — tabela de métodos disponíveis (PIX, boleto bancário, cartão de crédito)
- **status_pagamento** — tabela de status possíveis do pagamento (aguardando autorização, aprovado, rejeitado)
- **status_pedido** — tabela de status possíveis do pedido (pendente, aceito, etc.)
- **endereco_de_entrega** — endereços de entrega cadastrados pelo usuário

## Principais rotas da API

> A maioria das rotas autenticadas espera o header `userId` com o identificador do usuário (autenticação delegada a um serviço/gateway externo).

### Pedido
| Método | Rota | Descrição |
|---|---|---|
| POST | `/pedido` | Cria um novo pedido |
| GET | `/pedido` | Lista os pedidos do usuário |
| GET | `/pedido/full/:pedidoId` | Detalhes completos de um pedido (itens + endereço) |
| GET | `/pedido/findone/:id` | Busca um pedido por id |
| GET | `/pedido/validaCompra/:id` | Valida se a compra foi concluída/entregue |
| PATCH | `/pedido/update-endereco/:id` | Atualiza o endereço de entrega do pedido |
| PATCH | `/pedido/update-status/:id` | Avança o status do pedido |

### Pagamento
| Método | Rota | Descrição |
|---|---|---|
| POST | `/pagamento` | Cria um pagamento |
| GET | `/pagamento/all` | Lista todos os pagamentos |
| GET | `/pagamento/:id/status` | Consulta o status de um pagamento |
| PATCH | `/pagamento/:id/efetuar` | Efetiva/finaliza um pagamento |

### Item do pedido
| Método | Rota | Descrição |
|---|---|---|
| GET | `/item-pedido/:pedidoId` | Lista os itens de um pedido |
| PATCH | `/item-pedido/:id` | Atualiza um item |
| DELETE | `/item-pedido/:id` | Remove um item |

### Endereço de entrega
| Método | Rota | Descrição |
|---|---|---|
| POST | `/endereco` | Cadastra um endereço |
| GET | `/endereco` | Lista todos os endereços |
| GET | `/endereco/usuario` | Lista os endereços do usuário autenticado |
| GET | `/endereco/:id` | Busca um endereço específico |
| PATCH | `/endereco/:id` | Atualiza um endereço |
| DELETE | `/endereco/:id` | Remove um endereço |

### Métodos e status (somente leitura)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/metodos_de_pagamento` | Lista os métodos de pagamento |
| GET | `/status_pedido` | Lista os status de pedido |
| GET | `/status_pedido/:id` | Busca um status de pedido |

Cada módulo também expõe uma rota de health check (`GET /<modulo>/h`).

A documentação interativa completa (Swagger) fica disponível em **`/swagger`** após iniciar a aplicação (JSON em `/api-json`).

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis (sem valores sensíveis aqui):

- `DATABASE_URL` — string de conexão com o banco MySQL/MariaDB
- `DATABASE_HOST` — host do banco de dados
- `DATABASE_PORT` — porta do banco de dados
- `DATABASE_PASSWORD` — senha do banco de dados
- `DATABASE_USER` — usuário do banco de dados
- `DATABASE_SCHEMA` — schema do banco de dados
- `PORT` — porta em que a aplicação irá rodar (padrão: `3080`)

### Exemplo de `.env` para comunicação com o banco de dados externo

```env
DATABASE_URL="mysql://2026User:StrongPassword%40123@site.database.br:3306/DatabaseSchema_Dvaaz"
DATABASE_HOST="site.database.br"
DATABASE_PORT=3306
DATABASE_PASSWORD="StrongPassword@123"
DATABASE_USER="2026User"
DATABASE_SCHEMA="DatabaseSchema_Dvaaz"
PORT=3080
```


## Como rodar o projeto

### Pré-requisitos

- Node.js (versão compatível com TypeScript 5.7 / NestJS 11)
- Um banco MySQL ou MariaDB acessível
- npm

### Passo a passo

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure o arquivo `.env` (veja a seção [Variáveis de ambiente](#variáveis-de-ambiente)).

3. Gere o client do Prisma e aplique o schema ao banco:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```
   (ou `npx prisma db push` em ambiente de desenvolvimento, caso ainda não existam migrations)

4. Inicie a aplicação:
   ```bash
   # modo desenvolvimento (com watch)
   npm run start:dev

   # modo debug
   npm run start:debug

   # build de produção
   npm run build
   npm run start:prod
   ```

5. Acesse a documentação da API em `http://localhost:<PORT>/swagger`.

### Outros comandos úteis

```bash
npm run lint        # análise e correção de lint
npm run format      # formatação com Prettier
npm run test         # testes unitários
npm run test:e2e     # testes end-to-end
npm run test:cov     # cobertura de testes
```

## Integração com o frontend

O CORS está configurado para aceitar requisições da origem `http://localhost:5173` (ambiente de desenvolvimento do frontend), com os métodos `GET, POST, PUT, DELETE, PATCH` e os headers `Content-Type, Authorization` liberados.
