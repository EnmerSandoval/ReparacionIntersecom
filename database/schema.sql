-- =====================================================
-- SCRIPT DE BASE DE DATOS - TALLER INTERSECOM
-- Sistema de Gestión de Reparaciones
-- =====================================================

CREATE DATABASE IF NOT EXISTS taller_intersecom CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE taller_intersecom;

-- =====================================================
-- TABLA: clientes
-- Almacena información de clientes para evitar duplicados
-- =====================================================
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nombre (nombre),
    INDEX idx_telefono (telefono)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: ordenes
-- Tabla principal de órdenes de servicio
-- =====================================================
CREATE TABLE IF NOT EXISTS ordenes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_orden VARCHAR(20) UNIQUE NOT NULL, -- Ej: ORD-00376
    cliente_id INT NOT NULL,

    -- ===== DATOS DEL EQUIPO =====
    tipo_equipo VARCHAR(50) NOT NULL COMMENT 'Laptop, Celular, CPU, Tablet, etc.',
    marca VARCHAR(50),
    modelo VARCHAR(100),
    color VARCHAR(30),
    numero_serie VARCHAR(100),

    -- ===== DATOS DE ACCESO Y ESTADO FÍSICO =====
    datos_acceso TEXT COMMENT 'Contraseña, patrón, PIN del dispositivo',
    accesorios TEXT COMMENT 'Cargador, funda, memoria, etc.',
    falla_reportada TEXT NOT NULL COMMENT 'Descripción del problema según el cliente',
    observaciones_recepcion TEXT COMMENT 'Estado físico: golpes, rayones, roturas',

    -- ===== DATOS DE REPARACIÓN =====
    diagnostico_tecnico TEXT COMMENT 'Diagnóstico real del técnico',
    trabajo_realizado TEXT COMMENT 'Detalle de las reparaciones ejecutadas',
    repuestos_usados TEXT COMMENT 'Lista de repuestos instalados',
    tecnico_responsable VARCHAR(100) DEFAULT 'Intersecom',

    -- ===== FECHAS Y ESTADOS =====
    fecha_ingreso DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_estimada_salida DATE,
    fecha_entrega DATETIME NULL,
    estado ENUM(
        'Recibido',
        'En Diagnóstico',
        'En Espera de Repuesto',
        'En Reparación',
        'Reparado',
        'Listo para Entrega',
        'Entregado',
        'Cancelado',
        'No Reparable'
    ) DEFAULT 'Recibido',

    -- ===== FINANCIERO =====
    costo_estimado DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Presupuesto inicial',
    costo_total DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Costo final real',
    anticipo DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Pago adelantado',
    saldo_pendiente DECIMAL(10, 2) GENERATED ALWAYS AS (costo_total - anticipo) STORED,
    tipo_pago ENUM('Efectivo', 'Tarjeta', 'Transferencia', 'Mixto') DEFAULT 'Efectivo',
    lugar_cotizacion VARCHAR(100) COMMENT 'Dónde se cotizó el repuesto',

    -- ===== CONTROL Y AUDITORÍA =====
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    entregado_a VARCHAR(100) COMMENT 'Nombre de quien retira el equipo',

    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
    INDEX idx_estado (estado),
    INDEX idx_fecha_ingreso (fecha_ingreso),
    INDEX idx_numero_orden (numero_orden),
    INDEX idx_cliente (cliente_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: pagos
-- Historial de pagos parciales o totales
-- =====================================================
CREATE TABLE IF NOT EXISTS pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    orden_id INT NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    tipo_pago ENUM('Efectivo', 'Tarjeta', 'Transferencia') NOT NULL,
    concepto VARCHAR(200) DEFAULT 'Pago de reparación',
    fecha_pago DATETIME DEFAULT CURRENT_TIMESTAMP,
    recibido_por VARCHAR(100) DEFAULT 'Intersecom',

    FOREIGN KEY (orden_id) REFERENCES ordenes(id) ON DELETE CASCADE,
    INDEX idx_orden (orden_id),
    INDEX idx_fecha (fecha_pago)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: historial_estados
-- Tracking de cambios de estado para auditoría
-- =====================================================
CREATE TABLE IF NOT EXISTS historial_estados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    orden_id INT NOT NULL,
    estado_anterior VARCHAR(50),
    estado_nuevo VARCHAR(50) NOT NULL,
    notas TEXT,
    fecha_cambio DATETIME DEFAULT CURRENT_TIMESTAMP,
    usuario VARCHAR(100) DEFAULT 'Sistema',

    FOREIGN KEY (orden_id) REFERENCES ordenes(id) ON DELETE CASCADE,
    INDEX idx_orden (orden_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TRIGGER: Generar número de orden automático
-- =====================================================
DELIMITER $$

CREATE TRIGGER before_insert_orden
BEFORE INSERT ON ordenes
FOR EACH ROW
BEGIN
    DECLARE next_number INT;

    -- Obtener el siguiente número secuencial
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_orden, 5) AS UNSIGNED)), 0) + 1
    INTO next_number
    FROM ordenes;

    -- Generar número con formato ORD-00001
    SET NEW.numero_orden = CONCAT('ORD-', LPAD(next_number, 5, '0'));
END$$

DELIMITER ;

-- =====================================================
-- TRIGGER: Registrar cambios de estado
-- =====================================================
DELIMITER $$

CREATE TRIGGER after_update_orden_estado
AFTER UPDATE ON ordenes
FOR EACH ROW
BEGIN
    IF OLD.estado != NEW.estado THEN
        INSERT INTO historial_estados (orden_id, estado_anterior, estado_nuevo, notas)
        VALUES (NEW.id, OLD.estado, NEW.estado, CONCAT('Estado cambiado de ', OLD.estado, ' a ', NEW.estado));
    END IF;
END$$

DELIMITER ;

-- =====================================================
-- DATOS DE PRUEBA (Opcional - Comentar en producción)
-- =====================================================

-- Insertar cliente de ejemplo
INSERT INTO clientes (nombre, telefono, email) VALUES
('Juan Pérez', '77889900', 'juan@example.com'),
('María López', '55667788', 'maria@example.com');

-- Insertar orden de ejemplo
INSERT INTO ordenes (
    numero_orden, cliente_id, tipo_equipo, marca, modelo, color,
    datos_acceso, accesorios, falla_reportada, costo_estimado, anticipo
) VALUES (
    'ORD-00001', 1, 'Laptop', 'HP', 'Pavilion', 'Gris',
    'Pass: 1234', 'Cargador, mouse', 'No enciende', 250.00, 100.00
);

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista de órdenes activas con información del cliente
CREATE OR REPLACE VIEW v_ordenes_activas AS
SELECT
    o.id,
    o.numero_orden,
    c.nombre AS cliente_nombre,
    c.telefono AS cliente_telefono,
    o.tipo_equipo,
    o.marca,
    o.modelo,
    o.falla_reportada,
    o.estado,
    o.fecha_ingreso,
    o.costo_total,
    o.anticipo,
    o.saldo_pendiente,
    DATEDIFF(CURDATE(), o.fecha_ingreso) AS dias_en_taller
FROM ordenes o
INNER JOIN clientes c ON o.cliente_id = c.id
WHERE o.estado NOT IN ('Entregado', 'Cancelado')
ORDER BY o.fecha_ingreso DESC;

-- Vista de estadísticas generales
CREATE OR REPLACE VIEW v_estadisticas AS
SELECT
    COUNT(*) AS total_ordenes,
    SUM(CASE WHEN estado = 'Recibido' THEN 1 ELSE 0 END) AS recibidos,
    SUM(CASE WHEN estado IN ('En Diagnóstico', 'En Reparación') THEN 1 ELSE 0 END) AS en_proceso,
    SUM(CASE WHEN estado = 'Listo para Entrega' THEN 1 ELSE 0 END) AS listos,
    SUM(CASE WHEN estado = 'Entregado' THEN 1 ELSE 0 END) AS entregados,
    SUM(costo_total) AS ingresos_totales,
    SUM(saldo_pendiente) AS saldo_pendiente_total
FROM ordenes;

-- =====================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =====================================================

-- Índice compuesto para búsquedas frecuentes
CREATE INDEX idx_estado_fecha ON ordenes(estado, fecha_ingreso);

-- Índice de texto completo para búsquedas
ALTER TABLE ordenes ADD FULLTEXT INDEX idx_busqueda (falla_reportada, diagnostico_tecnico, trabajo_realizado);

-- =====================================================
-- CONFIGURACIÓN FINAL
-- =====================================================

-- Mostrar las tablas creadas
SHOW TABLES;

-- Mensaje de éxito
SELECT 'Base de datos creada exitosamente!' AS mensaje;
