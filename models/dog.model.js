const mongoose = require('mongoose');

const dogSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        default: '', // Default to an empty string if no image URL is provided
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isAdopted: {
        type: Boolean,
        default: false,
    },
    adoptedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // This field is optional and only exists if the dog is adopted
    },
    status: {
        type: String,
        enum: ['available', 'adopted'],
        default: 'available',
    },
    thankYouMessage: {
        type: String,
        default: '',
    },
    adoptedAt: {
        type: Date,
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

const Dog = mongoose.model('Dog', dogSchema);
module.exports = Dog;
