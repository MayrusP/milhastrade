# 🚀 Plano de Deploy AWS - MilhasTrade

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura AWS Proposta](#arquitetura-aws-proposta)
3. [Pré-Requisitos](#pré-requisitos)
4. [Fase 1: Preparação Local](#fase-1-preparação-local)
5. [Fase 2: Configuração AWS](#fase-2-configuração-aws)
6. [Fase 3: Deploy](#fase-3-deploy)
7. [Fase 4: Pós-Deploy](#fase-4-pós-deploy)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

Este documento detalha o processo completo de deploy da plataforma MilhasTrade na AWS, desde a preparação local até o monitoramento em produção.

**Tempo Estimado Total:** 3-5 dias  
**Custo Mensal Estimado:** $52-121 USD  
**Nível de Complexidade:** Intermediário

---

## 🏗️ Arquitetura AWS Proposta

```
┌─────────────────────────────────────────────────────────────┐
│                         USUÁRIOS                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Route 53 (DNS)                            │
│              milhastrade.com / api.milhastrade.com           │
└────────────┬───────────────────────────┬────────────────────┘
             │                           │
             ▼                           ▼
┌────────────────────────┐   ┌──────────────────────────────┐
│   CloudFront (CDN)     │   │   Application Load Balancer  │
│   Frontend (S3)        │   │   (ALB)                      │
└────────────────────────┘   └──────────┬───────────────────┘
                                        │
                                        ▼
                             ┌──────────────────────┐
                             │   EC2 Auto Scaling   │
                             │   Backend (Node.js)  │
                             └──────┬───────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
         ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
         │  RDS          │  │  S3 Bucket   │  │  SES         │
         │  PostgreSQL   │  │  Uploads     │  │  Email       │
         └──────────────┘  └──────────────┘  └──────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │  CloudWatch          │
         │  Logs & Monitoring   │
         └──────────────────────┘
```

---

## 📦 Pré-Requisitos

### Contas e Acessos
- [ ] Conta AWS criada e verificada
- [ ] AWS CLI instalado e configurado
- [ ] Domínio registrado (opcional mas recomendado)
- [ ] Git instalado

### Conhecimentos Necessários
- Básico de AWS (EC2, RDS, S3)
- Básico de Linux/Terminal
- Básico de Node.js
- Básico de PostgreSQL

### Ferramentas Locais
```bash
# Verificar instalações
node --version  # v18+
npm --version   # v9+
aws --version   # AWS CLI v2
psql --version  # PostgreSQL client
```

---

## 🔧 Fase 1: Preparação Local

### 1.1 Implementar JWT Real

**Arquivo:** `backend/utils/jwt.js` (criar)
```javascript
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };
```

**Atualizar:** `backend/server-simple.js`
```javascript
// Substituir mock token por JWT real
const { generateToken, verifyToken } = require('./utils/jwt');

// No endpoint de login
const token = generateToken(user.id);

// No middleware de auth
const decoded = verifyToken(token);
if (!decoded) {
  return res.status(401).json({ message: 'Token inválido' });
}
```

### 1.2 Migrar para PostgreSQL

**Atualizar:** `backend/prisma/schema.prisma`
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Testar localmente:**
```bash
# Instalar PostgreSQL localmente ou usar Docker
docker run --name postgres-milhastrade -e POSTGRES_PASSWORD=senha123 -p 5432:5432 -d postgres

# Atualizar .env
DATABASE_URL="postgresql://postgres:senha123@localhost:5432/milhastrade"

# Executar migrations
cd backend
npx prisma migrate dev --name init
npx prisma generate

# Popular dados iniciais
node populate-test-data.js
```

### 1.3 Implementar Upload para S3

**Instalar SDK:**
```bash
cd backend
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

**Arquivo:** `backend/utils/s3.js` (criar)
```javascript
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const uploadToS3 = async (file, key) => {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype
  });
  
  await s3Client.send(command);
  return key;
};

const getSignedDownloadUrl = async (key) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key
  });
  
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
};

module.exports = { uploadToS3, getSignedDownloadUrl };
```

### 1.4 Implementar Endpoints de Suporte

**Adicionar ao:** `backend/server-simple.js`
```javascript
// Criar ticket de suporte
app.post('/api/support/tickets', authMiddleware, async (req, res) => {
  try {
    const { subject, description, category, priority } = req.body;
    
    const ticket = await prisma.supportTicket.create({
      data: {
        subject,
        description,
        category,
        priority: priority || 'MEDIUM',
        userId: req.user.id
      }
    });
    
    res.json({ success: true, data: { ticket } });
  } catch (error) {
    console.error('Erro ao criar ticket:', error);
    res.status(500).json({ success: false, message: 'Erro ao criar ticket' });
  }
});

// Listar tickets do usuário
app.get('/api/support/tickets', authMiddleware, async (req, res) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: req.user.id },
      include: {
        responses: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, data: { tickets } });
  } catch (error) {
    console.error('Erro ao listar tickets:', error);
    res.status(500).json({ success: false, message: 'Erro ao listar tickets' });
  }
});

// Adicionar resposta ao ticket
app.post('/api/support/tickets/:id/responses', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    
    const response = await prisma.supportTicketResponse.create({
      data: {
        message,
        ticketId: id,
        userId: req.user.id,
        isFromAdmin: req.user.role === 'ADMIN' || req.user.role === 'MODERATOR'
      }
    });
    
    // Atualizar status do ticket
    await prisma.supportTicket.update({
      where: { id },
      data: { 
        status: 'IN_PROGRESS',
        updatedAt: new Date()
      }
    });
    
    res.json({ success: true, data: { response } });
  } catch (error) {
    console.error('Erro ao adicionar resposta:', error);
    res.status(500).json({ success: false, message: 'Erro ao adicionar resposta' });
  }
});

// Admin: Listar todos os tickets
app.get('/api/admin/support/tickets', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'MODERATOR') {
      return res.status(403).json({ success: false, message: 'Acesso negado' });
    }
    
    const tickets = await prisma.supportTicket.findMany({
      include: {
        user: { select: { name: true, email: true } },
        responses: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, data: { tickets } });
  } catch (error) {
    console.error('Erro ao listar tickets:', error);
    res.status(500).json({ success: false, message: 'Erro ao listar tickets' });
  }
});
```

### 1.5 Remover passwordNoHash

**Atualizar:** `backend/prisma/schema.prisma`
```prisma
model User {
  id             String   @id @default(cuid())
  email          String   @unique
  password       String
  // passwordNoHash String?  ← REMOVER ESTA LINHA
  name           String
  // ... resto do modelo
}
```

**Executar migration:**
```bash
npx prisma migrate dev --name remove_password_no_hash
```

### 1.6 Adicionar Segurança

**Instalar dependências:**
```bash
npm install express-rate-limit helmet
```

**Atualizar:** `backend/server-simple.js`
```javascript
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Adicionar no início, após criar app
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de 100 requests por IP
});
app.use('/api/', limiter);

// CORS restrito
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

### 1.7 Criar .env.production

**Arquivo:** `backend/.env.production`
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/milhastrade
JWT_SECRET=GERAR_STRING_ALEATORIA_MINIMO_32_CARACTERES
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://milhastrade.com
AWS_REGION=us-east-1
AWS_S3_BUCKET=milhastrade-uploads
AWS_ACCESS_KEY_ID=sua-access-key
AWS_SECRET_ACCESS_KEY=sua-secret-key
```

**Gerar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ☁️ Fase 2: Configuração AWS

### 2.1 Criar RDS PostgreSQL

**Via Console AWS:**
1. Acessar RDS → Create database
2. Escolher PostgreSQL
3. Template: Free tier (para teste) ou Production
4. DB instance identifier: `milhastrade-db`
5. Master username: `milhastrade_admin`
6. Master password: (gerar senha forte)
7. DB instance class: `db.t3.micro` (free tier) ou `db.t3.small`
8. Storage: 20 GB (SSD)
9. VPC: Default ou criar nova
10. Public access: Yes (temporariamente para teste)
11. Security group: Criar novo `milhastrade-db-sg`
12. Database name: `milhastrade`
13. Create database

**Configurar Security Group:**
- Inbound rules:
  - Type: PostgreSQL
  - Port: 5432
  - Source: Seu IP (para teste)
  - Source: EC2 security group (depois)

**Testar conexão:**
```bash
psql -h milhastrade-db.xxxxx.us-east-1.rds.amazonaws.com -U milhastrade_admin -d milhastrade
```

### 2.2 Criar S3 Bucket

**Via Console AWS:**
1. Acessar S3 → Create bucket
2. Bucket name: `milhastrade-uploads`
3. Region: us-east-1 (ou sua preferência)
4. Block all public access: ✅ (manter privado)
5. Versioning: Enable (recomendado)
6. Encryption: Enable (SSE-S3)
7. Create bucket

**Configurar CORS:**
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://milhastrade.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

**Criar IAM User para S3:**
1. IAM → Users → Create user
2. User name: `milhastrade-s3-user`
3. Attach policies: `AmazonS3FullAccess` (ou criar policy customizada)
4. Create access key → Application running outside AWS
5. Salvar Access Key ID e Secret Access Key

### 2.3 Criar EC2 Instance

**Via Console AWS:**
1. EC2 → Launch instance
2. Name: `milhastrade-backend`
3. AMI: Amazon Linux 2023 ou Ubuntu 22.04
4. Instance type: `t3.small` (ou t3.micro para teste)
5. Key pair: Criar novo ou usar existente
6. Network settings:
   - VPC: Default ou mesma do RDS
   - Auto-assign public IP: Enable
   - Security group: Criar novo `milhastrade-backend-sg`
7. Storage: 20 GB gp3
8. Launch instance

**Configurar Security Group:**
- Inbound rules:
  - SSH (22): Seu IP
  - HTTP (80): 0.0.0.0/0
  - HTTPS (443): 0.0.0.0/0
  - Custom TCP (5000): 0.0.0.0/0 (temporário)

**Conectar via SSH:**
```bash
ssh -i "sua-chave.pem" ec2-user@ec2-xx-xx-xx-xx.compute-1.amazonaws.com
```

### 2.4 Configurar EC2

**Instalar Node.js:**
```bash
# Amazon Linux 2023
sudo dnf install nodejs npm -y

# Ubuntu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar
node --version
npm --version
```

**Instalar PM2:**
```bash
sudo npm install -g pm2
```

**Instalar PostgreSQL client:**
```bash
# Amazon Linux
sudo dnf install postgresql15 -y

# Ubuntu
sudo apt-get install postgresql-client -y
```

**Configurar Git:**
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

### 2.5 Configurar CloudFront + S3 (Frontend)

**Build do Frontend:**
```bash
cd frontend
npm run build
# Gera pasta dist/
```

**Upload para S3:**
```bash
# Criar bucket para frontend
aws s3 mb s3://milhastrade-frontend

# Configurar como website
aws s3 website s3://milhastrade-frontend --index-document index.html --error-document index.html

# Upload dos arquivos
aws s3 sync dist/ s3://milhastrade-frontend --delete
```

**Criar CloudFront Distribution:**
1. CloudFront → Create distribution
2. Origin domain: milhastrade-frontend.s3.amazonaws.com
3. Origin access: Origin access control (OAC)
4. Viewer protocol policy: Redirect HTTP to HTTPS
5. Allowed HTTP methods: GET, HEAD, OPTIONS
6. Cache policy: CachingOptimized
7. Price class: Use all edge locations
8. Alternate domain name (CNAME): milhastrade.com
9. SSL certificate: Request certificate (ACM)
10. Create distribution

---

## 🚀 Fase 3: Deploy

### 3.1 Deploy Backend

**No EC2:**
```bash
# Clonar repositório
git clone https://github.com/seu-usuario/milhastrade.git
cd milhastrade/backend

# Instalar dependências
npm install

# Criar .env
nano .env
# Colar conteúdo do .env.production com valores reais

# Executar migrations
npx prisma migrate deploy
npx prisma generate

# Popular dados iniciais
node populate-test-data.js

# Testar servidor
node server-simple.js
# Ctrl+C para parar

# Iniciar com PM2
pm2 start server-simple.js --name milhastrade-api
pm2 save
pm2 startup
```

**Configurar Nginx (opcional mas recomendado):**
```bash
sudo dnf install nginx -y  # Amazon Linux
# ou
sudo apt-get install nginx -y  # Ubuntu

# Configurar
sudo nano /etc/nginx/conf.d/milhastrade.conf
```

```nginx
server {
    listen 80;
    server_name api.milhastrade.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
sudo nginx -t
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 3.2 Configurar DNS (Route 53)

**Criar Hosted Zone:**
1. Route 53 → Hosted zones → Create hosted zone
2. Domain name: milhastrade.com
3. Type: Public hosted zone
4. Create

**Criar Records:**
1. **Frontend (CloudFront):**
   - Record name: (vazio para root) ou www
   - Type: A
   - Alias: Yes
   - Route traffic to: CloudFront distribution
   - Select distribution

2. **Backend (EC2/ALB):**
   - Record name: api
   - Type: A
   - Value: IP público do EC2 (ou ALB)

**Atualizar Nameservers no Registrador:**
- Copiar nameservers do Route 53
- Atualizar no registrador do domínio

### 3.3 Configurar SSL/TLS

**Via AWS Certificate Manager (ACM):**
1. ACM → Request certificate
2. Domain names:
   - milhastrade.com
   - *.milhastrade.com
3. Validation method: DNS validation
4. Request
5. Create records in Route 53 (botão automático)
6. Aguardar validação (~5-30 min)

**Aplicar no CloudFront:**
- Editar distribution
- Custom SSL certificate: Selecionar certificado

**Aplicar no ALB/EC2:**
- Se usar ALB: Adicionar listener HTTPS
- Se usar EC2 direto: Configurar Nginx com SSL

---

## 📊 Fase 4: Pós-Deploy

### 4.1 Configurar CloudWatch

**Logs do Backend:**
```bash
# Instalar CloudWatch agent
sudo yum install amazon-cloudwatch-agent -y

# Configurar
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard

# Iniciar
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -s \
  -c file:/opt/aws/amazon-cloudwatch-agent/bin/config.json
```

**Criar Alarmes:**
1. CloudWatch → Alarms → Create alarm
2. Métricas importantes:
   - CPU Utilization > 80%
   - Memory Utilization > 80%
   - Disk Space < 20%
   - HTTP 5xx errors > 10
   - RDS CPU > 80%

### 4.2 Configurar Backups

**RDS Automated Backups:**
1. RDS → Databases → Selecionar DB
2. Modify
3. Backup retention period: 7 days
4. Backup window: Escolher horário de baixo tráfego
5. Apply immediately

**S3 Versioning:**
- Já habilitado na criação
- Configurar lifecycle policy para arquivos antigos

### 4.3 Testes Finais

**Checklist de Testes:**
- [ ] Registro de novo usuário
- [ ] Login
- [ ] Criar oferta
- [ ] Comprar oferta
- [ ] Upload de documentos
- [ ] Criar ticket de suporte
- [ ] Adicionar dados de passageiros
- [ ] Editar dados de passageiros
- [ ] Avaliar usuário
- [ ] Receber notificações
- [ ] Painel admin
- [ ] Verificação de identidade

**Teste de Carga (opcional):**
```bash
# Instalar Apache Bench
sudo yum install httpd-tools -y

# Teste simples
ab -n 1000 -c 10 https://api.milhastrade.com/api/health
```

---

## 🔧 Troubleshooting

### Problema: Não consigo conectar ao RDS
**Solução:**
1. Verificar security group permite conexão
2. Verificar se RDS está em subnet pública (se necessário)
3. Testar com psql localmente
4. Verificar DATABASE_URL no .env

### Problema: Upload de arquivos não funciona
**Solução:**
1. Verificar credenciais AWS no .env
2. Verificar permissões IAM do usuário
3. Verificar CORS do bucket S3
4. Verificar logs do backend

### Problema: Frontend não carrega
**Solução:**
1. Verificar build foi feito corretamente
2. Verificar arquivos foram enviados para S3
3. Verificar CloudFront distribution está ativa
4. Verificar DNS está apontando corretamente
5. Limpar cache do CloudFront

### Problema: CORS errors
**Solução:**
1. Verificar FRONTEND_URL no backend .env
2. Verificar configuração CORS no backend
3. Verificar headers no Nginx (se usar)

### Problema: 502 Bad Gateway
**Solução:**
1. Verificar se backend está rodando: `pm2 status`
2. Verificar logs: `pm2 logs milhastrade-api`
3. Verificar porta 5000 está aberta
4. Reiniciar: `pm2 restart milhastrade-api`

---

## 📞 Suporte e Recursos

### Documentação AWS
- [EC2 User Guide](https://docs.aws.amazon.com/ec2/)
- [RDS User Guide](https://docs.aws.amazon.com/rds/)
- [S3 User Guide](https://docs.aws.amazon.com/s3/)
- [CloudFront User Guide](https://docs.aws.amazon.com/cloudfront/)

### Comandos Úteis

**PM2:**
```bash
pm2 list                    # Listar processos
pm2 logs milhastrade-api    # Ver logs
pm2 restart milhastrade-api # Reiniciar
pm2 stop milhastrade-api    # Parar
pm2 delete milhastrade-api  # Remover
```

**Nginx:**
```bash
sudo nginx -t               # Testar configuração
sudo systemctl restart nginx # Reiniciar
sudo systemctl status nginx  # Status
sudo tail -f /var/log/nginx/error.log # Logs
```

**PostgreSQL:**
```bash
psql -h endpoint -U user -d db  # Conectar
\dt                             # Listar tabelas
\d table_name                   # Descrever tabela
\q                              # Sair
```

---

**Preparado por:** Kiro AI Assistant  
**Última Atualização:** 30 de Novembro de 2025  
**Versão:** 1.0
