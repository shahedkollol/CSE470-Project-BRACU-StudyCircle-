const mongoose = require('mongoose');

const options = { discriminatorKey: 'role', timestamps: true };

//Base User 
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    studentId: { type: String }, // Optional, generic ID
    department: { type: String },
    contactInfo: { type: String },
    interests: [String],
    skills: [String],
    privacySettings: {
        showEmail: { type: Boolean, default: false },
        showProfile: { type: Boolean, default: true }
    }
}, options);

const User = mongoose.model('User', userSchema);

//Student
const Student = User.discriminator('STUDENT', new mongoose.Schema({
    enrolledCourses: [String],
    availability: [String],
    tutoringSubjects: [String],
    favoritesTutors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}));

//Alumni
const employmentProfileSchema = new mongoose.Schema({
    jobTitle: String,
    company: String,
    industry: String,
    startDate: Date,
    endDate: Date,
    isCurrent: Boolean
});

const Alumni = User.discriminator('ALUMNI', new mongoose.Schema({
    employmentHistory: [employmentProfileSchema],
    currentPosition: String,
    currentCompany: String,
    industry: String,
    offersMentorship: { type: Boolean, default: false },
    graduationDate: Date
}));

//  Faculty 
const Faculty = User.discriminator('FACULTY', new mongoose.Schema({
    expertise: [String], // advisingGroups ref handled in ThesisGroup 
    
}));

//  Administrator 
const Administrator = User.discriminator('ADMIN', new mongoose.Schema({
    permissions: [String]
}));

module.exports = { User, Student, Alumni, Faculty, Administrator };
