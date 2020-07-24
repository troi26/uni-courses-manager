const jwt = require('jsonwebtoken');
var moment = require('moment');
const express = require('express');
const db = require('../utils/db');
const { Router } = require('express');
const e = require('express');
const { user } = require('../utils/db');
const sendErrorResponse = require("./utils").sendErrorResponse;
const roles = require('../models/user').roles;
const Course = db.course;
const User = db.user;
const Grade = db.grade;


const router = express.Router();

router.get('/', async function(req, res) {
    try {
        const grades = await Grade.find();
        res.json(grades);
    } catch (err) {
        // reponse with the caught error
        console.log(err);
        sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
    }
});

router.get('/:gradeId', async function(req, res) {
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

router.get('/byuser/:userId', async function(req, res) {
    const userId = req.params.userId;

    try {
        const grades = await Grade.find({ userId });
        res.json(grades);
    } catch (err) {
        // reponse with the caught error
        console.log(err);
        sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
    }
});

router.get('/bycourse/:courseId', async function(req, res) {
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

router.get('/user/:userId/:courseId', async function(req, res) {
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

// router.get('/bycourses/bycourses/bycourses', async (req, res) => {
//     const courseIds = req.query.courseIds;
//     console.log(courseIds);
//     // for (let id of courseIds) {
//     //     console.log(id);
//     // }
//     // const courseIds = req.params.courseIds;
//     try {
//         // const grades = await Grade.find({courseId: { $in: courseIds }});
//         const grade = await Grade.findOne({courseId: courseIds[0]});
//         return grade;
//     } catch (err) {
//         // reponse with the caught error
//         console.log(err);
//         sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
//     }
// });

router.post('/', async function(req, res) {
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


router.put('/:userId/:gradeId', async function(req, res) {
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

router.delete('/:gradeId', async (req, res) => {
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