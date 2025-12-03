<?php
/**
 * Archivo de prueba para verificar que WAMP y la base de datos funcionan correctamente
 * Acceder a: http://localhost/taller/backend/test.php
 */

echo "<h1>🔧 Test de Configuración INTERSECOM</h1>";
echo "<hr>";

// 1. Verificar PHP
echo "<h2>1. ✅ PHP Funcionando</h2>";
echo "Versión de PHP: " . phpversion() . "<br>";
echo "Fecha actual: " . date('Y-m-d H:i:s') . "<br>";
echo "<hr>";

// 2. Verificar archivo config.php
echo "<h2>2. Verificar config.php</h2>";
if (file_exists('config.php')) {
    echo "✅ config.php existe<br>";
    require_once 'config.php';
} else {
    echo "❌ config.php NO existe<br>";
    die("Por favor crea el archivo config.php");
}
echo "<hr>";

// 3. Probar conexión a base de datos
echo "<h2>3. Probar Conexión a Base de Datos</h2>";
try {
    $db = getDB();
    echo "✅ Conexión a base de datos exitosa!<br>";
    echo "Base de datos: " . DB_NAME . "<br>";
    echo "Host: " . DB_HOST . "<br>";
    echo "Usuario: " . DB_USER . "<br>";
} catch (Exception $e) {
    echo "❌ Error de conexión: " . $e->getMessage() . "<br>";
    echo "<br><strong>Posibles soluciones:</strong><br>";
    echo "1. Verifica que WAMP esté corriendo (icono verde)<br>";
    echo "2. Verifica las credenciales en config.php<br>";
    echo "3. Verifica que la base de datos 'intersecom_db' exista en phpMyAdmin<br>";
    die();
}
echo "<hr>";

// 4. Verificar tablas
echo "<h2>4. Verificar Tablas de la Base de Datos</h2>";
try {
    $tablas = [
        'sucursales',
        'clientes',
        'ordenes',
        'repuestos_utilizados',
        'traslados',
        'historial_estados'
    ];

    foreach ($tablas as $tabla) {
        $stmt = $db->query("SHOW TABLES LIKE '$tabla'");
        if ($stmt->rowCount() > 0) {
            // Contar registros
            $count = $db->query("SELECT COUNT(*) as total FROM $tabla")->fetch();
            echo "✅ Tabla '$tabla' existe ({$count['total']} registros)<br>";
        } else {
            echo "❌ Tabla '$tabla' NO existe<br>";
        }
    }
} catch (Exception $e) {
    echo "❌ Error al verificar tablas: " . $e->getMessage() . "<br>";
    echo "<br><strong>Solución:</strong> Importa el archivo database.sql en phpMyAdmin<br>";
}
echo "<hr>";

// 5. Probar API
echo "<h2>5. Probar API REST</h2>";
echo "URL de la API: <a href='api.php/sucursales' target='_blank'>api.php/sucursales</a><br>";
echo "Si ves un JSON, la API está funcionando correctamente.<br>";
echo "<hr>";

// 6. CORS Headers
echo "<h2>6. Verificar Headers CORS</h2>";
if (function_exists('apache_response_headers')) {
    $headers = apache_response_headers();
    if (isset($headers['Access-Control-Allow-Origin'])) {
        echo "✅ CORS configurado correctamente<br>";
    } else {
        echo "⚠️ CORS podría no estar configurado (pero puede funcionar igual)<br>";
    }
} else {
    echo "ℹ️ No se puede verificar CORS en este entorno<br>";
}
echo "<hr>";

// Resumen
echo "<h2>🎉 Resumen</h2>";
echo "<p><strong>Si todo tiene ✅, tu backend está listo!</strong></p>";
echo "<p>Próximos pasos:</p>";
echo "<ol>";
echo "<li>Verifica que el frontend esté configurado: <code>frontend/src/App.jsx</code> línea 16</li>";
echo "<li>Instala dependencias del frontend: <code>npm install</code></li>";
echo "<li>Inicia el frontend: <code>npm run dev</code></li>";
echo "<li>Abre el navegador en: <a href='http://localhost:3000' target='_blank'>http://localhost:3000</a></li>";
echo "</ol>";

echo "<hr>";
echo "<p><small>Archivo: " . __FILE__ . "</small></p>";
?>

<style>
    body {
        font-family: Arial, sans-serif;
        max-width: 800px;
        margin: 50px auto;
        padding: 20px;
        background: #f5f5f5;
    }
    h1 { color: #333; }
    h2 {
        color: #555;
        background: #e0e0e0;
        padding: 10px;
        border-radius: 5px;
    }
    hr { margin: 20px 0; }
    code {
        background: #fff;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
    }
</style>
