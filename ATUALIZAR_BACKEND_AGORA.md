# 🔄 Atualizar Backend AGORA

## ⚠️ Problema Identificado

O backend no EC2 está rodando uma versão antiga que não tem as rotas:
- `/api/auth/me`
- `/api/user/profile`

## ✅ Solução: Atualizar o Backend

### Passo 1: Fazer Commit Local

Abra o Git Bash ou terminal:

```bash
cd "C:\Users\mayru\Documents\Projeto - Site de milhas"
git add .
git commit -m "Atualizar frontend com URLs corretas da API"
git push origin main
```

### Passo 2: Conectar no EC2

```bash
ssh -i "milhastrade-key.pem" ubuntu@3.234.253.51
```

### Passo 3: Atualizar o Código

Dentro do EC2, execute:

```bash
cd /home/ubuntu/milhastrade/backend

# Ver qual versão está rodando
git log --oneline -1

# Puxar última versão
git pull origin main

# Ver se atualizou
git log --oneline -1

# Reinstalar dependências (se necessário)
npm install

# Reiniciar o servidor
pm2 restart milhastrade-backend

# Ver os logs
pm2 logs milhastrade-backend --lines 30
```

### Passo 4: Verificar se Está Funcionando

Aguarde ver nos logs:
```
✅ Server running on port 5000
✅ Database connected successfully
```

Pressione `Ctrl+C` para sair dos logs.

### Passo 5: Testar as Rotas

Ainda no EC2, teste se as rotas existem:

```bash
# Testar rota /auth/me (deve dar 401 sem token)
curl http://localhost:5000/api/auth/me

# Testar rota /user/profile (deve dar 401 sem token)
curl http://localhost:5000/api/user/profile

# Sair do EC2
exit
```

Se ambas retornarem erro 401 (não 404), significa que as rotas existem!

---

## 🧪 Testar no Navegador

1. Abra o site em **modo anônimo**: http://milhastrade-frontend-mayrus.s3-website-us-east-1.amazonaws.com
2. Faça login com:
   - Email: `admin@milhastrade.com`
   - Senha: `Admin123!`
3. Tente acessar:
   - **Perfil** (não deve dar mais erro 404)
   - **Dashboard** (não deve dar mais erro 404)

---

## 🐛 Se Ainda Não Funcionar

### Verificar se o PM2 está rodando o arquivo correto:

```bash
ssh -i "milhastrade-key.pem" ubuntu@3.234.253.51
pm2 describe milhastrade-backend
```

Verifique se o campo `script path` aponta para o arquivo correto.

### Se necessário, reiniciar completamente:

```bash
cd /home/ubuntu/milhastrade/backend
pm2 delete milhastrade-backend
pm2 start server-simple.js --name milhastrade-backend
pm2 save
pm2 logs milhastrade-backend
```

---

## 📝 Verificar Logs de Erro

Se ainda houver problemas:

```bash
ssh -i "milhastrade-key.pem" ubuntu@3.234.253.51
pm2 logs milhastrade-backend --err --lines 50
```

---

## ✅ Checklist

- [ ] Commit e push feitos
- [ ] Conectado no EC2
- [ ] Git pull executado
- [ ] PM2 reiniciado
- [ ] Logs verificados (sem erros)
- [ ] Rotas testadas (retornam 401, não 404)
- [ ] Site testado (perfil e dashboard funcionando)

---

## 🎯 Comandos Rápidos (Copiar e Colar)

```bash
# No seu computador
cd "C:\Users\mayru\Documents\Projeto - Site de milhas"
git add .
git commit -m "Atualizar configurações"
git push origin main

# No EC2
ssh -i "milhastrade-key.pem" ubuntu@3.234.253.51
cd /home/ubuntu/milhastrade/backend
git pull origin main
pm2 restart milhastrade-backend
pm2 logs milhastrade-backend --lines 20
# Ctrl+C para sair
exit
```

---

## 🆘 Problema Comum

### "Already up to date" mas ainda não funciona

Se o git pull diz que já está atualizado mas as rotas não funcionam:

```bash
# Ver qual arquivo o PM2 está rodando
pm2 describe milhastrade-backend | grep script

# Se estiver rodando o arquivo errado, corrigir:
pm2 delete milhastrade-backend
pm2 start server-simple.js --name milhastrade-backend
pm2 save
```

---

## 🎉 Pronto!

Depois de atualizar, o perfil e dashboard devem funcionar normalmente!
