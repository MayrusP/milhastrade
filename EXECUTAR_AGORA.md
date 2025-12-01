# ⚡ Executar Agora - Checklist Final

## ✅ O que já está pronto

- ✅ Bucket S3 criado: `milhastrade-frontend-mayrus`
- ✅ Frontend buildado em `frontend/dist/`
- ✅ Configurações atualizadas para o novo bucket
- ✅ Backend configurado com CORS correto

---

## 📋 Passo a Passo (Execute na Ordem)

### 1️⃣ Configurar o Bucket S3

Acesse: https://us-east-1.console.aws.amazon.com/s3/buckets/milhastrade-frontend-mayrus

#### A. Static Website Hosting
1. Clique na aba **Properties**
2. Role até **Static website hosting**
3. Clique em **Edit**
4. Marque: **Enable**
5. Hosting type: **Host a static website**
6. Index document: `index.html`
7. Error document: `index.html`
8. **Save changes**
9. **COPIE A URL** que aparece (ex: `http://milhastrade-frontend-mayrus.s3-website-us-east-1.amazonaws.com`)

#### B. Desbloquear Acesso Público
1. Clique na aba **Permissions**
2. Em **Block public access**, clique em **Edit**
3. **DESMARQUE** "Block all public access"
4. **Save changes**
5. Digite `confirm`

#### C. Adicionar Bucket Policy
1. Ainda em **Permissions**
2. Role até **Bucket policy**
3. Clique em **Edit**
4. Cole:
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
5. **Save changes**

---

### 2️⃣ Upload dos Arquivos

1. Clique na aba **Objects**
2. Clique em **Upload**
3. Clique em **Add files**
4. Navegue até: `C:\Users\mayru\Documents\Projeto - Site de milhas\frontend\dist`
5. Selecione **TODOS** os arquivos:
   - `index.html`
   - Todos os arquivos da pasta `assets/`
6. **IMPORTANTE:** Arraste também a pasta `assets/` inteira
7. Clique em **Upload**
8. Aguarde completar (pode levar 1-2 minutos)

---

### 3️⃣ Fazer Commit das Alterações

Abra o Git Bash ou terminal e execute:

```bash
cd "C:\Users\mayru\Documents\Projeto - Site de milhas"
git add .
git commit -m "Atualizar configurações para bucket milhastrade-frontend-mayrus"
git push origin main
```

---

### 4️⃣ Atualizar Backend no EC2

Abra o terminal e execute:

```bash
ssh -i "milhastrade-key.pem" ubuntu@3.234.253.51
```

Depois, dentro do EC2:

```bash
cd /home/ubuntu/milhastrade/backend
git pull origin main
pm2 restart milhastrade-backend
pm2 logs milhastrade-backend --lines 20
```

Verifique se aparece algo como:
```
Server running on port 5000
Database connected successfully
```

Digite `Ctrl+C` para sair dos logs, depois:
```bash
exit
```

---

### 5️⃣ Testar o Site

1. Abra o navegador em **modo anônimo** (Ctrl+Shift+N)
2. Acesse a URL que você copiou no passo 1A
3. Deve ser algo como: `http://milhastrade-frontend-mayrus.s3-website-us-east-1.amazonaws.com`

4. Teste o login:
   - Email: `admin@milhastrade.com`
   - Senha: `Admin123!`

5. Abra o DevTools (F12) e vá em **Network** → **XHR**
6. Faça login e verifique se as requisições vão para: `http://3.234.253.51:5000/api`

---

## ✅ Checklist Final

- [ ] Static website hosting configurado
- [ ] Public access desbloqueado
- [ ] Bucket policy adicionada
- [ ] Arquivos enviados para S3
- [ ] Commit feito e push realizado
- [ ] Backend atualizado no EC2
- [ ] Site testado e funcionando
- [ ] Login funcionando

---

## 🐛 Se Algo Não Funcionar

### Site não carrega (404)
- Verifique se o `index.html` está na raiz do bucket
- Verifique se o static website hosting está habilitado

### "403 Forbidden"
- Verifique se desbloqueou o public access
- Verifique se a bucket policy está correta

### Página carrega mas login não funciona
- Abra o DevTools (F12) → Console
- Veja se há erros de CORS
- Verifique se o backend está rodando: http://3.234.253.51:5000/health

### Backend não responde
```bash
ssh -i "milhastrade-key.pem" ubuntu@3.234.253.51
pm2 logs milhastrade-backend
pm2 restart milhastrade-backend
```

---

## 📝 URLs Importantes

- **Frontend:** http://milhastrade-frontend-mayrus.s3-website-us-east-1.amazonaws.com
- **Backend Health:** http://3.234.253.51:5000/health
- **Backend API:** http://3.234.253.51:5000/api
- **Console S3:** https://us-east-1.console.aws.amazon.com/s3/buckets/milhastrade-frontend-mayrus

---

## 🎉 Pronto!

Depois de seguir todos os passos, seu site estará no ar! 🚀

Se tudo funcionar, você pode deletar os arquivos de documentação antigos e manter apenas:
- EXECUTAR_AGORA.md (este arquivo)
- DEPLOY_FINAL.md
- STATUS_ATUAL.md
- INDEX.md
