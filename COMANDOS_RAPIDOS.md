# ⚡ Comandos Rápidos - Deploy Completo

## ✅ Chave SSH Configurada!

A chave `milhastrade-key.pem` foi copiada para a pasta do projeto e as permissões foram ajustadas.

---

## 🚀 Deploy Completo em 3 Passos

### 1️⃣ Commit e Push (Local)

```powershell
cd "C:\Users\mayru\Documents\Projeto - Site de milhas"
git add .
git commit -m "Atualizar intervalo de notificações para 60s"
git push origin main
```

### 2️⃣ Build do Frontend

```powershell
cd frontend
npm run build
```

### 3️⃣ Atualizar Backend no EC2

```powershell
cd ..
ssh -i "milhastrade-key.pem" ubuntu@3.234.253.51
```

Dentro do EC2:
```bash
cd /home/ubuntu/milhastrade/backend
git pull origin main
pm2 restart milhastrade-backend
pm2 logs milhastrade-backend --lines 20
# Ctrl+C para sair
exit
```

---

## 📤 Upload Frontend para S3

1. Acesse: https://us-east-1.console.aws.amazon.com/s3/buckets/milhastrade-frontend-mayrus?tab=objects
2. Delete todos os arquivos antigos
3. Upload dos arquivos de `frontend/dist/`
4. Teste: http://milhastrade-frontend-mayrus.s3-website-us-east-1.amazonaws.com

---

## 🔧 Comandos Úteis

### Conectar no EC2:
```powershell
cd "C:\Users\mayru\Documents\Projeto - Site de milhas"
ssh -i "milhastrade-key.pem" ubuntu@3.234.253.51
```

### Ver logs do backend:
```bash
pm2 logs milhastrade-backend
```

### Reiniciar backend:
```bash
pm2 restart milhastrade-backend
```

### Ver status:
```bash
pm2 status
```

### Testar API:
```bash
curl http://localhost:5000/api/health
```

---

## 📋 Checklist de Deploy

- [ ] Commit e push feitos
- [ ] Frontend buildado (`npm run build`)
- [ ] Backend atualizado no EC2 (`git pull`)
- [ ] PM2 reiniciado
- [ ] Frontend enviado para S3
- [ ] Site testado

---

## 🎯 Atalhos

### Deploy Rápido do Backend:
```powershell
cd "C:\Users\mayru\Documents\Projeto - Site de milhas"
git add . ; git commit -m "Update" ; git push
ssh -i "milhastrade-key.pem" ubuntu@3.234.253.51 "cd /home/ubuntu/milhastrade/backend && git pull && pm2 restart milhastrade-backend"
```

### Build Frontend:
```powershell
cd "C:\Users\mayru\Documents\Projeto - Site de milhas\frontend"
npm run build
```

---

## 🆘 Problemas Comuns

### "Permission denied" ao conectar SSH
```powershell
icacls milhastrade-key.pem /inheritance:r
icacls milhastrade-key.pem /grant:r "$env:USERNAME`:R"
```

### Backend não atualiza
```bash
# No EC2
cd /home/ubuntu/milhastrade/backend
git status
git pull origin main --force
pm2 restart milhastrade-backend
```

### Frontend não atualiza no S3
- Delete TODOS os arquivos do bucket antes de fazer novo upload
- Teste em modo anônimo (Ctrl+Shift+N)

---

## 📝 URLs Importantes

- **Frontend:** http://milhastrade-frontend-mayrus.s3-website-us-east-1.amazonaws.com
- **Backend Health:** http://3.234.253.51:5000/health
- **Backend API:** http://3.234.253.51:5000/api
- **Console S3:** https://us-east-1.console.aws.amazon.com/s3/buckets/milhastrade-frontend-mayrus
- **Console EC2:** https://console.aws.amazon.com/ec2/

---

## 🎉 Pronto!

Agora você pode conectar no EC2 e fazer deploy facilmente! 🚀
