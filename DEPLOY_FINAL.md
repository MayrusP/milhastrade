# 🚀 Deploy Final - MilhasTrade

## ✅ Bucket S3 Criado!

**Nome do bucket:** `milhastrade-frontend-mayrus`
**URL:** https://us-east-1.console.aws.amazon.com/s3/buckets/milhastrade-frontend-mayrus

---

## 📋 Checklist de Configuração do Bucket

### 1. Configurar Static Website Hosting

1. No bucket, vá em **Properties** (Propriedades)
2. Role até **Static website hosting**
3. Clique em **Edit**
4. Configure:
   - ✅ **Static website hosting:** Enable
   - ✅ **Hosting type:** Host a static website
   - ✅ **Index document:** `index.html`
   - ✅ **Error document:** `index.html`
5. Clique em **Save changes**
6. **Copie a URL do endpoint** (algo como: `http://milhastrade-frontend-mayrus.s3-website-us-east-1.amazonaws.com`)

### 2. Configurar Acesso Público

1. Vá em **Permissions** (Permissões)
2. Em **Block public access**, clique em **Edit**
3. **Desmarque** "Block all public access"
4. Clique em **Save changes**
5. Digite `confirm` e confirme

### 3. Adicionar Bucket Policy

1. Ainda em **Permissions**
2. Role até **Bucket policy**
3. Clique em **Edit**
4. Cole esta política:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::milhastrade-frontend-mayrus/*"
        }
    ]
}
```

5. Clique em **Save changes**

---

## 📤 Upload dos Arquivos

### Opção 1: Via Console (Recomendado)

1. Vá em **Objects**
2. Clique em **Upload**
3. Clique em **Add files** ou arraste os arquivos
4. Selecione TODOS os arquivos de `frontend/dist/`:
   - `index.html`
   - Pasta `assets/` (com todos os arquivos dentro)
5. Clique em **Upload**
6. Aguarde completar

### Opção 2: Via AWS CLI (Se instalado)

```bash
cd frontend
aws s3 sync dist/ s3://milhastrade-frontend-mayrus --delete
```

---

## 🧪 Testar o Deploy

1. Copie a URL do Static Website Hosting (do passo 1)
2. Abra em **modo anônimo** (Ctrl+Shift+N)
3. A URL deve ser algo como:
   ```
   http://milhastrade-frontend-mayrus.s3-website-us-east-1.amazonaws.com
   ```

4. Teste o login:
   - Email: `admin@milhastrade.com`
   - Senha: `Admin123!`

---

## 🔍 Verificações

### Frontend
- [ ] Bucket configurado para static website
- [ ] Acesso público habilitado
- [ ] Bucket policy adicionada
- [ ] Arquivos enviados (index.html + assets/)
- [ ] Site acessível pela URL

### Backend (Atualizar CORS)

O backend precisa ser atualizado para aceitar requisições do novo bucket:

```bash
ssh -i "milhastrade-key.pem" ubuntu@3.234.253.51
cd /home/ubuntu/milhastrade/backend
git pull
pm2 restart milhastrade-backend
exit
```

---

## 🐛 Troubleshooting

### "403 Forbidden" ao acessar o site
- Verifique se desbloqueou o public access
- Verifique se a bucket policy está correta
- Verifique se os arquivos têm permissão de leitura

### Página em branco
- Abra o DevTools (F12) e veja o Console
- Verifique se o `index.html` está na raiz do bucket
- Verifique se configurou o error document

### Erro de CORS
- Verifique se o backend está rodando: http://3.234.253.51:5000/health
- Faça o git pull e restart do backend (comando acima)

### API não responde
```bash
# Conectar no EC2
ssh -i "milhastrade-key.pem" ubuntu@3.234.253.51

# Ver logs
pm2 logs milhastrade-backend

# Reiniciar
pm2 restart milhastrade-backend
```

---

## 📝 URLs Importantes

- **Frontend:** http://milhastrade-frontend-mayrus.s3-website-us-east-1.amazonaws.com
- **Backend API:** http://3.234.253.51:5000/api
- **Backend Health:** http://3.234.253.51:5000/health
- **Console S3:** https://us-east-1.console.aws.amazon.com/s3/buckets/milhastrade-frontend-mayrus

---

## ✨ Próximos Deploys

Sempre que fizer alterações:

1. **Frontend:**
   ```bash
   cd frontend
   npm run build
   # Upload dos arquivos de dist/ para S3
   ```

2. **Backend:**
   ```bash
   git add .
   git commit -m "Suas alterações"
   git push
   
   # No EC2
   ssh -i "milhastrade-key.pem" ubuntu@3.234.253.51
   cd /home/ubuntu/milhastrade/backend
   git pull
   npm install
   npm run build
   pm2 restart milhastrade-backend
   ```

---

## 🎉 Pronto!

Siga os passos acima e seu site estará no ar! 🚀
