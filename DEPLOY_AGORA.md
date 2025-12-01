# 🚀 Deploy Imediato - Passo a Passo

## ✅ O que já está pronto

1. **Frontend buildado** - Pasta `frontend/dist` com os arquivos prontos
2. **Configurações atualizadas** - Todos os `.env` apontando para produção
3. **Backend configurado** - Rodando no EC2 com PostgreSQL RDS

## 📤 Upload do Frontend para S3

### Opção 1: Via Console AWS (Mais Fácil)

1. Acesse: https://s3.console.aws.amazon.com/s3/buckets/milhastrade-frontend
2. Clique em **"Upload"**
3. Arraste TODOS os arquivos da pasta `frontend/dist` (não a pasta, os arquivos dentro dela)
4. Em **"Permissions"** → Mantenha as configurações padrão
5. Em **"Properties"** → Adicione:
   - **Metadata:**
     - Key: `Cache-Control`
     - Value: `no-cache, no-store, must-revalidate`
6. Clique em **"Upload"**
7. Aguarde o upload completar
8. **IMPORTANTE:** Delete os arquivos antigos primeiro se houver

### Opção 2: Via AWS CLI (Se instalado)

```bash
cd frontend
aws s3 sync dist/ s3://milhastrade-frontend --delete --cache-control "no-cache, no-store, must-revalidate"
```

## 🧪 Testar o Deploy

1. Abra o navegador em **modo anônimo** (Ctrl+Shift+N)
2. Acesse: http://milhastrade-frontend.s3-website-us-east-1.amazonaws.com
3. Teste o login:
   - Email: `admin@milhastrade.com`
   - Senha: `Admin123!`

## 🔍 Verificar se está funcionando

### Frontend
- Abra o DevTools (F12)
- Vá em **Network** → **XHR**
- Faça login
- Verifique se as requisições estão indo para: `http://3.234.253.51:5000/api`

### Backend
Teste direto no navegador:
- Health: http://3.234.253.51:5000/health
- Airlines: http://3.234.253.51:5000/api/airlines

## 📋 Checklist de Deploy

- [ ] Build do frontend feito (`npm run build` na pasta frontend)
- [ ] Arquivos da pasta `frontend/dist` enviados para S3
- [ ] Arquivos antigos do S3 deletados
- [ ] Testado em modo anônimo
- [ ] Login funcionando
- [ ] API respondendo

## 🐛 Se algo não funcionar

### Frontend mostra página antiga
1. Delete TODOS os arquivos do bucket S3
2. Faça upload novamente
3. Teste em modo anônimo

### Erro de CORS
1. Verifique se o backend está rodando: http://3.234.253.51:5000/health
2. Se não estiver, conecte no EC2 e reinicie:
```bash
ssh -i "milhastrade-key.pem" ubuntu@3.234.253.51
pm2 restart milhastrade-backend
pm2 logs
```

### API não responde
```bash
# Conectar no EC2
ssh -i "milhastrade-key.pem" ubuntu@3.234.253.51

# Ver logs
pm2 logs milhastrade-backend

# Reiniciar se necessário
pm2 restart milhastrade-backend
```

## 📝 Próximos Deploys

Sempre que fizer alterações:

1. **Frontend:**
   ```bash
   cd frontend
   npm run build
   # Upload dos arquivos de dist/ para S3
   ```

2. **Backend:**
   ```bash
   # Commit e push das alterações
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

## 🎯 Arquivos Importantes

- `frontend/.env` - URL da API (já configurado)
- `backend/.env` - Configurações AWS e DB (já configurado)
- `frontend/dist/` - Arquivos para upload no S3

## ✨ Tudo Pronto!

Agora é só fazer o upload dos arquivos do `frontend/dist` para o S3 e testar! 🚀
