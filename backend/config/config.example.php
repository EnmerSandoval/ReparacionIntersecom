<?php
/**
 * =====================================================
 * CONFIGURACIÓN DE BASE DE DATOS - INTERSECOM
 * =====================================================
 * Archivo de ejemplo para configuración
 *
 * INSTRUCCIONES:
 * 1. Copiar este archivo como "config.php"
 * 2. Modificar las constantes con tus credenciales
 * 3. NO subir config.php a repositorios públicos
 */

// Configuración de errores (Cambiar a 0 en producción)
ini_set('display_errors', 1);
error_reporting(E_ALL);

// =====================================================
// CONSTANTES DE CONEXIÓN
// =====================================================
define('DB_HOST', 'localhost');              // Host de MySQL
define('DB_NAME', 'taller_intersecom');      // Nombre de la base de datos
define('DB_USER', 'root');                   // Usuario de MySQL
define('DB_PASS', '');                       // Contraseña de MySQL
define('DB_CHARSET', 'utf8mb4');

// =====================================================
// CONFIGURACIÓN DE ZONA HORARIA
// =====================================================
date_default_timezone_set('America/Guatemala'); // San Marcos, Guatemala

// =====================================================
// CLASE DE CONEXIÓN A BASE DE DATOS
// =====================================================
class Database {
    private static $instance = null;
    private $connection;

    /**
     * Constructor privado para implementar Singleton
     */
    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;

            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
            ];

            $this->connection = new PDO($dsn, DB_USER, DB_PASS, $options);

        } catch (PDOException $e) {
            error_log("Error de conexión: " . $e->getMessage());
            die(json_encode([
                'success' => false,
                'message' => 'Error de conexión a la base de datos',
                'error' => $e->getMessage()
            ]));
        }
    }

    /**
     * Obtener instancia única de la conexión (Singleton)
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Obtener la conexión PDO
     */
    public function getConnection() {
        return $this->connection;
    }

    /**
     * Prevenir clonación del objeto
     */
    private function __clone() {}

    /**
     * Prevenir deserialización del objeto
     */
    public function __wakeup() {
        throw new Exception("No se puede deserializar un singleton.");
    }
}

/**
 * Función helper para obtener la conexión
 */
function getDB() {
    return Database::getInstance()->getConnection();
}

/**
 * Función para responder en formato JSON
 */
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

/**
 * Función para validar campos requeridos
 */
function validateRequired($data, $requiredFields) {
    $missing = [];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || trim($data[$field]) === '') {
            $missing[] = $field;
        }
    }
    return $missing;
}

/**
 * Función para sanitizar input
 */
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}
