# 🗄️ Como Acessar o Banco de Dados PostgreSQL RDS

## 📊 Informações do Banco

**Tipo:** PostgreSQL (AWS RDS)
**Endpoint:** milhastrade-db.cohwawekwiia.us-east-1.rds.amazonaws.com
**Porta:** 5432
**Database:** milhastrade
**Usuário:** milhastrade_adm
**Senha:** Mayrus05011995

---

## 🌐 Opção 1: pgAdmin (Recomendado - Interface Gráfica)

### Passo 1: Instalar pgAdmin
1. Baixe: https://www.pgadmin.org/download/
2. Escolha a versão para Windows
3. Instale normalmente

### Passo 2: Conectar ao Banco
1. Abra o pgAdmin
2. Clique com botão direito em **Servers** → **Register** → **Server**
3. Na aba **General:**
   - Name: `MilhasTrade RDS`
4. Na aba **Connection:**
   - Host name/address: `milhastrade-db.cohwawekwiia.us-east-1.rds.amazonaws.com`
   - Port: `5432`
   - Maintenance database: `milhastrade`
   - Username: `milhastrade_adm`
   - Password: `Mayrus05011995`
   - ✅ Marque "Save password"
5. Clique em **Save**

### Passo 3: Explorar o Banco
1. Expanda: **Servers** → **MilhasTrade RDS** → **Databases** → **milhastrade**
2. Expanda **Schemas** → **public** → **Tables**
3. Clique com botão direito em uma tabela → **View/Edit Data** → **All Rows**

---

## 💻 Opção 2: DBeaver (Alternativa Gratuita)

### Passo 1: Instalar DBeaver
1. Baixe: https://dbeaver.io/download/
2. Escolha "Community Edition" (gratuita)
3. Instale normalmente

### Passo 2: Conectar ao Banco
1. Abra o DBeaver
2. Clique em **Database** → **New Database Connection**
3. Selecione **PostgreSQL** → **Next**
4. Preencha:
   - Host: `milhastrade-db.cohwawekwiia.us-east-1.rds.amazonaws.com`
   - Port: `5432`
   - Database: `milhastrade`
   - Username: `milhastrade_adm`
   - Password: `Mayrus05011995`
   - ✅ Marque "Save password"
5. Clique em **Test Connection**
6. Se pedir para baixar drivers, clique em **Download**
7. Clique em **Finish**

### Passo 3: Explorar o Banco
1. Expanda a conexão no painel esquerdo
2. Expanda **Databases** → **milhastrade** → **Schemas** → **public** → **Tables**
3. Clique duplo em uma tabela para ver os dados

---

## 🌍 Opção 3: Adminer (Interface Web)

### Passo 1: Instalar Adminer no EC2
```bash
ssh -i "milhastrade-key.pem" ubuntu@3.234.253.51
```

Dentro do EC2:
```bash
# Criar pasta para adminer
sudo mkdir -p /var/www/adminer
cd /var/www/adminer

# Baixar Adminer
sudo wget https://github.com/vrana/adminer/releases/download/v4.8.1/adminer-4.8.1.php
sudo mv adminer-4.8.1.php index.php

# Instalar nginx (se não tiver)
sudo apt update
sudo apt install nginx -y

# Configurar nginx
sudo nano /etc/nginx/sites-available/adminer
```

Cole esta configuração:
```nginx
server {
    listen 8080;
    server_name _;
    root /var/www/adminer;
    index index.php;

    location / {
        try_files $uri $uri/ =404;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    }
}
```

Salve (Ctrl+O, Enter, Ctrl+X) e continue:
```bash
# Ativar configuração
sudo ln -s /etc/nginx/sites-available/adminer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Instalar PHP
sudo apt install php-fpm php-pgsql -y
sudo systemctl restart php8.1-fpm

exit
```

### Passo 2: Acessar via Navegador
1. Abra: http://3.234.253.51:8080
2. Preencha:
   - System: **PostgreSQL**
   - Server: `milhastrade-db.cohwawekwiia.us-east-1.rds.amazonaws.com`
   - Username: `milhastrade_adm`
   - Password: `Mayrus05011995`
   - Database: `milhastrade`
3. Clique em **Login**

---

## 🔧 Opção 4: Via Linha de Comando (psql)

### No EC2:
```bash
ssh -i "milhastrade-key.pem" ubuntu@3.234.253.51

# Instalar psql (se não tiver)
sudo apt update
sudo apt install postgresql-client -y

# Conectar ao banco
psql -h milhastrade-db.cohwawekwiia.us-east-1.rds.amazonaws.com -U milhastrade_adm -d milhastrade
# Senha: Mayrus05011995
```

### Comandos Úteis no psql:
```sql
-- Listar tabelas
\dt

-- Ver estrutura de uma tabela
\d users

-- Ver dados de uma tabela
SELECT * FROM users LIMIT 10;

-- Contar registros
SELECT COUNT(*) FROM users;

-- Sair
\q
```

---

## 📊 Opção 5: TablePlus (Pago mas tem trial)

### Passo 1: Instalar TablePlus
1. Baixe: https://tableplus.com/
2. Instale (tem trial gratuito de 14 dias)

### Passo 2: Conectar
1. Abra TablePlus
2. Clique em **Create a new connection**
3. Selecione **PostgreSQL**
4. Preencha:
   - Name: `MilhasTrade`
   - Host: `milhastrade-db.cohwawekwiia.us-east-1.rds.amazonaws.com`
   - Port: `5432`
   - User: `milhastrade_adm`
   - Password: `Mayrus05011995`
   - Database: `milhastrade`
5. Clique em **Test** e depois **Connect**

---

## 🔍 Consultas Úteis

### Ver todos os usuários:
```sql
SELECT id, name, email, role, credits, "createdAt" 
FROM users 
ORDER BY "createdAt" DESC;
```

### Ver todas as ofertas:
```sql
SELECT o.id, o.title, o.type, o.status, o."milesAmount", o.price, 
       u.name as seller, a.name as airline
FROM offers o
JOIN users u ON o."sellerId" = u.id
JOIN airlines a ON o."airlineId" = a.id
ORDER BY o."createdAt" DESC;
```

### Ver transações:
```sql
SELECT t.id, t.status, t.amount, 
       buyer.name as buyer, 
       seller.name as seller,
       o.title as offer
FROM transactions t
JOIN users buyer ON t."buyerId" = buyer.id
JOIN users seller ON t."sellerId" = seller.id
JOIN offers o ON t."offerId" = o.id
ORDER BY t."createdAt" DESC;
```

### Estatísticas gerais:
```sql
-- Total de usuários
SELECT COUNT(*) as total_users FROM users;

-- Total de ofertas por status
SELECT status, COUNT(*) as total 
FROM offers 
GROUP BY status;

-- Total de transações por status
SELECT status, COUNT(*) as total, SUM(amount) as total_amount
FROM transactions 
GROUP BY status;
```

---

## ⚠️ Importante: Segurança

### Configurar Security Group do RDS

Para acessar de fora da AWS, você precisa liberar seu IP:

1. Acesse: https://console.aws.amazon.com/rds/
2. Clique em **Databases** → **milhastrade-db**
3. Na seção **Connectivity & security**, clique no **VPC security groups**
4. Clique na aba **Inbound rules** → **Edit inbound rules**
5. Clique em **Add rule**:
   - Type: **PostgreSQL**
   - Port: **5432**
   - Source: **My IP** (ou Custom com seu IP)
6. **Save rules**

**⚠️ ATENÇÃO:** Não deixe aberto para `0.0.0.0/0` (qualquer IP) em produção!

---

## 🎯 Recomendação

Para uso diário, recomendo:
1. **pgAdmin** - Mais completo e gratuito
2. **DBeaver** - Mais leve e também gratuito
3. **TablePlus** - Mais bonito mas pago

Para acesso rápido:
- **psql via EC2** - Já está configurado e seguro

---

## 📝 Backup do Banco

### Fazer backup via EC2:
```bash
ssh -i "milhastrade-key.pem" ubuntu@3.234.253.51

# Fazer backup
pg_dump -h milhastrade-db.cohwawekwiia.us-east-1.rds.amazonaws.com \
        -U milhastrade_adm \
        -d milhastrade \
        -F c \
        -f backup_$(date +%Y%m%d).dump

# Baixar backup para seu computador (em outro terminal)
scp -i "milhastrade-key.pem" \
    ubuntu@3.234.253.51:~/backup_*.dump \
    ./
```

### Restaurar backup:
```bash
pg_restore -h milhastrade-db.cohwawekwiia.us-east-1.rds.amazonaws.com \
           -U milhastrade_adm \
           -d milhastrade \
           -c \
           backup_20241130.dump
```

---

## 🆘 Problemas Comuns

### "Connection refused"
- Verifique se liberou seu IP no Security Group do RDS

### "Password authentication failed"
- Verifique se a senha está correta: `Mayrus05011995`

### "Could not connect to server"
- Verifique se o endpoint está correto
- Verifique sua conexão com a internet

### "SSL connection required"
- Adicione `?sslmode=require` na connection string
- Ou desabilite SSL nas configurações do cliente

---

## ✅ Pronto!

Agora você pode acessar e gerenciar seu banco de dados PostgreSQL RDS! 🎉
