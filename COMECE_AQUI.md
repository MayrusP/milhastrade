# 🎯 COMECE AQUI - Deploy MilhasTrade

## ✅ Bucket S3 Criado!

**Nome:** `milhastrade-frontend-mayrus`
**URL:** https://us-east-1.console.aws.amazon.com/s3/buckets/milhastrade-frontend-mayrus

## 📋 Passo a Passo Completo

### 1️⃣ Configurar o Bucket S3
📄 Siga: **[DEPLOY_FINAL.md](DEPLOY_FINAL.md)** ⭐

Resumo rápido:
1. Configure Static Website Hosting
2. Desmarque "Block all public access"
3. Adicione a Bucket Policy
4. Copie a URL do website endpoint

⏱️ Tempo estimado: 3 minutos

---

### 2️⃣ Fazer Upload do Frontend
📄 Siga: **[COMO_FAZER_DEPLOY.md](COMO_FAZER_DEPLOY.md)**

Resumo rápido:
1. Abra o bucket que você criou
2. Clique em "Upload"
3. Arraste os arquivos de `frontend/dist/`
4. Aguarde o upload

⏱️ Tempo estimado: 2 minutos

---

### 3️⃣ Atualizar Backend (CORS)
```bash
ssh -i "milhastrade-key.pem" ubuntu@3.234.253.51
cd /home/ubuntu/milhastrade/backend
git pull
pm2 restart milhastrade-backend
exit
```

### 4️⃣ Testar
Abra em modo anônimo:
```
http://milhastrade-frontend-mayrus.s3-website-us-east-1.amazonaws.com
```

Login de teste:
- Email: `admin@milhastrade.com`
- Senha: `Admin123!`

---

## 📚 Documentação Completa

- **[DEPLOY_FINAL.md](DEPLOY_FINAL.md)** ⭐ - Guia completo de deploy
- **[INDEX.md](INDEX.md)** - Índice de toda documentação
- **[STATUS_ATUAL.md](STATUS_ATUAL.md)** - Status do projeto

---

## ✅ Checklist Rápido

- [ ] Bucket S3 criado
- [ ] Static website hosting configurado
- [ ] Bucket policy adicionada
- [ ] Arquivos de `frontend/dist/` enviados
- [ ] Site testado e funcionando
- [ ] Login testado

---

## 🆘 Precisa de Ajuda?

### Erro: "403 Forbidden"
→ Verifique a bucket policy em [DEPLOY_FINAL.md](DEPLOY_FINAL.md)

### Erro: "Access Denied"
→ Verifique a bucket policy em [CRIAR_BUCKET_S3.md](CRIAR_BUCKET_S3.md)

### Backend não responde
→ Teste: http://3.234.253.51:5000/health

---

## 🎉 Depois de Tudo Funcionar

Para próximos deploys, basta:
1. `cd frontend && npm run build`
2. Upload dos arquivos de `dist/` para S3
3. Pronto!

---

**Comece agora:** Abra [DEPLOY_FINAL.md](DEPLOY_FINAL.md) 🚀
