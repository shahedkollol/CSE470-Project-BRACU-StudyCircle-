const mongoose = require('mongoose');

const tutoringPostSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Student
    subject: { type: String, required: true },
    description: String,
    availability: [String], 
    meetingMode: { type: String, enum: ['ONLINE', 'OFFLINE', 'HYBRID'] },
    rate: Number, // Hourly rate
    postType: { type: String, enum: ['OFFER', 'REQUEST'] } // Offer help or Need help
}, { timestamps: true });

const tutoringSessionSchema = new mongoose.Schema({
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    learner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    subject: String,
    scheduledTime: Date,
    location: String,
    status: { 
        type: String, 
        enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED'],
        default: 'PENDING'
    },
    rating: {
        stars: Number,
        review: String,
        timestamp: Date
    }
}, { timestamps: true });

module.exports = {
    TutoringPost: mongoose.model('TutoringPost', tutoringPostSchema),
    TutoringSession: mongoose.model('TutoringSession', tutoringSessionSchema)
};
