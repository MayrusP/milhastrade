# ✅ FAZER AGORA - Deploy Corrigido

## 🎯 Build Atualizado com Sucesso!

Todos os arquivos agora usam a URL correta: `http://3.234.253.51:5000/api`

---

## 📤 1. Upload para S3 (5 minutos)

### Passo 1: Limpar Bucket
https://us-east-1.console.aws.amazon.com/s3/buckets/milhastrade-frontend-mayrus?tab=objects

1. Selecione TODOS os arquivos (checkbox no topo)
2. Delete → `permanently delete` → Confirmar

### Passo 2: Upload Novos Arquivos
1. Clique em **Upload**
2. Navegue até: `C:\Users\mayru\Documents\Projeto - Site de milhas\frontend\dist`
3. **ENTRE na pasta dist**
4. Selecione TUDO (Ctrl+A)
5. Arraste para o S3
6. Upload

**Arquivos que devem ser enviados:**
- `index.html`
- `favicon-16x16.svg`
- `favicon-32x32.svg`
- `favicon.svg`
- `logo-milhastrade.svg`
- Pasta `assets/` com:
  - `index-b4558bdd.css`
  - `index-c4925bf6.js` ⚠️ **NOVO NOME!**

---

## 🔄 2. Commit e Push (2 minutos)

Abra o Git Bash:

```bash
cd "C:\Users\mayru\Documents\Projeto - Site de milhas"
git add .
git commit -m "Corrigir todas as URLs da API para produção"
git push origin main
```

---

## 🖥️ 3. Atualizar Backend (2 minutos)

```bash
ssh -i "milhastrade-key.pem" ubuntu@3.234.253.51
```

Dentro do EC2:

```bash
cd /home/ubuntu/milhastrade/backend
git pull origin main
pm2 restart milhastrade-backend
pm2 logs milhastrade-backend --lines 10
```

Aguarde ver:
```
Server running on port 5000
```

Pressione `Ctrl+C` e depois:
```bash
exit
```

---

## 🧪 4. Testar (1 minuto)

1. Abra **modo anônimo** (Ctrl+Shift+N)
2. Acesse: http://milhastrade-frontend-mayrus.s3-website-us-east-1.amazonaws.com
3. Abra DevTools (F12) → Console
4. **NÃO deve ter mais erros!**
5. Teste login:
   - Email: `admin@milhastrade.com`
   - Senha: `Admin123!`

---

## ✅ Checklist

- [ ] Arquivos antigos deletados do S3
- [ ] Novos arquivos enviados (incluindo `index-c4925bf6.js`)
- [ ] Commit e push feitos
- [ ] Backend atualizado no EC2
- [ ] PM2 reiniciado
- [ ] Site testado em modo anônimo
- [ ] Login funcionando SEM ERROS

---

## 🎉 Pronto!

Se tudo funcionar, seu site estará 100% operacional!

**URLs:**
- Frontend: http://milhastrade-frontend-mayrus.s3-website-us-east-1.amazonaws.com
- Backend: http://3.234.253.51:5000/health
