const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment configuration
dotenv.config();

const packetRoutes = require('./routes/packetRoutes');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/network_packet_analyser';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ============================================================================
// CORS Configuration (Supports local dev, LAN, and deployed frontend domains)
// ============================================================================
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman) or matched origin
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(null, true); // Permissive default for dashboard access
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

// ============================================================================
// Socket.IO Real-time Server Setup
// ============================================================================
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Store io instance on app for route access
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`🔌 [Socket.IO] Client connected: ${socket.id} from ${socket.handshake.address}`);

  socket.on('disconnect', (reason) => {
    console.log(`🔌 [Socket.IO] Client disconnected: ${socket.id} (Reason: ${reason})`);
  });

  socket.on('error', (err) => {
    console.error(`⚠️ [Socket.IO] Socket error on ${socket.id}:`, err);
  });
});

// ============================================================================
// REST API Routes
// ============================================================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    service: 'Network Packet Analyser Backend',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// Mount Packet Analyser REST Routes
app.use('/api', packetRoutes);

// Catch-all 404 handler for undefined API endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(`💥 [Error] ${req.method} ${req.originalUrl}:`, err.message || err);
  if (err.stack && process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error occurred',
    error: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
});

// ============================================================================
// Database Connection & Server Launch
// ============================================================================
async function startServer() {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB database successfully.');

    server.listen(PORT, () => {
      console.log('====================================================');
      console.log(`🚀 Network Packet Analyser Server running on port ${PORT}`);
      console.log(`📡 REST API endpoint: http://localhost:${PORT}/api`);
      console.log(`🔌 Socket.IO streaming: ws://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log('====================================================');
    });
  } catch (error) {
    console.error('❌ MongoDB Connection Failure:', error.message);
    console.warn('⚠️ Starting HTTP server in fallback mode (MongoDB features will retry when DB is up)...');

    server.listen(PORT, () => {
      console.log(`⚠️ Server running without active MongoDB connection on port ${PORT}.`);
    });
  }
}

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('\n🛑 Gracefully stopping server and closing connections...');
  try {
    await mongoose.disconnect();
    console.log('🔌 MongoDB connection closed.');
  } catch (err) {
    // ignore
  }
  process.exit(0);
});

startServer();
