// models/index.js
// This file is used to manage all the models in one place for easy access and relationships.

const User = require('./user.model');
const Dog = require('./dog.model');

// Export all models
module.exports = {
    User,
    Dog
};
