const jwt = require('jsonwebtoken');
var moment = require('moment');
const express = require('express');
const db = require('../utils/db');
const { Router } = require('express');
const e = require('express');
const { user } = require('../utils/db');
const sendErrorResponse = require("./utils").sendErrorResponse;
const authenticateTokenMiddleware = require('../middlewares/auth.middleware');
const roles = require('../models/user').roles;
const Course = db.course;
const User = db.user;
const Grade = db.grade;


const router = express.Router();

router.get('/', authenticateTokenMiddleware, async function(req, res) {
    try {
        const grades = await Grade.find();
        res.json(grades);
    } catch (err) {
        // reponse with the caught error
        console.log(err);
        sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
    }
});

router.get('/:gradeId', authenticateTokenMiddleware, async function(req, res) {
    const gradeId = req.params.gradeId;

    try {
        const grades = await Grade.findById(gradeId);
        res.json(grades);
    } catch (err) {
        // reponse with the caught error
        console.log(err);
        sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
    }
});

router.get('/byuser/:userId', authenticateTokenMiddleware, async function(req, res) {
    const userId = req.params.userId;
    const loggedId = req.user.sub;

    try {
        if (loggedId !== userId) {
            throw {
                message: "User can see just his own grades."
            }
        }
        const grades = await Grade.find({ userId });
        res.json(grades);
    } catch (err) {
        // reponse with the caught error
        console.log(err);
        sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
    }
});

router.get('/bycourse/:courseId', authenticateTokenMiddleware, async function(req, res) {
    const courseId = req.params.courseId;

    try {
        const grades = await Grade.find({ courseId });
        res.json(grades);
    } catch (err) {
        // reponse with the caught error
        console.log(err);
        sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
    }
});

router.get('/user/:userId/:courseId', authenticateTokenMiddleware, async function(req, res) {
    const userId = req.params.userId;
    const courseId = req.params.courseId;

    try {
        const grades = await Grade.findOne({ userId, courseId });
        res.json(grades);
    } catch (err) {
        // reponse with the caught error
        console.log(err);
        sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
    }
});

router.post('/', authenticateTokenMiddleware, async function(req, res) {
    const grade = req.body;
    console.log(grade);

    try {
        const course = await Course.findById(grade.courseId);
        if (!course) {
            throw {
                message: `Course with ID=${grade.courseId} does not exists.`
            };
        }
        const student = await User.findById(grade.userId);
        if (!student || !student.roles.includes(roles.STUDENT)) {
            throw {
                message: `Student with ID=${grade.userId} does not exists.`
            };
        }

        const gradeModel = new Grade(grade);
        const created = await gradeModel.save();
        res.json(created);
    } catch (err) {
        // reponse with the caught error
        console.log(err);
        sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
    }
});


router.put('/:userId/:gradeId', authenticateTokenMiddleware, async function(req, res) {
    const grade = req.body;
    const gradeId = req.params.gradeId;
    const userId = req.params.userId;

    try {
        if (gradeId !== grade.id) {
            throw {
                message: 'Path Id does not match the id field.',
            };
        }
        const prevGrade = await Grade.findById(gradeId);
        if (!prevGrade) {
            throw {
                message: `Grade with ID=${gradeId} does not exists.`
            };
        }

        if (prevGrade.courseId !== grade.courseId) {
            throw {
                message: `Can not change the course of the grade.`
            };
        }

        const course = await Course.findById(grade.courseId);
        if (!course) {
            throw {
                message: `This course does not exists.`
            };
        }

        const user = await User.findById(userId);
        if (!user) {
            throw {
                message: `Student with ID=${userId} does not exists.`
            };
        }

        await Grade.findByIdAndUpdate(prevGrade._id, grade);

        res.json(grade);
    } catch (err) {
        // reponse with the caught error
        console.log(err);
        sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
    }
});

router.delete('/:gradeId', authenticateTokenMiddleware, async (req, res) => {
    const gradeId = req.params.gradeId;
    
    try {
        const grade = await Grade.findById(gradeId);
        if (!grade) {
            throw {
                message: `Grade with ID=${gradeId} does not exists.`
            };
        }


        const deleted = await Grade.findByIdAndDelete(gradeId);
        res.json(deleted);
    } catch (err) {
        // reponse with the caught error
        console.log(err);
        sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
    }
});

module.exports = router;
// try {

// } catch (err) {
//     // reponse with the caught error
//     console.log(err);
//     sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
// }