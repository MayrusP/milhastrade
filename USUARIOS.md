# 👥 Usuários do Sistema - Plataforma de Troca de Milhas

## 🔐 Credenciais de Login

**IMPORTANTE:** Após o reset do banco de dados, use as credenciais abaixo:

### 👑 Administrador Principal
- **Email:** `mayrus.possa@gmail.com`
- **Senha:** `senha123`
- **Role:** ADMIN
- **Créditos:** R$ 50.000
- **Status:** Verificado ✅

### 👑 Administrador Teste
- **Email:** `admin@test.com`
- **Senha:** `senha123`
- **Role:** ADMIN
- **Créditos:** R$ 25.000
- **Status:** Verificado ✅

### 🌟 Usuário VIP
- **Email:** `vip@test.com`
- **Senha:** `senha123`
- **Role:** VIP
- **Créditos:** R$ 15.000
- **Status:** Verificado ✅

### 💎 Usuário Premium
- **Email:** `premium@test.com`
- **Senha:** `senha123`
- **Role:** PREMIUM
- **Créditos:** R$ 10.000
- **Status:** Verificado ✅

### 👤 Usuário Normal
- **Email:** `user@test.com`
- **Senha:** `senha123`
- **Role:** USER
- **Créditos:** R$ 5.000
- **Status:** Não verificado ❌

---

## 🚀 Funcionalidades por Tipo

### 👑 **Administradores**
- ✅ Painel administrativo completo
- ✅ Gerenciar verificações de usuários
- ✅ Ver estatísticas da plataforma
- ✅ Aprovar/rejeitar documentos
- ✅ Gerenciar tickets de suporte
- ✅ Todas as funcionalidades de usuário

### 🌟 **VIP/Premium**
- ✅ Perfil verificado automaticamente
- ✅ Maior limite de créditos
- ✅ Badge de verificado
- ✅ Todas as funcionalidades de usuário

### 👤 **Usuários Normais**
- ✅ Criar e gerenciar ofertas
- ✅ Comprar/vender milhas
- ✅ Sistema de avaliações
- ✅ Criar tickets de suporte
- ✅ Solicitar verificação de identidade
- ❌ Não verificado inicialmente

---

## 📱 Como Testar

1. **Acesse:** http://localhost:3000
2. **Clique em "Login"**
3. **Use um dos emails acima**
4. **Senha:** `senha123` (para todos)
5. **Explore as funcionalidades** baseadas no tipo de usuário

---

## 🔄 Trocar de Usuário

Para testar diferentes tipos:
1. Faça logout
2. Faça login com outro email
3. Use sempre a senha: `senha123`
4. Veja as diferenças nas funcionalidades disponíveis

---

## 🔧 Recriar Usuários

Se precisar recriar os usuários novamente:

```bash
node backend/recreate-users.js
```

---

**Última Atualização:** 30/11/2025  
**Senha Padrão:** `senha123` (para todos os usuários)
