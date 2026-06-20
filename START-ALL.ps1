# Memoir Gems — Inicia Backend + Frontend
# Haz doble-click o corre desde PowerShell

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Iniciando Memoir Gems..." -ForegroundColor Cyan

# Backend (puerto 3000)
Start-Process "wt.exe" -ArgumentList "new-tab --title `"BACKEND :3000`" cmd /k `"cd /d `"$root`" && npm run dev`""

# Esperar 2 segundos
Start-Sleep 2

# Frontend (puerto 3001)
Start-Process "wt.exe" -ArgumentList "new-tab --title `"FRONTEND :3001`" cmd /k `"cd /d `"$root\memoir-gems-frontend`" && npm run dev -- --port 3001`""

Write-Host ""
Write-Host "Backend:  http://localhost:3000" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3001" -ForegroundColor Yellow
Write-Host "Admin:    http://localhost:3000/admin" -ForegroundColor Magenta
Write-Host ""
Write-Host "Espera ~15 segundos para que compilen..." -ForegroundColor Gray
