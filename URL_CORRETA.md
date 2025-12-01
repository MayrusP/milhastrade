# 🌐 URL Correta do Site

## ✅ URL para Acessar o Site

```
http://milhastrade-frontend-mayrus.s3-website-us-east-1.amazonaws.com
```

**Copie e cole essa URL no navegador!**

---

## ❌ URLs Erradas (NÃO use estas)

```
❌ https://milhastrade-frontend-mayrus.s3.us-east-1.amazonaws.com/
❌ https://milhastrade-frontend-mayrus.s3.amazonaws.com/
❌ https://s3.console.aws.amazon.com/s3/buckets/milhastrade-frontend-mayrus
```

Essas URLs são para acessar o bucket via API ou console, não o website!

---

## 🔧 Como Habilitar Static Website Hosting

Se a URL correta não funcionar, você precisa habilitar o Static Website Hosting:

### Passo a Passo:

1. **Acesse o bucket:**
   https://us-east-1.console.aws.amazon.com/s3/buckets/milhastrade-frontend-mayrus?tab=properties

2. **Role até "Static website hosting"**

3. **Clique em "Edit"**

4. **Configure:**
   - Static website hosting: **Enable** ✅
   - Hosting type: **Host a static website**
   - Index document: `index.html`
   - Error document: `index.html`

5. **Clique em "Save changes"**

6. **Copie a URL** que aparece em "Bucket website endpoint"

---

## 🔐 Configurar Acesso Público

Se você vê "Access Denied", também precisa:

### 1. Desbloquear Acesso Público

1. Vá em **Permissions** (Permissões)
2. Em **Block public access**, clique em **Edit**
3. **DESMARQUE** "Block all public access"
4. **Save changes**
5. Digite `confirm`

### 2. Adicionar Bucket Policy

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

5. **Save changes**

---

## ✅ Checklist

- [ ] Static website hosting habilitado
- [ ] Public access desbloqueado
- [ ] Bucket policy adicionada
- [ ] Arquivos enviados (index.html + assets/)
- [ ] Acessando a URL correta (com `s3-website`)

---

## 🧪 Testar

Depois de configurar tudo, acesse:

```
http://milhastrade-frontend-mayrus.s3-website-us-east-1.amazonaws.com
```

Login:
- Email: `admin@milhastrade.com`
- Senha: `Admin123!`

---

## 📝 Salve Esta URL

Esta é a URL oficial do seu site. Salve em algum lugar!

```
http://milhastrade-frontend-mayrus.s3-website-us-east-1.amazonaws.com
```
