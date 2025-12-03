-- ================================================
-- SISTEMA DE GESTION DE REPARACIONES - INTERSECOM
-- Base de Datos MySQL con Soporte Multisucursal
-- ================================================

-- Eliminar base de datos si existe
DROP DATABASE IF EXISTS intersecom_db;

-- Crear base de datos
CREATE DATABASE intersecom_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE intersecom_db;

-- ================================================
-- TABLA: sucursales
-- ================================================
CREATE TABLE sucursales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    zona VARCHAR(50),
    ciudad VARCHAR(100) DEFAULT 'San Marcos',
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY idx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TABLA: clientes
-- ================================================
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    correo_electronico VARCHAR(150),
    direccion TEXT,
    nit VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_telefono (telefono),
    INDEX idx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TABLA: ordenes
-- ================================================
CREATE TABLE ordenes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_orden VARCHAR(20) UNIQUE NOT NULL,

    -- Relaciones
    id_cliente INT NOT NULL,
    id_sucursal INT NOT NULL,

    -- Datos del Equipo
    tipo_equipo ENUM('Laptop', 'Desktop', 'Celular', 'Tablet', 'Otro') NOT NULL,
    marca VARCHAR(100),
    modelo VARCHAR(100),
    color VARCHAR(50),

    -- Datos de Acceso (CRITICO)
    datos_acceso TEXT COMMENT 'Contraseña, patrón, PIN del dispositivo',

    -- Estado Físico
    accesorios TEXT COMMENT 'Cargador, funda, batería, etc.',
    falla_reportada TEXT NOT NULL,

    -- Trabajo Realizado
    detalle_trabajo TEXT COMMENT 'Descripción del trabajo realizado',

    -- Estados
    estado ENUM('Recibido', 'En Reparación', 'Listo', 'Entregado', 'Cancelado') DEFAULT 'Recibido',

    -- Financiero
    costo_estimado DECIMAL(10,2) DEFAULT 0.00,
    anticipo DECIMAL(10,2) DEFAULT 0.00,
    costo_repuestos DECIMAL(10,2) DEFAULT 0.00,
    costo_trabajo DECIMAL(10,2) DEFAULT 0.00,
    valor_total DECIMAL(10,2) DEFAULT 0.00,

    -- Fechas
    fecha_recepcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_estimada_entrega DATE,
    fecha_entrega TIMESTAMP NULL,

    -- Observaciones
    observaciones TEXT,

    -- Control
    recibido_por VARCHAR(100),
    entregado_por VARCHAR(100),

    -- Índices
    FOREIGN KEY (id_cliente) REFERENCES clientes(id) ON DELETE RESTRICT,
    FOREIGN KEY (id_sucursal) REFERENCES sucursales(id) ON DELETE RESTRICT,
    INDEX idx_numero_orden (numero_orden),
    INDEX idx_estado (estado),
    INDEX idx_fecha_recepcion (fecha_recepcion),
    INDEX idx_sucursal (id_sucursal)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TABLA: repuestos_utilizados
-- ================================================
CREATE TABLE repuestos_utilizados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_orden INT NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    cantidad INT DEFAULT 1,
    precio_unitario DECIMAL(10,2) DEFAULT 0.00,
    precio_total DECIMAL(10,2) AS (cantidad * precio_unitario) STORED,
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_orden) REFERENCES ordenes(id) ON DELETE CASCADE,
    INDEX idx_orden (id_orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TABLA: historial_estados
-- ================================================
CREATE TABLE historial_estados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_orden INT NOT NULL,
    estado_anterior ENUM('Recibido', 'En Reparación', 'Listo', 'Entregado', 'Cancelado'),
    estado_nuevo ENUM('Recibido', 'En Reparación', 'Listo', 'Entregado', 'Cancelado') NOT NULL,
    comentario TEXT,
    usuario VARCHAR(100),
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_orden) REFERENCES ordenes(id) ON DELETE CASCADE,
    INDEX idx_orden (id_orden),
    INDEX idx_fecha (fecha_cambio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TABLA: traslados
-- ================================================
CREATE TABLE traslados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_orden INT NOT NULL,
    id_sucursal_origen INT NOT NULL,
    id_sucursal_destino INT NOT NULL,
    motivo TEXT,
    estado_traslado ENUM('Pendiente', 'En Tránsito', 'Recibido', 'Cancelado') DEFAULT 'Pendiente',

    -- Control
    enviado_por VARCHAR(100),
    recibido_por VARCHAR(100),

    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_recepcion TIMESTAMP NULL,

    observaciones TEXT,

    FOREIGN KEY (id_orden) REFERENCES ordenes(id) ON DELETE RESTRICT,
    FOREIGN KEY (id_sucursal_origen) REFERENCES sucursales(id) ON DELETE RESTRICT,
    FOREIGN KEY (id_sucursal_destino) REFERENCES sucursales(id) ON DELETE RESTRICT,
    INDEX idx_orden (id_orden),
    INDEX idx_estado (estado_traslado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- INSERTAR DATOS INICIALES
-- ================================================

-- Insertar sucursales de ejemplo
INSERT INTO sucursales (nombre, direccion, telefono, zona, ciudad) VALUES
('Sucursal Principal', '15 Avenida 1-340 Zona 5', '7760-3991, 7725-4830, 3339-1099', 'Zona 5', 'San Marcos'),
('Sucursal Centro', '5 Calle 3-20 Zona 1', '7760-0000', 'Zona 1', 'San Marcos'),
('Sucursal Occidente', '10 Avenida 8-50 Zona 3', '7760-1111', 'Zona 3', 'Quetzaltenango');

-- Insertar algunos clientes de ejemplo
INSERT INTO clientes (nombre, telefono) VALUES
('Giada de León', '14796230'),
('José Eduardo Carrera', '34809839'),
('Guillermo Ochoa', '11384513');

-- ================================================
-- VISTAS ÚTILES
-- ================================================

-- Vista: Órdenes con información completa
CREATE VIEW vista_ordenes_completas AS
SELECT
    o.id,
    o.numero_orden,
    o.fecha_recepcion,
    o.estado,
    c.nombre AS cliente_nombre,
    c.telefono AS cliente_telefono,
    s.nombre AS sucursal_nombre,
    o.tipo_equipo,
    o.marca,
    o.modelo,
    o.falla_reportada,
    o.valor_total,
    o.anticipo,
    (o.valor_total - o.anticipo) AS saldo_pendiente,
    DATEDIFF(CURRENT_DATE, DATE(o.fecha_recepcion)) AS dias_en_taller
FROM ordenes o
INNER JOIN clientes c ON o.id_cliente = c.id
INNER JOIN sucursales s ON o.id_sucursal = s.id;

-- Vista: Traslados pendientes
CREATE VIEW vista_traslados_pendientes AS
SELECT
    t.id,
    t.id_orden,
    o.numero_orden,
    so.nombre AS sucursal_origen,
    sd.nombre AS sucursal_destino,
    t.estado_traslado,
    t.fecha_envio,
    t.enviado_por,
    o.tipo_equipo,
    o.marca,
    o.modelo
FROM traslados t
INNER JOIN ordenes o ON t.id_orden = o.id
INNER JOIN sucursales so ON t.id_sucursal_origen = so.id
INNER JOIN sucursales sd ON t.id_sucursal_destino = sd.id
WHERE t.estado_traslado IN ('Pendiente', 'En Tránsito');

-- ================================================
-- TRIGGER: Generar número de orden automático
-- ================================================
DELIMITER $$

CREATE TRIGGER before_orden_insert
BEFORE INSERT ON ordenes
FOR EACH ROW
BEGIN
    DECLARE next_num INT;
    DECLARE year_str VARCHAR(4);

    -- Obtener el año actual
    SET year_str = YEAR(CURRENT_DATE);

    -- Obtener el siguiente número de orden para este año
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_orden, -5) AS UNSIGNED)), 0) + 1
    INTO next_num
    FROM ordenes
    WHERE numero_orden LIKE CONCAT(year_str, '%');

    -- Generar el número de orden: YYYY-00001
    SET NEW.numero_orden = CONCAT(year_str, '-', LPAD(next_num, 5, '0'));

    -- Calcular valor total
    SET NEW.valor_total = NEW.costo_estimado + NEW.costo_repuestos + NEW.costo_trabajo;
END$$

DELIMITER ;

-- ================================================
-- TRIGGER: Registrar cambios de estado
-- ================================================
DELIMITER $$

CREATE TRIGGER after_orden_update_estado
AFTER UPDATE ON ordenes
FOR EACH ROW
BEGIN
    IF OLD.estado != NEW.estado THEN
        INSERT INTO historial_estados (id_orden, estado_anterior, estado_nuevo, fecha_cambio)
        VALUES (NEW.id, OLD.estado, NEW.estado, CURRENT_TIMESTAMP);
    END IF;
END$$

DELIMITER ;

-- ================================================
-- TRIGGER: Actualizar sucursal al recibir traslado
-- ================================================
DELIMITER $$

CREATE TRIGGER after_traslado_recibido
AFTER UPDATE ON traslados
FOR EACH ROW
BEGIN
    IF OLD.estado_traslado != 'Recibido' AND NEW.estado_traslado = 'Recibido' THEN
        UPDATE ordenes
        SET id_sucursal = NEW.id_sucursal_destino
        WHERE id = NEW.id_orden;
    END IF;
END$$

DELIMITER ;

-- ================================================
-- PROCEDIMIENTOS ALMACENADOS ÚTILES
-- ================================================

-- Procedimiento: Obtener estadísticas por sucursal
DELIMITER $$

CREATE PROCEDURE sp_estadisticas_sucursal(IN p_id_sucursal INT)
BEGIN
    SELECT
        COUNT(*) AS total_ordenes,
        SUM(CASE WHEN estado = 'Recibido' THEN 1 ELSE 0 END) AS recibidos,
        SUM(CASE WHEN estado = 'En Reparación' THEN 1 ELSE 0 END) AS en_reparacion,
        SUM(CASE WHEN estado = 'Listo' THEN 1 ELSE 0 END) AS listos,
        SUM(CASE WHEN estado = 'Entregado' THEN 1 ELSE 0 END) AS entregados,
        SUM(valor_total) AS ventas_totales,
        SUM(anticipo) AS anticipos_totales
    FROM ordenes
    WHERE id_sucursal = p_id_sucursal
    AND MONTH(fecha_recepcion) = MONTH(CURRENT_DATE)
    AND YEAR(fecha_recepcion) = YEAR(CURRENT_DATE);
END$$

DELIMITER ;

-- ================================================
-- PERMISOS Y USUARIOS (Opcional)
-- ================================================
-- Crear usuario para la aplicación
-- CREATE USER 'intersecom_user'@'localhost' IDENTIFIED BY 'password_seguro';
-- GRANT ALL PRIVILEGES ON intersecom_db.* TO 'intersecom_user'@'localhost';
-- FLUSH PRIVILEGES;

-- ================================================
-- FIN DEL SCRIPT
-- ================================================
