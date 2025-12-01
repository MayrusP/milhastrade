# Script PowerShell para conectar no EC2

# Caminho da chave
$keyPath = Join-Path $PSScriptRoot "milhastrade-key.pem"

# Verificar se a chave existe
if (-not (Test-Path $keyPath)) {
    Write-Host "❌ Chave não encontrada: $keyPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Chave encontrada: $keyPath" -ForegroundColor Green

# Conectar usando ssh.exe explicitamente
$sshExe = "C:\Windows\System32\OpenSSH\ssh.exe"

if (Test-Path $sshExe) {
    Write-Host "🔌 Conectando no EC2..." -ForegroundColor Cyan
    & $sshExe -i $keyPath ubuntu@3.234.253.51
} else {
    Write-Host "🔌 Conectando no EC2 (usando ssh do PATH)..." -ForegroundColor Cyan
    ssh -i $keyPath ubuntu@3.234.253.51
}
