const express = require('express');
const cors = require('cors');
require('dotenv').config();
const diagnosticMiddleware = require('./src/middlewares/diagnostiMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

// Simplified CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(diagnosticMiddleware);

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the backend!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});