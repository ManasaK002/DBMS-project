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
    // list shows for movie_id
    if (isset($_GET['movie_id'])) {
        $stmt = $pdo->prepare("SELECT s.*, v.venue_name, sc.screen_name FROM shows s
                              JOIN venues v ON s.venue_id=v.venue_id
                              JOIN screens sc ON s.screen_id=sc.screen_id
                              WHERE s.movie_id = ? AND s.status='scheduled'
                              ORDER BY s.show_date, s.show_time");
        $stmt->execute([$_GET['movie_id']]);
        echo json_encode($stmt->fetchAll());
        exit;
    }

    // get seats availability for show (requires show_id) -> returns seats with reservation status by checking tickets/bookings
    if (isset($_GET['show_id'])) {
        $show_id = intval($_GET['show_id']);
        // find the screen for this show
        $stmt = $pdo->prepare("SELECT screen_id FROM movies WHERE movie_id = ?");
        $stmt->execute([$show_id]);
        $show = $stmt->fetch();
        if (!$show) { http_response_code(404); echo json_encode(['error'=>'show not found']); exit; }
        $screen_id = $show['screen_id'];

        // get seats and mark reserved if present in tickets for bookings with reserved/confirmed status
        $q = "
          SELECT se.seat_id, se.row_number, se.seat_number, se.seat_type,
            IF(t.ticket_id IS NULL,'available','reserved') AS availability
          FROM seats se
          LEFT JOIN tickets t ON t.seat_id = se.seat_id
          LEFT JOIN bookings b ON b.booking_id = t.booking_id AND b.show_id = ?
          WHERE se.screen_id = ?
        ";
        $stmt = $pdo->prepare($q);
        $stmt->execute([$show_id, $screen_id]);
        echo json_encode($stmt->fetchAll());
        exit;
    }
}

http_response_code(405);
