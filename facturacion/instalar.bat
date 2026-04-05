@echo off
echo ============================================
echo  FacturaPY - Instalacion automatica
echo ============================================
echo.

echo [1/4] Instalando backend...
cd backend
npm install --ignore-scripts
if %errorlevel% neq 0 (
    echo ERROR en backend. Intentando con --legacy-peer-deps...
    npm install --ignore-scripts --legacy-peer-deps
)
echo Backend instalado OK
cd ..

echo.
echo [2/4] Instalando frontend...
cd frontend
npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ERROR en frontend
    pause
    exit /b 1
)
echo Frontend instalado OK
cd ..

echo.
echo ============================================
echo  Instalacion completada!
echo ============================================
echo.
echo Para iniciar el proyecto abre DOS terminales:
echo.
echo  Terminal 1 (Backend):
echo    cd backend
echo    node src/index.js
echo.
echo  Terminal 2 (Frontend):
echo    cd frontend
echo    npm start
echo.
echo Luego abre: http://localhost:3000
echo.
pause
