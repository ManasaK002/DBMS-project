<?php
// --- CORS setup ---
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// --- Handle preflight (OPTIONS) requests ---
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../src/db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['id'])) {
        $stmt = $pdo->prepare("SELECT * FROM movies WHERE movie_id = ?");
        $stmt->execute([$_GET['id']]);
        $ev = $stmt->fetch();
        if ($ev) echo json_encode($ev);
        else { http_response_code(404); echo json_encode(['error'=>'not found']); }
    } else {
        $stmt = $pdo->query("SELECT * FROM movies ORDER BY release_date DESC");
        $rows = $stmt->fetchAll();
        echo json_encode($rows);
    }
    exit;
}
http_response_code(405);
