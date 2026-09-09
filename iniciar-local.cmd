@echo off
rem Doble clic para instalar, preparar y abrir Avendia 3.0 en esta computadora.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0iniciar-local.ps1"
if errorlevel 1 pause
