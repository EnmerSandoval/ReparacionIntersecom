# 🚀 Guía de Inicio Rápido - INTERSECOM

## ⚡ Instalación en 5 Pasos

### 1️⃣ Crear la Base de Datos

```bash
# Abrir phpMyAdmin o ejecutar en MySQL:
mysql -u root -p < database/schema.sql
```

### 2️⃣ Configurar Backend

```bash
# Copiar archivo de configuración
cd backend/config
cp config.example.php config.php

# Editar config.php con tus credenciales de MySQL
nano config.php  # o usar cualquier editor
```

**Cambiar estas líneas:**
```php
define('DB_USER', 'tu_usuario');    // Ej: root
define('DB_PASS', 'tu_contraseña'); // Tu contraseña de MySQL
```

### 3️⃣ Mover Proyecto al Servidor Web

```bash
# Para XAMPP (Windows)
Copiar la carpeta a: C:\xampp\htdocs\ReparacionIntersecom\

# Para XAMPP (Linux/Mac)
sudo cp -r ReparacionIntersecom /opt/lampp/htdocs/

# Para WAMP
Copiar la carpeta a: C:\wamp64\www\ReparacionIntersecom\
```

### 4️⃣ Probar el Backend

Abrir en el navegador:
```
http://localhost/ReparacionIntersecom/backend/api/api.php?action=getOrdenes
```

**✅ Debes ver:**
```json
{
  "success": true,
  "data": [],
  "count": 0
}
```

### 5️⃣ Iniciar Frontend

```bash
cd frontend
npm install
npm start
```

**✅ Se abrirá automáticamente:** `http://localhost:3000`

---

## 🎯 Primeros Pasos

### Crear tu Primera Orden

1. Ir a **"Nueva Orden"**
2. Llenar datos del cliente:
   - Nombre: Juan Pérez
   - Teléfono: 77889900

3. Datos del equipo:
   - Tipo: Laptop
   - Marca: HP
   - Modelo: Pavilion

4. **⚠️ IMPORTANTE:** Datos de acceso: `PIN: 1234`

5. Falla reportada: `No enciende`

6. Costo estimado: `250.00`
   Anticipo: `100.00`

7. Hacer clic en **"Registrar Orden"**

### Ver la Orden Creada

1. Ir a **"Órdenes en el Taller"**
2. Verás tu primera orden con número **ORD-00001**

### Cambiar Estado

1. Usar el selector desplegable en la columna "Estado"
2. Cambiar a: **"En Reparación"**

### Editar Detalles

1. Hacer clic en **✏️**
2. Agregar en "Trabajo Realizado": `Cambio de disco duro`
3. Agregar en "Repuestos": `Disco SSD 240GB`
4. Actualizar Costo Total: `350.00`
5. Guardar

### Imprimir Recibo

1. Hacer clic en **🖨️**
2. Revisar el recibo
3. Hacer clic en **"Imprimir"**

---

## 📞 ¿Problemas?

### Backend no responde
```bash
# Verificar que Apache y MySQL estén corriendo
# En XAMPP: Abrir el Panel de Control y verificar que estén en "Running"
```

### Error de conexión MySQL
```bash
# Verificar credenciales en backend/config/config.php
# Verificar que la base de datos "taller_intersecom" exista
```

### Frontend no carga
```bash
# Verificar la URL de la API en frontend/src/services/api.js
# Debe coincidir con la ubicación de tu backend
```

---

## 🎉 ¡Listo!

Tu sistema está funcionando. Ahora puedes:

- ✅ Recibir equipos de clientes
- ✅ Hacer seguimiento de reparaciones
- ✅ Imprimir recibos profesionales
- ✅ Controlar pagos y saldos
- ✅ Ver estadísticas del taller

**Para más detalles, consulta el archivo README.md**
