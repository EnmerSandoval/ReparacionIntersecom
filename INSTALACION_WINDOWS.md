# Guía de Instalación Rápida - Windows

## Paso 1: Instalar Dependencias del Frontend

Abre PowerShell o CMD y ejecuta:

```powershell
cd C:\wamp64\www\taller\frontend
npm install
```

**Nota:** Este proceso puede tardar 2-3 minutos la primera vez.

## Paso 2: Iniciar el Backend PHP

Abre una nueva terminal PowerShell:

```powershell
cd C:\wamp64\www\taller\backend
php -S localhost:8000
```

**Importante:** Deja esta terminal abierta mientras trabajas.

## Paso 3: Iniciar el Frontend React

Abre OTRA terminal PowerShell:

```powershell
cd C:\wamp64\www\taller\frontend
npm run dev
```

El sistema se abrirá automáticamente en: `http://localhost:3000`

## Paso 4: Configurar la Base de Datos

### Opción A: Usando WAMP/phpMyAdmin

1. Abre el navegador en: `http://localhost/phpmyadmin`
2. Click en "Nueva" para crear una base de datos
3. Nombre: `intersecom_db`
4. Cotejamiento: `utf8mb4_unicode_ci`
5. Click en la base de datos creada
6. Click en "Importar"
7. Selecciona el archivo: `C:\wamp64\www\taller\backend\database.sql`
8. Click en "Continuar"

### Opción B: Usando línea de comandos

```powershell
# Ubicar mysql.exe (usualmente en):
cd C:\wamp64\bin\mysql\mysql8.x.x\bin

# Ejecutar:
.\mysql.exe -u root -p

# Dentro de MySQL:
source C:/wamp64/www/taller/backend/database.sql;
exit;
```

## Paso 5: Configurar Credenciales

Edita el archivo `C:\wamp64\www\taller\backend\config.php`:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'intersecom_db');
define('DB_USER', 'root');         // Usuario de WAMP
define('DB_PASS', '');             // Contraseña de WAMP (vacía por defecto)
```

## Solución de Problemas

### Error: "vite no se reconoce como comando"

**Causa:** No se han instalado las dependencias.

**Solución:**
```powershell
cd C:\wamp64\www\taller\frontend
npm install
```

### Error: "Cannot find module"

**Solución:**
```powershell
cd C:\wamp64\www\taller\frontend
rm -rf node_modules
rm package-lock.json
npm install
```

### Error: "Port 3000 is already in use"

**Solución:**
```powershell
# Opción 1: Usar otro puerto
npm run dev -- --port 3001

# Opción 2: Cerrar el proceso que usa el puerto 3000
netstat -ano | findstr :3000
taskkill /PID [NUMERO_PID] /F
```

### Error de conexión a base de datos

1. Verifica que WAMP esté iniciado (icono verde)
2. Verifica que MySQL esté corriendo
3. Verifica las credenciales en `backend/config.php`
4. Prueba la conexión en phpMyAdmin

### El backend no inicia en puerto 8000

**Solución:**
```powershell
# Usar otro puerto
cd C:\wamp64\www\taller\backend
php -S localhost:8080

# Y actualizar frontend/vite.config.js:
# target: 'http://localhost:8080'
```

## Estructura de Carpetas Esperada

```
C:\wamp64\www\taller\
├── backend/
│   ├── api.php
│   ├── config.php
│   └── database.sql
└── frontend/
    ├── node_modules/        ← Se crea con npm install
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── styles/
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Primera Ejecución

Una vez todo instalado:

1. **Terminal 1 - Backend:**
   ```powershell
   cd C:\wamp64\www\taller\backend
   php -S localhost:8000
   ```

2. **Terminal 2 - Frontend:**
   ```powershell
   cd C:\wamp64\www\taller\frontend
   npm run dev
   ```

3. Abrir navegador en: `http://localhost:3000`

## Verificar que Todo Funciona

1. ✅ El navegador muestra el sistema INTERSECOM
2. ✅ El menú superior tiene las opciones: Dashboard, Nueva Orden, Órdenes, Traslados, Configuración
3. ✅ En la esquina superior derecha debe aparecer un selector de sucursales
4. ✅ Si vas a Configuración → Sucursales, deberías ver 3 sucursales de ejemplo

## Comandos Útiles

```powershell
# Ver versión de Node
node --version

# Ver versión de npm
npm --version

# Ver versión de PHP
php --version

# Limpiar caché de npm
npm cache clean --force

# Reinstalar todo
cd C:\wamp64\www\taller\frontend
rm -rf node_modules package-lock.json
npm install
```

## Notas Importantes

- **WAMP debe estar corriendo** (icono verde en la bandeja del sistema)
- **Necesitas DOS terminales abiertas**: una para backend y otra para frontend
- **No cierres las terminales** mientras trabajas con el sistema
- **Primera carga puede ser lenta** mientras se compilan los archivos

## Contacto

Si encuentras algún problema, verifica:
1. ✅ WAMP está corriendo
2. ✅ Base de datos `intersecom_db` existe
3. ✅ `npm install` se ejecutó sin errores
4. ✅ Backend corriendo en puerto 8000
5. ✅ Frontend corriendo en puerto 3000
