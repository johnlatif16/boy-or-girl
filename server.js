const express = require('express');
const path = require('path');
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Firebase Admin
const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: firebaseConfig.projectId,
    clientEmail: `firebase-adminsdk-${firebaseConfig.projectId}@${firebaseConfig.projectId}.iam.gserviceaccount.com`,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
  databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
});

const db = admin.firestore();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API to save gender choice
app.post('/api/choice', async (req, res) => {
  const { gender } = req.body;
  try {
    await db.collection('babyChoice').doc('current').set({
      gender,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API to get current choice
app.get('/api/choice', async (req, res) => {
  try {
    const doc = await db.collection('babyChoice').doc('current').get();
    if (doc.exists) {
      res.json({ gender: doc.data().gender });
    } else {
      res.json({ gender: null });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
