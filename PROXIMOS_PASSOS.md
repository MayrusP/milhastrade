# 🎯 Próximos Passos - Deploy AWS

## ✅ O que já está pronto:

- ✅ Banco RDS PostgreSQL criado
- ✅ Bucket S3 criado: `milhastrade-uploads-mayrus`
- ✅ Usuário IAM criado com credenciais
- ✅ Código atualizado com JWT real
- ✅ Schema Prisma configurado para PostgreSQL
- ✅ Arquivos `.env` e `.env.production` configurados
- ✅ Script de deploy criado

---

## 🚀 AGORA FAÇA ISSO (na ordem):

### 1️⃣ Configurar PowerShell (Windows)

**Abra PowerShell como Administrador** e execute:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### 2️⃣ Instalar Dependências e Testar Localmente

**Abra o terminal normal** na pasta do projeto:

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init_postgres
node deploy-setup.js
node server-simple.js
```

**Teste no navegador:**
- http://localhost:5000/api/health

**Se funcionar, pressione Ctrl+C e continue!**

---

### 3️⃣ Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Nome: `milhastrade`
3. Private: ✅
4. **NÃO** marque "Initialize with README"
5. Create repository

**No terminal:**
```bash
# Na pasta raiz do projeto (não dentro de backend!)
cd ..
git init
git add .
git commit -m "Deploy para AWS"
git remote add origin https://github.com/SEU-USUARIO/milhastrade.git
git branch -M main
git push -u origin main
```

---

### 4️⃣ Criar Servidor EC2

1. Acesse: https://console.aws.amazon.com/ec2
2. Clique em **"Launch instance"**
3. Configure:
   - **Name:** `milhastrade-backend`
   - **AMI:** Amazon Linux 2023
   - **Instance type:** t3.small (ou t3.micro para free tier)
   - **Key pair:** Create new key pair
     - Name: `milhastrade-key`
     - Type: RSA
     - Format: .pem
     - **⚠️ BAIXE O ARQUIVO .pem**
   - **Network settings:**
     - Auto-assign public IP: Enable
     - Create security group: Yes
     - **Adicionar regras:**
       - SSH (22): My IP
       - HTTP (80): Anywhere (0.0.0.0/0)
       - HTTPS (443): Anywhere (0.0.0.0/0)
       - Custom TCP (5000): Anywhere (0.0.0.0/0)
   - **Storage:** 20 GB gp3
4. **Launch instance**
5. Aguarde 2-3 minutos até status "Running"
6. **Copie o IP público** da instância

---

### 5️⃣ Conectar ao EC2 via SSH

**Windows (PowerShell):**
```powershell
cd Downloads
ssh -i milhastrade-key.pem ec2-user@[COLE-O-IP-PUBLICO-AQUI]
```

**Se der erro de permissão:**
```powershell
icacls milhastrade-key.pem /inheritance:r
icacls milhastrade-key.pem /grant:r "$($env:USERNAME):(R)"
```

---

### 6️⃣ Configurar o Servidor EC2

**Dentro do EC2 (via SSH):**

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

# Clonar projeto
git clone https://github.com/SEU-USUARIO/milhastrade.git
cd milhastrade/backend

# Instalar dependências
npm install

# Criar arquivo .env
nano .env
```

**Cole este conteúdo no .env:**
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
CORS_ORIGINS=http://localhost:5173
```

**Salvar:** Ctrl+X, depois Y, depois Enter

---

### 7️⃣ Executar Migrations e Popular Banco

```bash
npx prisma generate
npx prisma migrate deploy
node deploy-setup.js
```

---

### 8️⃣ Iniciar o Servidor

```bash
# Testar manualmente
node server-simple.js
# Se funcionar, pressione Ctrl+C

# Iniciar com PM2
pm2 start server-simple.js --name milhastrade-api
pm2 save
pm2 startup
# Copiar e executar o comando que aparecer
```

---

### 9️⃣ Verificar se Está Funcionando

**No navegador:**
```
http://[IP-DO-EC2]:5000/api/health
```

**Deve retornar:**
```json
{
  "status": "OK",
  "message": "Plataforma de Troca de Milhas API is running",
  "timestamp": "..."
}
```

---

## 🎉 PRONTO! Backend no Ar!

**URLs:**
- API: `http://[IP-DO-EC2]:5000/api`
- Health: `http://[IP-DO-EC2]:5000/api/health`

**Credenciais de teste:**
- Admin: mayrus@admin.com / senha123
- Usuário: teste@teste.com / senha123
- Vendedor: vendedor@teste.com / senha123

---

## 📱 Próximo: Deploy do Frontend

Depois que o backend estiver funcionando, vamos fazer o deploy do frontend no S3 + CloudFront.

**Me avise quando chegar neste ponto!**

---

## 🔧 Comandos Úteis

### Ver logs do servidor
```bash
pm2 logs milhastrade-api
```

### Reiniciar servidor
```bash
pm2 restart milhastrade-api
```

### Ver status
```bash
pm2 status
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

## 🚨 Se Algo Der Errado

### Erro ao conectar no RDS
Verifique o Security Group do RDS:
1. Console RDS → Clique no banco
2. Connectivity & security → Security group
3. Inbound rules → Adicionar regra:
   - Type: PostgreSQL
   - Port: 5432
   - Source: Security group do EC2

### PM2 não inicia
```bash
pm2 logs milhastrade-api --lines 100
```

### Testar conexão com banco
```bash
psql -h milhastrade-db.cohwawekwiia.us-east-1.rds.amazonaws.com -U milhastrade_adm -d milhastrade
# Senha: Mayrus05011995
```

---

**Tempo estimado:** 1-2 horas  
**Dificuldade:** Intermediária  
**Custo:** $0 (free tier) ou ~$30/mês

**Boa sorte! 🚀**
