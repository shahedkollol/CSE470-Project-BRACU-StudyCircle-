const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    description: String,
    subject: String,
    department: String,
    fileType: String, //PDF,DOCX,PPT
    fileUrl: { type: String, required: true },
    tags: [String],
    downloadCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 }
}, { timestamps: true });

const bookmarkSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }
}, { timestamps: true });

module.exports = {
    Resource: mongoose.model('Resource', resourceSchema),
    Bookmark: mongoose.model('Bookmark', bookmarkSchema)
};
