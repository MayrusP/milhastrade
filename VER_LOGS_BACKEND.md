# 🔍 Ver Logs do Backend

## 🚨 Erro ao Criar Oferta

Erro 500 significa que há um problema no servidor backend.

---

## 🔧 Ver Logs Agora

```powershell
ssh -i "milhastrade-key.pem" ubuntu@44.221.82.103
pm2 logs milhastrade-backend --lines 100
```

Pressione `Ctrl+C` para sair dos logs.

---

## 📊 Comandos Úteis

### Ver apenas erros
```bash
pm2 logs milhastrade-backend --err --lines 50
```

### Ver status do PM2
```bash
pm2 status
```

### Reiniciar backend
```bash
pm2 restart milhastrade-backend
```

### Ver logs em tempo real
```bash
pm2 logs milhastrade-backend
```

---

## 🐛 Possíveis Causas

### 1. Problema com Companhia Aérea (Airline)
O campo `airlineId` pode estar inválido ou a companhia não existe.

### 2. Problema com Validação
Algum campo obrigatório está faltando ou inválido.

### 3. Problema com Banco de Dados
Conexão com o banco pode estar falhando.

### 4. Problema com Autenticação
Token JWT pode estar inválido ou expirado.

---

## 🔍 Me Envie

Depois de ver os logs, me envie:
1. A mensagem de erro completa que aparece nos logs
2. O que você estava tentando criar (tipo de oferta, valores, etc.)
