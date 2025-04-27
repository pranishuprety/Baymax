require('dotenv').config(); // Load environment variables from .env file
require('./backendStuff/db'); // Import database connection
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid'); // Correct position
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const app = express();
const PORT = 3001;
const SECRET_KEY = process.env.SECRET_KEY;



// Temporary in-memory "database"
let therapists = [];
let therapistNotes = {}; // Key: username -> Array of therapist notes
let therapistPatients = {}; // Key: username -> Array of patients
let patientNotes = {}; // Key: patientId -> Array of notes

app.use(cors());
app.use(bodyParser.json());

// Therapist signup
app.post('/therapist/signup', async (req, res) => {
    const { username, password } = req.body;

    const existingUser = therapists.find(t => t.username === username);
    if (existingUser) {
        return res.status(400).json({ message: 'Username already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    therapists.push({ username, password: hashedPassword });

    res.status(201).json({ message: 'Therapist registered successfully!' });
});

// Therapist login
app.post('/therapist/login', async (req, res) => {
    const { username, password } = req.body;

    const therapist = therapists.find(t => t.username === username);
    if (!therapist) {
        return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, therapist.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ username: therapist.username }, SECRET_KEY, { expiresIn: '2h' });
    res.json({ message: 'Login successful!', token });
});

// Therapist dashboard (secured)
app.get('/therapist/dashboard', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        res.json({ message: `Welcome, ${decoded.username}` });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Add therapist note
app.post('/therapist/addNote', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const { note } = req.body;

        if (!therapistNotes[decoded.username]) {
            therapistNotes[decoded.username] = [];
        }

        const newNote = {
            id: uuidv4(),
            text: note,
            createdAt: new Date().toISOString()
        };

        therapistNotes[decoded.username].push(newNote);

        res.json({ message: 'Note added successfully!', note: newNote });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Get all therapist notes
app.get('/therapist/notes', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const notes = therapistNotes[decoded.username] || [];
        res.json({ notes });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Update therapist note
app.put('/therapist/updateNote/:noteId', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const { noteId } = req.params;
        const { newText } = req.body;

        const notes = therapistNotes[decoded.username] || [];
        const note = notes.find(n => n.id === noteId);

        if (!note) return res.status(404).json({ message: 'Note not found.' });

        note.text = newText;
        res.json({ message: 'Note updated successfully!', updatedNote: note });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Delete therapist note
app.delete('/therapist/deleteNote/:noteId', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const { noteId } = req.params;

        let notes = therapistNotes[decoded.username] || [];
        const originalLength = notes.length;

        notes = notes.filter(n => n.id !== noteId);
        therapistNotes[decoded.username] = notes;

        if (notes.length === originalLength) {
            return res.status(404).json({ message: 'Note not found.' });
        }

        res.json({ message: 'Note deleted successfully!' });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Update therapist profile (password)
app.put('/therapist/updateProfile', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const { newPassword } = req.body;

        const therapist = therapists.find(t => t.username === decoded.username);
        if (!therapist) return res.status(404).json({ message: 'Therapist not found.' });

        therapist.password = await bcrypt.hash(newPassword, 10);
        res.json({ message: 'Password updated successfully!' });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Add patient
app.post('/therapist/addPatient', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const { patientName, patientAge, patientCondition } = req.body;

        if (!therapistPatients[decoded.username]) {
            therapistPatients[decoded.username] = [];
        }

        const newPatient = {
            id: uuidv4(),
            name: patientName,
            age: patientAge,
            condition: patientCondition,
            createdAt: new Date().toISOString()
        };

        therapistPatients[decoded.username].push(newPatient);

        res.json({ message: 'Patient added successfully!', patient: newPatient });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Get patients
app.get('/therapist/patients', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const patients = therapistPatients[decoded.username] || [];
        res.json({ patients });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Delete patient
app.delete('/therapist/deletePatient/:patientId', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const { patientId } = req.params;

        let patients = therapistPatients[decoded.username] || [];
        const originalLength = patients.length;

        patients = patients.filter(p => p.id !== patientId);
        therapistPatients[decoded.username] = patients;

        if (patients.length === originalLength) {
            return res.status(404).json({ message: 'Patient not found.' });
        }

        res.json({ message: 'Patient deleted successfully!' });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Add patient note
app.post('/therapist/addPatientNote/:patientId', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const { patientId } = req.params;
        const { noteContent } = req.body;

        if (!patientNotes[patientId]) {
            patientNotes[patientId] = [];
        }

        const newNote = {
            id: uuidv4(),
            content: noteContent,
            createdAt: new Date().toISOString()
        };

        patientNotes[patientId].push(newNote);

        res.json({ message: 'Patient note added successfully!', note: newNote });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Get patient notes
app.get('/therapist/patientNotes/:patientId', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const { patientId } = req.params;
        const notes = patientNotes[patientId] || [];
        res.json({ notes });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // save images in uploads folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  }
});

const upload = multer({ storage: storage });

app.post('/therapist/uploadProfilePhoto', upload.single('profilePhoto'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ message: 'Profile photo uploaded successfully!', filePath: req.file.path });
});


// ---------------------------------
// CLIENT SIDE APIs
// ---------------------------------

// In-memory database for clients
let clients = [];

const CLIENT_SECRET_KEY = process.env.CLIENT_SECRET_KEY || "client_default_secret"; // (Optional) separate secret key

// Client Signup
app.post('/client/signup', async (req, res) => {
  const { username, password } = req.body;

  const existingUser = clients.find(c => c.username === username);
  if (existingUser) {
    return res.status(400).json({ message: 'Username already exists.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  clients.push({ username, password: hashedPassword });

  res.status(201).json({ message: 'Client registered successfully!' });
});

// Client Login
app.post('/client/login', async (req, res) => {
  const { username, password } = req.body;

  const client = clients.find(c => c.username === username);
  if (!client) {
    return res.status(400).json({ message: 'Invalid credentials.' });
  }

  const isMatch = await bcrypt.compare(password, client.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials.' });
  }

  const token = jwt.sign({ username: client.username, role: 'client' }, CLIENT_SECRET_KEY, { expiresIn: '2h' });

  res.json({ message: 'Login successful!', token });
});

// Client Dashboard (Protected)
app.get('/client/dashboard', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, CLIENT_SECRET_KEY);
    if (decoded.role !== 'client') {
      return res.status(403).json({ message: 'Access denied.' });
    }
    res.json({ message: `Welcome Client, ${decoded.username}!` });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Client Reset Password
app.put('/client/resetPassword', async (req, res) => {
    try {
      const { username, newPassword } = req.body;
  
      const client = clients.find(c => c.username === username);
      if (!client) {
        return res.status(404).json({ message: 'Client not found.' });
      }
  
      client.password = await bcrypt.hash(newPassword, 10);
      res.json({ message: 'Password reset successfully!' });
    } catch (err) {
      console.error("Error resetting client password:", err);
      res.status(500).json({ message: 'Error resetting password.' });
    }
  });
  
  // Therapist Reset Password
  app.put('/therapist/resetPassword', async (req, res) => {
    try {
      const { username, newPassword } = req.body;
  
      const therapist = therapists.find(t => t.username === username);
      if (!therapist) {
        return res.status(404).json({ message: 'Therapist not found.' });
      }
  
      therapist.password = await bcrypt.hash(newPassword, 10);
      res.json({ message: 'Password reset successfully!' });
    } catch (err) {
      console.error("Error resetting therapist password:", err);
      res.status(500).json({ message: 'Error resetting password.' });
    }
  });

// New Route: Emotion Detection
app.post('/detectEmotion', async (req, res) => {
  const { imageBase64 } = req.body;

  try {
    const response = await fetch('https://api-us.faceplusplus.com/facepp/v3/detect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        api_key: process.env.FACEPLUSPLUS_API_KEY,
        api_secret: process.env.FACEPLUSPLUS_API_SECRET,
        image_base64: imageBase64,
        return_attributes: 'emotion'
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error detecting emotion:', error);
    res.status(500).send('Internal Server Error');
  }
});

  

  

// Finally start the server
app.listen(PORT, () => {
    console.log(`Therapist server running on http://localhost:${PORT}`);
});
