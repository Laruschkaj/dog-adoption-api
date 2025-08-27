const mongoose = require('mongoose');

const dogSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Dog name is required'],
        trim: true,
        maxlength: [50, 'Dog name cannot exceed 50 characters']
    },
    description: {
        type: String,
        required: [true, 'Dog description is required'],
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Owner is required']
    },
    status: {
        type: String,
        enum: ['available', 'adopted'],
        default: 'available'
    },
    adoptedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    adoptedAt: {
        type: Date,
        default: null
    },
    thankYouMessage: {
        type: String,
        trim: true,
        maxlength: [200, 'Thank you message cannot exceed 200 characters']
    }
}, {
    timestamps: true
});

// Index for better query performance
dogSchema.index({ owner: 1, status: 1 });
dogSchema.index({ adoptedBy: 1 });
dogSchema.index({ status: 1 });

// Static method to find available dogs
dogSchema.statics.findAvailable = function () {
    return this.find({ status: 'available' });
};

// Static method to find dogs by owner
dogSchema.statics.findByOwner = function (ownerId, status = null) {
    const query = { owner: ownerId };
    if (status) {
        query.status = status;
    }
    return this.find(query).populate('adoptedBy', 'username');
};

// Static method to find adopted dogs by adopter
dogSchema.statics.findByAdopter = function (adopterId) {
    return this.find({ adoptedBy: adopterId, status: 'adopted' })
        .populate('owner', 'username');
};

// Instance method to adopt dog
dogSchema.methods.adoptDog = function (adopterId, thankYouMessage = '') {
    this.status = 'adopted';
    this.adoptedBy = adopterId;
    this.adoptedAt = new Date();
    this.thankYouMessage = thankYouMessage;
    return this.save();
};

module.exports = mongoose.model('Dog', dogSchema);