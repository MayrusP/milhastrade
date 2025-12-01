# 🪣 Criar Bucket S3 para Frontend

## Erro Atual
```
404 Not Found - The specified bucket does not exist
BucketName: milhastrade-frontend
```

## ✅ Solução: Criar o Bucket

### Passo 1: Acessar S3
1. Abra: https://s3.console.aws.amazon.com/s3/
2. Clique em **"Create bucket"** (Criar bucket)

### Passo 2: Configurar Bucket
**Nome do bucket:**
```
milhastrade-frontend
```

**Região:**
```
US East (N. Virginia) us-east-1
```

**Object Ownership:**
- Selecione: **ACLs disabled (recommended)**

**Block Public Access settings:**
- ⚠️ **DESMARQUE** "Block all public access"
- ✅ Marque o checkbox confirmando que você entende os riscos
- (Precisamos que o site seja público)

**Bucket Versioning:**
- Deixe: **Disable** (desabilitado)

**Tags (opcional):**
- Pode deixar em branco

**Default encryption:**
- Deixe: **Server-side encryption with Amazon S3 managed keys (SSE-S3)**

**Clique em "Create bucket"**

### Passo 3: Configurar para Website Estático

1. Clique no bucket **milhastrade-frontend** que você acabou de criar
2. Vá na aba **Properties** (Propriedades)
3. Role até o final até encontrar **Static website hosting**
4. Clique em **Edit**
5. Configure:
   - **Static website hosting:** Enable
   - **Hosting type:** Host a static website
   - **Index document:** `index.html`
   - **Error document:** `index.html` (para React Router funcionar)
6. Clique em **Save changes**

### Passo 4: Configurar Política de Acesso Público

1. Ainda no bucket, vá na aba **Permissions**
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
            "Resource": "arn:aws:s3:::milhastrade-frontend/*"
        }
    ]
}
```

5. Clique em **Save changes**

### Passo 5: Fazer Upload dos Arquivos

1. Vá na aba **Objects**
2. Clique em **Upload**
3. Arraste TODOS os arquivos da pasta `frontend/dist/`
   - ⚠️ Arraste os ARQUIVOS, não a pasta
   - Deve incluir: `index.html`, pasta `assets/`, etc.
4. Clique em **Upload**
5. Aguarde completar

### Passo 6: Obter URL do Site

1. Volte na aba **Properties**
2. Role até **Static website hosting**
3. Copie a **Bucket website endpoint**
4. Deve ser algo como: `http://milhastrade-frontend.s3-website-us-east-1.amazonaws.com`

### Passo 7: Testar

Abra a URL em modo anônimo e teste o login:
- Email: `admin@milhastrade.com`
- Senha: `Admin123!`

## 🎯 Checklist

- [ ] Bucket criado com nome `milhastrade-frontend`
- [ ] Região `us-east-1` selecionada
- [ ] Public access desbloqueado
- [ ] Static website hosting habilitado
- [ ] Bucket policy configurada
- [ ] Arquivos de `frontend/dist/` enviados
- [ ] Site acessível pela URL

## 🐛 Problemas Comuns

### "Access Denied" ao acessar o site
- Verifique se desbloqueou o public access
- Verifique se a bucket policy está correta
- Verifique se os arquivos foram enviados

### Página em branco
- Verifique se o `index.html` está na raiz do bucket
- Verifique se configurou o error document como `index.html`

### API não funciona
- Verifique se o backend está rodando: http://3.234.253.51:5000/health
- Verifique se o `frontend/.env` tem a URL correta

## 📝 Depois de Criar

Atualize os arquivos de documentação com a URL real do bucket se for diferente.

## ✨ Pronto!

Depois de seguir esses passos, seu frontend estará no ar! 🚀
