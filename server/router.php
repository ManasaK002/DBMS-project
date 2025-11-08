<?php

//$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Full path to the requested file
//$file = __DIR__ . '/public' . $uri;

// If the file exists directly (like a .css or .js), serve it normally
/* if ($uri !== '/' && file_exists($file)) {
    return false; 
} */

// If it’s an API call like /api/auth, automatically map to auth.php
/* if (preg_match('#^/api/([a-zA-Z0-9_-]+)$#', $uri, $matches)) {
    $apiFile = __DIR__ . '/public/api/' . $matches[1] . '.php';
    if (file_exists($apiFile)) {
        require $apiFile;
        exit();
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'API endpoint not found']);
        exit();
    }
}

require_once __DIR__ . '/public/index.php'; */

// router.php
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if (preg_match('/^\/api\/auth/', $uri)) {
    require __DIR__ . '/public/api/auth.php';
} elseif (preg_match('/^\/api\/movies/', $uri)) {
    require __DIR__ . '/public/api/movies.php';
} elseif (preg_match('/^\/api\/bookings/', $uri)) {
    require __DIR__ . '/public/api/bookings.php';
} elseif (preg_match('/^\/api\/seats/', $uri)) {
    require __DIR__ . '/public/api/seats.php';
} else {
    return false; // fallback to static files if needed
}

