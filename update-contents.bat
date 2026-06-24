@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"
title Aggiornamento contenuti - Glem Website

echo.
echo ==========================================
echo   AGGIORNAMENTO CONTENUTI DEL SITO
echo ==========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [ERRORE] Node.js non e' installato.
  echo Scaricalo da https://nodejs.org e riprova.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo Installazione dipendenze in corso...
  call npm install
  if errorlevel 1 (
    echo [ERRORE] Installazione dipendenze fallita.
    pause
    exit /b 1
  )
  echo.
)

echo Scansione cartella progetti...
echo   public\assets\03.Project
echo.
call npm run generate:manifest
if errorlevel 1 (
  echo.
  echo [ERRORE] Aggiornamento non riuscito.
  pause
  exit /b 1
)

echo.
echo ------------------------------------------
echo   FATTO - Contenuti aggiornati
echo ------------------------------------------
echo.
echo Cosa e' stato aggiornato:
echo   - Progetti ^(immagini, tag, collage home^)
echo   - Testi nel manifest per build/produzione
echo.
echo Testi ^(TESTO.txt^):
echo   - In sviluppo si leggono dal file ogni 2 secondi
echo   - Salva TESTO.txt e ricarica la pagina progetto ^(F5^)
echo   - Il bat serve soprattutto per immagini e nuovi progetti
echo.
echo Si aggiornano da sole ^(senza bat^):
echo   - Eventi  ^(04.Events^)
echo   - Contatti ^(05.Contacts^)
echo.
echo Per vedere le modifiche nel browser:
echo   1. Ricarica la pagina ^(F5^)
echo   2. Se non basta, riavvia il server: npm run dev
echo.
pause
