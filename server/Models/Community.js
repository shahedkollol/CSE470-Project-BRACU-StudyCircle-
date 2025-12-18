const mongoose = require('mongoose');

// Study Group
const studyGroupSchema = new mongoose.Schema({
    groupName: String,
    course: String,
    topic: String,
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    sharedResources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }]
}, { timestamps: true });

// Events
const eventSchema = new mongoose.Schema({
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: String,
    description: String,
    dateTime: Date,
    location: String,
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// Jobs (Alumni)
const jobPostingSchema = new mongoose.Schema({
    poster: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Alumni
    title: String,
    company: String,
    description: String,
    requirements: [String],
    deadline: Date
}, { timestamps: true });

// Mentorship
const mentorshipRequestSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    alumni: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED'], default: 'PENDING' }
}, { timestamps: true });

module.exports = {
    StudyGroup: mongoose.model('StudyGroup', studyGroupSchema),
    Event: mongoose.model('Event', eventSchema),
    JobPosting: mongoose.model('JobPosting', jobPostingSchema),
    MentorshipRequest: mongoose.model('MentorshipRequest', mentorshipRequestSchema)
};
