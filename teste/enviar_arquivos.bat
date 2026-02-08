@echo off
chcp 65001 >nul
echo ==========================================
echo 🚀 ENVIANDO ARQUIVOS PARA VPS HOSTINGER
echo ==========================================
echo.
echo 📂 Entrando na pasta do backend...
cd /d "f:\Projetos\Automações\Personal Agenda\backend"
echo Caminho: %CD%
echo.
echo 📡 Conectando... (Digite a senha da VPS se pedir)
echo.
scp -r * root@srv1286351.hostinger.com:/var/www/personal-agenda-backend/
echo.
echo ==========================================
echo ✅ Processo finalizado!
echo Se não apareceu erro acima, os arquivos foram enviados.
echo ==========================================
pause
