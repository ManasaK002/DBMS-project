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
        // Fetch a single movie by ID
        $stmt = $pdo->prepare("
            SELECT 
                movie_id AS id,
                title,
                description,
                duration,
                language,
                genre,
                rating,
                poster_url,
                release_date
            FROM movies
            WHERE movie_id = ?
        ");
        $stmt->execute([$_GET['id']]);
        $movie = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($movie) {
            echo json_encode($movie);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Movie not found']);
        }
    } else {
        // Fetch all movies
        $stmt = $pdo->query("
            SELECT 
                movie_id AS id,
                title,
                description,
                duration,
                language,
                genre,
                rating,
                poster_url,
                release_date
            FROM movies
            ORDER BY release_date DESC
        ");
        $movies = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($movies);
    }
    exit;
}

http_response_code(405);
