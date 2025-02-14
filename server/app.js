const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const diagnosticMiddleware = require('./src/middlewares/diagnostiMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const competenceRoutes = require('./src/routes/competenceRoutes');

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads/profiles');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Simplified CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(diagnosticMiddleware);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add a test endpoint to check image paths
app.get('/test-image/:filename', (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, 'uploads/profiles', filename);
  console.log('Testing image path:', imagePath);
  console.log('File exists:', fs.existsSync(imagePath));
  res.json({ 
    exists: fs.existsSync(imagePath),
    path: imagePath
  });
});

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', competenceRoutes);
app.use('/profile', profileRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the backend!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});