const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { initializeEmailService } = require('./utils/emailService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize email service
initializeEmailService();

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notices', require('./routes/notices'));
app.use('/api/categories', require('./routes/categories'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    emailService: !!process.env.SMTP_HOST && !!process.env.SMTP_USER
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});