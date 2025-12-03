# Configuración WAMP para INTERSECOM

Esta guía te ayudará a configurar correctamente WAMP para que funcione con el sistema INTERSECOM.

## 1. Verificar que WAMP está Corriendo

1. Abre WAMP (icono en la bandeja del sistema)
2. El icono debe estar **VERDE**
3. Si está naranja o rojo, haz clic y selecciona "Start All Services"

## 2. Verificar la Ubicación del Proyecto

Tu proyecto debe estar en la carpeta `www` de WAMP:

```
C:\wamp64\www\taller\
├── backend\
│   ├── api.php
│   ├── config.php
│   ├── database.sql
│   └── .htaccess
└── frontend\
    └── ...
```

**Ruta correcta:** `C:\wamp64\www\taller`

## 3. Probar Acceso al Backend

Abre el navegador y accede a:

```
http://localhost/taller/backend/api.php/sucursales
```

**Resultado esperado:** Deberías ver un JSON con el mensaje de error o una respuesta válida.

**Si ves error 404:** La ruta no es correcta. Verifica que el proyecto esté en `C:\wamp64\www\taller`

**Si ves "Forbidden":** Necesitas habilitar permisos (ver sección siguiente)

## 4. Configurar Permisos en Apache

### Opción A: Usando el Menú de WAMP

1. Click derecho en el icono de WAMP
2. Apache → Apache modules
3. Verificar que estén activados:
   - [x] rewrite_module
   - [x] headers_module

### Opción B: Editar httpd.conf Manualmente

1. Click derecho en WAMP → Apache → httpd.conf
2. Buscar la línea: `LoadModule rewrite_module modules/mod_rewrite.so`
3. Asegurarse que NO tenga `#` al inicio
4. Buscar: `LoadModule headers_module modules/mod_headers.so`
5. Asegurarse que NO tenga `#` al inicio
6. Guardar y reiniciar Apache

## 5. Configurar Virtual Host (Opcional pero Recomendado)

### Editar httpd-vhosts.conf

1. Click derecho en WAMP → Apache → httpd-vhosts.conf
2. Agregar al final:

```apache
<VirtualHost *:80>
    ServerName localhost
    DocumentRoot "C:/wamp64/www"

    <Directory "C:/wamp64/www/taller/backend">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted

        # Habilitar CORS
        Header set Access-Control-Allow-Origin "*"
        Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
        Header set Access-Control-Allow-Headers "Content-Type, Authorization"
    </Directory>
</VirtualHost>
```

3. Guardar y reiniciar Apache

## 6. Configurar la Base de Datos

### Paso 1: Crear la Base de Datos

1. Abre phpMyAdmin: `http://localhost/phpmyadmin`
2. Click en "Nueva" (en el panel izquierdo)
3. Nombre: `intersecom_db`
4. Cotejamiento: `utf8mb4_unicode_ci`
5. Click en "Crear"

### Paso 2: Importar el Script SQL

1. Click en la base de datos `intersecom_db`
2. Click en la pestaña "Importar"
3. Click en "Seleccionar archivo"
4. Navegar a: `C:\wamp64\www\taller\backend\database.sql`
5. Click en "Continuar"
6. Esperar a que termine la importación

### Paso 3: Verificar las Tablas

Deberías ver estas tablas creadas:
- ✅ clientes
- ✅ historial_estados
- ✅ ordenes
- ✅ repuestos_utilizados
- ✅ sucursales
- ✅ traslados

## 7. Configurar Credenciales de Base de Datos

Edita el archivo: `C:\wamp64\www\taller\backend\config.php`

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'intersecom_db');
define('DB_USER', 'root');
define('DB_PASS', '');  // Vacío por defecto en WAMP
```

**Nota:** Si configuraste una contraseña en MySQL, cámbiala en `DB_PASS`.

## 8. Probar la Conexión

### Crear archivo de prueba

Crea `C:\wamp64\www\taller\backend\test.php`:

```php
<?php
require_once 'config.php';

try {
    $db = getDB();
    echo "✅ Conexión exitosa a la base de datos!";

    // Probar consulta
    $stmt = $db->query("SELECT COUNT(*) as total FROM sucursales");
    $result = $stmt->fetch();
    echo "<br>Total sucursales: " . $result['total'];
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage();
}
?>
```

Accede a: `http://localhost/taller/backend/test.php`

**Resultado esperado:** "✅ Conexión exitosa a la base de datos! Total sucursales: 3"

## 9. Iniciar el Frontend

```powershell
cd C:\wamp64\www\taller\frontend
npm run dev
```

El frontend se abrirá en: `http://localhost:3000`

## 10. Verificar que Todo Funciona

### Checklist de Verificación

- [ ] WAMP icono verde
- [ ] `http://localhost/phpmyadmin` funciona
- [ ] Base de datos `intersecom_db` existe con 6 tablas
- [ ] `http://localhost/taller/backend/test.php` muestra conexión exitosa
- [ ] `http://localhost/taller/backend/api.php/sucursales` muestra JSON
- [ ] Frontend en `http://localhost:3000` muestra el sistema INTERSECOM
- [ ] No hay errores de red en la consola del navegador

## Solución de Problemas

### Error: "Network Error" en la consola

**Causa:** El backend no está accesible o CORS no está configurado.

**Solución:**
1. Verifica que WAMP esté corriendo (icono verde)
2. Prueba acceder a: `http://localhost/taller/backend/api.php/sucursales`
3. Verifica que el archivo `.htaccess` exista en `backend/`
4. Reinicia Apache

### Error: "Access denied for user 'root'@'localhost'"

**Causa:** Credenciales de base de datos incorrectas.

**Solución:**
1. Abre phpMyAdmin
2. Ve a Cuentas de usuario
3. Verifica el usuario `root`
4. Si tiene contraseña, actualízala en `backend/config.php`

### Error: "Table doesn't exist"

**Causa:** No se importó correctamente el script SQL.

**Solución:**
1. Abre phpMyAdmin
2. Selecciona la base de datos `intersecom_db`
3. Si no tiene tablas, click en "Importar"
4. Importa `backend/database.sql` de nuevo

### El frontend muestra página en blanco

**Causa:** Dependencias no instaladas o error en JavaScript.

**Solución:**
1. Abre la consola del navegador (F12)
2. Verifica si hay errores
3. En la terminal, ejecuta:
   ```powershell
   cd C:\wamp64\www\taller\frontend
   npm install
   npm run dev
   ```

### Error 403 Forbidden

**Causa:** Permisos de Apache no configurados.

**Solución:**
1. Edita `httpd.conf` (click derecho en WAMP → Apache → httpd.conf)
2. Busca todas las líneas con `Require local`
3. Cámbiala por `Require all granted`
4. Reinicia Apache

### El icono de WAMP está naranja

**Causa:** Apache o MySQL no están corriendo.

**Solución:**
1. Click derecho en WAMP
2. "Start All Services"
3. Si sigue naranja, revisa el log de errores:
   - Click derecho → Apache → Apache error log

## Configuración de PHP (Opcional)

Para ver errores de PHP durante el desarrollo:

1. Click derecho en WAMP → PHP → php.ini
2. Buscar y cambiar:
   ```ini
   display_errors = On
   error_reporting = E_ALL
   ```
3. Guardar y reiniciar Apache

## URLs de Referencia

- **Backend API:** `http://localhost/taller/backend/api.php`
- **Frontend:** `http://localhost:3000`
- **phpMyAdmin:** `http://localhost/phpmyadmin`
- **WAMP:** `http://localhost`

## Contacto

Si después de seguir todos estos pasos sigues teniendo problemas, verifica:
1. La versión de WAMP (debe ser 3.2.0 o superior)
2. La versión de PHP (debe ser 7.4 o superior)
3. Los logs de Apache en `C:\wamp64\logs\apache_error.log`
