<?php
/**
 * Configuración de Base de Datos - INTERSECOM
 * Archivo de conexión usando PDO
 */

// Configuración de la base de datos
define('DB_HOST', 'localhost');
define('DB_NAME', 'intersecom_db');
define('DB_USER', 'root'); // Cambiar por tu usuario
define('DB_PASS', '');     // Cambiar por tu contraseña

// Configuración de zona horaria
date_default_timezone_set('America/Guatemala');

// Configuración de errores (desactivar en producción)
error_reporting(E_ALL);
ini_set('display_errors', 1);

/**
 * Clase Database - Singleton para conexión PDO
 */
class Database {
    private static $instance = null;
    private $conn;

    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";

            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ];

            $this->conn = new PDO($dsn, DB_USER, DB_PASS, $options);

        } catch(PDOException $e) {
            die(json_encode([
                'success' => false,
                'error' => 'Error de conexión: ' . $e->getMessage()
            ]));
        }
    }

    /**
     * Obtener instancia única de la base de datos
     */
    public static function getInstance() {
        if (self::$instance == null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    /**
     * Obtener conexión PDO
     */
    public function getConnection() {
        return $this->conn;
    }

    /**
     * Prevenir clonación del objeto
     */
    private function __clone() {}

    /**
     * Prevenir deserialización del objeto
     */
    public function __wakeup() {
        throw new Exception("No se puede deserializar un singleton");
    }
}

/**
 * Función helper para obtener conexión rápidamente
 */
function getDB() {
    return Database::getInstance()->getConnection();
}

/**
 * Función para enviar respuesta JSON
 */
function sendJSON($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Función para manejar errores
 */
function handleError($message, $statusCode = 400) {
    sendJSON([
        'success' => false,
        'error' => $message
    ], $statusCode);
}

/**
 * Función para validar campos requeridos
 */
function validateRequired($data, $fields) {
    $missing = [];
    foreach ($fields as $field) {
        if (!isset($data[$field]) || trim($data[$field]) === '') {
            $missing[] = $field;
        }
    }
    return $missing;
}
