@echo off
cd /d "%~dp0"
if not exist "node_modules\" (
  echo Instalando dependencias...
  call npm install
)
if not exist ".env" (
  if not exist "server\.env" (
    echo.
    echo [AVISO] No hay .env — copia .env.example a .env con tu MONGODB_URI de Atlas.
    echo         Usa la MISMA URI que en Vercel para ver los mismos rankings.
    echo.
    pause
    exit /b 1
  )
)
echo Comprobando MongoDB...
call node scripts/check-db.js
if errorlevel 1 (
  echo.
  echo Arregla .env y vuelve a ejecutar dev.bat
  pause
  exit /b 1
)
echo.
echo Servidor: http://localhost:3000/menu.html
echo Ranking:  http://localhost:3000/ranking.html
echo.
call npm run dev
pause
