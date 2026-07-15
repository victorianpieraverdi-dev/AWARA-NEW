@echo off
certutil -decode awara-roadmap-v3.b64 awara-roadmap-v3.pdf >nul 2>&1
echo PDF decoded: awara-roadmap-v3.pdf
del awara-roadmap-v3.b64
pause
