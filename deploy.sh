#!/bin/bash

echo "🚀 Iniciando deploy completo do MilhasTrade..."

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Build do Frontend
echo -e "${BLUE}📦 Fazendo build do frontend...${NC}"
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Erro no build do frontend"
    exit 1
fi

# 2. Deploy do Frontend para S3
echo -e "${BLUE}☁️  Fazendo upload do frontend para S3...${NC}"
aws s3 sync dist/ s3://milhastrade-frontend --delete
if [ $? -ne 0 ]; then
    echo "❌ Erro no upload para S3"
    exit 1
fi

# 3. Limpar cache do CloudFront (se configurado)
# aws cloudfront create-invalidation --distribution-id SEU_DISTRIBUTION_ID --paths "/*"

cd ..

# 4. Deploy do Backend para EC2
echo -e "${BLUE}🖥️  Fazendo deploy do backend para EC2...${NC}"
ssh -i "milhastrade-key.pem" ubuntu@3.234.253.51 << 'ENDSSH'
    cd /home/ubuntu/milhastrade/backend
    git pull origin main
    npm install --production
    npm run build
    pm2 restart milhastrade-backend || pm2 start dist/server.js --name milhastrade-backend
    pm2 save
ENDSSH

if [ $? -ne 0 ]; then
    echo "❌ Erro no deploy do backend"
    exit 1
fi

echo -e "${GREEN}✅ Deploy completo realizado com sucesso!${NC}"
echo ""
echo "Frontend: http://milhastrade-frontend.s3-website-us-east-1.amazonaws.com"
echo "Backend: http://3.234.253.51:5000"
