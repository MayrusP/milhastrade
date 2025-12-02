# 🔍 Verificar e Resetar Conta

## 🎯 Problema

Não consegue acessar a conta `mayrus.possa@gmail.com`

## ✅ Solução

Execute o script que vai:
1. Verificar se a conta existe
2. Mostrar informações da conta
3. Resetar a senha para `senha123`
4. Garantir que é ADMIN e verificado

---

## 🚀 Como Executar

### Opção 1: Localmente (Se o backend estiver rodando local)

```powershell
cd "C:\Users\mayru\Documents\Projeto - Site de milhas\backend"
node verificar-usuario.js
```

### Opção 2: No EC2 (Produção)

```powershell
# Conectar no EC2
ssh -i "milhastrade-key.pem" ubuntu@44.221.82.103

# Ir para a pasta do backend
cd /home/ubuntu/milhastrade/backend

# Executar o script
node verificar-usuario.js

# Sair do EC2
exit
```

---

## 📊 O Que o Script Faz

1. ✅ Busca o usuário no banco de dados
2. ✅ Mostra todas as informações da conta
3. ✅ Reseta a senha para `senha123`
4. ✅ Garante que o usuário é ADMIN
5. ✅ Garante que o usuário está verificado

---

## 🔑 Credenciais Após Executar

- **Email:** `mayrus.possa@gmail.com`
- **Senha:** `senha123`
- **Role:** ADMIN
- **Status:** Verificado ✅

---

## 🧪 Testar Login

Depois de executar o script:

1. Acesse: http://milhastrade-frontend-mayrus.s3-website-us-east-1.amazonaws.com
2. Clique em **Login**
3. Digite:
   - Email: `mayrus.possa@gmail.com`
   - Senha: `senha123`
4. Clique em **Entrar**

✅ Deve funcionar!

---

## 🐛 Se Ainda Não Funcionar

### Verificar se o Backend Está Rodando

```powershell
# Testar API
Invoke-WebRequest -Uri "http://44.221.82.103:5000/api/health" -UseBasicParsing
```

Deve retornar: `{"status":"OK",...}`

### Verificar Logs do Backend

```powershell
ssh -i "milhastrade-key.pem" ubuntu@44.221.82.103
pm2 logs milhastrade-backend --lines 50
```

### Tentar Criar Nova Conta

Se nada funcionar, tente criar uma nova conta com outro email e veja se funciona.

---

## 💡 Possíveis Problemas

### 1. Senha Incorreta
✅ **Solução:** Execute o script para resetar

### 2. Conta Não Verificada
✅ **Solução:** O script marca como verificada

### 3. Conta Suspensa
✅ **Solução:** O script garante que é ADMIN (não suspensa)

### 4. Token Expirado
✅ **Solução:** Faça logout e login novamente

### 5. Backend Não Está Rodando
✅ **Solução:** Reinicie o backend no EC2

---

## 🔧 Comandos Úteis

### Ver Todos os Usuários

```javascript
// No backend, crie um arquivo listar-usuarios.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listarUsuarios() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isVerified: true,
      credits: true,
    }
  });
  console.table(users);
  await prisma.$disconnect();
}

listarUsuarios();
```

Execute:
```powershell
node listar-usuarios.js
```

---

## 📝 Checklist

- [ ] Script executado com sucesso
- [ ] Senha resetada para `senha123`
- [ ] Usuário é ADMIN
- [ ] Usuário está verificado
- [ ] Backend está rodando
- [ ] Login testado e funcionando

---

## 🆘 Suporte

Se nada funcionar, me envie:
1. A saída do script `verificar-usuario.js`
2. Os logs do backend (`pm2 logs`)
3. O erro que aparece ao tentar fazer login
