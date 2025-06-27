const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(4000, 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

let io;

app.prepare().then(() => {
  const server = createServer((req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // Socket.IO Configuration
  io = new Server(server, {
    cors: {
      origin: dev 
        ? ["http://localhost:3000", "http://127.0.0.1:3000"] 
        : process.env.ALLOWED_ORIGINS?.split(',') || false,
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Socket.IO Connection Handler
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);
    
    // Handle client disconnection
    socket.on('disconnect', (reason) => {
      console.log(`🔌 Client disconnected: ${socket.id}, reason: ${reason}`);
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error(`❌ Socket error for ${socket.id}:`, error);
    });

    // Example: Join room for router updates
    socket.on('join-router-room', (routerId) => {
      socket.join(`router-${routerId}`);
      console.log(`📡 Socket ${socket.id} joined router room: ${routerId}`);
    });

    // Example: Leave room
    socket.on('leave-router-room', (routerId) => {
      socket.leave(`router-${routerId}`);
      console.log(`📡 Socket ${socket.id} left router room: ${routerId}`);
    });

    // Example: Handle router status request
    socket.on('request-router-status', (routerId) => {
      // You can implement your router status check logic here
      // and emit back the status
      console.log(`📊 Status requested for router: ${routerId}`);
    });
  });

  // Export io globally for use in API routes
  global.io = io;

  // Graceful shutdown handling
  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`🚀 Server ready on http://${hostname}:${port}`);
    console.log(`📡 Socket.IO ready for connections`);
  });
});

// Helper function to emit router status updates
// You can call this from your API routes or background jobs
function emitRouterStatus(routerId, status) {
  if (io) {
    // Emit to specific router room
    io.to(`router-${routerId}`).emit('router-status', {
      id: routerId,
      status: status,
      timestamp: new Date().toISOString()
    });
    
    // Also emit to all clients (for the main table)
    io.emit('router-status', {
      id: routerId,
      status: status,
      timestamp: new Date().toISOString()
    });
    
    console.log(`📡 Emitted status update for router ${routerId}: ${status}`);
  }
}

// Helper function to emit to all clients
function broadcastToAll(event, data) {
  if (io) {
    io.emit(event, data);
    console.log(`📡 Broadcasted ${event} to all clients`);
  }
}

// Helper function to emit to specific room
function emitToRoom(room, event, data) {
  if (io) {
    io.to(room).emit(event, data);
    console.log(`📡 Emitted ${event} to room: ${room}`);
  }
}

// Export helper functions
global.emitRouterStatus = emitRouterStatus;
global.broadcastToAll = broadcastToAll;
global.emitToRoom = emitToRoom;

module.exports = { io };