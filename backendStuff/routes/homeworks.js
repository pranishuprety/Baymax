// routes/homeworks.js
const express = require('express');
const router = express.Router();
const { connectDB } = require('../lib/db');

// POST /api/homeworks
router.post('/', async (req, res) => {
  try {
    const { clientId, assignedBy, title, description, dueDate } = req.body;

    if (!clientId || !assignedBy || !title || !dueDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = await connectDB();

    const result = await db.collection('homeworks').insertOne({
      clientId,
      assignedBy,
      title,
      description,
      dueDate: new Date(dueDate),
      completed: false,
      createdAt: new Date()
    });

    res.status(201).json({ message: 'Homework assigned', id: result.insertedId });
  } catch (error) {
    console.error('Error assigning homework:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/homeworks/:clientId
router.get('/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;

    const db = await connectDB();
    const homeworks = await db.collection('homeworks')
      .find({ clientId })
      .sort({ dueDate: 1 })
      .toArray();

    res.json({ homeworks });
  } catch (error) {
    console.error('Error fetching homework:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
