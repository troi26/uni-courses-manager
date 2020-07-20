const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    username: { type: String, required: true },
    courseId: { type: String, required: true },
    value: { type: Number, required: false, default: -1 },
});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    }
});

const Grade = mongoose.model('Grade', schema, 'grades');

module.exports.Grade = Grade;