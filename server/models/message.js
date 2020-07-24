const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    room: {
        type: [{ type: String }],
        required: true,
    },
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    date: { type: Date, default: Date.now },
    text: { type: String, default: "" }
});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
    }
});

const Message = mongoose.model('Message', schema, 'chat-messages');

module.exports = Message;