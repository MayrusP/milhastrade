# 🚀 MilhasTrade - Plataforma de Troca de Milhas

## 📋 Informações do Deploy

### 🗄️ Banco de Dados (AWS RDS)
- **Endpoint:** milhastrade-db.cohwawekwiia.us-east-1.rds.amazonaws.com
- **Port:** 5432
- **Database:** milhastrade
- **Username:** milhastrade_adm

### ☁️ AWS S3
- **Bucket:** milhastrade-uploads-mayrus
- **Region:** us-east-1

### 🔑 Credenciais de Teste
- **Admin:** mayrus@admin.com / senha123
- **Usuário:** teste@teste.com / senha123
- **Vendedor:** vendedor@teste.com / senha123

---

## 🚀 Deploy no EC2

### 1. Conectar ao EC2
```bash
ssh -i milhastrade-key.pem ec2-user@[IP-EC2]
```

### 2. Instalar Dependências
```bash
sudo dnf update -y
sudo dnf install nodejs npm git -y
sudo npm install -g pm2
```

### 3. Clonar Projeto
```bash
git clone https://github.com/SEU-USUARIO/milhastrade.git
cd milhastrade/backend
npm install
```

### 4. Configurar .env
```bash
nano .env
```

Cole o conteúdo do arquivo `.env.production`

### 5. Executar Migrations
```bash
npx prisma generate
npx prisma migrate deploy
node deploy-setup.js
```

### 6. Iniciar Servidor
```bash
pm2 start server-simple.js --name milhastrade-api
pm2 save
pm2 startup
```

### 7. Verificar
```bash
pm2 status
pm2 logs milhastrade-api
```

---

## 🔧 Comandos Úteis

```bash
pm2 restart milhastrade-api  # Reiniciar
pm2 logs milhastrade-api     # Ver logs
pm2 stop milhastrade-api     # Parar
```

---

## 📊 Estrutura do Projeto

```
milhastrade/
├── backend/          # API Node.js + Express
│   ├── prisma/       # Schema e migrations
│   ├── src/          # Código fonte
│   ├── utils/        # Utilitários (JWT, S3)
│   └── server-simple.js
└── frontend/         # React + TypeScript
    └── src/
```

---

**Deploy realizado em:** 30/11/2025
