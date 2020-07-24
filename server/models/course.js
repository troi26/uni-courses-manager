const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    owner: { type: String, required: true },
    description: { type: String, default: ""},
    lecturers: {
        type: [{ type: String }],
        required: true,
        validate: [(val) => val.length > 0, 'Can not create course with no lecturers.'],
    },
    enrolmentLimit: { type: Number, required: true },
    hasEntranceTest: { type: Boolean, required: true },
    targetSpeciality: { type: String, required: true, default: "Every" },
    enrolments: {
        type: [{ type: String }],
        default: [],
    },
    startDate: { type: Date, required: true },
});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
    }
});

const Course = mongoose.model('Course', schema, 'courses');

module.exports = Course;