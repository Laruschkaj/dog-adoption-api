const Dog = require('../models/dog.model');
const mongoose = require('mongoose');

// @desc    Register a new dog
// @route   POST /api/dogs
// @access  Private
const registerDog = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Validation
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: 'Dog name and description are required'
            });
        }

        // Create dog
        const dog = new Dog({
            name: name.trim(),
            description: description.trim(),
            owner: req.user.id
        });

        await dog.save();
        await dog.populate('owner', 'username');

        res.status(201).json({
            success: true,
            message: 'Dog registered successfully',
            data: { dog }
        });

    } catch (error) {
        console.error('Dog registration error:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during dog registration'
        });
    }
};

// @desc    Adopt a dog
// @route   PUT /api/dogs/:id/adopt
// @access  Private
const adoptDog = async (req, res) => {
    try {
        const { id } = req.params;
        const { thankYouMessage } = req.body;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid dog ID'
            });
        }

        // Find dog
        const dog = await Dog.findById(id);
        if (!dog) {
            return res.status(404).json({
                success: false,
                message: 'Dog not found'
            });
        }

        // Check if dog is already adopted
        if (dog.status === 'adopted') {
            return res.status(409).json({
                success: false,
                message: 'This dog has already been adopted'
            });
        }

        // Check if user is trying to adopt their own dog
        if (dog.owner.toString() === req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You cannot adopt your own dog'
            });
        }

        // Adopt the dog
        await dog.adoptDog(req.user.id, thankYouMessage || '');
        await dog.populate(['owner', 'adoptedBy'], 'username');

        res.json({
            success: true,
            message: 'Dog adopted successfully!',
            data: { dog }
        });

    } catch (error) {
        console.error('Dog adoption error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during dog adoption'
        });
    }
};

// @desc    Remove a dog
// @route   DELETE /api/dogs/:id
// @access  Private
const removeDog = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid dog ID'
            });
        }

        // Find dog
        const dog = await Dog.findById(id);
        if (!dog) {
            return res.status(404).json({
                success: false,
                message: 'Dog not found'
            });
        }

        // Check if user owns the dog
        if (dog.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only remove dogs you registered'
            });
        }

        // Check if dog has been adopted
        if (dog.status === 'adopted') {
            return res.status(403).json({
                success: false,
                message: 'Cannot remove an adopted dog'
            });
        }

        // Remove the dog
        await Dog.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Dog removed successfully'
        });

    } catch (error) {
        console.error('Dog removal error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during dog removal'
        });
    }
};

// @desc    Get user's registered dogs
// @route   GET /api/dogs/registered
// @access  Private
const getRegisteredDogs = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build query
        const query = { owner: req.user.id };
        if (status && ['available', 'adopted'].includes(status)) {
            query.status = status;
        }

        // Get total count for pagination
        const total = await Dog.countDocuments(query);

        // Get dogs with pagination
        const dogs = await Dog.find(query)
            .populate('adoptedBy', 'username')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const totalPages = Math.ceil(total / limitNum);

        res.json({
            success: true,
            data: {
                dogs,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalDogs: total,
                    hasNext: pageNum < totalPages,
                    hasPrev: pageNum > 1
                }
            }
        });

    } catch (error) {
        console.error('Get registered dogs error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching registered dogs'
        });
    }
};

// @desc    Get user's adopted dogs
// @route   GET /api/dogs/adopted
// @access  Private
const getAdoptedDogs = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Get total count for pagination
        const total = await Dog.countDocuments({
            adoptedBy: req.user.id,
            status: 'adopted'
        });

        // Get adopted dogs with pagination
        const dogs = await Dog.find({
            adoptedBy: req.user.id,
            status: 'adopted'
        })
            .populate('owner', 'username')
            .sort({ adoptedAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const totalPages = Math.ceil(total / limitNum);

        res.json({
            success: true,
            data: {
                dogs,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalDogs: total,
                    hasNext: pageNum < totalPages,
                    hasPrev: pageNum > 1
                }
            }
        });

    } catch (error) {
        console.error('Get adopted dogs error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching adopted dogs'
        });
    }
};

module.exports = {
    registerDog,
    adoptDog,
    removeDog,
    getRegisteredDogs,
    getAdoptedDogs
};