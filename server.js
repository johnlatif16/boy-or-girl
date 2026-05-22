const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// API endpoint to get Firebase config
app.get('/api/config', (req, res) => {
    const firebaseConfig = process.env.FIREBASE_CONFIG;
    
    if (firebaseConfig) {
        try {
            const config = JSON.parse(firebaseConfig);
            res.json(config);
        } catch (error) {
            console.error('Error parsing FIREBASE_CONFIG:', error);
            res.json({});
        }
    } else {
        // Return empty config for demo mode
        res.json({});
    }
});

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve dashboard.html
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Dashboard available at http://localhost:${PORT}/dashboard`);
});
