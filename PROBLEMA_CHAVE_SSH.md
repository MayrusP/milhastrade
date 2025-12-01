# 🔑 Problema: Chave SSH Incorreta

## 🔍 Diagnóstico

O SSH está funcionando corretamente, mas o servidor EC2 está **rejeitando a chave**.

```
debug1: Trying private key: milhastrade-key.pem
debug1: Authentications that can continue: publickey,gssapi-keyex,gssapi-with-mic
debug1: No more authentication methods to try.
```

Isso significa que a chave `milhastrade-key.pem` **não corresponde** à chave pública configurada no EC2.

---

## ✅ Soluções

### Opção 1: Verificar se Há Outra Chave

Procure por outras chaves `.pem` no seu computador:

```powershell
Get-ChildItem -Path "C:\Users\mayru" -Filter "*.pem" -Recurse -ErrorAction SilentlyContinue | Select-Object FullName
```

Se encontrar outra chave, tente com ela:

```powershell
ssh -i "caminho\da\outra\chave.pem" ubuntu@3.234.253.51
```

---

### Opção 2: Baixar a Chave Correta do AWS

Se você ainda tem acesso à chave original:

1. Verifique seus e-mails da AWS
2. Verifique outros computadores onde você pode ter salvado
3. Verifique backups

**⚠️ IMPORTANTE:** A chave privada só pode ser baixada UMA VEZ quando você cria o Key Pair. Se você perdeu, não pode recuperar.

---

### Opção 3: Verificar o Nome da Chave no EC2

Vamos ver qual chave o EC2 está esperando:

1. Acesse: https://console.aws.amazon.com/ec2/
2. Clique em **Instances**
3. Selecione a instância `milhastrade` (IP: 3.234.253.51)
4. Na aba **Details**, procure por **Key pair name**

Anote o nome da chave. Deve ser algo como `milhastrade-key` ou similar.

---

### Opção 4: Criar Nova Chave e Reconfigurar EC2

Se você perdeu a chave original, você precisará:

#### Passo 1: Criar Nova Chave

1. Acesse: https://console.aws.amazon.com/ec2/
2. Vá em **Key Pairs** (no menu lateral)
3. Clique em **Create key pair**
4. Nome: `milhastrade-key-new`
5. Type: **RSA**
6. Format: **pem**
7. Clique em **Create key pair**
8. **SALVE O ARQUIVO** que será baixado!

#### Passo 2: Adicionar Nova Chave ao EC2

Isso é mais complicado e requer acesso ao servidor. Você tem algumas opções:

**Opção A: Usar AWS Systems Manager (Session Manager)**

1. Acesse: https://console.aws.amazon.com/ec2/
2. Selecione a instância
3. Clique em **Connect**
4. Escolha **Session Manager**
5. Clique em **Connect**

Se funcionar, você terá acesso ao terminal e pode adicionar a nova chave:

```bash
# No terminal do Session Manager
cd /home/ubuntu/.ssh
echo "SUA_CHAVE_PUBLICA_AQUI" >> authorized_keys
```

**Opção B: Criar Snapshot e Nova Instância**

Mais trabalhoso, mas funciona:

1. Criar snapshot do volume atual
2. Criar nova instância com a nova chave
3. Anexar o volume antigo
4. Migrar dados

---

### Opção 5: Usar AWS CloudShell

1. Acesse: https://console.aws.amazon.com/cloudshell/
2. No CloudShell, tente conectar:

```bash
# Primeiro, você precisa ter a chave no CloudShell
# Você pode fazer upload ou criar uma nova

# Conectar
ssh -i sua-chave.pem ubuntu@3.234.253.51
```

---

## 🔍 Verificar Fingerprint da Chave

Para confirmar se a chave está errada:

### No PowerShell:

```powershell
# Ver fingerprint da sua chave local
ssh-keygen -lf milhastrade-key.pem
```

### No AWS Console:

1. Acesse: https://console.aws.amazon.com/ec2/
2. Vá em **Key Pairs**
3. Procure pela chave usada no EC2
4. Compare o fingerprint

Se forem diferentes, você tem a chave errada.

---

## 🆘 Solução Temporária: Usar Console AWS

Enquanto resolve o problema da chave, você pode acessar o EC2 pelo console:

1. Acesse: https://console.aws.amazon.com/ec2/
2. Selecione a instância
3. Clique em **Connect**
4. Escolha **EC2 Instance Connect**
5. Clique em **Connect**

Isso abre um terminal no navegador!

---

## 📝 Comandos para Atualizar Backend (via Console AWS)

Se conseguir acessar pelo console:

```bash
cd /home/ubuntu/milhastrade/backend
git pull origin main
pm2 restart milhastrade-backend
pm2 logs milhastrade-backend
```

---

## ✅ Próximos Passos

1. **Tente acessar via EC2 Instance Connect** (console AWS)
2. **Verifique qual é a chave correta** no EC2
3. **Procure a chave original** no seu computador
4. Se não encontrar, **crie nova chave** e reconfigure

---

## 🎯 Comando para Procurar Chaves

```powershell
# Procurar todas as chaves .pem
Get-ChildItem -Path "C:\Users\mayru" -Filter "*.pem" -Recurse -ErrorAction SilentlyContinue | 
    Select-Object FullName, LastWriteTime | 
    Format-Table -AutoSize
```

---

## 💡 Dica

A forma mais rápida agora é usar o **EC2 Instance Connect** pelo console AWS para atualizar o backend enquanto resolve o problema da chave SSH.
