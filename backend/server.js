require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const offeredSkillRoutes = require('./routes/offeredSkillRoutes');
const requestedSkillRoutes = require('./routes/requestedSkillRoutes');
const messageRoutes = require('./routes/messageRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();
const server = http.createServer(app);

// Optional real-time via Socket.IO
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

// Keep a simple in-memory map of userId -> socketId
const onlineUsers = new Map();

io.on('connection', (socket) => {
  socket.on('identify', (userId) => {
    if (userId) onlineUsers.set(String(userId), socket.id);
  });

  socket.on('disconnect', () => {
    for (const [userId, sid] of onlineUsers.entries()) {
      if (sid === socket.id) onlineUsers.delete(userId);
    }
  });
});

// Attach io to app for use in controllers
app.set('io', io);
app.set('onlineUsers', onlineUsers);

// Middleware
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/offered-skills', offeredSkillRoutes);
app.use('/api/requested-skills', requestedSkillRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);

// 404 and error handler
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

// Start server only after DB connects
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
