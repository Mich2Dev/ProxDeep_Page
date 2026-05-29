@echo off
title ProxDeep - Iniciador
cls

echo =======================================================================
echo     PROXDEEP - PLATAFORMA DE IA SOBERANA (DEMO MVP)
echo =======================================================================
echo.

:: Detectar Docker
docker -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] Docker no esta instalado en el sistema.
    goto NO_DOCKER
)

:: Detectar si el demonio de Docker esta activo
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] Docker esta instalado, pero no parece estar ejecutandose.
    echo     Por favor, abre Docker Desktop e intenta nuevamente.
    echo.
    goto NO_DOCKER
)

:CHOOSE_MODE
echo [+] Docker detectado y activo.
echo Selecciona el modo de inicio:
echo   [1] Iniciar con Docker (Completo: Base de Datos, Servidor y Cliente)
echo   [2] Iniciar Local (Solo Cliente en Modo Demo sin Docker - Mas Rapido)
echo.
set /p OPTION="Selecciona una opcion (1 o 2) [Default: 1]: "

if "%OPTION%"=="" set OPTION=1
if "%OPTION%"=="1" goto RUN_DOCKER
if "%OPTION%"=="2" goto RUN_LOCAL
echo Opcion invalida.
goto CHOOSE_MODE

:RUN_DOCKER
echo.
echo =======================================================================
echo [*] Iniciando en contenedores Docker...
echo =======================================================================
echo.
echo Limpiando contenedores y base de datos anterior...
docker-compose down -v
echo.
echo Reconstruyendo imagenes de Docker...
docker-compose build
echo.
echo Levantando la aplicacion...
docker-compose up
goto END

:NO_DOCKER
echo [*] Intentando inicio alternativo local sin Docker...
echo.

:RUN_LOCAL
:: Detectar Node.js
node -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo =======================================================================
    echo [X] ERROR: No se detecto Node.js ni Docker en este sistema.
    echo =======================================================================
    echo Para ejecutar ProxDeep de forma local necesitas:
    echo 1. Instalar Node.js (https://nodejs.org/)
    echo    O BIEN:
    echo 2. Instalar Docker Desktop (https://www.docker.com/products/docker-desktop/)
    echo.
    pause
    exit /b 1
)

echo [v] Node.js detectado. Iniciando cliente en Modo Demo...
echo.

if not exist "client\node_modules\" (
    echo [*] Instalando dependencias del cliente (esto puede tardar unos momentos)...
    cd client
    call npm install
    cd ..
)

echo.
echo [*] Iniciando el servidor de desarrollo de Vite...
echo [+] La aplicacion se abrira en http://localhost:5173
echo.

:: Abrir el navegador automaticamente
start http://localhost:5173

:: Iniciar Vite en el directorio client
cd client
call npm run dev
cd ..

:END
pause
