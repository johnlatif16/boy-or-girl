const express = require('express');
const admin = require('firebase-admin');
const path = require('path');

const app = express();
app.use(express.json());

// تهيئة Firebase
let db;
try {
    let firebaseConfig;
    if (process.env.FIREBASE_CONFIG) {
        firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
        firebaseConfig.private_key = firebaseConfig.private_key.replace(/\\n/g, '\n');

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(firebaseConfig),
                databaseURL: `https://${firebaseConfig.project_id}-default-rtdb.firebaseio.com`
            });
        }

        db = admin.database();
        console.log('✅ Firebase initialized');
    } else {
        console.log('⚠️ FIREBASE_CONFIG not found, running without database');
    }
} catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
}

// دوال مساعدة
async function readData() {
    try {
        if (!db) {
            return {
                currentGender: null,
                lastUpdated: null,
                showResult: false
            };
        }

        const snapshot = await db.ref('gameData').once('value');
        return snapshot.val() || {
            currentGender: null,
            lastUpdated: null,
            showResult: false
        };

    } catch (error) {
        console.error('readData error:', error);
        return {
            currentGender: null,
            lastUpdated: null,
            showResult: false
        };
    }
}

async function writeData(data) {
    try {
        if (!db) return false;
        await db.ref('gameData').set(data);
        return true;
    } catch (error) {
        console.error('writeData error:', error);
        return false;
    }
}

console.log("Server started");
console.log("Firebase exists:", !!db);

// API Routes
app.get('/api/result', async (req, res) => {
    const data = await readData();
    res.json(data);
});

app.post('/api/set-result', async (req, res) => {
    const { gender } = req.body;
    if (!gender || (gender !== 'Boy' && gender !== 'Girl')) {
        return res.status(400).json({ error: 'Invalid gender' });
    }
    const data = await readData();
    data.currentGender = gender;
    data.lastUpdated = Date.now();
    data.showResult = true;
    if (await writeData(data)) {
        res.json({ success: true, gender: gender });
    } else {
        res.status(500).json({ error: 'Failed to save to database' });
    }
});

app.post('/api/reset', async (req, res) => {
    const data = { currentGender: null, lastUpdated: null, showResult: false };
    if (await writeData(data)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to reset' });
    }
});

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'dashboard.html'));
});

module.exports = app;
