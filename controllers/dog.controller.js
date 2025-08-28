// controllers/dog.controller.js
const { Dog } = require('../models');

/**
 * @desc    Get all dogs with filtering and pagination
 * @route   GET /api/dogs
 * @access  Public
 */
exports.getAllDogs = async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) {
        if (status === 'registered') {
            query.adoptedBy = null;
        } else if (status === 'adopted') {
            query.adoptedBy = { $ne: null };
        }
    }

    try {
        const dogs = await Dog.find(query)
            .populate('owner', 'username')
            .populate('adoptedBy', 'username')
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Dog.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                dogs,
                total,
                page: Number(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Register a new dog
 * @route   POST /api/dogs
 * @access  Private
 */
exports.registerDog = async (req, res) => {
    const { name, description } = req.body;
    const ownerId = req.user.id;

    if (!name || !description) {
        return res.status(400).json({
            success: false,
            message: 'Dog name and description are required'
        });
    }

    try {
        const newDog = await Dog.create({
            name,
            description,
            owner: ownerId
        });
        res.status(201).json({ success: true, data: newDog });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Adopt a dog
 * @route   PUT /api/dogs/:id/adopt
 * @access  Private
 */
exports.adoptDog = async (req, res) => {
    const { id } = req.params;
    const adopterId = req.user.id;
    const { message } = req.body;

    try {
        const dog = await Dog.findById(id);

        if (!dog) {
            return res.status(404).json({ success: false, message: 'Dog not found' });
        }

        if (dog.owner.toString() === adopterId) {
            return res.status(400).json({ success: false, message: 'You cannot adopt a dog you registered.' });
        }

        if (dog.adoptedBy) {
            return res.status(400).json({ success: false, message: 'This dog has already been adopted.' });
        }

        dog.adoptedBy = adopterId;
        dog.adoptionDate = new Date();
        await dog.save();

        res.status(200).json({ success: true, message: 'Dog adopted successfully!', data: dog });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Remove a dog
 * @route   DELETE /api/dogs/:id
 * @access  Private
 */
exports.removeDog = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const dog = await Dog.findById(id);

        if (!dog) {
            return res.status(404).json({ success: false, message: 'Dog not found' });
        }

        if (dog.owner.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'You do not have permission to remove this dog.' });
        }

        if (dog.adoptedBy) {
            return res.status(400).json({ success: false, message: 'Cannot remove a dog that has been adopted.' });
        }

        await dog.deleteOne();

        res.status(200).json({ success: true, message: 'Dog removed successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    List dogs registered by the authenticated user
 * @route   GET /api/dogs/registered
 * @access  Private
 */
exports.getRegisteredDogs = async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    try {
        const dogs = await Dog.find({ owner: userId })
            .populate('owner', 'username')
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Dog.countDocuments({ owner: userId });

        res.status(200).json({
            success: true,
            data: {
                dogs,
                total,
                page: Number(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    List dogs adopted by the authenticated user
 * @route   GET /api/dogs/adopted
 * @access  Private
 */
exports.getAdoptedDogs = async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    try {
        const dogs = await Dog.find({ adoptedBy: userId })
            .populate('owner', 'username')
            .populate('adoptedBy', 'username')
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Dog.countDocuments({ adoptedBy: userId });

        res.status(200).json({
            success: true,
            data: {
                dogs,
                total,
                page: Number(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
