require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/db');
const { createRedisClient } = require('./config/redis');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimit');
const { getCorsOptions } = require('./config/cors');

// Routes
const authRoutes = require('./routes/authRoutes');
const offeredSkillRoutes = require('./routes/offeredSkillRoutes');
const requestedSkillRoutes = require('./routes/requestedSkillRoutes');
const messageRoutes = require('./routes/messageRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const exchangeRoutes = require('./routes/exchangeRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const server = http.createServer(app);

// Optional real-time via Socket.IO
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: getCorsOptions(),
});

io.use((socket, next) => {
  // Authenticate via JWT passed as handshake.auth.token
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Unauthorized'));
    const jwt = require('jsonwebtoken');
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = String(payload.id);
    return next();
  } catch (e) {
    return next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  if (socket.userId) {
    socket.join(`user:${socket.userId}`);
  }
  socket.on('disconnect', () => {
    // rooms are cleaned up by adapter; no explicit map cleanup needed
  });
});

// Attach io to app for use in controllers
app.set('io', io);

// Middleware
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(cors(getCorsOptions()));
app.use('/api', apiLimiter);

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
app.use('/api/exchanges', exchangeRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 and error handler
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

// Optionally attach Redis and Socket.IO adapter for scale-out
const redis = createRedisClient();
if (redis) {
  app.set('redis', redis);
  try {
    const { createAdapter } = require('@socket.io/redis-adapter');
    const pubClient = redis.duplicate();
    const subClient = redis.duplicate();
    Promise.all([pubClient.connect?.(), subClient.connect?.()]).catch(() => {});
    io.adapter(createAdapter(pubClient, subClient));
    console.log('Socket.IO using Redis adapter');
  } catch (e) {
    console.warn('Failed to configure Socket.IO Redis adapter:', e.message);
  }
}

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
