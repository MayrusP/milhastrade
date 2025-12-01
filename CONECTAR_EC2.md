# 🔑 Como Conectar no EC2

## ❌ Erro Comum

```
Warning: Identity file milhastrade-key.pem not accessible: No such file or directory.
```

Isso acontece porque você está em um diretório diferente de onde está a chave.

---

## ✅ Solução 1: Navegar até a Pasta do Projeto

```powershell
# Navegar até a pasta do projeto
cd "C:\Users\mayru\Documents\Projeto - Site de milhas"

# Conectar (a chave deve estar nesta pasta)
ssh -i "milhastrade-key.pem" ubuntu@3.234.253.51
```

---

## ✅ Solução 2: Usar Caminho Completo

```powershell
# De qualquer lugar, use o caminho completo da chave
ssh -i "C:\Users\mayru\Documents\Projeto - Site de milhas\milhastrade-key.pem" ubuntu@3.234.253.51
```

---

## ✅ Solução 3: Usar Git Bash (Recomendado)

O Git Bash funciona melhor com SSH no Windows:

1. Abra o **Git Bash** (não PowerShell)
2. Execute:

```bash
cd "/c/Users/mayru/Documents/Projeto - Site de milhas"
ssh -i "milhastrade-key.pem" ubuntu@3.234.253.51
```

---

## 🔧 Verificar Permissões da Chave

Se ainda der erro de permissão, ajuste as permissões:

### No PowerShell (como Administrador):

```powershell
# Navegar até a pasta
cd "C:\Users\mayru\Documents\Projeto - Site de milhas"

# Remover herança de permissões
icacls milhastrade-key.pem /inheritance:r

# Dar permissão apenas para você
icacls milhastrade-key.pem /grant:r "$env:USERNAME:(R)"

# Verificar permissões
icacls milhastrade-key.pem
```

### No Git Bash:

```bash
cd "/c/Users/mayru/Documents/Projeto - Site de milhas"
chmod 400 milhastrade-key.pem
ssh -i "milhastrade-key.pem" ubuntu@3.234.253.51
```

---

## 📝 Comandos Completos para Atualizar Backend

### Opção A: Usando PowerShell

```powershell
# 1. Navegar até a pasta do projeto
cd "C:\Users\mayru\Documents\Projeto - Site de milhas"

# 2. Fazer commit e push
git add .
git commit -m "Atualizar intervalo de notificações para 60s"
git push origin main

# 3. Conectar no EC2
ssh -i "milhastrade-key.pem" ubuntu@3.234.253.51
```

### Opção B: Usando Git Bash (Recomendado)

```bash
# 1. Navegar até a pasta do projeto
cd "/c/Users/mayru/Documents/Projeto - Site de milhas"

# 2. Fazer commit e push
git add .
git commit -m "Atualizar intervalo de notificações para 60s"
git push origin main

# 3. Conectar no EC2
ssh -i "milhastrade-key.pem" ubuntu@3.234.253.51
```

---

## 🖥️ Dentro do EC2

Depois de conectar, execute:

```bash
# Atualizar backend
cd /home/ubuntu/milhastrade/backend
git pull origin main
pm2 restart milhastrade-backend
pm2 logs milhastrade-backend --lines 20

# Pressione Ctrl+C para sair dos logs
# Digite exit para sair do EC2
exit
```

---

## 🚀 Build e Deploy do Frontend

Depois de sair do EC2, faça o build do frontend:

```bash
# Navegar até a pasta frontend
cd frontend

# Fazer build
npm run build

# Os arquivos estarão em frontend/dist/
# Faça upload para o S3
```

---

## 🆘 Se Ainda Não Funcionar

### Verificar se a chave existe:

```powershell
cd "C:\Users\mayru\Documents\Projeto - Site de milhas"
dir milhastrade-key.pem
```

Se não existir, você precisa baixar a chave novamente do AWS Console.

### Baixar chave do AWS:

1. Acesse: https://console.aws.amazon.com/ec2/
2. Vá em **Key Pairs**
3. Se a chave não estiver lá, você precisará criar uma nova e reconfigurar o EC2

---

## ✅ Atalho Rápido

Crie um arquivo `conectar-ec2.bat` na pasta do projeto:

```batch
@echo off
cd /d "C:\Users\mayru\Documents\Projeto - Site de milhas"
ssh -i "milhastrade-key.pem" ubuntu@3.234.253.51
```

Depois é só dar duplo clique nele para conectar!

---

## 🎯 Resumo

**Sempre use um destes comandos:**

```powershell
# PowerShell - com caminho completo
ssh -i "C:\Users\mayru\Documents\Projeto - Site de milhas\milhastrade-key.pem" ubuntu@3.234.253.51
```

```bash
# Git Bash - navegando até a pasta
cd "/c/Users/mayru/Documents/Projeto - Site de milhas"
ssh -i "milhastrade-key.pem" ubuntu@3.234.253.51
```
