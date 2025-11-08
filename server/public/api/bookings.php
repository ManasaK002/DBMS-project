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
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST') {
    // Expected fields: user_id, show_id, seats: [seat_id,...], payment_method, total_amount
    $user_id = $input['user_id'] ?? null;
    $show_id = $input['show_id'] ?? null;
    $seats = $input['seats'] ?? [];
    $total_amount = $input['total_amount'] ?? 0.00;
    if (!$user_id || !$show_id || !is_array($seats) || count($seats) === 0) {
        http_response_code(400);
        echo json_encode(['error'=>'Missing required fields']);
        exit;
    }

    try {
        // Start transaction
        $pdo->beginTransaction();

        // For each seat ensure it's still available for this show (i.e. no ticket exists for seat+show)
        $placeholders = implode(',', array_fill(0, count($seats), '?'));
        $checkSql = "
          SELECT t.ticket_id, t.seat_id FROM tickets t
          JOIN bookings b ON b.booking_id = t.booking_id
          WHERE b.show_id = ? AND t.seat_id IN ($placeholders) AND b.booking_status IN ('reserved','confirmed')
        ";
        $params = array_merge([$show_id], $seats);
        $stmt = $pdo->prepare($checkSql);
        $stmt->execute($params);
        $taken = $stmt->fetchAll();
        if (count($taken) > 0) {
            $pdo->rollBack();
            http_response_code(409);
            echo json_encode(['error'=>'Some seats already booked', 'taken' => $taken]);
            exit;
        }

        // Create booking
        $stmt = $pdo->prepare("INSERT INTO bookings (user_id, show_id, booking_date, booking_time, total_amount, number_of_tickets, booking_status) VALUES (?, ?, ?, ?, ?, ?, 'reserved')");
        $today = date('Y-m-d');
        $now = date('H:i:s');
        $stmt->execute([$user_id, $show_id, $today, $now, $total_amount, count($seats)]);
        $booking_id = $pdo->lastInsertId();

        // Insert tickets
        $ticketStmt = $pdo->prepare("INSERT INTO tickets (booking_id, seat_id, ticket_type, ticket_price, ticket_status, qr_code) VALUES (?, ?, ?, ?, 'issued', ?)");
        foreach ($seats as $seat_id) {
            // qrcode placeholder
            $qr = 'QR-' . bin2hex(random_bytes(6));
            // price per seat simple split or could be per-seat price passed
            $price = round($total_amount / count($seats), 2);
            $ticketStmt->execute([$booking_id, $seat_id, 'standard', $price, $qr]);
        }

        // Optionally: Mark booking confirmed only after payment; here we keep 'reserved' until payment
        $pdo->commit();
        echo json_encode(['success'=>true, 'booking_id'=>$booking_id]);
        exit;
    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error'=>'Booking failed', 'message'=>$e->getMessage()]);
        exit;
    }
}

http_response_code(405);
