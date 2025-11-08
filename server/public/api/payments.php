<?php
require_once __DIR__ . '/../../src/db.php';
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST') {
    // expected: booking_id, user_id, payment_amount, payment_method, transaction_id (optional)
    $booking_id = $input['booking_id'] ?? null;
    $user_id = $input['user_id'] ?? null;
    $amount = $input['payment_amount'] ?? 0.0;
    $pm = $input['payment_method'] ?? 'card';
    $transaction_id = $input['transaction_id'] ?? ('TXN-' . time());
    if (!$booking_id || !$user_id) { http_response_code(400); echo json_encode(['error'=>'Missing']); exit; }

    try {
        $pdo->beginTransaction();
        $stmt = $pdo->prepare("INSERT INTO payments (booking_id, user_id, payment_amount, payment_method, gateway_used, transaction_id, payment_date, payment_time, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'success')");
        $date = date('Y-m-d'); $time = date('H:i:s');
        $stmt->execute([$booking_id, $user_id, $amount, $pm, 'mock_gateway', $transaction_id, $date, $time]);

        // Update booking status to confirmed
        $u = $pdo->prepare("UPDATE bookings SET booking_status='confirmed' WHERE booking_id = ?");
        $u->execute([$booking_id]);

        $pdo->commit();
        echo json_encode(['success'=>true, 'transaction_id'=>$transaction_id]);
    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error'=>'Payment failed', 'message'=>$e->getMessage()]);
    }
    exit;
}

http_response_code(405);
