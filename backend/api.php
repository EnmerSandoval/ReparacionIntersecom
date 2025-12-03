<?php
/**
 * API REST - Sistema de Gestión de Reparaciones INTERSECOM
 * Backend en PHP Vanilla con PDO
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config.php';

// Obtener método HTTP y recurso
$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

// Parsear la URL para obtener el recurso y parámetros
$uri_parts = explode('?', $request_uri);
$path = $uri_parts[0];
$path_parts = explode('/', trim($path, '/'));

// Obtener recurso y ID si existe
$resource = isset($path_parts[count($path_parts) - 2]) ? $path_parts[count($path_parts) - 2] : '';
$id = isset($path_parts[count($path_parts) - 1]) && is_numeric($path_parts[count($path_parts) - 1])
    ? $path_parts[count($path_parts) - 1]
    : null;

// Si no hay ID, el recurso es el último elemento
if (!$id) {
    $resource = end($path_parts);
}

// Obtener datos del body
$input = json_decode(file_get_contents('php://input'), true);
$db = getDB();

try {
    // ===================================================
    // ENRUTADOR PRINCIPAL
    // ===================================================
    switch ($resource) {
        case 'sucursales':
            handleSucursales($method, $id, $input, $db);
            break;

        case 'clientes':
            handleClientes($method, $id, $input, $db);
            break;

        case 'ordenes':
            handleOrdenes($method, $id, $input, $db);
            break;

        case 'repuestos':
            handleRepuestos($method, $id, $input, $db);
            break;

        case 'traslados':
            handleTraslados($method, $id, $input, $db);
            break;

        case 'dashboard':
            handleDashboard($method, $input, $db);
            break;

        case 'estadisticas':
            handleEstadisticas($method, $input, $db);
            break;

        default:
            handleError('Recurso no encontrado', 404);
    }

} catch (Exception $e) {
    handleError('Error del servidor: ' . $e->getMessage(), 500);
}

// ===================================================
// FUNCIONES MANEJADORAS POR RECURSO
// ===================================================

/**
 * SUCURSALES
 */
function handleSucursales($method, $id, $input, $db) {
    switch ($method) {
        case 'GET':
            if ($id) {
                // Obtener una sucursal
                $stmt = $db->prepare("SELECT * FROM sucursales WHERE id = ?");
                $stmt->execute([$id]);
                $sucursal = $stmt->fetch();

                if (!$sucursal) {
                    handleError('Sucursal no encontrada', 404);
                }

                sendJSON(['success' => true, 'data' => $sucursal]);
            } else {
                // Obtener todas las sucursales
                $activo = isset($_GET['activo']) ? $_GET['activo'] : null;

                $sql = "SELECT * FROM sucursales";
                if ($activo !== null) {
                    $sql .= " WHERE activo = " . ($activo === 'true' ? 1 : 0);
                }
                $sql .= " ORDER BY nombre";

                $stmt = $db->query($sql);
                $sucursales = $stmt->fetchAll();

                sendJSON(['success' => true, 'data' => $sucursales]);
            }
            break;

        case 'POST':
            // Crear sucursal
            $required = ['nombre', 'direccion'];
            $missing = validateRequired($input, $required);

            if (!empty($missing)) {
                handleError('Campos requeridos faltantes: ' . implode(', ', $missing));
            }

            $stmt = $db->prepare("
                INSERT INTO sucursales (nombre, direccion, telefono, zona, ciudad, activo)
                VALUES (?, ?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                $input['nombre'],
                $input['direccion'],
                $input['telefono'] ?? null,
                $input['zona'] ?? null,
                $input['ciudad'] ?? 'San Marcos',
                $input['activo'] ?? true
            ]);

            sendJSON([
                'success' => true,
                'message' => 'Sucursal creada exitosamente',
                'id' => $db->lastInsertId()
            ], 201);
            break;

        case 'PUT':
            // Actualizar sucursal
            if (!$id) {
                handleError('ID de sucursal requerido');
            }

            $stmt = $db->prepare("
                UPDATE sucursales
                SET nombre = ?, direccion = ?, telefono = ?, zona = ?, ciudad = ?, activo = ?
                WHERE id = ?
            ");

            $stmt->execute([
                $input['nombre'],
                $input['direccion'],
                $input['telefono'] ?? null,
                $input['zona'] ?? null,
                $input['ciudad'] ?? 'San Marcos',
                $input['activo'] ?? true,
                $id
            ]);

            sendJSON(['success' => true, 'message' => 'Sucursal actualizada exitosamente']);
            break;

        case 'DELETE':
            // Eliminar sucursal (soft delete)
            if (!$id) {
                handleError('ID de sucursal requerido');
            }

            $stmt = $db->prepare("UPDATE sucursales SET activo = 0 WHERE id = ?");
            $stmt->execute([$id]);

            sendJSON(['success' => true, 'message' => 'Sucursal desactivada exitosamente']);
            break;

        default:
            handleError('Método no permitido', 405);
    }
}

/**
 * CLIENTES
 */
function handleClientes($method, $id, $input, $db) {
    switch ($method) {
        case 'GET':
            if ($id) {
                // Obtener un cliente
                $stmt = $db->prepare("SELECT * FROM clientes WHERE id = ?");
                $stmt->execute([$id]);
                $cliente = $stmt->fetch();

                if (!$cliente) {
                    handleError('Cliente no encontrado', 404);
                }

                sendJSON(['success' => true, 'data' => $cliente]);
            } else {
                // Obtener todos los clientes o buscar por teléfono/nombre
                $search = $_GET['search'] ?? null;

                if ($search) {
                    $stmt = $db->prepare("
                        SELECT * FROM clientes
                        WHERE nombre LIKE ? OR telefono LIKE ?
                        ORDER BY nombre
                        LIMIT 50
                    ");
                    $searchTerm = "%$search%";
                    $stmt->execute([$searchTerm, $searchTerm]);
                } else {
                    $stmt = $db->query("SELECT * FROM clientes ORDER BY fecha_registro DESC LIMIT 100");
                }

                $clientes = $stmt->fetchAll();
                sendJSON(['success' => true, 'data' => $clientes]);
            }
            break;

        case 'POST':
            // Crear cliente
            $required = ['nombre', 'telefono'];
            $missing = validateRequired($input, $required);

            if (!empty($missing)) {
                handleError('Campos requeridos faltantes: ' . implode(', ', $missing));
            }

            $stmt = $db->prepare("
                INSERT INTO clientes (nombre, telefono, correo_electronico, direccion, nit)
                VALUES (?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                $input['nombre'],
                $input['telefono'],
                $input['correo_electronico'] ?? null,
                $input['direccion'] ?? null,
                $input['nit'] ?? null
            ]);

            sendJSON([
                'success' => true,
                'message' => 'Cliente creado exitosamente',
                'id' => $db->lastInsertId()
            ], 201);
            break;

        case 'PUT':
            // Actualizar cliente
            if (!$id) {
                handleError('ID de cliente requerido');
            }

            $stmt = $db->prepare("
                UPDATE clientes
                SET nombre = ?, telefono = ?, correo_electronico = ?, direccion = ?, nit = ?
                WHERE id = ?
            ");

            $stmt->execute([
                $input['nombre'],
                $input['telefono'],
                $input['correo_electronico'] ?? null,
                $input['direccion'] ?? null,
                $input['nit'] ?? null,
                $id
            ]);

            sendJSON(['success' => true, 'message' => 'Cliente actualizado exitosamente']);
            break;

        default:
            handleError('Método no permitido', 405);
    }
}

/**
 * ÓRDENES
 */
function handleOrdenes($method, $id, $input, $db) {
    switch ($method) {
        case 'GET':
            if ($id) {
                // Obtener una orden completa con todos sus datos relacionados
                $stmt = $db->prepare("
                    SELECT
                        o.*,
                        c.nombre AS cliente_nombre,
                        c.telefono AS cliente_telefono,
                        c.correo_electronico AS cliente_correo,
                        s.nombre AS sucursal_nombre,
                        s.direccion AS sucursal_direccion,
                        s.telefono AS sucursal_telefono
                    FROM ordenes o
                    INNER JOIN clientes c ON o.id_cliente = c.id
                    INNER JOIN sucursales s ON o.id_sucursal = s.id
                    WHERE o.id = ?
                ");
                $stmt->execute([$id]);
                $orden = $stmt->fetch();

                if (!$orden) {
                    handleError('Orden no encontrada', 404);
                }

                // Obtener repuestos de la orden
                $stmt = $db->prepare("SELECT * FROM repuestos_utilizados WHERE id_orden = ?");
                $stmt->execute([$id]);
                $orden['repuestos'] = $stmt->fetchAll();

                // Obtener historial de estados
                $stmt = $db->prepare("SELECT * FROM historial_estados WHERE id_orden = ? ORDER BY fecha_cambio DESC");
                $stmt->execute([$id]);
                $orden['historial'] = $stmt->fetchAll();

                sendJSON(['success' => true, 'data' => $orden]);
            } else {
                // Obtener todas las órdenes con filtros
                $sucursal = $_GET['sucursal'] ?? null;
                $estado = $_GET['estado'] ?? null;
                $fecha_desde = $_GET['fecha_desde'] ?? null;
                $fecha_hasta = $_GET['fecha_hasta'] ?? null;

                $sql = "
                    SELECT
                        o.id,
                        o.numero_orden,
                        o.fecha_recepcion,
                        o.estado,
                        o.tipo_equipo,
                        o.marca,
                        o.modelo,
                        o.falla_reportada,
                        o.valor_total,
                        o.anticipo,
                        (o.valor_total - o.anticipo) AS saldo_pendiente,
                        c.nombre AS cliente_nombre,
                        c.telefono AS cliente_telefono,
                        s.nombre AS sucursal_nombre,
                        DATEDIFF(CURRENT_DATE, DATE(o.fecha_recepcion)) AS dias_en_taller
                    FROM ordenes o
                    INNER JOIN clientes c ON o.id_cliente = c.id
                    INNER JOIN sucursales s ON o.id_sucursal = s.id
                    WHERE 1=1
                ";

                $params = [];

                if ($sucursal) {
                    $sql .= " AND o.id_sucursal = ?";
                    $params[] = $sucursal;
                }

                if ($estado) {
                    $sql .= " AND o.estado = ?";
                    $params[] = $estado;
                }

                if ($fecha_desde) {
                    $sql .= " AND DATE(o.fecha_recepcion) >= ?";
                    $params[] = $fecha_desde;
                }

                if ($fecha_hasta) {
                    $sql .= " AND DATE(o.fecha_recepcion) <= ?";
                    $params[] = $fecha_hasta;
                }

                $sql .= " ORDER BY o.fecha_recepcion DESC LIMIT 200";

                $stmt = $db->prepare($sql);
                $stmt->execute($params);
                $ordenes = $stmt->fetchAll();

                sendJSON(['success' => true, 'data' => $ordenes]);
            }
            break;

        case 'POST':
            // Crear nueva orden
            $required = ['id_cliente', 'id_sucursal', 'tipo_equipo', 'falla_reportada'];
            $missing = validateRequired($input, $required);

            if (!empty($missing)) {
                handleError('Campos requeridos faltantes: ' . implode(', ', $missing));
            }

            $db->beginTransaction();

            try {
                // Insertar orden
                $stmt = $db->prepare("
                    INSERT INTO ordenes (
                        id_cliente, id_sucursal, tipo_equipo, marca, modelo, color,
                        datos_acceso, accesorios, falla_reportada, costo_estimado,
                        anticipo, fecha_estimada_entrega, observaciones, recibido_por
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");

                $stmt->execute([
                    $input['id_cliente'],
                    $input['id_sucursal'],
                    $input['tipo_equipo'],
                    $input['marca'] ?? null,
                    $input['modelo'] ?? null,
                    $input['color'] ?? null,
                    $input['datos_acceso'] ?? null,
                    $input['accesorios'] ?? null,
                    $input['falla_reportada'],
                    $input['costo_estimado'] ?? 0,
                    $input['anticipo'] ?? 0,
                    $input['fecha_estimada_entrega'] ?? null,
                    $input['observaciones'] ?? null,
                    $input['recibido_por'] ?? null
                ]);

                $orden_id = $db->lastInsertId();

                // Obtener el número de orden generado
                $stmt = $db->prepare("SELECT numero_orden FROM ordenes WHERE id = ?");
                $stmt->execute([$orden_id]);
                $numero_orden = $stmt->fetchColumn();

                $db->commit();

                sendJSON([
                    'success' => true,
                    'message' => 'Orden creada exitosamente',
                    'id' => $orden_id,
                    'numero_orden' => $numero_orden
                ], 201);

            } catch (Exception $e) {
                $db->rollBack();
                handleError('Error al crear orden: ' . $e->getMessage(), 500);
            }
            break;

        case 'PUT':
            // Actualizar orden
            if (!$id) {
                handleError('ID de orden requerido');
            }

            $db->beginTransaction();

            try {
                $stmt = $db->prepare("
                    UPDATE ordenes SET
                        tipo_equipo = ?,
                        marca = ?,
                        modelo = ?,
                        color = ?,
                        datos_acceso = ?,
                        accesorios = ?,
                        falla_reportada = ?,
                        detalle_trabajo = ?,
                        estado = ?,
                        costo_estimado = ?,
                        anticipo = ?,
                        costo_repuestos = ?,
                        costo_trabajo = ?,
                        valor_total = ?,
                        fecha_estimada_entrega = ?,
                        observaciones = ?,
                        entregado_por = ?
                    WHERE id = ?
                ");

                $valor_total = ($input['costo_estimado'] ?? 0) +
                               ($input['costo_repuestos'] ?? 0) +
                               ($input['costo_trabajo'] ?? 0);

                $stmt->execute([
                    $input['tipo_equipo'],
                    $input['marca'] ?? null,
                    $input['modelo'] ?? null,
                    $input['color'] ?? null,
                    $input['datos_acceso'] ?? null,
                    $input['accesorios'] ?? null,
                    $input['falla_reportada'],
                    $input['detalle_trabajo'] ?? null,
                    $input['estado'],
                    $input['costo_estimado'] ?? 0,
                    $input['anticipo'] ?? 0,
                    $input['costo_repuestos'] ?? 0,
                    $input['costo_trabajo'] ?? 0,
                    $valor_total,
                    $input['fecha_estimada_entrega'] ?? null,
                    $input['observaciones'] ?? null,
                    $input['entregado_por'] ?? null,
                    $id
                ]);

                // Si el estado es "Entregado", actualizar fecha de entrega
                if ($input['estado'] === 'Entregado') {
                    $stmt = $db->prepare("UPDATE ordenes SET fecha_entrega = CURRENT_TIMESTAMP WHERE id = ?");
                    $stmt->execute([$id]);
                }

                $db->commit();

                sendJSON(['success' => true, 'message' => 'Orden actualizada exitosamente']);

            } catch (Exception $e) {
                $db->rollBack();
                handleError('Error al actualizar orden: ' . $e->getMessage(), 500);
            }
            break;

        case 'DELETE':
            // Cancelar orden (no eliminar físicamente)
            if (!$id) {
                handleError('ID de orden requerido');
            }

            $stmt = $db->prepare("UPDATE ordenes SET estado = 'Cancelado' WHERE id = ?");
            $stmt->execute([$id]);

            sendJSON(['success' => true, 'message' => 'Orden cancelada exitosamente']);
            break;

        default:
            handleError('Método no permitido', 405);
    }
}

/**
 * REPUESTOS
 */
function handleRepuestos($method, $id, $input, $db) {
    switch ($method) {
        case 'GET':
            // Obtener repuestos de una orden
            $id_orden = $_GET['id_orden'] ?? null;

            if (!$id_orden) {
                handleError('ID de orden requerido');
            }

            $stmt = $db->prepare("SELECT * FROM repuestos_utilizados WHERE id_orden = ?");
            $stmt->execute([$id_orden]);
            $repuestos = $stmt->fetchAll();

            sendJSON(['success' => true, 'data' => $repuestos]);
            break;

        case 'POST':
            // Agregar repuesto a una orden
            $required = ['id_orden', 'descripcion', 'cantidad', 'precio_unitario'];
            $missing = validateRequired($input, $required);

            if (!empty($missing)) {
                handleError('Campos requeridos faltantes: ' . implode(', ', $missing));
            }

            $db->beginTransaction();

            try {
                $stmt = $db->prepare("
                    INSERT INTO repuestos_utilizados (id_orden, descripcion, cantidad, precio_unitario)
                    VALUES (?, ?, ?, ?)
                ");

                $stmt->execute([
                    $input['id_orden'],
                    $input['descripcion'],
                    $input['cantidad'],
                    $input['precio_unitario']
                ]);

                // Actualizar costo de repuestos en la orden
                $stmt = $db->prepare("
                    UPDATE ordenes
                    SET costo_repuestos = (
                        SELECT SUM(precio_total) FROM repuestos_utilizados WHERE id_orden = ?
                    )
                    WHERE id = ?
                ");
                $stmt->execute([$input['id_orden'], $input['id_orden']]);

                // Actualizar valor total
                $stmt = $db->prepare("
                    UPDATE ordenes
                    SET valor_total = costo_estimado + costo_repuestos + costo_trabajo
                    WHERE id = ?
                ");
                $stmt->execute([$input['id_orden']]);

                $db->commit();

                sendJSON([
                    'success' => true,
                    'message' => 'Repuesto agregado exitosamente',
                    'id' => $db->lastInsertId()
                ], 201);

            } catch (Exception $e) {
                $db->rollBack();
                handleError('Error al agregar repuesto: ' . $e->getMessage(), 500);
            }
            break;

        case 'DELETE':
            // Eliminar repuesto
            if (!$id) {
                handleError('ID de repuesto requerido');
            }

            $db->beginTransaction();

            try {
                // Obtener id_orden antes de eliminar
                $stmt = $db->prepare("SELECT id_orden FROM repuestos_utilizados WHERE id = ?");
                $stmt->execute([$id]);
                $id_orden = $stmt->fetchColumn();

                // Eliminar repuesto
                $stmt = $db->prepare("DELETE FROM repuestos_utilizados WHERE id = ?");
                $stmt->execute([$id]);

                // Actualizar costos en la orden
                $stmt = $db->prepare("
                    UPDATE ordenes
                    SET costo_repuestos = (
                        SELECT COALESCE(SUM(precio_total), 0) FROM repuestos_utilizados WHERE id_orden = ?
                    ),
                    valor_total = costo_estimado + (
                        SELECT COALESCE(SUM(precio_total), 0) FROM repuestos_utilizados WHERE id_orden = ?
                    ) + costo_trabajo
                    WHERE id = ?
                ");
                $stmt->execute([$id_orden, $id_orden, $id_orden]);

                $db->commit();

                sendJSON(['success' => true, 'message' => 'Repuesto eliminado exitosamente']);

            } catch (Exception $e) {
                $db->rollBack();
                handleError('Error al eliminar repuesto: ' . $e->getMessage(), 500);
            }
            break;

        default:
            handleError('Método no permitido', 405);
    }
}

/**
 * TRASLADOS
 */
function handleTraslados($method, $id, $input, $db) {
    switch ($method) {
        case 'GET':
            if ($id) {
                // Obtener un traslado
                $stmt = $db->prepare("SELECT * FROM vista_traslados_pendientes WHERE id = ?");
                $stmt->execute([$id]);
                $traslado = $stmt->fetch();

                if (!$traslado) {
                    handleError('Traslado no encontrado', 404);
                }

                sendJSON(['success' => true, 'data' => $traslado]);
            } else {
                // Obtener todos los traslados
                $estado = $_GET['estado'] ?? null;

                $sql = "SELECT * FROM vista_traslados_pendientes WHERE 1=1";
                $params = [];

                if ($estado) {
                    $sql .= " AND estado_traslado = ?";
                    $params[] = $estado;
                }

                $sql .= " ORDER BY fecha_envio DESC";

                $stmt = $db->prepare($sql);
                $stmt->execute($params);
                $traslados = $stmt->fetchAll();

                sendJSON(['success' => true, 'data' => $traslados]);
            }
            break;

        case 'POST':
            // Crear traslado
            $required = ['id_orden', 'id_sucursal_origen', 'id_sucursal_destino'];
            $missing = validateRequired($input, $required);

            if (!empty($missing)) {
                handleError('Campos requeridos faltantes: ' . implode(', ', $missing));
            }

            $stmt = $db->prepare("
                INSERT INTO traslados (
                    id_orden, id_sucursal_origen, id_sucursal_destino,
                    motivo, enviado_por, observaciones
                ) VALUES (?, ?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                $input['id_orden'],
                $input['id_sucursal_origen'],
                $input['id_sucursal_destino'],
                $input['motivo'] ?? null,
                $input['enviado_por'] ?? null,
                $input['observaciones'] ?? null
            ]);

            sendJSON([
                'success' => true,
                'message' => 'Traslado creado exitosamente',
                'id' => $db->lastInsertId()
            ], 201);
            break;

        case 'PUT':
            // Actualizar estado del traslado
            if (!$id) {
                handleError('ID de traslado requerido');
            }

            $stmt = $db->prepare("
                UPDATE traslados
                SET estado_traslado = ?, recibido_por = ?, fecha_recepcion = ?
                WHERE id = ?
            ");

            $fecha_recepcion = ($input['estado_traslado'] === 'Recibido')
                ? date('Y-m-d H:i:s')
                : null;

            $stmt->execute([
                $input['estado_traslado'],
                $input['recibido_por'] ?? null,
                $fecha_recepcion,
                $id
            ]);

            sendJSON(['success' => true, 'message' => 'Traslado actualizado exitosamente']);
            break;

        default:
            handleError('Método no permitido', 405);
    }
}

/**
 * DASHBOARD
 */
function handleDashboard($method, $input, $db) {
    if ($method !== 'GET') {
        handleError('Método no permitido', 405);
    }

    $id_sucursal = $_GET['sucursal'] ?? null;

    // Estadísticas generales
    $sql_stats = "
        SELECT
            COUNT(*) AS total_ordenes,
            SUM(CASE WHEN estado = 'Recibido' THEN 1 ELSE 0 END) AS recibidos,
            SUM(CASE WHEN estado = 'En Reparación' THEN 1 ELSE 0 END) AS en_reparacion,
            SUM(CASE WHEN estado = 'Listo' THEN 1 ELSE 0 END) AS listos,
            SUM(CASE WHEN estado = 'Entregado' THEN 1 ELSE 0 END) AS entregados,
            SUM(valor_total) AS ventas_totales,
            SUM(anticipo) AS anticipos_totales,
            SUM(valor_total - anticipo) AS saldo_pendiente
        FROM ordenes
        WHERE MONTH(fecha_recepcion) = MONTH(CURRENT_DATE)
        AND YEAR(fecha_recepcion) = YEAR(CURRENT_DATE)
    ";

    if ($id_sucursal) {
        $sql_stats .= " AND id_sucursal = $id_sucursal";
    }

    $stmt = $db->query($sql_stats);
    $stats = $stmt->fetch();

    // Órdenes pendientes por sucursal
    $sql_pendientes = "
        SELECT
            s.nombre AS sucursal,
            COUNT(*) AS total,
            SUM(CASE WHEN o.estado = 'Recibido' THEN 1 ELSE 0 END) AS recibidos,
            SUM(CASE WHEN o.estado = 'En Reparación' THEN 1 ELSE 0 END) AS en_reparacion,
            SUM(CASE WHEN o.estado = 'Listo' THEN 1 ELSE 0 END) AS listos
        FROM ordenes o
        INNER JOIN sucursales s ON o.id_sucursal = s.id
        WHERE o.estado IN ('Recibido', 'En Reparación', 'Listo')
    ";

    if ($id_sucursal) {
        $sql_pendientes .= " AND o.id_sucursal = $id_sucursal";
    }

    $sql_pendientes .= " GROUP BY s.id, s.nombre";

    $stmt = $db->query($sql_pendientes);
    $pendientes_sucursal = $stmt->fetchAll();

    sendJSON([
        'success' => true,
        'data' => [
            'estadisticas' => $stats,
            'por_sucursal' => $pendientes_sucursal
        ]
    ]);
}

/**
 * ESTADÍSTICAS
 */
function handleEstadisticas($method, $input, $db) {
    if ($method !== 'GET') {
        handleError('Método no permitido', 405);
    }

    $tipo = $_GET['tipo'] ?? 'general';
    $sucursal = $_GET['sucursal'] ?? null;

    switch ($tipo) {
        case 'ventas_mes':
            $sql = "
                SELECT
                    DATE(fecha_recepcion) AS fecha,
                    COUNT(*) AS total_ordenes,
                    SUM(valor_total) AS ventas
                FROM ordenes
                WHERE MONTH(fecha_recepcion) = MONTH(CURRENT_DATE)
                AND YEAR(fecha_recepcion) = YEAR(CURRENT_DATE)
            ";

            if ($sucursal) {
                $sql .= " AND id_sucursal = $sucursal";
            }

            $sql .= " GROUP BY DATE(fecha_recepcion) ORDER BY fecha";

            $stmt = $db->query($sql);
            $data = $stmt->fetchAll();

            sendJSON(['success' => true, 'data' => $data]);
            break;

        case 'equipos_mas_reparados':
            $sql = "
                SELECT
                    tipo_equipo,
                    marca,
                    COUNT(*) AS total
                FROM ordenes
                WHERE MONTH(fecha_recepcion) = MONTH(CURRENT_DATE)
                AND YEAR(fecha_recepcion) = YEAR(CURRENT_DATE)
            ";

            if ($sucursal) {
                $sql .= " AND id_sucursal = $sucursal";
            }

            $sql .= " GROUP BY tipo_equipo, marca ORDER BY total DESC LIMIT 10";

            $stmt = $db->query($sql);
            $data = $stmt->fetchAll();

            sendJSON(['success' => true, 'data' => $data]);
            break;

        default:
            handleError('Tipo de estadística no válido');
    }
}
