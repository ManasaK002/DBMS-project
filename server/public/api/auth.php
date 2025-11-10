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

// public/api/auth.php
require_once __DIR__ . '/../../src/db.php';

// read json body
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST') {
    if (isset($input['action']) && $input['action'] === 'register') {
        // register
        $first = $input['first_name'] ?? '';
        $last  = $input['last_name'] ?? '';
        $email = $input['email'] ?? '';
        $password = $input['password'] ?? '';

        if (!$email || !$password || !$first) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing fields']);
            exit;
        }

        $hash = password_hash($password, PASSWORD_DEFAULT);
        try {
            $stmt = $pdo->prepare("INSERT INTO users (first_name,last_name,email,password_hash,phone_number,registration_status) VALUES (?,?,?,?,?, 'active')");
            $stmt->execute([$first,$last,$email,$hash, $input['phone_number'] ?? null]);
            
            echo json_encode(['success'=>true, 'user' => ['user_id'=>$user['user_id'],'first_name'=>$user['first_name'],'last_name'=>$user['last_name']]]);
            echo json_encode(['success' => true, 'user_id' => $pdo->lastInsertId()]);

        } catch (PDOException $e) {
            http_response_code(400);
            echo json_encode(['error' => 'Registration failed', 'detail' => $e->getMessage()]);
        }
        exit;
    } elseif (isset($input['action']) && $input['action'] === 'login') {
        $email = $input['email'] ?? '';
        $password = $input['password'] ?? '';
        if (!$email || !$password) { http_response_code(400); echo json_encode(['error'=>'Missing']); exit; }
        $stmt = $pdo->prepare("SELECT user_id, password_hash, first_name, last_name FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        if ($user && password_verify($password, $user['password_hash'])) {
            // NOTE: In production return a JWT or session cookie
            echo json_encode(['success'=>true, 'user' => ['user_id'=>$user['user_id'], 'first_name'=>$user['first_name'], 'last_name'=>$user['last_name']]]);
            
        } else {
            http_response_code(401);
            echo json_encode(['error'=>'Invalid credentials']);
        }
        exit;
    }
}

http_response_code(400);
echo json_encode(['error'=>'Unsupported auth action']);
