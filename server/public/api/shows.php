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
    // GET show by ID (for seat selection)
if (isset($_GET['show_id'])) {
    $show_id = intval($_GET['show_id']);

    $stmt = $pdo->prepare("SELECT s.show_id, s.show_date, s.show_time, s.status,
                                  m.title AS movie_title, v.venue_name AS theater_name,
                                  sc.screen_name, sc.screen_type
                           FROM shows s
                           JOIN movies m ON s.movie_id = m.movie_id
                           JOIN venues v ON s.venue_id = v.venue_id
                           JOIN screens sc ON s.screen_id = sc.screen_id
                           WHERE s.show_id = ?");
    $stmt->execute([$show_id]);
    $show = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$show) {
        http_response_code(404);
        echo json_encode(['error' => 'Show not found']);
        exit;
    }

    // Get all seats for this show’s screen
    $seatQuery = "
        SELECT se.seat_id AS id, se.row_number AS row_name, se.seat_number,
               se.seat_type,
               IF(t.ticket_id IS NULL, 0, 1) AS is_booked
        FROM seats se
        LEFT JOIN tickets t ON t.seat_id = se.seat_id
        LEFT JOIN bookings b ON b.booking_id = t.booking_id AND b.show_id = ?
        WHERE se.screen_id = ?
    ";
    $screenIdStmt = $pdo->prepare("SELECT screen_id FROM shows WHERE show_id = ?");
    $screenIdStmt->execute([$show_id]);
    $screenRow = $screenIdStmt->fetch();
    $screen_id = $screenRow['screen_id'];

    $seatStmt = $pdo->prepare($seatQuery);
    $seatStmt->execute([$show_id, $screen_id]);
    $seats = $seatStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'show' => [
            'id' => $show['show_id'],
            'movie_title' => $show['movie_title'],
            'theater_name' => $show['theater_name'],
            'screen_name' => $show['screen_name'],
            'screen_type' => $show['screen_type'],
            'price' => 250, // static for now
            'show_date' => $show['show_date'],
            'show_time' => $show['show_time']
        ],
        'seats' => $seats
    ]);
    exit;
}
}

http_response_code(405);
