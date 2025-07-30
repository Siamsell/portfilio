const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'portf'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to database.');
});

// Create comments table if it doesn't exist
db.query(`
    CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        text TEXT NOT NULL,
        date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`, (err) => {
    if (err) console.error('Error creating table:', err);
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
// Get all comments
app.get('/api/comments', (req, res) => {
    db.query('SELECT * FROM comments ORDER BY date DESC', (err, results) => {
        if (err) {
            console.error('Error fetching comments:', err);
            return res.status(500).json({ error: 'Failed to fetch comments' });
        }
        res.json(results);
    });
});

// Add new comment
app.post('/api/comments', (req, res) => {
    const { name, text } = req.body;
    
    if (!name || !text) {
        return res.status(400).json({ error: 'Name and text are required' });
    }
    
    db.query(
        'INSERT INTO comments (name, text) VALUES (?, ?)',
        [name, text],
        (err, results) => {
            if (err) {
                console.error('Error adding comment:', err);
                return res.status(500).json({ error: 'Failed to add comment' });
            }
            
            // Return the newly created comment
            db.query(
                'SELECT * FROM comments WHERE id = ?',
                [results.insertId],
                (err, newComment) => {
                    if (err || !newComment.length) {
                        return res.status(500).json({ error: 'Failed to retrieve new comment' });
                    }
                    res.status(201).json(newComment[0]);
                }
            );
        }
    );
});

// Contact form submission
app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;
    
    // Here you would typically save to database or send an email
    console.log('Contact form submission:', { name, email, subject, message });
    
    // Simulate processing delay
    setTimeout(() => {
        res.json({ success: true, message: 'Thank you for your message! I will get back to you soon.' });
    }, 1500);
});

// Serve the HTML file for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});