<?php
// api/get_config.php
require_once __DIR__ . '/../config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

echo json_encode([
    'admin_token' => ADMIN_TOKEN
]);
?>