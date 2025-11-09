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

$user_id = $input['user_id'] ?? ($input['userId'] ?? null);
$show_id = $input['show_id'] ?? ($input['showId'] ?? null);
$seats = $input['seats'] ?? ($input['seatIds'] ?? []);
$total_amount = $input['total_amount'] ?? ($input['totalAmount'] ?? 0.00);


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

        // 🧾 Create booking (anonymous user for now)
        $stmt = $pdo->prepare("
            INSERT INTO bookings (show_id, booking_status, booking_time, total_amount) 
            VALUES (?, 'pending', NOW(), 0)
        ");
        $stmt->execute([$show_id]);
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
    // 📜 List all bookings (for now, all users)
    $stmt = $pdo->query("
        SELECT 
            b.booking_id AS id,
            b.booking_time,
            b.total_amount,
            b.booking_status AS status,
            m.title AS movie_title,
            m.poster_url,
            s.show_date,
            s.show_time,
            v.venue_name AS theater_name,
            v.address,
            sc.screen_name
        FROM bookings b
        JOIN shows s ON b.show_id = s.show_id
        JOIN movies m ON s.movie_id = m.movie_id
        JOIN venues v ON s.venue_id = v.venue_id
        JOIN screens sc ON s.screen_id = sc.screen_id
        ORDER BY b.booking_time DESC
    ");
    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Add seats for each booking
    foreach ($bookings as &$booking) {
        $seatStmt = $pdo->prepare("
            SELECT CONCAT(row_number, seat_number) AS seat_label
            FROM tickets t
            JOIN seats se ON t.seat_id = se.seat_id
            WHERE t.booking_id = ?
        ");
        $seatStmt->execute([$booking['id']]);
        $booking['seats'] = array_column($seatStmt->fetchAll(PDO::FETCH_ASSOC), 'seat_label');
    }

    echo json_encode(['bookings' => $bookings]);
    
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
