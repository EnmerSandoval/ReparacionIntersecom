<?php
/**
 * =====================================================
 * API REST - TALLER INTERSECOM
 * =====================================================
 * Endpoints para gestión de órdenes de reparación
 *
 * Endpoints disponibles:
 * - GET    /api.php?action=getOrdenes
 * - GET    /api.php?action=getOrden&id=1
 * - POST   /api.php?action=createOrden
 * - PUT    /api.php?action=updateOrden
 * - PUT    /api.php?action=updateEstado
 * - DELETE /api.php?action=deleteOrden&id=1
 * - GET    /api.php?action=getClientes
 * - POST   /api.php?action=createCliente
 * - GET    /api.php?action=getEstadisticas
 */

// Incluir configuración
require_once '../config/config.php';

// =====================================================
// CONFIGURACIÓN DE CORS (Cross-Origin Resource Sharing)
// =====================================================
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// =====================================================
// OBTENER MÉTODO Y ACCIÓN
// =====================================================
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Obtener datos del cuerpo de la petición
$input = json_decode(file_get_contents('php://input'), true);

try {
    $db = getDB();

    // =====================================================
    // ROUTER - Enrutador de acciones
    // =====================================================
    switch ($action) {

        // =================================================
        // GET: Obtener todas las órdenes
        // =================================================
        case 'getOrdenes':
            if ($method !== 'GET') {
                jsonResponse(['success' => false, 'message' => 'Método no permitido'], 405);
            }

            $estado = $_GET['estado'] ?? null;
            $limit = $_GET['limit'] ?? 100;
            $offset = $_GET['offset'] ?? 0;

            $sql = "SELECT
                        o.*,
                        c.nombre AS cliente_nombre,
                        c.telefono AS cliente_telefono,
                        c.email AS cliente_email,
                        DATEDIFF(CURDATE(), o.fecha_ingreso) AS dias_en_taller
                    FROM ordenes o
                    INNER JOIN clientes c ON o.cliente_id = c.id";

            if ($estado) {
                $sql .= " WHERE o.estado = :estado";
            }

            $sql .= " ORDER BY o.fecha_ingreso DESC LIMIT :limit OFFSET :offset";

            $stmt = $db->prepare($sql);

            if ($estado) {
                $stmt->bindParam(':estado', $estado, PDO::PARAM_STR);
            }

            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();

            $ordenes = $stmt->fetchAll();

            jsonResponse([
                'success' => true,
                'data' => $ordenes,
                'count' => count($ordenes)
            ]);
            break;

        // =================================================
        // GET: Obtener una orden específica
        // =================================================
        case 'getOrden':
            if ($method !== 'GET') {
                jsonResponse(['success' => false, 'message' => 'Método no permitido'], 405);
            }

            $id = $_GET['id'] ?? null;

            if (!$id) {
                jsonResponse(['success' => false, 'message' => 'ID requerido'], 400);
            }

            $sql = "SELECT
                        o.*,
                        c.nombre AS cliente_nombre,
                        c.telefono AS cliente_telefono,
                        c.email AS cliente_email,
                        c.direccion AS cliente_direccion
                    FROM ordenes o
                    INNER JOIN clientes c ON o.cliente_id = c.id
                    WHERE o.id = :id";

            $stmt = $db->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            $orden = $stmt->fetch();

            if (!$orden) {
                jsonResponse(['success' => false, 'message' => 'Orden no encontrada'], 404);
            }

            // Obtener historial de estados
            $sqlHistorial = "SELECT * FROM historial_estados WHERE orden_id = :id ORDER BY fecha_cambio DESC";
            $stmtHistorial = $db->prepare($sqlHistorial);
            $stmtHistorial->bindParam(':id', $id, PDO::PARAM_INT);
            $stmtHistorial->execute();
            $orden['historial'] = $stmtHistorial->fetchAll();

            jsonResponse([
                'success' => true,
                'data' => $orden
            ]);
            break;

        // =================================================
        // POST: Crear nueva orden
        // =================================================
        case 'createOrden':
            if ($method !== 'POST') {
                jsonResponse(['success' => false, 'message' => 'Método no permitido'], 405);
            }

            // Validar campos requeridos
            $required = ['cliente_nombre', 'cliente_telefono', 'tipo_equipo', 'falla_reportada'];
            $missing = validateRequired($input, $required);

            if (!empty($missing)) {
                jsonResponse([
                    'success' => false,
                    'message' => 'Faltan campos requeridos',
                    'missing_fields' => $missing
                ], 400);
            }

            $db->beginTransaction();

            try {
                // 1. Buscar o crear cliente
                $sqlCliente = "SELECT id FROM clientes WHERE telefono = :telefono LIMIT 1";
                $stmtCliente = $db->prepare($sqlCliente);
                $stmtCliente->bindParam(':telefono', $input['cliente_telefono']);
                $stmtCliente->execute();
                $cliente = $stmtCliente->fetch();

                if ($cliente) {
                    $clienteId = $cliente['id'];
                } else {
                    // Crear nuevo cliente
                    $sqlInsertCliente = "INSERT INTO clientes (nombre, telefono, email, direccion)
                                        VALUES (:nombre, :telefono, :email, :direccion)";
                    $stmtInsertCliente = $db->prepare($sqlInsertCliente);
                    $stmtInsertCliente->execute([
                        ':nombre' => sanitizeInput($input['cliente_nombre']),
                        ':telefono' => sanitizeInput($input['cliente_telefono']),
                        ':email' => sanitizeInput($input['cliente_email'] ?? null),
                        ':direccion' => sanitizeInput($input['cliente_direccion'] ?? null)
                    ]);
                    $clienteId = $db->lastInsertId();
                }

                // 2. Crear orden
                $sqlOrden = "INSERT INTO ordenes (
                    cliente_id, tipo_equipo, marca, modelo, color, numero_serie,
                    datos_acceso, accesorios, falla_reportada, observaciones_recepcion,
                    diagnostico_tecnico, trabajo_realizado, repuestos_usados, tecnico_responsable,
                    fecha_estimada_salida, estado, costo_estimado, costo_total, anticipo,
                    tipo_pago, lugar_cotizacion
                ) VALUES (
                    :cliente_id, :tipo_equipo, :marca, :modelo, :color, :numero_serie,
                    :datos_acceso, :accesorios, :falla_reportada, :observaciones_recepcion,
                    :diagnostico_tecnico, :trabajo_realizado, :repuestos_usados, :tecnico_responsable,
                    :fecha_estimada_salida, :estado, :costo_estimado, :costo_total, :anticipo,
                    :tipo_pago, :lugar_cotizacion
                )";

                $stmtOrden = $db->prepare($sqlOrden);
                $stmtOrden->execute([
                    ':cliente_id' => $clienteId,
                    ':tipo_equipo' => sanitizeInput($input['tipo_equipo']),
                    ':marca' => sanitizeInput($input['marca'] ?? ''),
                    ':modelo' => sanitizeInput($input['modelo'] ?? ''),
                    ':color' => sanitizeInput($input['color'] ?? ''),
                    ':numero_serie' => sanitizeInput($input['numero_serie'] ?? ''),
                    ':datos_acceso' => sanitizeInput($input['datos_acceso'] ?? ''),
                    ':accesorios' => sanitizeInput($input['accesorios'] ?? ''),
                    ':falla_reportada' => sanitizeInput($input['falla_reportada']),
                    ':observaciones_recepcion' => sanitizeInput($input['observaciones_recepcion'] ?? ''),
                    ':diagnostico_tecnico' => sanitizeInput($input['diagnostico_tecnico'] ?? ''),
                    ':trabajo_realizado' => sanitizeInput($input['trabajo_realizado'] ?? ''),
                    ':repuestos_usados' => sanitizeInput($input['repuestos_usados'] ?? ''),
                    ':tecnico_responsable' => sanitizeInput($input['tecnico_responsable'] ?? 'Intersecom'),
                    ':fecha_estimada_salida' => $input['fecha_estimada_salida'] ?? null,
                    ':estado' => sanitizeInput($input['estado'] ?? 'Recibido'),
                    ':costo_estimado' => $input['costo_estimado'] ?? 0,
                    ':costo_total' => $input['costo_total'] ?? 0,
                    ':anticipo' => $input['anticipo'] ?? 0,
                    ':tipo_pago' => sanitizeInput($input['tipo_pago'] ?? 'Efectivo'),
                    ':lugar_cotizacion' => sanitizeInput($input['lugar_cotizacion'] ?? '')
                ]);

                $ordenId = $db->lastInsertId();

                // 3. Obtener el número de orden generado
                $sqlNumero = "SELECT numero_orden FROM ordenes WHERE id = :id";
                $stmtNumero = $db->prepare($sqlNumero);
                $stmtNumero->bindParam(':id', $ordenId);
                $stmtNumero->execute();
                $numeroOrden = $stmtNumero->fetch()['numero_orden'];

                $db->commit();

                jsonResponse([
                    'success' => true,
                    'message' => 'Orden creada exitosamente',
                    'data' => [
                        'id' => $ordenId,
                        'numero_orden' => $numeroOrden
                    ]
                ], 201);

            } catch (Exception $e) {
                $db->rollBack();
                jsonResponse([
                    'success' => false,
                    'message' => 'Error al crear la orden',
                    'error' => $e->getMessage()
                ], 500);
            }
            break;

        // =================================================
        // PUT: Actualizar orden completa
        // =================================================
        case 'updateOrden':
            if ($method !== 'PUT') {
                jsonResponse(['success' => false, 'message' => 'Método no permitido'], 405);
            }

            $id = $input['id'] ?? null;

            if (!$id) {
                jsonResponse(['success' => false, 'message' => 'ID requerido'], 400);
            }

            $sql = "UPDATE ordenes SET
                        marca = :marca,
                        modelo = :modelo,
                        color = :color,
                        numero_serie = :numero_serie,
                        datos_acceso = :datos_acceso,
                        accesorios = :accesorios,
                        falla_reportada = :falla_reportada,
                        observaciones_recepcion = :observaciones_recepcion,
                        diagnostico_tecnico = :diagnostico_tecnico,
                        trabajo_realizado = :trabajo_realizado,
                        repuestos_usados = :repuestos_usados,
                        tecnico_responsable = :tecnico_responsable,
                        fecha_estimada_salida = :fecha_estimada_salida,
                        costo_estimado = :costo_estimado,
                        costo_total = :costo_total,
                        anticipo = :anticipo,
                        tipo_pago = :tipo_pago,
                        lugar_cotizacion = :lugar_cotizacion
                    WHERE id = :id";

            $stmt = $db->prepare($sql);
            $result = $stmt->execute([
                ':id' => $id,
                ':marca' => sanitizeInput($input['marca'] ?? ''),
                ':modelo' => sanitizeInput($input['modelo'] ?? ''),
                ':color' => sanitizeInput($input['color'] ?? ''),
                ':numero_serie' => sanitizeInput($input['numero_serie'] ?? ''),
                ':datos_acceso' => sanitizeInput($input['datos_acceso'] ?? ''),
                ':accesorios' => sanitizeInput($input['accesorios'] ?? ''),
                ':falla_reportada' => sanitizeInput($input['falla_reportada'] ?? ''),
                ':observaciones_recepcion' => sanitizeInput($input['observaciones_recepcion'] ?? ''),
                ':diagnostico_tecnico' => sanitizeInput($input['diagnostico_tecnico'] ?? ''),
                ':trabajo_realizado' => sanitizeInput($input['trabajo_realizado'] ?? ''),
                ':repuestos_usados' => sanitizeInput($input['repuestos_usados'] ?? ''),
                ':tecnico_responsable' => sanitizeInput($input['tecnico_responsable'] ?? 'Intersecom'),
                ':fecha_estimada_salida' => $input['fecha_estimada_salida'] ?? null,
                ':costo_estimado' => $input['costo_estimado'] ?? 0,
                ':costo_total' => $input['costo_total'] ?? 0,
                ':anticipo' => $input['anticipo'] ?? 0,
                ':tipo_pago' => sanitizeInput($input['tipo_pago'] ?? 'Efectivo'),
                ':lugar_cotizacion' => sanitizeInput($input['lugar_cotizacion'] ?? '')
            ]);

            jsonResponse([
                'success' => true,
                'message' => 'Orden actualizada exitosamente'
            ]);
            break;

        // =================================================
        // PUT: Actualizar solo el estado
        // =================================================
        case 'updateEstado':
            if ($method !== 'PUT') {
                jsonResponse(['success' => false, 'message' => 'Método no permitido'], 405);
            }

            $id = $input['id'] ?? null;
            $estado = $input['estado'] ?? null;

            if (!$id || !$estado) {
                jsonResponse(['success' => false, 'message' => 'ID y estado requeridos'], 400);
            }

            $sql = "UPDATE ordenes SET estado = :estado";

            // Si el estado es "Entregado", actualizar fecha de entrega
            if ($estado === 'Entregado') {
                $sql .= ", fecha_entrega = NOW()";
                if (isset($input['entregado_a'])) {
                    $sql .= ", entregado_a = :entregado_a";
                }
            }

            $sql .= " WHERE id = :id";

            $stmt = $db->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->bindParam(':estado', $estado, PDO::PARAM_STR);

            if ($estado === 'Entregado' && isset($input['entregado_a'])) {
                $entregado_a = sanitizeInput($input['entregado_a']);
                $stmt->bindParam(':entregado_a', $entregado_a, PDO::PARAM_STR);
            }

            $stmt->execute();

            jsonResponse([
                'success' => true,
                'message' => 'Estado actualizado exitosamente'
            ]);
            break;

        // =================================================
        // DELETE: Eliminar orden
        // =================================================
        case 'deleteOrden':
            if ($method !== 'DELETE') {
                jsonResponse(['success' => false, 'message' => 'Método no permitido'], 405);
            }

            $id = $_GET['id'] ?? null;

            if (!$id) {
                jsonResponse(['success' => false, 'message' => 'ID requerido'], 400);
            }

            $sql = "DELETE FROM ordenes WHERE id = :id";
            $stmt = $db->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            jsonResponse([
                'success' => true,
                'message' => 'Orden eliminada exitosamente'
            ]);
            break;

        // =================================================
        // GET: Obtener todos los clientes
        // =================================================
        case 'getClientes':
            if ($method !== 'GET') {
                jsonResponse(['success' => false, 'message' => 'Método no permitido'], 405);
            }

            $sql = "SELECT * FROM clientes ORDER BY nombre ASC";
            $stmt = $db->query($sql);
            $clientes = $stmt->fetchAll();

            jsonResponse([
                'success' => true,
                'data' => $clientes
            ]);
            break;

        // =================================================
        // GET: Obtener estadísticas
        // =================================================
        case 'getEstadisticas':
            if ($method !== 'GET') {
                jsonResponse(['success' => false, 'message' => 'Método no permitido'], 405);
            }

            $sql = "SELECT * FROM v_estadisticas";
            $stmt = $db->query($sql);
            $stats = $stmt->fetch();

            jsonResponse([
                'success' => true,
                'data' => $stats
            ]);
            break;

        // =================================================
        // ACCIÓN NO ENCONTRADA
        // =================================================
        default:
            jsonResponse([
                'success' => false,
                'message' => 'Acción no válida',
                'action_received' => $action
            ], 400);
            break;
    }

} catch (PDOException $e) {
    jsonResponse([
        'success' => false,
        'message' => 'Error de base de datos',
        'error' => $e->getMessage()
    ], 500);
} catch (Exception $e) {
    jsonResponse([
        'success' => false,
        'message' => 'Error interno del servidor',
        'error' => $e->getMessage()
    ], 500);
}
