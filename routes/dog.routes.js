const express = require('express');
const { authenticateToken } = require('../middlewares/auth.middleware');
const {
    registerDog,
    adoptDog,
    removeDog,
    getRegisteredDogs,
    getAdoptedDogs
} = require('../controllers/dog.controller');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// @route   POST /api/dogs
// @desc    Register a new dog
// @access  Private
router.post('/', registerDog);

// @route   PUT /api/dogs/:id/adopt
// @desc    Adopt a dog
// @access  Private
router.put('/:id/adopt', adoptDog);

// @route   DELETE /api/dogs/:id
// @desc    Remove a dog
// @access  Private
router.delete('/:id', removeDog);

// @route   GET /api/dogs/registered
// @desc    Get user's registered dogs
// @access  Private
router.get('/registered', getRegisteredDogs);

// @route   GET /api/dogs/adopted
// @desc    Get user's adopted dogs
// @access  Private
router.get('/adopted', getAdoptedDogs);

module.exports = router;