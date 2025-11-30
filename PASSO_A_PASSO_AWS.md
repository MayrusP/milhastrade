# 🚀 Passo a Passo: Migração para AWS

**Status:** Você está logado na AWS ✅  
**Próximo passo:** Seguir este guia na ordem

---

## 📋 FASE 1: Preparar Projeto Localmente (30 min)

### ✅ Passo 1.1: Instalar Dependências Necessárias

```bash
cd backend
npm install jsonwebtoken bcryptjs express-rate-limit helmet @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### ✅ Passo 1.2: Criar Utilitário JWT Real

Vou criar os arquivos necessários para você agora...

---

## 📋 FASE 2: Criar Banco de Dados na AWS (15 min)

### ✅ Passo 2.1: Criar RDS PostgreSQL

1. **Acesse o Console AWS:** https://console.aws.amazon.com
2. **Busque por "RDS"** na barra de pesquisa
3. **Clique em "Create database"**
4. **Configure:**
   - Engine: **PostgreSQL**
   - Version: **15.x** (mais recente)
   - Templates: **Free tier** ✅ (para começar sem custo)
   - DB instance identifier: `milhastrade-db`
   - Master username: `milhastrade_admin`
   - Master password: **Crie uma senha forte** (anote!)
   - DB instance class: **db.t3.micro** (free tier)
   - Storage: **20 GB** (SSD)
   - Public access: **Yes** ✅ (temporariamente)
   - VPC security group: **Create new**
   - Initial database name: `milhastrade`
5. **Clique em "Create database"**
6. **Aguarde 5-10 minutos** até status ficar "Available"

### ✅ Passo 2.2: Configurar Acesso ao Banco

1. **Clique no banco criado**
2. **Vá em "Connectivity & security"**
3. **Copie o "Endpoint"** (algo como: milhastrade-db.xxxxx.us-east-1.rds.amazonaws.com)
4. **Clique no Security Group**
5. **Editar Inbound Rules:**
   - Type: **PostgreSQL**
   - Port: **5432**
   - Source: **My IP** (seu IP atual)
   - Clique em **Save rules**

### ✅ Passo 2.3: Testar Conexão (Opcional)

```bash
# Se tiver PostgreSQL instalado localmente
psql -h milhastrade-db.xxxxx.us-east-1.rds.amazonaws.com -U milhastrade_admin -d milhastrade
# Digite a senha quando solicitado
# Se conectar, digite \q para sair
```

---

## 📋 FASE 3: Criar Buckets S3 (10 min)

### ✅ Passo 3.1: Criar Bucket para Uploads

1. **Busque por "S3"** no console AWS
2. **Clique em "Create bucket"**
3. **Configure:**
   - Bucket name: `milhastrade-uploads-[SEU-NOME]` (deve ser único globalmente)
   - Region: **us-east-1** (ou sua preferência)
   - Block all public access: **✅ Deixe marcado** (segurança)
   - Bucket Versioning: **Enable** (recomendado)
   - Encryption: **Enable** (SSE-S3)
4. **Clique em "Create bucket"**

### ✅ Passo 3.2: Configurar CORS do Bucket

1. **Clique no bucket criado**
2. **Vá em "Permissions"**
3. **Role até "Cross-origin resource sharing (CORS)"**
4. **Clique em "Edit"**
5. **Cole este JSON:**

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["http://localhost:5173", "https://seu-dominio.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

6. **Clique em "Save changes"**

### ✅ Passo 3.3: Criar Usuário IAM para S3

1. **Busque por "IAM"** no console AWS
2. **Clique em "Users" → "Create user"**
3. **User name:** `milhastrade-s3-user`
4. **Clique em "Next"**
5. **Attach policies directly:**
   - Busque e marque: **AmazonS3FullAccess**
6. **Clique em "Next" → "Create user"**
7. **Clique no usuário criado**
8. **Vá em "Security credentials"**
9. **Clique em "Create access key"**
10. **Escolha:** "Application running outside AWS"
11. **Clique em "Next" → "Create access key"**
12. **⚠️ IMPORTANTE: Copie e salve:**
    - **Access key ID:** AKIA...
    - **Secret access key:** (só aparece uma vez!)

---

## 📋 FASE 4: Criar Servidor EC2 (15 min)

### ✅ Passo 4.1: Criar Instância EC2

1. **Busque por "EC2"** no console AWS
2. **Clique em "Launch instance"**
3. **Configure:**
   - Name: `milhastrade-backend`
   - AMI: **Amazon Linux 2023** (recomendado)
   - Instance type: **t3.small** (ou t3.micro para free tier)
   - Key pair: **Create new key pair**
     - Name: `milhastrade-key`
     - Type: RSA
     - Format: .pem
     - **⚠️ Baixe e salve o arquivo .pem**
   - Network settings:
     - Auto-assign public IP: **Enable**
     - Create security group: **Yes**
     - Security group name: `milhastrade-backend-sg`
     - **Adicionar regras:**
       - SSH (22): My IP
       - HTTP (80): Anywhere (0.0.0.0/0)
       - HTTPS (443): Anywhere (0.0.0.0/0)
       - Custom TCP (5000): Anywhere (0.0.0.0/0)
   - Storage: **20 GB** gp3
4. **Clique em "Launch instance"**
5. **Aguarde 2-3 minutos** até status "Running"

### ✅ Passo 4.2: Conectar ao EC2

**Windows (usando PowerShell):**
```powershell
# Navegar até onde está o arquivo .pem
cd Downloads

# Dar permissão ao arquivo (se necessário)
icacls milhastrade-key.pem /inheritance:r
icacls milhastrade-key.pem /grant:r "$($env:USERNAME):(R)"

# Conectar via SSH
ssh -i milhastrade-key.pem ec2-user@[IP-PUBLICO-DO-EC2]
```

**Pegar o IP público:**
- No console EC2, clique na instância
- Copie o "Public IPv4 address"

---

## 📋 FASE 5: Configurar EC2 (20 min)

### ✅ Passo 5.1: Instalar Node.js

```bash
# Atualizar sistema
sudo dnf update -y

# Instalar Node.js 18
sudo dnf install nodejs npm -y

# Verificar instalação
node --version  # Deve mostrar v18.x
npm --version   # Deve mostrar v9.x
```

### ✅ Passo 5.2: Instalar PM2

```bash
sudo npm install -g pm2
pm2 --version
```

### ✅ Passo 5.3: Instalar PostgreSQL Client

```bash
sudo dnf install postgresql15 -y
psql --version
```

### ✅ Passo 5.4: Instalar Git

```bash
sudo dnf install git -y
git --version
```

---

## 📋 FASE 6: Preparar Código para Deploy (30 min)

### ✅ Passo 6.1: Criar Repositório Git

**Opção A: GitHub (Recomendado)**
1. Acesse https://github.com
2. Clique em "New repository"
3. Nome: `milhastrade`
4. Private: ✅
5. Create repository

**No seu computador local:**
```bash
# Na pasta do projeto
git init
git add .
git commit -m "Preparar para deploy AWS"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/milhastrade.git
git push -u origin main
```

**Opção B: Usar SCP (Transferir direto)**
```bash
# Comprimir projeto
tar -czf milhastrade.tar.gz backend/ frontend/

# Enviar para EC2
scp -i milhastrade-key.pem milhastrade.tar.gz ec2-user@[IP-EC2]:~
```

### ✅ Passo 6.2: Atualizar .env para Produção

**No seu computador, crie:** `backend/.env.production`

```env
NODE_ENV=production
PORT=5000

# Database - SUBSTITUIR COM SEUS DADOS
DATABASE_URL="postgresql://milhastrade_admin:SUA_SENHA@milhastrade-db.xxxxx.us-east-1.rds.amazonaws.com:5432/milhastrade"

# JWT - GERAR NOVO SECRET
JWT_SECRET=COLE_AQUI_O_SECRET_GERADO
JWT_EXPIRES_IN=7d

# AWS S3 - SUBSTITUIR COM SUAS CREDENCIAIS
AWS_REGION=us-east-1
AWS_S3_BUCKET=milhastrade-uploads-SEU-NOME
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# Frontend URL (atualizar depois)
FRONTEND_URL=http://localhost:5173
```

**Gerar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📋 FASE 7: Deploy Backend (30 min)

### ✅ Passo 7.1: Clonar/Extrair Projeto no EC2

**Se usou Git:**
```bash
# No EC2
git clone https://github.com/SEU-USUARIO/milhastrade.git
cd milhastrade/backend
```

**Se usou SCP:**
```bash
# No EC2
tar -xzf milhastrade.tar.gz
cd backend
```

### ✅ Passo 7.2: Instalar Dependências

```bash
npm install
```

### ✅ Passo 7.3: Configurar .env

```bash
nano .env
# Cole o conteúdo do .env.production
# Ctrl+X, Y, Enter para salvar
```

### ✅ Passo 7.4: Migrar para PostgreSQL

```bash
# Atualizar schema.prisma
nano prisma/schema.prisma
# Mudar: provider = "sqlite" para provider = "postgresql"
# Ctrl+X, Y, Enter

# Executar migrations
npx prisma migrate dev --name init_postgres
npx prisma generate

# Popular dados iniciais
node recreate-users.js
```

### ✅ Passo 7.5: Testar Servidor

```bash
# Testar manualmente
node server-simple.js
# Se funcionar, Ctrl+C para parar

# Iniciar com PM2
pm2 start server-simple.js --name milhastrade-api
pm2 save
pm2 startup
# Copiar e executar o comando que aparecer
```

### ✅ Passo 7.6: Verificar Status

```bash
pm2 status
pm2 logs milhastrade-api
```

---

## 📋 FASE 8: Testar API (10 min)

### ✅ Passo 8.1: Testar Endpoints

**No seu navegador:**
```
http://[IP-EC2]:5000/api/health
```

**Deve retornar:**
```json
{
  "status": "OK",
  "timestamp": "..."
}
```

**Testar login:**
```bash
curl -X POST http://[IP-EC2]:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"mayrus@admin.com","password":"senha123"}'
```

---

## 📋 FASE 9: Deploy Frontend (20 min)

### ✅ Passo 9.1: Atualizar URL da API

**No seu computador:**
```bash
cd frontend
```

**Editar:** `src/services/api.ts` (ou onde está a URL da API)
```typescript
const API_URL = 'http://[IP-EC2]:5000/api';
```

### ✅ Passo 9.2: Build do Frontend

```bash
npm run build
# Gera pasta dist/
```

### ✅ Passo 9.3: Criar Bucket S3 para Frontend

1. **Console S3 → Create bucket**
2. **Nome:** `milhastrade-frontend-[SEU-NOME]`
3. **Region:** us-east-1
4. **⚠️ DESMARCAR "Block all public access"** (frontend precisa ser público)
5. **Create bucket**

### ✅ Passo 9.4: Configurar Bucket como Website

1. **Clique no bucket**
2. **Properties → Static website hosting**
3. **Enable**
4. **Index document:** `index.html`
5. **Error document:** `index.html`
6. **Save changes**

### ✅ Passo 9.5: Adicionar Bucket Policy

1. **Permissions → Bucket policy**
2. **Edit → Cole:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::milhastrade-frontend-SEU-NOME/*"
    }
  ]
}
```

3. **Save changes**

### ✅ Passo 9.6: Upload dos Arquivos

```bash
# Instalar AWS CLI (se não tiver)
# Windows: https://aws.amazon.com/cli/

# Configurar credenciais
aws configure
# Access Key ID: [do usuário IAM]
# Secret Access Key: [do usuário IAM]
# Region: us-east-1
# Output: json

# Upload
aws s3 sync dist/ s3://milhastrade-frontend-SEU-NOME --delete
```

### ✅ Passo 9.7: Acessar Frontend

**URL do website:**
```
http://milhastrade-frontend-SEU-NOME.s3-website-us-east-1.amazonaws.com
```

---

## 🎉 PRONTO! Seu site está no ar!

### ✅ URLs Finais

- **Frontend:** http://milhastrade-frontend-SEU-NOME.s3-website-us-east-1.amazonaws.com
- **Backend:** http://[IP-EC2]:5000/api
- **Banco:** milhastrade-db.xxxxx.us-east-1.rds.amazonaws.com

### ✅ Credenciais de Teste

Conforme arquivo USUARIOS.md:
- **Admin:** mayrus@admin.com / senha123
- **Usuário:** teste@teste.com / senha123

---

## 🔧 Comandos Úteis

### PM2 (Gerenciar Backend)
```bash
pm2 list                    # Ver processos
pm2 logs milhastrade-api    # Ver logs
pm2 restart milhastrade-api # Reiniciar
pm2 stop milhastrade-api    # Parar
```

### Atualizar Código
```bash
# No EC2
cd milhastrade/backend
git pull
npm install
npx prisma generate
pm2 restart milhastrade-api
```

### Ver Logs
```bash
pm2 logs milhastrade-api --lines 100
```

---

## 🚨 Troubleshooting

### Problema: Não consigo conectar ao RDS
- Verificar Security Group permite seu IP
- Verificar endpoint está correto no .env
- Testar com: `psql -h endpoint -U user -d db`

### Problema: PM2 não inicia
- Ver logs: `pm2 logs`
- Verificar .env está correto
- Testar manual: `node server-simple.js`

### Problema: Frontend não carrega
- Verificar bucket policy está público
- Verificar arquivos foram enviados: `aws s3 ls s3://bucket-name`
- Verificar URL da API no código

---

## 📞 Próximos Passos (Opcional)

1. **Domínio Próprio:** Configurar Route 53
2. **HTTPS:** Configurar CloudFront + ACM
3. **Email:** Configurar AWS SES
4. **Monitoramento:** CloudWatch
5. **Backups:** Automated backups RDS

---

**Tempo Total Estimado:** 3-4 horas  
**Custo:** $0 (free tier) ou ~$30-50/mês

**Boa sorte! 🚀**
