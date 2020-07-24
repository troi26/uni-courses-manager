const jwt = require('jsonwebtoken');
var moment = require('moment');
const express = require('express');
const authenticateTokenMiddleware = require('../middlewares/auth.middleware');
const authenticateTokenMiddlewareSIO = require('../middlewares/auth.middleware.sio');
const db = require("../utils/db");

const io = require('socket.io');
const { sendErrorResponse } = require('./utils');
const { ioS } = require('../server');

const Message = db.message;
const router = express.Router();


module.exports = function (io) {
    
    io.use(authenticateTokenMiddlewareSIO);
    io.on('connection', async socket => {
        const receiver = socket.handshake.query.receiver;
        console.log("CONNECTED: ", socket.decoded.sub, receiver);
        const possible1 = [socket.decoded.sub, receiver];
        const possible2 = [receiver, socket.decoded.sub];
        const room = await Message.findOne({ $or: [ { room: possible1 }, { room: possible2 }]});
        if (!room) {
            const roomId = possible1;
            const initialMessage = {
                text: "Initial message",
                receiver: receiver,
                sender: socket.decoded.sub,
                room: roomId,
                date: new Date(),
            };
            const msgModel = new Message(initialMessage);
            await msgModel.save();
            socket.join(`${roomId[0]}__${roomId[1]}`);
        } else {
            console.log("EXISTED: ", room);
            const roomId = room.room;
            console.log("IN_ROOM: ", `${roomId[0]}__${roomId[1]}`);
            socket.join(`${roomId[0]}__${roomId[1]}`);
        }
      });

    router.get('/messages/:receiver', authenticateTokenMiddleware, async (req, res) => {
        const sender = req.user.sub;
        const reseiver = req.params.receiver;
        const room = [sender, reseiver];
        const roomReversed = [reseiver, sender];
        console.log(room);
        try {
            const messages = await Message.find({ $or: [ { room }, { room: roomReversed }]});
            res.json(messages);
        } catch (err) {
            // reponse with the caught error
            console.log(err);
            sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
        }
    })
    
    router.post('/message', authenticateTokenMiddleware, async (req, res) => {
        const message = req.body;
        message.sender = req.user.sub;
        console.log("MESSAGE: ", message);
        const possibleId1 = [message.sender, message.receiver];
        const possibleId2 = [message.receiver, message.sender];
        try {
            const messageModel = new Message(message);
            const created = await messageModel.save();
            const initialMessage = await Message.findOne({ $or: [ { room: possibleId1 }, { room: possibleId2 }]});
            if (!initialMessage) {
                throw {
                    message: "Room not found!!!",
                };
            }
            message.room = initialMessage.room;
            const roomId = message.room;
            // io.soc
            console.log("TO_ROOM: ", `${roomId[0]}__${roomId[1]}`);
            io.to(`${roomId[0]}__${roomId[1]}`).emit("message", message);
            // io.sockets.emit("message", message);
            res.sendStatus(200);
        } catch (err) {
            // reponse with the caught error
            console.log(err);
            sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
        }
    });

    return router;
};