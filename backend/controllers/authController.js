const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            phone,
            password
        } = req.body;

        // Basic validation
        if (!first_name || !last_name || !email || !phone || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const cleanUser = {
            first_name: first_name.trim().toLowerCase(),
            last_name: last_name.trim().toLowerCase(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            password
        };

        // Check email
        if (await User.exists({ email: cleanUser.email })) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        // Check phone
        if (await User.exists({ phone: cleanUser.phone })) {
            return res.status(400).json({
                message: "Phone number already used"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(
            cleanUser.password,
            10
        );

        const user = {
            first_name: cleanUser.first_name,
            last_name: cleanUser.last_name,
            email: cleanUser.email,
            phone: cleanUser.phone,
            password: hashedPassword
        };

        await User.create(user);

        return res.status(201).json({
            message: "Registered successfully!"
        });

    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const userEmail = email.trim().toLowerCase();

        // Find user using the actual MongoDB field name
        const user = await User.findOne({
            email: userEmail
        });

        if (!user) {
            return res.status(400).json({
                message: "Email unavailable"
            });
        }

        // Compare entered password with hashed password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "Incorrect password"
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "24h"
            }
        );

        return res.json({
            token
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

exports.getRiders = async (req, res) => {
    try {
        const riders = await User.find({ role: 'rider', status: 'available' }).select('-password');
        const formattedRiders = riders.map(rider => ({
            rider_id: rider._id,
            first_name: rider.first_name,
            last_name: rider.last_name,
            email: rider.email,
            phone: rider.phone,
            status: rider.status
        }));
        return res.json({
            riders: formattedRiders
        });
    } catch (error) {
        console.error("Error fetching riders:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};
