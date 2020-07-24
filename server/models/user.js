const mongoose = require('mongoose');

const roles = {
    ADMIN: "ROLE_ADMIN",
    STUDENT: "ROLE_STUDENT",
    TEACHER: "ROLE_TEACHER",
};

module.exports.roles = roles;

const schema = new mongoose.Schema({
    // Once the username is set wont be able to change
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    createdDate: { type: Date, default: Date.now },
    roles: {
        type: [{ type: String, enum: Object.values(roles)}],
        required: true,
        validate: [(val) => val.length > 0, 'At least one(1) role required.'],
    },
});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
    }
});

const User = mongoose.model('User', schema, 'users');

module.exports.User = User;