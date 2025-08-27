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
        owner: ownerId,
        imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop'
    };

    const dog = new Dog({ ...defaultDog, ...dogData });
    await dog.save();
    return dog;
};

// Helper function to create multiple test dogs for testing pagination
const createMultipleTestDogs = async (ownerId, count = 5) => {
    const dogs = [];
    for (let i = 0; i < count; i++) {
        const dog = await createTestDog(ownerId, {
            name: `TestDog${i + 1}`,
            description: `Test dog number ${i + 1} for pagination testing`,
        });
        dogs.push(dog);
    }
    return dogs;
};

module.exports = {
    cleanDatabase,
    createTestUser,
    createTestDog,
    createMultipleTestDogs
};