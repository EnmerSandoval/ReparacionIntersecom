# 🔧 INTERSECOM - Sistema de Gestión de Reparaciones

Sistema completo para administración de taller de reparación de computadoras y celulares.

## 📋 Descripción

Sistema web desarrollado para el taller **INTERSECOM** que permite gestionar órdenes de reparación, desde la recepción del equipo hasta la entrega al cliente. Incluye generación automática de recibos con cláusulas legales y seguimiento completo del estado de cada reparación.

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React.js + React Bootstrap
- **Backend:** PHP Vanilla (sin frameworks) + PDO
- **Base de Datos:** MySQL 5.7+
- **Arquitectura:** API REST

## 📁 Estructura del Proyecto

```
ReparacionIntersecom/
├── backend/
│   ├── api/
│   │   └── api.php              # API REST principal
│   ├── config/
│   │   └── config.php           # Configuración de BD
│   └── .htaccess                # Configuración Apache
├── database/
│   └── schema.sql               # Script de creación de BD
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── FormularioOrden.jsx
│   │   │   ├── TablaOrdenes.jsx
│   │   │   ├── ReciboImprimible.jsx
│   │   │   └── ReciboImprimible.css
│   │   ├── services/
│   │   │   └── api.js           # Servicio de consumo de API
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## 🚀 Instalación

### 1. Requisitos Previos

- **Servidor Web:** Apache 2.4+ o Nginx
- **PHP:** 7.4 o superior
- **MySQL:** 5.7 o superior
- **Node.js:** 16+ y npm (para desarrollo frontend)
- **Navegador:** Chrome, Firefox, Edge (versiones recientes)

### 2. Configurar la Base de Datos

#### Opción A: Usando phpMyAdmin

1. Abrir phpMyAdmin
2. Ir a la pestaña "SQL"
3. Copiar y pegar el contenido de `database/schema.sql`
4. Hacer clic en "Ejecutar"

#### Opción B: Usando la línea de comandos

```bash
# Conectar a MySQL
mysql -u root -p

# Ejecutar el script
source /ruta/al/proyecto/database/schema.sql
```

#### Verificar la instalación

```sql
USE taller_intersecom;
SHOW TABLES;
-- Debes ver: clientes, ordenes, pagos, historial_estados
```

### 3. Configurar el Backend PHP

1. **Mover el proyecto a la carpeta del servidor web:**

```bash
# Para XAMPP (Windows)
C:\xampp\htdocs\ReparacionIntersecom\

# Para XAMPP (Linux/Mac)
/opt/lampp/htdocs/ReparacionIntersecom/

# Para WAMP
C:\wamp64\www\ReparacionIntersecom\
```

2. **Configurar credenciales de base de datos:**

Editar el archivo `backend/config/config.php`:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'taller_intersecom');
define('DB_USER', 'root');           // Tu usuario MySQL
define('DB_PASS', '');               // Tu contraseña MySQL
```

3. **Verificar que el backend funciona:**

Abrir en el navegador:
```
http://localhost/ReparacionIntersecom/backend/api/api.php?action=getOrdenes
```

Debes ver una respuesta JSON similar a:
```json
{
  "success": true,
  "data": [],
  "count": 0
}
```

### 4. Configurar el Frontend React

1. **Instalar dependencias:**

```bash
cd frontend
npm install
```

2. **Configurar la URL de la API:**

Editar el archivo `frontend/src/services/api.js`:

```javascript
// Cambiar según tu configuración
const API_BASE_URL = 'http://localhost/ReparacionIntersecom/backend/api/api.php';
```

3. **Iniciar el servidor de desarrollo:**

```bash
npm start
```

El navegador debería abrirse automáticamente en `http://localhost:3000`

## 🎯 Uso del Sistema

### 1. Recepción de Equipos

1. Ir a la pestaña **"Nueva Orden"**
2. Llenar los datos del cliente (nombre y teléfono son obligatorios)
3. Seleccionar el tipo de equipo y sus características
4. **⚠️ IMPORTANTE:** Registrar los datos de acceso (contraseña/patrón del dispositivo)
5. Anotar los accesorios que trae el equipo
6. Describir la falla reportada por el cliente
7. Indicar costo estimado y anticipo (si aplica)
8. Hacer clic en **"Registrar Orden"**

### 2. Gestión de Reparaciones

1. En la pestaña **"Órdenes en el Taller"** aparecen todos los equipos
2. Usar el selector de estado para cambiar el progreso:
   - Recibido
   - En Diagnóstico
   - En Espera de Repuesto
   - En Reparación
   - Reparado
   - Listo para Entrega
   - Entregado

3. Hacer clic en **✏️ (Editar)** para agregar:
   - Diagnóstico técnico
   - Trabajo realizado
   - Repuestos utilizados
   - Costo total final

### 3. Impresión de Recibos

1. Hacer clic en **🖨️ (Imprimir)** junto a la orden
2. Revisar que todos los datos sean correctos
3. Hacer clic en **"Imprimir"**
4. El recibo incluye automáticamente:
   - Número de orden único (ej: ORD-00376)
   - Datos completos del cliente y equipo
   - Cláusulas legales del taller
   - Saldo pendiente calculado automáticamente

## 📊 Características Principales

### ✅ Funcionalidades Implementadas

- ✔️ Registro completo de clientes y equipos
- ✔️ Campo crítico para datos de acceso (contraseñas/patrones)
- ✔️ Gestión de accesorios y estado físico del equipo
- ✔️ Seguimiento de estados de reparación
- ✔️ Cálculo automático de saldo pendiente
- ✔️ Historial de cambios de estado
- ✔️ Generación de recibos imprimibles
- ✔️ Cláusulas legales automáticas en recibos
- ✔️ Dashboard con estadísticas en tiempo real
- ✔️ Filtrado de órdenes por estado
- ✔️ Edición completa de órdenes
- ✔️ Soporte para múltiples tipos de pago

### 🔒 Cláusulas Legales Incluidas

Todos los recibos incluyen automáticamente:

1. **Garantía:** No responsabilidad por daños causados por mal uso o inestabilidad eléctrica
2. **Abandono:** No responsabilidad por equipos no recogidos en 30 días
3. **Pérdida de Datos:** Recomendación de respaldo previo

## 🌐 Endpoints de la API

### Órdenes

- **GET** `/api.php?action=getOrdenes` - Listar todas las órdenes
- **GET** `/api.php?action=getOrdenes&estado=Recibido` - Filtrar por estado
- **GET** `/api.php?action=getOrden&id=1` - Obtener orden específica
- **POST** `/api.php?action=createOrden` - Crear nueva orden
- **PUT** `/api.php?action=updateOrden` - Actualizar orden completa
- **PUT** `/api.php?action=updateEstado` - Actualizar solo estado
- **DELETE** `/api.php?action=deleteOrden&id=1` - Eliminar orden

### Clientes

- **GET** `/api.php?action=getClientes` - Listar clientes

### Estadísticas

- **GET** `/api.php?action=getEstadisticas` - Obtener estadísticas generales

## 🔧 Configuración para Producción

### 1. Deshabilitar modo debug en PHP

Editar `backend/config/config.php`:

```php
ini_set('display_errors', 0);
error_reporting(0);
```

### 2. Compilar el frontend para producción

```bash
cd frontend
npm run build
```

Esto generará una carpeta `build/` con los archivos optimizados.

### 3. Configurar el servidor web

Copiar el contenido de `frontend/build/` a la raíz de tu servidor o configurar un VirtualHost.

### 4. Configurar HTTPS (Recomendado)

- Obtener un certificado SSL (Let's Encrypt es gratuito)
- Configurar Apache/Nginx para usar HTTPS
- Actualizar la URL de la API en `frontend/src/services/api.js`

### 5. Proteger credenciales

- Cambiar el usuario y contraseña de MySQL
- Usar `.htaccess` para proteger archivos sensibles (ya incluido)

## 🐛 Solución de Problemas

### Error: "Connection refused" al conectar con la API

**Solución:**
- Verificar que Apache/MySQL estén corriendo
- Revisar la URL de la API en `frontend/src/services/api.js`
- Verificar permisos de la carpeta del proyecto

### Error: "Access denied for user"

**Solución:**
- Verificar credenciales en `backend/config/config.php`
- Asegurarse que el usuario MySQL tenga permisos

### Error: "CORS policy" en el navegador

**Solución:**
- Verificar que el archivo `backend/.htaccess` esté presente
- Verificar que `mod_headers` esté habilitado en Apache:
  ```bash
  sudo a2enmod headers
  sudo service apache2 restart
  ```

### La tabla no muestra órdenes

**Solución:**
- Abrir la consola del navegador (F12) y revisar errores
- Verificar que la base de datos tenga datos de prueba
- Verificar la conexión a la API

## 📱 Soporte y Contacto

Para soporte o consultas:

- **Taller:** INTERSECOM
- **Dirección:** 15 Avenida 1-340 Zona 5 San Marcos
- **Sistema desarrollado:** 2024

## 📄 Licencia

Este sistema fue desarrollado específicamente para INTERSECOM. Todos los derechos reservados.

## 🎓 Créditos

- **Desarrollado por:** Arquitecto de Software Senior
- **Tecnologías:** React.js, PHP, MySQL
- **Año:** 2024

---

**¡Importante!** Recuerda hacer respaldos periódicos de la base de datos:

```bash
mysqldump -u root -p taller_intersecom > backup_$(date +%Y%m%d).sql
```
