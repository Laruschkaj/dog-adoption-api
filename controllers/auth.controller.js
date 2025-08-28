// controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '24h'
    });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username and password are required'
        });
    }

    try {
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(409).json({ success: false, message: 'Username already exists' });
        }

        const newUser = await User.create({ username, password });
        const token = generateToken(newUser._id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                token,
                user: {
                    id: newUser._id,
                    username: newUser.username
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Authenticate user and get token
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username and password are required'
        });
    }

    try {
        const user = await User.findOne({ username });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

