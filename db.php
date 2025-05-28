<?php
$conn = new mysqli("localhost", "root", "Lenovo1nur", "wfo");

if ($conn->connect_error) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}
?>