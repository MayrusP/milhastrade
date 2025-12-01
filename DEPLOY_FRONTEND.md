# 🎨 Deploy do Frontend - S3 + CloudFront

## ✅ Status Atual:
- ✅ Backend rodando: http://3.234.253.51:5000/api
- ⏳ Frontend: Vamos fazer agora!

---

## 🚀 Passo a Passo:

### 1️⃣ Atualizar URL da API no Frontend

**No seu computador local:**

Edite o arquivo: `frontend/src/services/api.ts`

Mude de:
```typescript
const API_URL = 'http://localhost:5000/api';
```

Para:
```typescript
const API_URL = 'http://3.234.253.51:5000/api';
```

### 2️⃣ Build do Frontend

```bash
cd frontend
npm install
npm run build
```

Isso vai gerar a pasta `dist/` com os arquivos otimizados.

### 3️⃣ Criar Bucket S3 para Frontend

1. Acesse: https://console.aws.amazon.com/s3
2. Clique em **"Create bucket"**
3. Configure:
   - **Bucket name:** `milhastrade-frontend` (ou outro nome único)
   - **Region:** us-east-1
   - **⚠️ DESMARQUE** "Block all public access"
   - Marque: "I acknowledge that the current settings..."
4. Clique em **"Create bucket"**

### 4️⃣ Configurar Bucket como Website

1. Clique no bucket criado
2. Aba **"Properties"**
3. Role até **"Static website hosting"**
4. Clique em **"Edit"**
5. Configure:
   - Static website hosting: **Enable**
   - Hosting type: **Host a static website**
   - Index document: `index.html`
   - Error document: `index.html`
6. Clique em **"Save changes"**
7. **Copie a URL do website** (ex: http://milhastrade-frontend.s3-website-us-east-1.amazonaws.com)

### 5️⃣ Adicionar Bucket Policy (Tornar Público)

1. Aba **"Permissions"**
2. Role até **"Bucket policy"**
3. Clique em **"Edit"**
4. Cole este JSON (substitua o nome do bucket):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::milhastrade-frontend/*"
    }
  ]
}
```

5. Clique em **"Save changes"**

### 6️⃣ Upload dos Arquivos

**Opção A: Via Console AWS**
1. Aba **"Objects"**
2. Clique em **"Upload"**
3. Clique em **"Add files"** e **"Add folder"**
4. Selecione TODOS os arquivos da pasta `frontend/dist/`
5. Clique em **"Upload"**

**Opção B: Via AWS CLI (Mais rápido)**
```bash
cd frontend
aws s3 sync dist/ s3://milhastrade-frontend --delete
```

### 7️⃣ Atualizar CORS no Backend

No EC2, edite o .env para permitir o frontend:

```bash
ssh -i milhastrade-key.pem ec2-user@3.234.253.51
cd milhastrade/backend
nano .env
```

Mude a linha `CORS_ORIGINS` para:
```
CORS_ORIGINS=http://localhost:5173,http://3.234.253.51:5000,http://milhastrade-frontend.s3-website-us-east-1.amazonaws.com
```

Salve (Ctrl+X, Y, Enter) e reinicie:
```bash
pm2 restart milhastrade-api
```

### 8️⃣ Testar o Frontend

Acesse a URL do S3 website:
```
http://milhastrade-frontend.s3-website-us-east-1.amazonaws.com
```

---

## 🎉 Pronto! Aplicação Completa no Ar!

**URLs Finais:**
- **Frontend:** http://milhastrade-frontend.s3-website-us-east-1.amazonaws.com
- **Backend:** http://3.234.253.51:5000/api

**Credenciais:**
- Admin: mayrus@admin.com / senha123
- Usuário: teste@teste.com / senha123

---

## 🔜 Próximos Passos (Opcional):

### CloudFront (CDN + HTTPS)
- Distribuir conteúdo globalmente
- Adicionar HTTPS
- Melhorar performance

### Domínio Próprio
- Registrar domínio
- Configurar Route 53
- Certificado SSL

### Melhorias
- Configurar CI/CD
- Monitoramento CloudWatch
- Backups automáticos

---

**Tempo estimado:** 15-20 minutos  
**Custo:** $0 (free tier) ou ~$1-2/mês
