@echo off
title Memoir Gems - FRONTEND (Cliente)
color 09
echo.
echo  ============================================
echo   MEMOIR GEMS - Frontend Cliente
echo   http://localhost:3001
echo  ============================================
echo.
cd /d "%~dp0memoir-gems-frontend"
npm run dev -- --port 3001
pause
