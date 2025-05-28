<?php
require_once('db.php');

$sql = "CREATE TABLE IF NOT EXISTS watchlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    year VARCHAR(4) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_user_movie (user_id, title)
)";

if ($conn->query($sql) === TRUE) {
    echo "Watchlist table created successfully";
} else {
    echo "Error creating table: " . $conn->error;
}

$conn->close();
?>