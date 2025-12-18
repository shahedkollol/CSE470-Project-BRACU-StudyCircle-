const mongoose = require('mongoose');

//  Thesis Collaboration 
const milestoneSchema = new mongoose.Schema({
    title: String,
    description: String,
    dueDate: Date,
    isCompleted: { type: Boolean, default: false },
    assignedMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const thesisGroupSchema = new mongoose.Schema({
    groupName: { type: String, required: true },
    researchInterests: [String],
    hierarchicalTags: [String], // e.g., ["CS", "AI", "NLP"]
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    advisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    maxMembers: { type: Number, default: 4 },
    status: { 
        type: String, 
        enum: ['OPEN', 'CLOSED', 'FULL', 'ARCHIVED'], 
        default: 'OPEN' 
    },
    milestones: [milestoneSchema],
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'GroupChat' } // Link to Chat
}, { timestamps: true });

//  Thesis Repository (Final Papers) 
const thesisSchema = new mongoose.Schema({
    title: { type: String, required: true },
    authors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    department: String,
    abstract: String,
    keywords: [String],
    pdfUrl: String,
    year: Number,
    citations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Thesis' }],
    authenticityRating: { type: Number, default: 0 },
    status: { 
        type: String, 
        enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'FLAGGED'],
        default: 'DRAFT'
    },
    downloadCount: { type: Number, default: 0 }
}, { timestamps: true });

//  Thesis Review 
const thesisReviewSchema = new mongoose.Schema({
    thesis: { type: mongoose.Schema.Types.ObjectId, ref: 'Thesis' },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authenticityScore: Number,
    comments: String,
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVISION'] }
}, { timestamps: true });

const ThesisGroup = mongoose.model('ThesisGroup', thesisGroupSchema);
const Thesis = mongoose.model('Thesis', thesisSchema);
const ThesisReview = mongoose.model('ThesisReview', thesisReviewSchema);

module.exports = { ThesisGroup, Thesis, ThesisReview };
