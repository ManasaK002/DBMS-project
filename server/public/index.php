<?php

// public/index.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Basic router using path
$path = $_SERVER['REQUEST_URI'];
// Remove query string
$path = explode('?', $path, 2)[0];
$segments = explode('/', trim($path, '/'));

if (isset($segments[1]) && $segments[1] === 'api' && isset($segments[2])) {
    $file = __DIR__ . '/api/' . $segments[2] . '.php';
    if (file_exists($file)) {
        require $file;
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
    }
} else {
    echo json_encode(['message' => 'Booking API root. Use /api/{events,shows,auth,bookings,payments,reviews}']);
}
