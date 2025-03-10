const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/user');
const jose = require('jose');
const bcrypt = require('bcryptjs');
const http = require('http');

// Create a server instance
const server = http.createServer(app);

// Set up Socket.io with CORS
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3000", // Allow requests from this origin
    methods: ["GET", "POST"]
  }
});

// Load environment variables from .env file
require('dotenv').config();
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse incoming JSON requests

// Set mongoose to use strict query
mongoose.set('strictQuery', true);

// Connect to MongoDB using the connection string from the environment variables
mongoose.connect(process.env.MONGO_CONNECTION_STRING);

// Store active users and their socket connections in a Map
const activeUsers = new Map();

// Socket.io connection event
io.on('connection', (socket) => {
  console.log('User connected:', socket.id); // Log the user's socket ID

  // Handle user joining a room
  socket.on('join_room', (data) => {
    const { roomId, userId, userName } = data; // Extract roomId, userId, and userName from data
    socket.join(roomId); // Join the specified room
    activeUsers.set(socket.id, { userId, userName, roomId }); // Store user information in activeUsers Map
    
    // Notify other users in the room about the new user
    socket.to(roomId).emit('user_joined', {
      userId,
      userName,
      message: `${userName} has joined the room`
    });
  });

  // Handle incoming chat messages
  socket.on('send_message', (data) => {
    const { roomId, message, userName } = data; // Extract roomId, message, and userName from data
    io.to(roomId).emit('receive_message', {
      message,
      userName,
      timestamp: new Date().toISOString() // Include timestamp with the message
    });
  });

  // Handle disconnection event
  socket.on('disconnect', () => {
    const user = activeUsers.get(socket.id); // Get the user info from activeUsers Map
    if (user) {
      const { roomId, userName } = user;
      // Notify others in the room that the user has left
      socket.to(roomId).emit('user_left', {
        userName,
        message: `${userName} has left the room`
      });
      activeUsers.delete(socket.id); // Remove the user from activeUsers Map
    }
  });
});

// API endpoint for user registration
app.post('/api/register', async (req, res) => {
    try {
        // Hash the password before storing it in the database
        const newPassword = await bcrypt.hash(req.body.password, 10);
        // Determine if the user is a tutor based on the role
        const tutor = req.body.role === 'tutor' ? true : false;
        
        // Create a new user document in the database
        await User.create({
            name: req.body.name,
            email: req.body.email,
            password: newPassword,
            tutor: tutor,
        });
        res.json({ status: 'ok' }); // Respond with success status
    } catch (err) {
        res.json({ status: 'error', error: err }); // Respond with error status
    }
});

// API endpoint for user login
app.post('/api/login', async (req, res) => {
    const user = await User.findOne({
        email: req.body.email,
    });
    if (!user) {
        return res.json({ status: 'error', error: 'invalid login' }); // Respond if user not found
    }
    const isPasswordValid = await bcrypt.compare(req.body.password, user.password); // Check password validity
    
    if (isPasswordValid) {
        // Create a JWT token for the user
        const token = await new jose.SignJWT({
            name: user.name,
            email: user.email,
        })
            .setProtectedHeader({ alg: 'HS256' }) // Set the algorithm for the JWT
            .setIssuedAt() // Set the issued date
            .sign(new TextEncoder().encode(process.env.JWTKey)); // Sign the token with the secret key

        return res.json({
            status: 'ok',
            user: token, // Return the token
            tutor: user.tutor // Return whether the user is a tutor
        });
    } else {
        return res.json({ status: 'error', user: false }); // Respond if password is invalid
    }
});

// API endpoint to save user availability
app.post('/api/saveAvailability', async (req, res) => {
    const token = req.headers['x-access-token']; // Get the token from the request header

    if (!token) {
        return res.status(401).json({ status: 'error', error: 'Token is required.' }); // Respond if no token is provided
    }

    // Verify the token
    try {
        const decoded = await jose.jwtVerify(token, new TextEncoder().encode(process.env.JWTKey)); // Decode and verify the token
        const email = decoded.payload.email; // Extract the email from the token
        const { availability } = req.body; // Get availability from the request body

        if (!availability) {
            return res.status(400).json({ status: 'error', error: 'Availability is required.' }); // Respond if availability is not provided
        }

        // Find the user by email and update their availability
        const user = await User.findOneAndUpdate(
            { email },
            { availability },
            { new: true } // Return the updated document
        );

        if (user) {
            res.json({ status: 'ok', message: 'Availability updated successfully', user }); // Respond with success message
        } else {
            res.status(404).json({ status: 'error', error: 'User not found' }); // Respond if user is not found
        }
    } catch (error) {
        res.status(401).json({ status: 'error', error: 'Invalid token' }); // Respond if token is invalid
    }
});

// API endpoint to get the list of tutors
app.get('/api/tutors', async (req, res) => {
    try {
        const tutors = await User.find({ tutor: true }, 'name email availability'); // Fetch tutors with their availability
        res.json({ status: 'ok', tutors }); // Respond with the list of tutors
    } catch (error) {
        res.json({ status: 'error', error: 'Failed to fetch tutors' }); // Respond if fetching tutors fails
    }
});

app.get('/api/userType', async (req, res) => {
    const token = req.headers['x-access-token']; // Get the token from the request header

    if (!token) {
        return res.status(401).json({ status: 'error', error: 'Token is required.' }); // Respond if no token is provided
    }

    // Verify the token
    try {
        const decoded = await jose.jwtVerify(token, new TextEncoder().encode(process.env.JWTKey)); // Decode and verify the token
        const email = decoded.payload.email; // Extract the email from the token

        // Find the user by email
        const user = await User.findOne({ email });

        if (user) {
            res.json({ status: 'ok', tutor: user.tutor }); // Respond with the user type
        } else {
            res.status(404).json({ status: 'error', error: 'User not found' }); // Respond if user is not found
        }
    } catch (error) {
        res.status(401).json({ status: 'error', error: 'Invalid token' }); // Respond if token is invalid
    }
});

app.post('/api/schedule-session', async (req, res) => {
    try {
        const { slots } = req.body; // Extract slots from request body
        const token = req.headers['x-access-token']; // Get the token from the request header
        const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        if (!token) {
            return res.json({ status: 'error', error: 'Token not provided' });
        }

        // Decode and verify the token
        const decoded = await jose.jwtVerify(token, new TextEncoder().encode(process.env.JWTKey));
        const tutoreeEmail = decoded.payload.email; // Get tutoree email from token

        // Find the tutoree document
        const tutoree = await User.findOne({ email: tutoreeEmail });
        if (!tutoree) {
            return res.json({ status: 'error', error: 'Tutoree not found' });
        }

        const tutorPromises = slots.map(async (slot) => {
            const { tutorEmail, day, time } = slot;

            // Find the tutor document
            const tutor = await User.findOne({ email: tutorEmail });
            if (!tutor) {
                throw new Error(`Tutor not found for email: ${tutorEmail}`);
            }

            // Create a booking entry for the slot
            const booking = {
                name : tutoree.name,
                tutoreeEmail, // Only store the tutoreeEmail
                link: 'https://us04web.zoom.us/j/6660800222?pwd=sAjWk1tUuCSK8oWWrummRo274Gw969.1',
                day: DAYS.indexOf(day), // Convert day string to index
                time: parseInt(time.split(':')[0]) - 7, // Convert time string to slot index
            };

            // Update tutor's availability for the specific slot
            tutor.availability[booking.day][booking.time] = false;
            tutor.bookings.push(booking); // Add the booking with tutoreeEmail

            await tutor.save(); // Save the tutor document after the update
        });

        // Wait for all tutor updates to complete
        await Promise.all(tutorPromises);

        // Add the booking to tutoree (only storing tutorEmail, day, and time)
        for (const slot of slots) {
            const { tutorName, tutorEmail, day, time } = slot;
            const booking = {
                name: tutorName,
                tutorEmail, // Only store the tutorEmail
                link: 'https://us04web.zoom.us/j/6660800222?pwd=sAjWk1tUuCSK8oWWrummRo274Gw969.1',
                day: DAYS.indexOf(day),
                time: parseInt(time.split(':')[0]) - 7,
            };

            tutoree.bookings.push(booking);
        }

        // Save the tutoree document
        await tutoree.save();

        res.json({ status: 'ok', message: 'Sessions scheduled successfully' });
    } catch (error) {
        console.error('Error scheduling sessions:', error);
        res.json({ status: 'error', error: 'Failed to schedule sessions' });
    }
});

app.get('/api/bookings', async (req, res) => {
    const token = req.headers['x-access-token']; // Get the token from the request header

    if (!token) {
        return res.json({ status: 'error', error: 'Token not provided' });
    }

    const decoded = await jose.jwtVerify(token, new TextEncoder().encode(process.env.JWTKey)); // Decode and verify the token
    const email = decoded.payload.email;

    const user = await User.findOne({ email });

    if (!user) {
        return res.json({ status: 'error', error: 'User not found' });
    }

    res.json({ status: 'ok', name: user.name, bookings: user.bookings, link: user.link });
});

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 1337;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app; // Export the server for testing