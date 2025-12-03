# Sistema de Gestión de Reparaciones - INTERSECOM

Sistema web completo para la gestión de reparaciones de computadoras y celulares con soporte multisucursal. Desarrollado con React.js, PHP Vanilla y MySQL.

## Características Principales

✅ **Gestión de Órdenes de Reparación**
- Registro completo de equipos (Laptops, Desktops, Celulares, Tablets)
- Seguimiento de estados (Recibido, En Reparación, Listo, Entregado)
- Datos de acceso del dispositivo
- Control de accesorios y fallas reportadas

✅ **Sistema Multisucursal**
- Gestión de múltiples sucursales
- Traslados de equipos entre sucursales
- Dashboard por sucursal

✅ **Gestión de Clientes**
- Registro y búsqueda de clientes
- Historial de reparaciones por cliente

✅ **Control Financiero**
- Costos estimados y reales
- Control de anticipos
- Gestión de repuestos utilizados
- Cálculo automático de saldos

✅ **Recibo Imprimible**
- Formato tipo ticket profesional
- Incluye toda la información de la orden
- Cláusulas legales personalizadas

## Tecnologías Utilizadas

### Frontend
- React 18.2
- React Bootstrap 5.3
- React Router DOM 6.20
- Axios para peticiones HTTP
- Vite como bundler

### Backend
- PHP Vanilla (sin frameworks)
- PDO para base de datos
- API REST con formato JSON

### Base de Datos
- MySQL 8.0+
- Triggers automáticos
- Vistas para reportes
- Procedimientos almacenados

## Estructura del Proyecto

```
ReparacionIntersecom/
├── backend/
│   ├── api.php              # API REST principal
│   ├── config.php           # Configuración de BD
│   └── database.sql         # Script de creación de BD
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ReciboImprimible.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── NuevaOrden.jsx
│   │   │   ├── ListaOrdenes.jsx
│   │   │   ├── DetalleOrden.jsx
│   │   │   ├── Sucursales.jsx
│   │   │   ├── Traslados.jsx
│   │   │   └── Clientes.jsx
│   │   ├── styles/
│   │   │   └── ReciboImprimible.css
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Requisitos Previos

- **PHP** 7.4 o superior
- **MySQL** 8.0 o superior
- **Node.js** 16.0 o superior
- **npm** 8.0 o superior
- Servidor web (Apache, Nginx, o servidor integrado de PHP)

## Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/ReparacionIntersecom.git
cd ReparacionIntersecom
```

### 2. Configurar la Base de Datos

#### Opción A: Usando línea de comandos

```bash
# Acceder a MySQL
mysql -u root -p

# Ejecutar el script SQL
source backend/database.sql
```

#### Opción B: Usando phpMyAdmin

1. Acceder a phpMyAdmin
2. Crear nueva base de datos llamada `intersecom_db`
3. Importar el archivo `backend/database.sql`

### 3. Configurar el Backend

Editar el archivo `backend/config.php` con tus credenciales:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'intersecom_db');
define('DB_USER', 'root');        // Tu usuario de MySQL
define('DB_PASS', '');            // Tu contraseña de MySQL
```

### 4. Configurar el Frontend

```bash
cd frontend
npm install
```

### 5. Iniciar el Backend (PHP)

#### Opción A: Servidor Integrado de PHP

```bash
cd backend
php -S localhost:8000
```

#### Opción B: Apache/Nginx

Configurar el virtual host apuntando al directorio `backend/`

Ejemplo para Apache (`httpd-vhosts.conf`):

```apache
<VirtualHost *:8000>
    DocumentRoot "/ruta/a/ReparacionIntersecom/backend"
    ServerName localhost
    <Directory "/ruta/a/ReparacionIntersecom/backend">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

### 6. Iniciar el Frontend (React)

```bash
cd frontend
npm run dev
```

El frontend estará disponible en: `http://localhost:3000`

## Configuración Adicional

### Habilitar CORS en PHP (si es necesario)

El archivo `api.php` ya incluye los headers CORS necesarios:

```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

### Cambiar el Puerto del Backend

Si necesitas cambiar el puerto del backend, también debes actualizar `frontend/vite.config.js`:

```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:TU_PUERTO',  // Cambiar aquí
        changeOrigin: true,
      }
    }
  }
})
```

## Uso del Sistema

### 1. Acceso al Sistema

Abrir el navegador en `http://localhost:3000`

### 2. Configuración Inicial

1. **Crear Sucursales**:
   - Ir a Configuración → Sucursales
   - Crear al menos una sucursal

2. **Crear Clientes**:
   - Ir a Configuración → Clientes
   - Registrar clientes frecuentes

### 3. Flujo de Trabajo

#### Recepción de Equipo

1. Ir a **Nueva Orden**
2. Buscar o crear cliente
3. Ingresar datos del equipo
4. **IMPORTANTE**: Ingresar datos de acceso (contraseña/patrón)
5. Describir la falla reportada
6. Establecer costo estimado y anticipo
7. Guardar orden

#### Reparación

1. Ir a **Órdenes**
2. Buscar la orden
3. Cambiar estado a "En Reparación"
4. Agregar detalles del trabajo realizado
5. Agregar repuestos utilizados
6. Cambiar estado a "Listo"

#### Entrega

1. Cambiar estado a "Entregado"
2. Imprimir recibo para el cliente
3. Registrar quien entrega

#### Traslados entre Sucursales

1. Ir a **Traslados**
2. Crear nuevo traslado
3. Seleccionar orden y sucursal destino
4. El sistema actualiza automáticamente la ubicación

## API Endpoints

### Sucursales
- `GET /api.php/sucursales` - Listar sucursales
- `POST /api.php/sucursales` - Crear sucursal
- `PUT /api.php/sucursales/{id}` - Actualizar sucursal
- `DELETE /api.php/sucursales/{id}` - Desactivar sucursal

### Clientes
- `GET /api.php/clientes` - Listar clientes
- `GET /api.php/clientes?search={term}` - Buscar clientes
- `POST /api.php/clientes` - Crear cliente
- `PUT /api.php/clientes/{id}` - Actualizar cliente

### Órdenes
- `GET /api.php/ordenes` - Listar órdenes
- `GET /api.php/ordenes/{id}` - Obtener orden específica
- `POST /api.php/ordenes` - Crear orden
- `PUT /api.php/ordenes/{id}` - Actualizar orden
- `DELETE /api.php/ordenes/{id}` - Cancelar orden

### Repuestos
- `GET /api.php/repuestos?id_orden={id}` - Listar repuestos de una orden
- `POST /api.php/repuestos` - Agregar repuesto
- `DELETE /api.php/repuestos/{id}` - Eliminar repuesto

### Traslados
- `GET /api.php/traslados` - Listar traslados
- `POST /api.php/traslados` - Crear traslado
- `PUT /api.php/traslados/{id}` - Actualizar estado de traslado

### Dashboard
- `GET /api.php/dashboard?sucursal={id}` - Obtener estadísticas

## Base de Datos

### Tablas Principales

- **sucursales**: Gestión de sucursales
- **clientes**: Registro de clientes
- **ordenes**: Órdenes de reparación
- **repuestos_utilizados**: Repuestos por orden
- **traslados**: Traslados entre sucursales
- **historial_estados**: Auditoría de cambios de estado

### Triggers Automáticos

- **before_orden_insert**: Genera número de orden automáticamente (formato: YYYY-00001)
- **after_orden_update_estado**: Registra cambios de estado en historial
- **after_traslado_recibido**: Actualiza sucursal al recibir traslado

## Compilación para Producción

```bash
cd frontend
npm run build
```

Los archivos compilados estarán en `frontend/dist/`

### Desplegar en Producción

1. Copiar `frontend/dist/*` a tu servidor web
2. Copiar `backend/*` a tu servidor
3. Configurar virtual host para servir el frontend
4. Asegurar que las peticiones a `/api` apunten al backend PHP
5. Actualizar `config.php` con credenciales de producción

## Seguridad en Producción

⚠️ **IMPORTANTE**: Antes de desplegar en producción:

1. **Cambiar credenciales de base de datos**
2. **Desactivar display_errors en PHP**:
   ```php
   ini_set('display_errors', 0);
   ```
3. **Configurar CORS específico** (no usar `*`)
4. **Usar HTTPS**
5. **Crear usuario de MySQL con permisos limitados**
6. **Habilitar logs de errores PHP**

## Solución de Problemas

### Error de Conexión a Base de Datos

- Verificar credenciales en `config.php`
- Verificar que MySQL esté corriendo
- Verificar permisos del usuario de BD

### Error CORS

- Verificar que el backend esté corriendo
- Verificar configuración de proxy en `vite.config.js`
- Verificar headers CORS en `api.php`

### Error al Imprimir Recibo

- Verificar que los estilos de impresión estén cargados
- Usar Google Chrome o Edge (mejor soporte de @media print)

## Soporte y Contribuciones

Para reportar bugs o solicitar nuevas funcionalidades, crear un issue en GitHub.

## Licencia

Este proyecto es propietario de INTERSECOM - Todos los derechos reservados.

## Autor

Desarrollado por [Tu Nombre]
Contacto: [tu@email.com]

---

**INTERSECOM DE TODO EN COMPUTACIÓN**
15 Avenida 1-340 Zona 5 San Marcos
Tels. 7760-3991 -:- 7725-4830 -:- 3339-1099
