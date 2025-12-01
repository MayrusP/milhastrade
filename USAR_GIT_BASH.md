# 🔧 Usar Git Bash para Conectar no EC2

## ⚠️ Problema com PowerShell

O PowerShell do Windows tem problemas com chaves SSH. Use o **Git Bash** que funciona melhor.

---

## ✅ Solução: Usar Git Bash

### Passo 1: Abrir Git Bash

1. Clique com botão direito na pasta do projeto
2. Selecione **"Git Bash Here"**

OU

1. Abra o **Git Bash** (procure no menu Iniciar)
2. Navegue até a pasta:
   ```bash
   cd "/c/Users/mayru/Documents/Projeto - Site de milhas"
   ```

### Passo 2: Ajustar Permissões da Chave

```bash
chmod 400 milhastrade-key.pem
```

### Passo 3: Conectar no EC2

```bash
ssh -i milhastrade-key.pem ubuntu@3.234.253.51
```

---

## 🚀 Ou Use o Script Pronto

Criamos um script que faz tudo automaticamente:

```bash
# No Git Bash, na pasta do projeto
./conectar-ec2.sh
```

---

## 📋 Comandos Completos no Git Bash

### Deploy Completo:

```bash
# 1. Commit e push
git add .
git commit -m "Atualizar intervalo de notificações para 60s"
git push origin main

# 2. Build do frontend
cd frontend
npm run build
cd ..

# 3. Conectar no EC2
ssh -i milhastrade-key.pem ubuntu@3.234.253.51
```

### Dentro do EC2:

```bash
cd /home/ubuntu/milhastrade/backend
git pull origin main
pm2 restart milhastrade-backend
pm2 logs milhastrade-backend --lines 20
# Ctrl+C para sair
exit
```

---

## 🔑 Verificar se a Chave Está Correta

No Git Bash:

```bash
# Ver permissões
ls -la milhastrade-key.pem

# Deve mostrar: -r-------- (400)
# Se não, execute:
chmod 400 milhastrade-key.pem

# Testar conexão
ssh -i milhastrade-key.pem ubuntu@3.234.253.51 -v
```

O `-v` mostra detalhes da conexão para debug.

---

## 🆘 Se Ainda Não Funcionar

### Verificar se a chave é a correta:

```bash
# Ver fingerprint da chave local
ssh-keygen -lf milhastrade-key.pem
```

### Verificar no AWS Console:

1. Acesse: https://console.aws.amazon.com/ec2/
2. Vá em **Key Pairs**
3. Procure por `milhastrade-key`
4. Compare o fingerprint

### Se a chave estiver errada:

Você precisará:
1. Baixar a chave correta do AWS (se ainda tiver)
2. OU criar uma nova chave e reconfigurar o EC2

---

## 💡 Alternativa: Usar PuTTY (Windows)

Se o Git Bash não funcionar, você pode usar o PuTTY:

### Passo 1: Converter a Chave

1. Baixe o PuTTYgen: https://www.putty.org/
2. Abra o PuTTYgen
3. **Load** → Selecione `milhastrade-key.pem`
4. **Save private key** → Salve como `milhastrade-key.ppk`

### Passo 2: Conectar com PuTTY

1. Abra o PuTTY
2. Em **Host Name**: `ubuntu@3.234.253.51`
3. Em **Connection** → **SSH** → **Auth** → **Credentials**
4. **Private key file**: Selecione `milhastrade-key.ppk`
5. Clique em **Open**

---

## 🎯 Recomendação

**Use o Git Bash!** É a forma mais simples e confiável no Windows.

```bash
# Abra Git Bash na pasta do projeto
cd "/c/Users/mayru/Documents/Projeto - Site de milhas"
chmod 400 milhastrade-key.pem
ssh -i milhastrade-key.pem ubuntu@3.234.253.51
```

---

## ✅ Depois de Conectar

Quando conseguir conectar, execute:

```bash
# Atualizar backend
cd /home/ubuntu/milhastrade/backend
git pull origin main
pm2 restart milhastrade-backend
pm2 logs milhastrade-backend

# Sair
exit
```

---

## 📝 Criar Atalho

Crie um arquivo `conectar.sh` na pasta do projeto:

```bash
#!/bin/bash
chmod 400 milhastrade-key.pem
ssh -i milhastrade-key.pem ubuntu@3.234.253.51
```

Depois é só executar:
```bash
./conectar.sh
```
