const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();

// CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://foodie-haven-frontend.vercel.app']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');
const favoriteRoutes = require('./routes/favorites');
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/favorites', favoriteRoutes);

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.FRONTEND_URL, 'https://foodie-haven-frontend.vercel.app']
      : ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['*']
  },
  allowEIO3: true
});

// Import Chat model
const Chat = require('./models/Chat');
const User = require('./models/User');

// Socket.IO connection handling
io.on('connection', (socket) => {
  // Join recipe room
  socket.on('join-recipe', async (data) => {
    const { recipeId, recipeType } = data;
    const room = `${recipeType}-${recipeId}`;
    socket.join(room);
    
    // Send last 10 messages to the user
    try {
      const chat = await Chat.findOne({ recipeId, recipeType });
      if (chat) {
        socket.emit('chat-history', chat.messages);
      } else {
        socket.emit('chat-history', []);
      }
    } catch (error) {
      // Error handling
    }
  });

  // Handle new messages
  socket.on('send-message', async (data) => {
    if (!data.userId) {
      return;
    }
    
    const { recipeId, recipeType, message, userId, username } = data;
    const room = `${recipeType}-${recipeId}`;
    
    try {
      // Find or create chat
      let chat = await Chat.findOne({ recipeId, recipeType });
      if (!chat) {
        chat = new Chat({ recipeId, recipeType, messages: [] });
      }
      
      // Add new message
      chat.messages.push({
        user: userId,
        username,
        message,
        timestamp: new Date()
      });
      
      // Keep only last 10 messages
      if (chat.messages.length > 10) {
        chat.messages = chat.messages.slice(-10);
      }
      
      await chat.save();
      
      // Broadcast to all users in the room
      io.to(room).emit('new-message', {
        user: userId,
        username,
        message,
        timestamp: new Date()
      });
    } catch (error) {
      // Error handling
    }
  });

  socket.on('disconnect', () => {
    // User disconnected
  });
});

// MongoDB connection event handlers
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected successfully!');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

async function start() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGO_URI missing in .env file. Server will start without DB connection.');
      console.log('⚠️  Please add MONGO_URI to your .env file');
    } else {
      console.log('🔄 Connecting to MongoDB...');
      console.log('📍 Connection string:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs
      await mongoose.connect(mongoUri);
    }

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  }
}

start();


