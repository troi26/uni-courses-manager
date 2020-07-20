const jwt = require('jsonwebtoken');
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../utils/db');
const { Router } = require('express');
const e = require('express');
const sendErrorResponse = require("./utils").sendErrorResponse;
const roles = require('../models/user').roles;
const authenticateTokenMiddleware = require('../middlewares/auth.middleware');
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
        sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
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
    const users = await User.find();

    res.json(users);
});

// get user by username
router.get("/:username", authenticateTokenMiddleware, async (req, res) => {
    const username = req.params.username;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            throw {
                message: "User with selected username does not exist."
            };
        }
        res.json(user);
    } catch (err) {
        sendErrorResponse(req, res, 500, err.message, err);
    }
});

// delete user by username if admin or yourself
router.delete("/:username", authenticateTokenMiddleware, async (req, res) => {
    const myUsername = req.body.username;
    const username = req.params.username;
    if (myUsername === username) {
        const deletedUser = await User.deleteOne({ username });
        res.status(200).location("http://localhost:9010/api/users/auth/login").json(deletedUser);
        return;
    }

    const myRole = req.body.role;
    if (myRole === roles.ADMIN) {
        const deletedUser = await User.deleteOne({ username });
        res.json(deletedUser);

        // TODO: Check if JWT invalidation needed here!!!
        return;
    }
    
    sendErrorResponse(req, res, 500, "Not authorized to delete a user other than yourself!", err);

});

// modify user data if myself or admin
router.put("/:username", authenticateTokenMiddleware, async (req, res) => {
    const newData = req.body;
    const username = req.params.username;
    try {
        // Username changes are not permitted
        if (newData.username !== username) {
            throw {
                message: "'Username' can not be changed!"
            };
            return;
        }
        // Check if new password send
        const user = await User.findOne({ username });
        if (!bcrypt.compareSync(newData.password, user.password)) {
            newData.password = bcrypt.hashSync(newData.password, 10);
        }

        const result = await User.update(newData);

        // TODO: Check if JWT refresh needed here!!!

        res.json(result);
    } catch (err) {
        sendErrorResponse(req, res, 500, err.message, err);
    }
});

module.exports.router = router;