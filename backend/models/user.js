const mongoose = require('mongoose');

// Define the User schema
const User = new mongoose.Schema(
    {   
        // The user's full name, required for all users
        name: { type: String, required: true },
        
        // Boolean indicating whether the user is a tutor
        tutor: { type: Boolean, required: true },
        
        // User's email address, must be unique and required
        email: { type: String, required: true, unique: true },
        
        // Hashed password for the user's account, required for all users
        password: { type: String, required: true },
        
        // 2D array representing the user's availability
        // Each sub-array represents a day of the week, and contains Boolean values for each time slot
        availability: {
            type: [[Boolean]], // The structure is a 2D array
            // Default value initializes availability for 7 days (Mon-Sun) with 19 time slots each (e.g., 7 AM to 9 PM)
            default: Array(7).fill(Array(19).fill(false)) 
        },

        bookings: [{
            name: { type: String},
            tutorEmail: { type: String},
            tutoreeEmail: { type: String},
            link: { type: String},
            day: Number,  // 0-6 representing Mon-Sun
            time: Number, // 0-18 representing time slots
        }]
    },
    // Specify the collection name in MongoDB
    { collection: 'user-data' }
);

// Create the User model from the schema
const model = mongoose.model('UserData', User);

// Export the User model for use in other parts of the application
module.exports = model;