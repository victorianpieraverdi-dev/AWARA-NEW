@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================
echo   AWARA AI proxy  ->  https://cc.freemodel.dev
echo   Local: http://127.0.0.1:8787
echo   Ne zakryvay eto okno poka rabotaesh v Tigele.
echo ============================================
node awara-ai-proxy.cjs
pause
