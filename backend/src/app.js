const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const searchRoutes = require('./routes/search');
const uploadRoutes = require('./routes/upload');
const imagesRoutes = require('./routes/images');
const authRoutes = require('./routes/auth');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:", "*"], // Allow all image sources
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "*"] // Allow all connections
    }
  },
  crossOriginResourcePolicy: false // Disable CORP to allow cross-origin images
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting - more lenient for uploads
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased limit for better UX
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware with larger limits for image uploads
// Skip JSON parsing for upload routes (they use multipart/form-data)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/upload')) {
    return next();
  }
  express.json({ 
    limit: '50mb',
    verify: (req, res, buf) => {
      try {
        JSON.parse(buf);
      } catch (e) {
        // Don't send response here, just throw error for middleware to handle
        throw new Error('Invalid JSON');
      }
    }
  })(req, res, next);
});
app.use(express.urlencoded({ 
  extended: true, 
  limit: '50mb',
  parameterLimit: 10000
}));

// Static files for uploaded images
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/search', searchRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', authenticateToken, uploadRoutes);
app.use('/api/images', authenticateToken, imagesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  // Check if headers have already been sent
  if (res.headersSent) {
    return next(err);
  }
  
  // Handle specific error types
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ 
      error: 'Payload too large',
      message: 'The request payload is too large. Please reduce the file size or number of files.'
    });
  }
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ 
      error: 'Invalid JSON',
      message: 'The request body contains invalid JSON.'
    });
  }
  
  if (err.message === 'Invalid JSON') {
    return res.status(400).json({ 
      error: 'Invalid JSON payload',
      message: 'The request body contains invalid JSON data.'
    });
  }
  
  // Default error response
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚗 Backend server running on port ${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
});
