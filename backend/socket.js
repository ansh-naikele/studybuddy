const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/user');
const jose = require('jose');
const bcrypt = require('bcryptjs');
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

require('dotenv').config();
app.use(cors());
app.use(express.json());
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_CONNECTION_STRING);

// Store active users and their socket connections
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining a room
  socket.on('join_room', (data) => {
    const { roomId, userId, userName } = data;
    socket.join(roomId);
    activeUsers.set(socket.id, { userId, userName, roomId });
    
    // Notify others in the room
    socket.to(roomId).emit('user_joined', {
      userId,
      userName,
      message: `${userName} has joined the room`
    });
  });

  // Handle chat messages
  socket.on('send_message', (data) => {
    const { roomId, message, userName } = data;
    io.to(roomId).emit('receive_message', {
      message,
      userName,
      timestamp: new Date().toISOString()
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = activeUsers.get(socket.id);
    if (user) {
      const { roomId, userName } = user;
      socket.to(roomId).emit('user_left', {
        userName,
        message: `${userName} has left the room`
      });
      activeUsers.delete(socket.id);
    }
  });
});

// Your existing routes here
app.post('/api/register', async (req, res) => {
  // ... existing register code ...
});

app.post('/api/login', async (req, res) => {
  // ... existing login code ...
});

server.listen(1337, () => {
  console.log('Server is running on port 1337');
});