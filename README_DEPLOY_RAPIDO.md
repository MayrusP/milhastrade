# 🚀 Deploy Rápido - 5 Minutos

## Bucket Criado: ✅
`milhastrade-frontend-mayrus`

---

## 3 Passos Simples

### 1. Configurar Bucket (2 min)
https://us-east-1.console.aws.amazon.com/s3/buckets/milhastrade-frontend-mayrus

**Properties → Static website hosting:**
- Enable ✅
- Index: `index.html`
- Error: `index.html`

**Permissions → Block public access:**
- Desmarcar tudo ✅

**Permissions → Bucket policy:**
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

### 2. Upload Arquivos (2 min)
**Objects → Upload:**
- Arraste TUDO de `frontend/dist/`
- Upload ✅

### 3. Atualizar Backend (1 min)
```bash
ssh -i "milhastrade-key.pem" ubuntu@3.234.253.51
cd /home/ubuntu/milhastrade/backend
git pull
pm2 restart milhastrade-backend
exit
```

---

## Testar
URL: http://milhastrade-frontend-mayrus.s3-website-us-east-1.amazonaws.com

Login:
- admin@milhastrade.com
- Admin123!

---

## Problemas?
Veja: [EXECUTAR_AGORA.md](EXECUTAR_AGORA.md)
