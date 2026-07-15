@echo off
certutil -decode awara-full-status.b64 awara-full-status.pdf >nul 2>&1
echo PDF: awara-full-status.pdf
del awara-full-status.b64
pause
