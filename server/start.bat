@echo off
cd /d "%~dp0"
echo Base de datos: FNAA / usuarios
echo Si el puerto 3000 esta ocupado, cierra la ventana anterior del servidor.
node server.js
pause
