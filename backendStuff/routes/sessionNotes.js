const express = require('express');
const router = express.Router();
const { connectDB } = require('../lib/db');

// POST /api/sessionNotes
router.post('/', async (req, res) => {
  try {
    const {
      clientId,
      therapistId,
      noteType,
      subjective,
      objective,
      assessment,
      plan,
      homeworkAssigned
    } = req.body;

    if (!clientId || !therapistId || !noteType) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const db = await connectDB();
    const result = await db.collection('sessionNotes').insertOne({
      clientId,
      therapistId,
      noteType,
      subjective,
      objective,
      assessment,
      plan,
      homeworkAssigned,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json({ message: "Session note created", id: result.insertedId });
  } catch (error) {
    console.error('Error creating session note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/sessionNotes/:clientId
router.get('/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;

    const db = await connectDB();
    const notes = await db.collection('sessionNotes')
      .find({ clientId })
      .sort({ createdAt: 1 })
      .toArray();

    res.json({ notes });
  } catch (error) {
    console.error('Error fetching session notes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
