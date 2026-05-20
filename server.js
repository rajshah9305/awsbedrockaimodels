/**
 * AWS Bedrock AI Web Application
 * 
 * @author RAJ SHAH
 * @repository https://github.com/rajshah9305/awsbedrockaimodels
 * @description Advanced web application for interacting with AWS Bedrock AI models
 * @license MIT
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bedrockRoutes = require('./routes/bedrock');

const app = express();
const PORT = process.env.PORT || 3000;

// Increase timeout for long-running AI requests
const SERVER_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(SERVER_TIMEOUT);
  res.setTimeout(SERVER_TIMEOUT);
  next();
});

// Serve static files
app.use(express.static('public'));

// API Routes
app.use('/api/bedrock', bedrockRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'AWS Bedrock AI Web App'
  });
});

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle specific error types
  if (err.name === 'PayloadTooLargeError') {
    return res.status(413).json({
      error: 'Request payload too large',
      message: 'The request body exceeds the maximum allowed size'
    });
  }
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'The request body contains invalid JSON'
    });
  }
  
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// For local development
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const server = app.listen(PORT, () => {
    console.log('='.repeat(70));
    console.log('🚀 AWS Bedrock AI Web App');
    console.log('👨‍💻 Developed by: RAJ SHAH');
    console.log('🔗 GitHub: https://github.com/rajshah9305/awsbedrockaimodels');
    console.log('='.repeat(70));
    console.log(`📍 Server running on: http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌍 Region: ${process.env.AWS_REGION || 'us-east-1'}`);
    console.log('='.repeat(70));
    console.log('🤖 Ready to interact with AWS Bedrock models!');
    console.log('');
    console.log('💡 Quick Tips:');
    console.log('   • Use Amazon Nova, Claude, or Titan models (no subscription needed)');
    console.log('   • Enable model access in AWS Bedrock Console first');
    console.log('   • Check README.md for detailed instructions');
    console.log('='.repeat(70));
  });

  // Set server timeout
  server.timeout = SERVER_TIMEOUT;
  server.keepAliveTimeout = SERVER_TIMEOUT;
  server.headersTimeout = SERVER_TIMEOUT + 1000;

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('\nSIGINT signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
}

module.exports = app;
