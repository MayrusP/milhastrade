# 🚀 Deploy Simplificado - MilhasTrade

## Configuração Única (já feita)

Todos os arquivos de configuração agora estão prontos para produção:
- ✅ `backend/.env` - Configurado para AWS RDS, S3 e EC2
- ✅ `frontend/.env` - Configurado para apontar para o backend EC2
- ✅ Arquivos `.env` estão no repositório (não mais ignorados)

## Deploy Automático

### Opção 1: Script Automático (Recomendado)

**Windows:**
```bash
deploy.bat
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

O script faz automaticamente:
1. Build do frontend
2. Upload para S3
3. Deploy do backend no EC2 via SSH

### Opção 2: Deploy Manual

#### Frontend (S3)
```bash
cd frontend
npm run build
aws s3 sync dist/ s3://milhastrade-frontend --delete
```

#### Backend (EC2)
```bash
ssh -i "milhastrade-key.pem" ubuntu@3.234.253.51
cd /home/ubuntu/milhastrade/backend
git pull origin main
npm install --production
npm run build
pm2 restart milhastrade-backend
```

## URLs de Acesso

- **Frontend:** http://milhastrade-frontend.s3-website-us-east-1.amazonaws.com
- **Backend API:** http://3.234.253.51:5000/api
- **Backend Health:** http://3.234.253.51:5000/health

## Fluxo de Trabalho

1. Faça suas alterações no código
2. Commit e push para o repositório
3. Execute `deploy.bat` (Windows) ou `./deploy.sh` (Linux/Mac)
4. Pronto! 🎉

## Verificação Rápida

Após o deploy, teste:
```bash
# Testar backend
curl http://3.234.253.51:5000/health

# Testar frontend
curl http://milhastrade-frontend.s3-website-us-east-1.amazonaws.com
```

## Troubleshooting

### Frontend não atualiza
```bash
# Limpar cache do navegador ou usar modo anônimo
# Ou forçar novo upload:
aws s3 sync frontend/dist/ s3://milhastrade-frontend --delete --cache-control "no-cache"
```

### Backend não responde
```bash
# Verificar logs no EC2
ssh -i "milhastrade-key.pem" ubuntu@3.234.253.51
pm2 logs milhastrade-backend
```

### Erro de permissão SSH
```bash
# Windows
icacls milhastrade-key.pem /inheritance:r
icacls milhastrade-key.pem /grant:r "%username%:R"

# Linux/Mac
chmod 400 milhastrade-key.pem
```

## Notas Importantes

- ⚠️ As credenciais AWS estão no `.env` - mantenha o repositório privado
- 🔄 Sempre faça commit antes de fazer deploy
- 📝 O script de deploy puxa as últimas alterações do Git
- 🗄️ O banco de dados PostgreSQL RDS está sempre ativo
