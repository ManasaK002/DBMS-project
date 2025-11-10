<?php
// --- CORS setup ---
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// --- Handle preflight (OPTIONS) requests ---
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../src/db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // ✅ Expected from frontend:
    // { "showId": 1, "seatIds": [3,4,5] }

    $input = json_decode(file_get_contents('php://input'), true);

    if (isset($input['user_id'])) {
    $user_id = intval($input['user_id']);
} else {
    $user_id = intval($input['userId'] ?? 0);
}

$today = date('Y-m-d');
$now = date('H:i:s');


$user_id = $input['user_id'] ?? ($input['userId'] ?? null);
$show_id = $input['show_id'] ?? ($input['showId'] ?? null);
$seats = $input['seats'] ?? ($input['seatIds'] ?? []);
$total_amount = $input['total_amount'] ?? ($input['totalAmount'] ?? 0.00);

error_log("DEBUG booking payload: user_id=$user_id, show_id=$show_id, total_amount=$total_amount, seats=" . json_encode($seats));

    if (!$show_id || empty($seats)) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing showId or seatIds']);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // 🔒 Ensure seats are not already booked for this show
        $placeholders = implode(',', array_fill(0, count($seats), '?'));
        $checkSql = "
            SELECT t.ticket_id, t.seat_id 
            FROM tickets t
            JOIN bookings b ON b.booking_id = t.booking_id
            WHERE b.show_id = ? 
            AND t.seat_id IN ($placeholders)
            AND b.booking_status IN ('reserved','confirmed')
        ";
        $params = array_merge([$show_id], $seats);
        $stmt = $pdo->prepare($checkSql);
        $stmt->execute($params);
        $taken = $stmt->fetchAll();

        if (count($taken) > 0) {
            $pdo->rollBack();
            http_response_code(409);
            echo json_encode(['error' => 'Some seats already booked', 'taken' => $taken]);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO bookings (user_id, show_id, booking_date, booking_time, total_amount, number_of_tickets, booking_status) VALUES (?, ?, ?, ?, ?, ?, 'confirmed')");
        $stmt->execute([$user_id, $show_id, $today, $now, $total_amount, count($seats)]);

        $booking_id = $pdo->lastInsertId();

        // 🎟️ Insert tickets
        $ticketStmt = $pdo->prepare("
            INSERT INTO tickets (booking_id, seat_id, ticket_status) VALUES (?, ?, 'issued')
        ");
        foreach ($seats as $seat_id) {
            $ticketStmt->execute([$booking_id, $seat_id]);
        }

        $pdo->commit();

        echo json_encode([
            'success' => true,
            'booking' => ['id' => $booking_id],
            'expiresIn' => 900 // 15 minutes
        ]);
        exit;
    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Booking failed', 'message' => $e->getMessage()]);
        exit;
    }
}

if ($method === 'DELETE') {
    // 🗑 Cancel a booking
    $url = $_SERVER['REQUEST_URI'];
    if (preg_match('/bookings\/(\d+)/', $url, $matches)) {
        $booking_id = intval($matches[1]);

        $stmt = $pdo->prepare("UPDATE bookings SET booking_status = 'cancelled' WHERE booking_id = ?");
        $stmt->execute([$booking_id]);

        
        echo json_encode(['success' => true, 'message' => 'Booking confirmed']);

        exit;
    }

    http_response_code(400);
    echo json_encode(['error' => 'Invalid booking ID']);
    exit;
}

if ($method === 'GET') {
    // Get user_id directly from query parameter (e.g. /api/bookings?user_id=1)
    $user_id = $_GET['user_id'] ?? null;

    if (!$user_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing user_id']);
        exit;
    }

    $stmt = $pdo->prepare("
        SELECT 
            b.booking_id AS id,
            b.booking_time,
            b.total_amount,
            b.booking_status AS status,
            s.show_date,
            s.show_time,
            v.venue_name AS theater_name,
            v.address,
            sc.screen_name,
            m.title AS movie_title,
            m.poster_url
        FROM bookings b
        JOIN shows s ON b.show_id = s.show_id
        JOIN venues v ON s.venue_id = v.venue_id
        JOIN screens sc ON s.screen_id = sc.screen_id
        JOIN movies m ON s.movie_id = m.movie_id
        WHERE b.user_id = ?
        ORDER BY b.booking_time DESC
    ");
    $stmt->execute([$user_id]);
    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['bookings' => $bookings]);
    exit;
}



http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
