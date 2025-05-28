<?php
header('Content-Type: application/json');
session_start();
require_once('db.php');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'User not authenticated']);
    exit;
}

$user_id = $_SESSION['user_id'];
$action = $_POST['action'] ?? '';
$title = $_POST['title'] ?? '';
$year = $_POST['year'] ?? '';

if (!$action) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing action parameter']);
    exit;
}

switch ($action) {
    case 'add':
        if (!$title || !$year) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing title or year']);
            exit;
        }
        $stmt = $conn->prepare("INSERT INTO watchlist (user_id, title, year) VALUES (?, ?, ?)");
        $stmt->bind_param("iss", $user_id, $title, $year);
        break;

    case 'remove':
        if (!$title) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing title']);
            exit;
        }
        $stmt = $conn->prepare("DELETE FROM watchlist WHERE user_id = ? AND title = ?");
        $stmt->bind_param("is", $user_id, $title);
        break;

    case 'get':
        $stmt = $conn->prepare("SELECT title FROM watchlist WHERE user_id = ? AND status = 'active'");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $watchlist = [];
        while ($row = $result->fetch_assoc()) {
            $watchlist[] = $row['title'];
        }
        echo json_encode(['watchlist' => $watchlist]);
        exit;

    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
        exit;
}

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    if ($conn->errno == 1062) { // Duplicate entry
        echo json_encode(['success' => true, 'message' => 'Movie already in watchlist']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $conn->error]);
    }
}

$stmt->close();
$conn->close();
?>