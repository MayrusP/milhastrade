# 🚀 Comandos para Deploy - Guia Rápido

## ✅ Passo 1: Configurar PowerShell (Windows)

**Execute como Administrador:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## ✅ Passo 2: Instalar Dependências

```bash
cd backend
npm install
```

---

## ✅ Passo 3: Gerar Prisma Client

```bash
npx prisma generate
```

---

## ✅ Passo 4: Executar Migrations (Criar Tabelas)

```bash
npx prisma migrate dev --name init_postgres
```

Se der erro, tente:
```bash
npx prisma db push
```

---

## ✅ Passo 5: Popular Banco de Dados

```bash
node deploy-setup.js
```

---

## ✅ Passo 6: Testar Localmente

```bash
node server-simple.js
```

Acesse: http://localhost:5000/api/health

---

## ✅ Passo 7: Criar Repositório Git

```bash
# Na pasta raiz do projeto
git init
git add .
git commit -m "Deploy para AWS"
```

**Criar repositório no GitHub:**
1. Acesse: https://github.com/new
2. Nome: `milhastrade`
3. Private: ✅
4. Create repository

**Enviar código:**
```bash
git remote add origin https://github.com/SEU-USUARIO/milhastrade.git
git branch -M main
git push -u origin main
```

---

## ✅ Passo 8: Criar EC2 na AWS

1. Acesse: https://console.aws.amazon.com/ec2
2. Launch instance
3. Configure:
   - Name: `milhastrade-backend`
   - AMI: **Amazon Linux 2023**
   - Instance type: **t3.small** (ou t3.micro)
   - Key pair: **Create new** → `milhastrade-key.pem` (baixe!)
   - Security group:
     - SSH (22): My IP
     - HTTP (80): Anywhere
     - HTTPS (443): Anywhere
     - Custom TCP (5000): Anywhere
   - Storage: 20 GB
4. Launch instance

---

## ✅ Passo 9: Conectar ao EC2

**Windows (PowerShell):**
```powershell
cd Downloads
ssh -i milhastrade-key.pem ec2-user@[IP-PUBLICO-EC2]
```

**Pegar IP público:**
- Console EC2 → Clique na instância → Copie "Public IPv4 address"

---

## ✅ Passo 10: Configurar EC2

**No servidor EC2:**
```bash
# Atualizar sistema
sudo dnf update -y

# Instalar Node.js
sudo dnf install nodejs npm -y
node --version

# Instalar PM2
sudo npm install -g pm2

# Instalar Git
sudo dnf install git -y
```

---

## ✅ Passo 11: Clonar Projeto no EC2

```bash
# Clonar repositório
git clone https://github.com/SEU-USUARIO/milhastrade.git
cd milhastrade/backend

# Instalar dependências
npm install

# Criar arquivo .env
nano .env
```

**Cole o conteúdo do `.env.production`:**
```env
NODE_ENV=production
PORT=5000
DATABASE_URL="postgresql://milhastrade_adm:Mayrus05011995@milhastrade-db.cohwawekwiia.us-east-1.rds.amazonaws.com:5432/milhastrade"
JWT_SECRET=a7f8d9e6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8
JWT_EXPIRES_IN=7d
AWS_REGION=us-east-1
AWS_S3_BUCKET=milhastrade-uploads-mayrus
AWS_ACCESS_KEY_ID=AKIAR6E3J5J5U5JBMRE7
AWS_SECRET_ACCESS_KEY=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
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,https://seu-dominio.com
```

**Salvar:** Ctrl+X, Y, Enter

---

## ✅ Passo 12: Executar Migrations no EC2

```bash
npx prisma generate
npx prisma migrate deploy
node deploy-setup.js
```

---

## ✅ Passo 13: Iniciar Servidor com PM2

```bash
# Testar manualmente primeiro
node server-simple.js
# Se funcionar, Ctrl+C

# Iniciar com PM2
pm2 start server-simple.js --name milhastrade-api
pm2 save
pm2 startup
# Copiar e executar o comando que aparecer
```

---

## ✅ Passo 14: Verificar Status

```bash
pm2 status
pm2 logs milhastrade-api
```

---

## ✅ Passo 15: Testar API

**No navegador:**
```
http://[IP-EC2]:5000/api/health
```

**Testar login:**
```bash
curl -X POST http://[IP-EC2]:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"mayrus@admin.com","password":"senha123"}'
```

---

## 🎉 Backend no Ar!

**URLs:**
- API: `http://[IP-EC2]:5000/api`
- Health: `http://[IP-EC2]:5000/api/health`

**Credenciais:**
- Admin: mayrus@admin.com / senha123
- Usuário: teste@teste.com / senha123

---

## 🔧 Comandos Úteis PM2

```bash
pm2 list                    # Ver processos
pm2 logs milhastrade-api    # Ver logs
pm2 restart milhastrade-api # Reiniciar
pm2 stop milhastrade-api    # Parar
pm2 delete milhastrade-api  # Remover
```

---

## 🚨 Troubleshooting

### Erro de conexão com RDS
```bash
# Verificar se consegue conectar
psql -h milhastrade-db.cohwawekwiia.us-east-1.rds.amazonaws.com -U milhastrade_adm -d milhastrade
```

### PM2 não inicia
```bash
pm2 logs milhastrade-api --lines 100
```

### Atualizar código
```bash
cd milhastrade/backend
git pull
npm install
npx prisma generate
pm2 restart milhastrade-api
```

---

**Tempo estimado:** 1-2 horas  
**Custo:** $0 (free tier) ou ~$30/mês
