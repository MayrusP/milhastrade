# 🔧 Atualizar Backend para Permitir Frontend

Execute estes comandos no PowerShell:

```powershell
cd Downloads
ssh -i milhastrade-key.pem ec2-user@3.234.253.51
```

Depois no EC2:

```bash
cd milhastrade/backend
nano .env
```

Encontre a linha `CORS_ORIGINS` e mude para:

```
CORS_ORIGINS=http://localhost:5173,http://3.234.253.51:5000,http://milhastrade-frontend-mayrus.s3-website-us-east-1.amazonaws.com
```

Salve: Ctrl+X, Y, Enter

Reinicie o servidor:

```bash
pm2 restart milhastrade-api
pm2 logs milhastrade-api --lines 10
```

Pressione Ctrl+C para sair dos logs.

Digite `exit` para sair do EC2.
