# Plataforma de Troca de Milhas

Uma plataforma web para compra, venda e troca de milhas aéreas entre usuários.

## Estrutura do Projeto

```
plataforma-troca-milhas/
├── frontend/          # Aplicação React (TypeScript)
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── services/      # Serviços de API
│   │   ├── hooks/         # Hooks customizados
│   │   ├── types/         # Definições de tipos TypeScript
│   │   └── ...
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── backend/           # API Node.js (TypeScript)
│   ├── src/
│   │   ├── controllers/   # Controladores da API
│   │   ├── services/      # Lógica de negócio
│   │   ├── middleware/    # Middlewares Express
│   │   ├── routes/        # Definições de rotas
│   │   ├── utils/         # Utilitários
│   │   └── index.ts       # Ponto de entrada
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.js
└── README.md
```

## Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca para interfaces de usuário
- **TypeScript** - Superset tipado do JavaScript
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário
- **React Router** - Roteamento para React
- **Axios** - Cliente HTTP

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **TypeScript** - Superset tipado do JavaScript
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação via tokens
- **bcrypt** - Hash de senhas
- **Zod** - Validação de esquemas

### Ferramentas de Desenvolvimento
- **ESLint** - Linter para JavaScript/TypeScript
- **Prettier** - Formatador de código
- **Jest** - Framework de testes
- **Nodemon** - Auto-reload para desenvolvimento

## Configuração do Ambiente

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn
- PostgreSQL

### Instalação

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd plataforma-troca-milhas
   ```

2. **Configure o Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

3. **Configure o Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure o Banco de Dados**
   ```bash
   cd backend
   # Gerar cliente Prisma
   npm run db:generate
   
   # Executar migrações (se usando PostgreSQL configurado)
   npm run db:migrate
   
   # Popular dados iniciais
   npm run db:seed
   ```

### Executando o Projeto

1. **Inicie o Backend**
   ```bash
   cd backend
   npm run dev
   ```
   O servidor estará disponível em `http://localhost:5000`
   
   **Endpoints disponíveis:**
   - `GET /api/health` - Health check
   - `POST /api/auth/register` - Registro de usuário
   - `POST /api/auth/login` - Login
   - `GET /api/offers` - Listar ofertas
   - `GET /api/offers/airlines` - Listar companhias aéreas

2. **Inicie o Frontend**
   ```bash
   cd frontend
   npm run dev
   ```
   A aplicação estará disponível em `http://localhost:3000`

### Primeiro Acesso

1. Acesse `http://localhost:3000`
2. Clique em "Cadastrar" para criar uma conta
3. Faça login com suas credenciais
4. Explore o marketplace ou crie sua primeira oferta

## Scripts Disponíveis

### Frontend
- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run lint` - Executa o linter
- `npm run format` - Formata o código com Prettier

### Backend
- `npm run dev` - Inicia o servidor em modo desenvolvimento
- `npm run build` - Compila TypeScript para JavaScript
- `npm start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter
- `npm run format` - Formata o código com Prettier
- `npm test` - Executa os testes

## Funcionalidades Implementadas

✅ **Sistema de Autenticação**
- Registro e login de usuários
- Autenticação JWT
- Proteção de rotas
- Gerenciamento de sessão

✅ **Marketplace de Milhas**
- Listagem de ofertas com filtros avançados
- Busca por companhia aérea, tipo, preço e quantidade
- Ordenação por diferentes critérios
- Paginação de resultados

✅ **Gestão de Ofertas**
- Criação de ofertas de venda e troca
- Edição e remoção de ofertas próprias
- Visualização de ofertas por usuário
- Status de ofertas (ativa, vendida, cancelada)

✅ **Sistema de Transações**
- Início de transações entre usuários
- Fluxo de status (pendente → confirmada → concluída)
- Histórico completo de transações
- Estatísticas do usuário

✅ **Dashboard do Usuário**
- Painel com estatísticas pessoais
- Gerenciamento de ofertas
- Histórico de transações
- Ações rápidas

✅ **Interface Responsiva**
- Design moderno com Tailwind CSS
- Compatível com dispositivos móveis
- Componentes reutilizáveis
- Feedback visual para ações do usuário

## Contribuição

Este projeto segue as especificações definidas no documento de requisitos e design. Consulte os arquivos em `.kiro/specs/plataforma-troca-milhas/` para mais detalhes sobre os requisitos e arquitetura do sistema.