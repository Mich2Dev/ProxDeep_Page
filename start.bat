@echo off
echo ========================================================
echo Iniciando ProxDeep (Demo MVP)
echo ========================================================
echo.
echo Limpiando contenedores y base de datos anterior...
docker-compose down -v
echo.
echo Forzando limpieza de cache de Docker (Reconstruyendo desde cero)...
docker-compose build --no-cache
echo.
echo Levantando la aplicacion...
docker-compose up
pause
