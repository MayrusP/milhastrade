# 🎯 Como Fazer Deploy - Guia Rápido

## 1️⃣ Frontend (Já está buildado!)

### Passo 1: Acessar S3
Abra: https://s3.console.aws.amazon.com/s3/buckets/milhastrade-frontend

### Passo 2: Limpar bucket
- Selecione TODOS os arquivos antigos
- Clique em **Delete**
- Confirme

### Passo 3: Upload
- Clique em **Upload**
- Arraste os arquivos de `frontend/dist/` (não a pasta, os arquivos dentro)
- Clique em **Upload**
- Aguarde completar

### Passo 4: Testar
Abra em modo anônimo: http://milhastrade-frontend.s3-website-us-east-1.amazonaws.com

---

## 2️⃣ Backend (Se precisar atualizar)

```bash
ssh -i "milhastrade-key.pem" ubuntu@3.234.253.51
cd /home/ubuntu/milhastrade/backend
git pull
npm install
npm run build
pm2 restart milhastrade-backend
exit
```

---

## ✅ Pronto!

Teste o login:
- Email: `admin@milhastrade.com`
- Senha: `Admin123!`

---

## 🔄 Próximos Deploys

Sempre que fizer alterações no código:

**Frontend:**
1. `cd frontend`
2. `npm run build`
3. Upload dos arquivos de `dist/` para S3

**Backend:**
1. Commit e push
2. SSH no EC2
3. `git pull && npm install && npm run build && pm2 restart milhastrade-backend`

---

## 📞 Problemas?

- Frontend não atualiza? → Delete tudo do S3 e faça upload novamente
- Backend não responde? → `ssh` no EC2 e rode `pm2 logs milhastrade-backend`
- Erro de login? → Verifique se o backend está rodando em http://3.234.253.51:5000/health
