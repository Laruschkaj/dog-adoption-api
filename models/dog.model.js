const mongoose = require('mongoose');

const dogSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Dog name is required'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Dog description is required'],
        trim: true,
    },
    // The owner is a reference to the User model, linking a dog to a specific user
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // This flag determines if the dog has been adopted
    isAdopted: {
        type: Boolean,
        default: false,
    },
    // An image URL for the dog's photo
    imageUrl: {
        type: String,
        required: false,
    },
    // The date the dog was registered
    registeredAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Dog', dogSchema);
