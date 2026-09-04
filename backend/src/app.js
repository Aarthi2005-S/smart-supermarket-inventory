const express = require('express');
const cors = require('cors');

const productRoutes = require('./routes/productRoutes');
const batchRoutes = require('./routes/batchRoutes');

const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173'];

app.use(
  cors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
  })
);

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    data: {
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    },
  });
});

// API routes
app.use('/api/products', productRoutes);
app.use('/api/batches', batchRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;