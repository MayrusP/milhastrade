# 🔧 Atualizar Backend - Corrigir Criar Oferta

## 🐛 Problema

Erro 500 ao criar oferta porque o backend estava usando sistema de token antigo.

## ✅ Correção Aplicada

1. Adicionada função helper `getUserIdFromToken()` para extrair userId do JWT
2. Atualizada rota POST `/api/offers` para usar JWT real
3. Removido código antigo de `mock-jwt-token`

---

## 🚀 Atualizar Backend no EC2

### 1. Fazer Commit Local

```powershell
cd "C:\Users\mayru\Documents\Projeto - Site de milhas"
git add backend/server-simple.js
git commit -m "Corrigir autenticação JWT na rota de criar oferta"
git push origin main
```

### 2. Conectar no EC2

```powershell
ssh -i "milhastrade-key.pem" ubuntu@44.221.82.103
```

### 3. Atualizar Código

```bash
cd /home/ubuntu/milhastrade/backend
git pull origin main
```

### 4. Reiniciar Backend

```bash
pm2 restart milhastrade-backend
```

### 5. Verificar Logs

```bash
pm2 logs milhastrade-backend --lines 20
```

Aguarde ver:
```
✅ Server running on port 5000
✅ Database connected successfully
```

Pressione `Ctrl+C` para sair.

### 6. Sair do EC2

```bash
exit
```

---

## 🧪 Testar Criar Oferta

1. Acesse o site
2. Faça login com `mayrus.possa@gmail.com` / `senha123`
3. Vá para o Marketplace
4. Clique em "Criar Oferta"
5. Preencha os dados:
   - Título: "Teste de Oferta"
   - Descrição: "Oferta de teste"
   - Quantidade de Milhas: 10000
   - Preço: 500
   - Tipo: Venda
   - Companhia: Selecione uma
6. Clique em "Criar Oferta"

✅ Deve funcionar agora!

---

## 🔍 Se Ainda Houver Erro

### Ver Logs Detalhados

```bash
ssh -i "milhastrade-key.pem" ubuntu@44.221.82.103
pm2 logs milhastrade-backend --err --lines 50
```

### Verificar se o Git Pull Funcionou

```bash
cd /home/ubuntu/milhastrade/backend
git log --oneline -1
```

Deve mostrar o commit mais recente.

### Verificar se o Arquivo Foi Atualizado

```bash
grep -n "getUserIdFromToken" server-simple.js
```

Deve encontrar a função.

---

## 📊 O Que Foi Corrigido

### Antes (Código Antigo)
```javascript
// ❌ Usava sistema mock
let userId = token.replace('mock-jwt-token-', '');
```

### Depois (Código Novo)
```javascript
// ✅ Usa JWT real
function getUserIdFromToken(authHeader) {
  const token = authHeader.replace('Bearer ', '');
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded.userId;
}

let userId = getUserIdFromToken(req.headers.authorization);
```

---

## 🎯 Próximos Passos

Depois de corrigir esta rota, vou precisar atualizar outras rotas que ainda usam o sistema antigo:
- GET /api/user/offers
- POST /api/offers/:id/buy
- GET /api/user/transactions
- GET /api/notifications
- E outras...

Mas por enquanto, a criação de ofertas deve funcionar!

---

## 📝 Checklist

- [ ] Commit feito localmente
- [ ] Push para o GitHub
- [ ] Git pull no EC2
- [ ] Backend reiniciado
- [ ] Logs verificados (sem erros)
- [ ] Teste de criar oferta funcionando

---

## 🆘 Suporte

Se ainda houver erro, me envie:
1. A mensagem de erro completa dos logs
2. O que você preencheu no formulário
3. A resposta da API (se houver)
