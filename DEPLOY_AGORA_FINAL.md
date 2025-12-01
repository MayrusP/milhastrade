# 🚀 Deploy Final - Passo a Passo

## ✅ Build Atualizado!

O frontend foi reconstruído com a URL correta da API: `http://3.234.253.51:5000/api`

---

## 📤 1. Upload do Frontend para S3

### Passo 1: Limpar o Bucket
1. Acesse: https://us-east-1.console.aws.amazon.com/s3/buckets/milhastrade-frontend-mayrus?tab=objects
2. Selecione TODOS os arquivos (checkbox no topo)
3. Clique em **Delete**
4. Digite `permanently delete` e confirme

### Passo 2: Upload dos Novos Arquivos
1. Clique em **Upload**
2. Navegue até: `C:\Users\mayru\Documents\Projeto - Site de milhas\frontend\dist`
3. **ENTRE na pasta dist**
4. Selecione TUDO (Ctrl+A):
   - `index.html`
   - `favicon-16x16.svg`
   - `favicon-32x32.svg`
   - `favicon.svg`
   - `logo-milhastrade.svg`
   - Pasta `assets/` (com os arquivos dentro)
5. Arraste para o S3
6. Clique em **Upload**
7. Aguarde completar

---

## 🔄 2. Atualizar Backend no EC2

### Fazer Commit das Alterações

Abra o Git Bash ou terminal:

```bash
cd "C:\Users\mayru\Documents\Projeto - Site de milhas"
git add .
git commit -m "Corrigir configuração da API no frontend"
git push origin main
```

### Atualizar no EC2

```bash
ssh -i "milhastrade-key.pem" ubuntu@3.234.253.51
```

Dentro do EC2:

```bash
cd /home/ubuntu/milhastrade/backend
git pull origin main
pm2 restart milhastrade-backend
pm2 logs milhastrade-backend --lines 20
```

Verifique se aparece:
```
Server running on port 5000
Database connected successfully
```

Digite `Ctrl+C` para sair dos logs, depois:
```bash
exit
```

---

## 🧪 3. Testar o Site

1. Abra o navegador em **modo anônimo** (Ctrl+Shift+N)
2. Acesse: http://milhastrade-frontend-mayrus.s3-website-us-east-1.amazonaws.com
3. Abra o DevTools (F12) → Console
4. Não deve ter mais erros!
5. Teste o login:
   - Email: `admin@milhastrade.com`
   - Senha: `Admin123!`

---

## ✅ Checklist Final

- [ ] Arquivos antigos deletados do S3
- [ ] Novos arquivos enviados para S3
- [ ] Commit feito e push realizado
- [ ] Backend atualizado no EC2
- [ ] PM2 reiniciado
- [ ] Site testado em modo anônimo
- [ ] Login funcionando
- [ ] API respondendo corretamente

---

## 🎉 Pronto!

Se tudo funcionar, seu site estará 100% operacional! 🚀

**URLs Importantes:**
- Frontend: http://milhastrade-frontend-mayrus.s3-website-us-east-1.amazonaws.com
- Backend Health: http://3.234.253.51:5000/health
- Backend API: http://3.234.253.51:5000/api

---

## 🐛 Se Ainda Houver Problemas

### Erro de CORS
```bash
ssh -i "milhastrade-key.pem" ubuntu@3.234.253.51
cd /home/ubuntu/milhastrade/backend
cat .env | grep CORS
# Deve mostrar: CORS_ORIGINS=http://milhastrade-frontend-mayrus.s3-website-us-east-1.amazonaws.com,...
```

### Backend não responde
```bash
ssh -i "milhastrade-key.pem" ubuntu@3.234.253.51
pm2 status
pm2 logs milhastrade-backend
```

### Frontend mostra erro 404 nos assets
- Verifique se a pasta `assets/` foi enviada corretamente
- Deve ter 2 arquivos dentro: `index-b4558bdd.css` e `index-eb007d6a.js`
