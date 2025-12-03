@echo off
echo ================================================
echo INSTALADOR SISTEMA INTERSECOM - Windows
echo ================================================
echo.

REM Verificar que estamos en la carpeta correcta
if not exist "frontend\package.json" (
    echo ERROR: No se encuentra package.json
    echo Por favor ejecuta este script desde la carpeta raiz del proyecto
    pause
    exit /b 1
)

echo [1/3] Instalando dependencias del Frontend...
cd frontend
call npm install

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Fallo la instalacion de dependencias
    echo Verifica que Node.js y npm esten instalados correctamente
    pause
    exit /b 1
)

echo.
echo ================================================
echo INSTALACION COMPLETADA EXITOSAMENTE!
echo ================================================
echo.
echo Proximos pasos:
echo.
echo 1. Configura la base de datos:
echo    - Abre phpMyAdmin: http://localhost/phpmyadmin
echo    - Importa: backend\database.sql
echo.
echo 2. Edita backend\config.php con tus credenciales
echo.
echo 3. Inicia el backend (Terminal 1):
echo    cd backend
echo    php -S localhost:8000
echo.
echo 4. Inicia el frontend (Terminal 2):
echo    cd frontend
echo    npm run dev
echo.
echo 5. Abre: http://localhost:3000
echo.
pause
