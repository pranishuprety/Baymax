// routes/sessionHistories.js
const express = require('express');
const router = express.Router();
const { connectDB } = require('../lib/db');

// POST /api/sessionHistories
router.post('/', async (req, res) => {
  try {
    const { clientId, sessionSummary } = req.body;

    if (!clientId || !sessionSummary) {
      return res.status(400).json({ error: 'Missing clientId or sessionSummary' });
    }

    const db = await connectDB();

    // Check if client already has a session history
    const existing = await db.collection('sessionHistories').findOne({ clientId });

    if (existing) {
      // Update: push new summary to sessions array
      await db.collection('sessionHistories').updateOne(
        { clientId },
        { $push: { sessions: { ...sessionSummary, createdAt: new Date() } } }
      );
      res.status(200).json({ message: "Session history updated" });
    } else {
      // Insert: first entry
      await db.collection('sessionHistories').insertOne({
        clientId,
        sessions: [{ ...sessionSummary, createdAt: new Date() }]
      });
      res.status(201).json({ message: "Session history created" });
    }
  } catch (error) {
    console.error('Error saving session history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/sessionHistories/:clientId
router.get('/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;

    const db = await connectDB();
    const history = await db.collection('sessionHistories').findOne({ clientId });

    if (!history) {
      return res.status(404).json({ error: 'No session history found' });
    }

    res.json({ history });
  } catch (error) {
    console.error('Error fetching session history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
