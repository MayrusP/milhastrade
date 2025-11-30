# 🚀 Guia Rápido - Deploy AWS

## ✅ Projeto Limpo e Pronto!

Todos os arquivos de teste e debug foram removidos. O projeto está otimizado para produção.

---

## 📦 Estrutura Final

```
milhastrade/
├── 📄 README.md                    # Documentação
├── 📄 PLANO_DEPLOY_AWS.md          # Guia completo (detalhado)
├── 📄 RESUMO_EXECUTIVO_PROJETO.md  # Visão geral
├── 📄 USUARIOS.md                  # Credenciais
├── 🔧 backend/
│   ├── .env                        # Variáveis locais
│   ├── .env.example                # Template
│   ├── package.json                # Dependências
│   ├── server-simple.js            # ⭐ Servidor principal
│   ├── recreate-users.js           # Script de setup
│   ├── prisma/
│   │   ├── schema.prisma           # Schema do banco
│   │   └── migrations/             # Migrations
│   └── src/                        # Código fonte
└── 🎨 frontend/
    ├── package.json                # Dependências
    ├── vite.config.ts              # Config Vite
    └── src/                        # Código React
```

---

## 🎯 Próximos Passos

### 1️⃣ Preparação (1-2 horas)

**Implementar melhorias de segurança:**
- [ ] JWT real (substituir mock token)
- [ ] PostgreSQL (migrar de SQLite)
- [ ] Upload S3 (substituir local storage)
- [ ] Rate limiting
- [ ] Helmet.js

### 2️⃣ Criar Conta AWS (30 min)

1. Acessar [aws.amazon.com](https://aws.amazon.com)
2. Criar conta (cartão de crédito necessário)
3. Ativar free tier
4. Instalar AWS CLI: `aws configure`

### 3️⃣ Configurar Infraestrutura (2-3 horas)

**RDS PostgreSQL:**
```bash
# Via Console AWS
- Template: Free tier
- Instance: db.t3.micro
- Storage: 20 GB
- Database: milhastrade
```

**S3 Buckets:**
```bash
# Bucket 1: Frontend
aws s3 mb s3://milhastrade-frontend

# Bucket 2: Uploads
aws s3 mb s3://milhastrade-uploads
```

**EC2 Instance:**
```bash
# Via Console AWS
- AMI: Amazon Linux 2023
- Instance: t3.small
- Storage: 20 GB
- Security Group: Portas 22, 80, 443, 5000
```

### 4️⃣ Deploy Backend (1 hora)

**No EC2:**
```bash
# Conectar via SSH
ssh -i "sua-chave.pem" ec2-user@seu-ip

# Instalar Node.js
sudo dnf install nodejs npm -y

# Clonar projeto
git clone seu-repositorio
cd milhastrade/backend

# Instalar dependências
npm install

# Configurar .env
nano .env
# DATABASE_URL=postgresql://...
# JWT_SECRET=...
# AWS_S3_BUCKET=...

# Migrations
npx prisma migrate deploy
npx prisma generate

# Iniciar com PM2
npm install -g pm2
pm2 start server-simple.js --name api
pm2 save
pm2 startup
```

### 5️⃣ Deploy Frontend (30 min)

**Local:**
```bash
cd frontend
npm run build

# Upload para S3
aws s3 sync dist/ s3://milhastrade-frontend --delete
```

**CloudFront:**
- Criar distribution
- Origin: S3 bucket
- SSL: Solicitar certificado ACM
- CNAME: seu-dominio.com

### 6️⃣ Configurar DNS (30 min)

**Route 53:**
```
milhastrade.com     → CloudFront (frontend)
api.milhastrade.com → EC2 IP (backend)
```

---

## 💰 Custos Estimados

### Inicial (Free Tier)
- **RDS:** db.t3.micro = $0 (12 meses)
- **EC2:** t3.micro = $0 (12 meses)
- **S3:** 5 GB = $0 (12 meses)
- **CloudFront:** 50 GB = $0 (12 meses)
- **Total:** ~$0/mês (primeiro ano)

### Após Free Tier
- **RDS:** db.t3.small = ~$30/mês
- **EC2:** t3.small = ~$15/mês
- **S3:** ~$5/mês
- **CloudFront:** ~$10/mês
- **Route 53:** ~$1/mês
- **Total:** ~$61/mês

---

## 🔍 Checklist de Deploy

### Antes do Deploy
- [x] Projeto limpo (arquivos de teste removidos)
- [ ] JWT implementado
- [ ] PostgreSQL configurado
- [ ] Upload S3 implementado
- [ ] Variáveis de ambiente configuradas
- [ ] Testes locais passando

### Durante o Deploy
- [ ] RDS criado e acessível
- [ ] S3 buckets criados
- [ ] EC2 configurado
- [ ] Backend rodando (PM2)
- [ ] Frontend no S3
- [ ] CloudFront configurado
- [ ] DNS apontando

### Após o Deploy
- [ ] Testar registro/login
- [ ] Testar criar oferta
- [ ] Testar comprar oferta
- [ ] Testar upload de arquivos
- [ ] Testar suporte
- [ ] Configurar backups
- [ ] Configurar monitoramento

---

## 🆘 Comandos Úteis

### PM2 (Gerenciar Backend)
```bash
pm2 list                # Ver processos
pm2 logs api            # Ver logs
pm2 restart api         # Reiniciar
pm2 stop api            # Parar
```

### AWS CLI
```bash
# S3
aws s3 ls                           # Listar buckets
aws s3 sync dist/ s3://bucket       # Upload

# EC2
aws ec2 describe-instances          # Listar instâncias

# RDS
aws rds describe-db-instances       # Listar databases
```

### PostgreSQL
```bash
# Conectar
psql -h endpoint -U user -d milhastrade

# Comandos úteis
\dt                     # Listar tabelas
\d users                # Ver estrutura
SELECT * FROM users;    # Query
\q                      # Sair
```

---

## 📚 Documentação Completa

Para instruções detalhadas, consulte:
- **PLANO_DEPLOY_AWS.md** - Guia completo passo a passo (22KB)
- **README.md** - Documentação do projeto
- **RESUMO_EXECUTIVO_PROJETO.md** - Visão geral executiva

---

## 🎉 Funcionalidades Prontas

- ✅ Sistema de usuários (registro, login, perfis)
- ✅ Marketplace (criar/comprar ofertas)
- ✅ Sistema de créditos
- ✅ Avaliações (1-5 estrelas)
- ✅ Suporte (tickets, chat)
- ✅ Notificações em tempo real
- ✅ Verificação de identidade
- ✅ 10 companhias aéreas
- ✅ Interface responsiva
- ✅ Modo escuro

---

**🚀 Pronto para decolar na AWS!**

**Tempo estimado total:** 5-8 horas  
**Dificuldade:** Intermediária  
**Custo inicial:** $0 (free tier)
