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
const thesisReviewEmbeddedSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 }, // Star rating 1-5
    comment: String,
    createdAt: { type: Date, default: Date.now }
});

const thesisSchema = new mongoose.Schema({
    title: { type: String, required: true },
    authors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    department: String,
    abstract: String,
    brief: String, // Short description/summary
    keywords: [String],
    pdfUrl: String,
    codeUrl: String, // Attached code file (.zip, .tar.gz)
    gitRepoUrl: String, // GitHub/GitLab repository URL
    designation: String, // Author designation (e.g., Student, Faculty, Researcher)
    year: Number,
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reviews: [thesisReviewEmbeddedSchema],
    averageRating: { type: Number, default: 0 }, // Calculated average of review ratings
    status: {
        type: String,
        enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'FLAGGED'],
        default: 'DRAFT'
    },
    viewCount: { type: Number, default: 0 },
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
