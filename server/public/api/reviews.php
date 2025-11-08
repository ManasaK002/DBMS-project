<?php
require_once __DIR__ . '/../../src/db.php';
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST') {
    // expected: user_id, event_id or show_id, rating, review_text
    $user_id = $input['user_id'] ?? null;
    $rating = intval($input['rating'] ?? 0);
    if (!$user_id || ($input['event_id'] ?? null) === null || $rating < 1 || $rating > 5) {
        http_response_code(400);
        echo json_encode(['error'=>'Invalid input']);
        exit;
    }

    $event_id = $input['event_id'] ?? null;
    $show_id = $input['show_id'] ?? null;
    $stmt = $pdo->prepare("INSERT INTO reviews (user_id, event_id, show_id, rating, review_text, review_date, review_time) VALUES (?,?,?,?,?, ?, ?)");
    $date = date('Y-m-d'); $time = date('H:i:s');
    $stmt->execute([$user_id, $event_id, $show_id, $rating, $input['review_text'] ?? null, $date, $time]);
    echo json_encode(['success'=>true, 'review_id' => $pdo->lastInsertId()]);
    exit;
}

if ($method === 'GET') {
    if (isset($_GET['event_id'])) {
        $stmt = $pdo->prepare("SELECT r.*, u.first_name, u.last_name FROM reviews r JOIN users u ON u.user_id = r.user_id WHERE r.event_id = ? ORDER BY r.review_date DESC");
        $stmt->execute([$_GET['event_id']]);
        echo json_encode($stmt->fetchAll());
        exit;
    }
}
http_response_code(405);
