// routes/dog.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.middleware');
const {
    getAllDogs,
    registerDog,
    adoptDog,
    removeDog,
    getRegisteredDogs,
    getAdoptedDogs
} = require('../controllers/dog.controller');

// Public route to get all dogs with pagination/filtering
router.get('/', getAllDogs);

// Private routes (require authentication)
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
// @desc    List dogs registered by the authenticated user
// @access  Private
router.get('/registered', getRegisteredDogs);

// @route   GET /api/dogs/adopted
// @desc    List dogs adopted by the authenticated user
// @access  Private
router.get('/adopted', getAdoptedDogs);

module.exports = router;
