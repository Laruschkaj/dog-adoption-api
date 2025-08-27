const mongoose = require('mongoose');
const User = require('../models/user.model');
const Dog = require('../models/dog.model');

// Helper function to clean database
const cleanDatabase = async () => {
    try {
        await User.deleteMany({});
        await Dog.deleteMany({});
    } catch (error) {
        console.error('Error cleaning database:', error);
    }
};

// Helper function to create test user
const createTestUser = async (userData = {}) => {
    const defaultUser = {
        username: 'testuser',
        password: 'password123'
    };

    const user = new User({ ...defaultUser, ...userData });
    await user.save();
    return user;
};

// Helper function to create test dog
const createTestDog = async (ownerId, dogData = {}) => {
    const defaultDog = {
        name: 'Buddy',
        description: 'A friendly golden retriever',
        owner: ownerId
    };

    const dog = new Dog({ ...defaultDog, ...dogData });
    await dog.save();
    return dog;
};

module.exports = {
    cleanDatabase,
    createTestUser,
    createTestDog
};