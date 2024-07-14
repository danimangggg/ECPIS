// Import necessary modules
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Adjust the path to your models
const router = express.Router();
const db = require("../../models");
const User = db.user;

// Define your secret key for JWT
const SECRET_KEY = 'your_secret_key'; // You should keep your secret key in environment variables for security

// Login route
    const sign =   async (req, res) => {
    const { user_name, password } = req.body;

    try {
        // Find the user by user name
        const user = await User.findOne({ where: { user_name } });
        if (!user) {
            return res.status(401).json({ message: 'Authentication failed. User not found.' });
        }

        // Compare the password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Authentication failed. Wrong password.' });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });

        // Send the token to the client
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error.', error });
    }
}

module.exports = {sign};
