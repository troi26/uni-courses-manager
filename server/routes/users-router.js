const jwt = require('jsonwebtoken');
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../utils/db');
const { Router } = require('express');
const e = require('express');
const sendErrorResponse = require("./utils").sendErrorResponse;
const roles = require('../models/user').roles;
const authenticateTokenMiddleware = require('../middlewares/auth.middleware');
const { sendModeValidationErrorResponse } = require('./utils');
const User = db.user;

const router = express.Router();

// register new user
router.post('/auth/register', async function (req, res) {
    // validate user`s data
    const user = req.body;
    try {
        const response = await User.findOne({ username: user.username });
        if (response) {
            console.log("FOUND: ", response);
            throw {
                message: 'Username "' + user.username + '" is already taken'
            };
        } else {
            console.log("not found");
        }
    
        const userDoc = new User(user);
    
        // hashing the password
        if (user.password) {
            userDoc.password = bcrypt.hashSync(user.password, 10);
        }

        console.log(userDoc);

        // try to save user
        const created = await userDoc.save();
        res.status(201).location(`/api/users/${created.id}`).json(created);
        
    } catch (err) {
        // reponse with the caught error
        console.log(err);
        sendModeValidationErrorResponse(req, res, 500, `${err.message}`, err);
    }
});

// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZjExYTA2ODczYjI3YzRlNThhZjZhMjQiLCJpYXQiOjE1OTUxNjAzMTIsImV4cCI6MTU5NTc2NTExMn0.WM9gMWIjgXJrnXObeTmg4jKtX2wYH2TGOH_B5kwyU0w"
router.post("/auth/login", async (req, res) => {
    const credentials = req.body;
    console.log("CREDENTIALS: ", credentials);
    const user = await User.findOne({ username: credentials.username });
    if (user && bcrypt.compareSync(credentials.password, user.password)) {
        console.log("SECRET: ", process.env.JWT_SECRET);
        const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({
            ...user.toJSON(),
            token
        });
    } else {
        sendErrorResponse(req, res, 500, 'Incorrect username or password.', {
            view: 'login',
            fields: ["username", "password"],
        });
    }
});

// get all users
router.get("/", authenticateTokenMiddleware, async (req, res) => {
    console.log("GET ALL USERS:");
    const users = await User.find();
    console.log(users);
    res.json(users);
});

// get user by username
router.get("/:userId", authenticateTokenMiddleware, async (req, res) => {
    const userId = req.params.userId;
    const loggedId = req.user.sub;
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw {
                message: "User with selected ID does not exist."
            };
        }
        res.json(user);
    } catch (err) {
        sendErrorResponse(req, res, 500, err.message, err);
    }
});

// delete user by username if admin or yourself
router.delete("/:userId", authenticateTokenMiddleware, async (req, res) => {
    const loggedId = req.user.sub;
    const userId = req.params.userId;
    try {
        const logged = await User.findById(loggedId);

        if (logged.roles.includes(roles.ADMIN) || logged.id === userId) {
            const deletedUser = await User.findByIdAndDelete(userId);
            res.json(deletedUser);
        } else {
            throw {
                message: "Not authorized to delete users",
                customCode: 401,
            };
        } 
            
    } catch (err) {
        sendErrorResponse(req, res, err.customCode ? err.customCode : 500, "Not authorized to delete a user other than yourself!", err);

    }
});

// modify user data if myself or admin
router.put("/:userId", authenticateTokenMiddleware, async (req, res) => {
    const newData = req.body;
    const userId = req.params.userId;
    const loggedId = req.user.sub;
    try {
        // Check if new password send
        const user = await User.findById(userId);
        const logged = await User.findById(loggedId);
        // Username changes are not permitted

        if (loggedId !== userId && !logged.roles.includes(roles.ADMIN)) {
            throw {
                message: "Not authorized for this action.",
                customCode: 401,
            }
        }

        if (newData.username !== user.username) {
            throw {
                message: "'Username' can not be changed!"
            };
        }

        if (!bcrypt.compareSync(newData.password, user.password)) {
            newData.password = bcrypt.hashSync(newData.password, 10);
        }

        console.log(user);
        await User.findByIdAndUpdate(newData.id, newData);

        res.json(newData);
    } catch (err) {
        sendErrorResponse(req, res, err.customCode ? err.customCode : 500, err.message, err);
    }
});

router.patch('/auth/passwordchange/:userId/:currentPassword/:newPassword', authenticateTokenMiddleware, async (req, res) => {
    const newData = req.body;
    const userId = req.params.userId;
    const currentPassword = req.params.currentPassword;
    const newPassword = req.params.newPassword;
    try {
        // Check if new password send
        const user = await User.findById(userId);
        // Username changes are not permitted
        console.log(user, currentPassword);
        if (!bcrypt.compareSync(currentPassword, user.password)) {
            throw {
                message: "Current password does not match."
            };
        }

        let newPasswordHash = user.password;
        if (!bcrypt.compareSync(newPassword, user.password)) {
            newPasswordHash = bcrypt.hashSync(newPassword, 10);
        }
            
        await User.findByIdAndUpdate(userId, {$set: {password: newPasswordHash}});

        res.json({
            token: newPasswordHash
        });
    } catch (err) {
        sendErrorResponse(req, res, 500, err.message, err);
    }
})

module.exports.router = router;