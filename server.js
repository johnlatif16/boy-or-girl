const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const DATA_FILE = path.join(__dirname, 'data.json');

function initDataFile() {
    if (!fs.existsSync(DATA_FILE)) {
        const initialData = {
            currentGender: null,  // الجنس الحقيقي المختار من الداشبورد
            lastUpdated: null,
            showResult: false
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
        console.log('✅ تم إنشاء data.json');
    }
}

function readData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data:', error);
        return { currentGender: null, lastUpdated: null, showResult: false };
    }
}

function writeData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing data:', error);
        return false;
    }
}

// API: جلب النتيجة الحالية
app.get('/api/result', (req, res) => {
    const data = readData();
    res.json({
        gender: data.currentGender,
        showResult: data.showResult,
        lastUpdated: data.lastUpdated
    });
});

// API: تحديث الجنس من الداشبورد (هذا هو الجواب النهائي)
app.post('/api/set-result', (req, res) => {
    const { gender } = req.body;
    
    if (!gender || (gender !== 'Boy' && gender !== 'Girl')) {
        return res.status(400).json({ error: 'Invalid gender' });
    }
    
    const data = readData();
    data.currentGender = gender;
    data.lastUpdated = Date.now();
    data.showResult = true;  // يظهر النتيجة فوراً للجميع
    
    if (writeData(data)) {
        res.json({ success: true, gender: gender });
    } else {
        res.status(500).json({ error: 'Failed to set result' });
    }
});

// API: إعادة تعيين (لبدء لعبة جديدة)
app.post('/api/reset', (req, res) => {
    const data = {
        currentGender: null,
        lastUpdated: null,
        showResult: false
    };
    
    if (writeData(data)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to reset' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

initDataFile();
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
});