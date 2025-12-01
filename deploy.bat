@echo off
echo 🚀 Iniciando deploy completo do MilhasTrade...

REM 1. Build do Frontend
echo 📦 Fazendo build do frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Erro no build do frontend
    exit /b 1
)

REM 2. Deploy do Frontend para S3
echo ☁️  Fazendo upload do frontend para S3...
aws s3 sync dist/ s3://milhastrade-frontend --delete
if %errorlevel% neq 0 (
    echo ❌ Erro no upload para S3
    exit /b 1
)

cd ..

REM 3. Deploy do Backend para EC2
echo 🖥️  Fazendo deploy do backend para EC2...
echo Conectando via SSH...
ssh -i "milhastrade-key.pem" ubuntu@3.234.253.51 "cd /home/ubuntu/milhastrade/backend && git pull origin main && npm install --production && npm run build && pm2 restart milhastrade-backend || pm2 start dist/server.js --name milhastrade-backend && pm2 save"

if %errorlevel% neq 0 (
    echo ❌ Erro no deploy do backend
    exit /b 1
)

echo ✅ Deploy completo realizado com sucesso!
echo.
echo Frontend: http://milhastrade-frontend.s3-website-us-east-1.amazonaws.com
echo Backend: http://3.234.253.51:5000
