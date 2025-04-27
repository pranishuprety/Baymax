// routes/messages.js
const express = require('express');
const router = express.Router();
const { connectDB } = require('../lib/db');

// POST /api/messages
router.post('/', async (req, res) => {
  try {
    const { conversationId, senderId, text } = req.body;
    if (!conversationId || !senderId || !text) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    const db = await connectDB();
    const result = await db.collection('messages').insertOne({
      conversationId,
      senderId,
      text,
      timestamp: new Date(),
      read: false
    });
    res.status(201).json({ message: 'Message saved', id: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// GET /api/messages/:conversationId
router.get('/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const db = await connectDB();
    const messages = await db.collection('messages')
      .find({ conversationId })
      .sort({ timestamp: 1 })
      .toArray();
    res.json({ messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
