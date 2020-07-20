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

router.get('/:username', async function(req, res) {
    const username = req.params.username;

    try {
        const grades = await Grade.findOne({ username });
        res.json(grades);
    } catch (err) {
        // reponse with the caught error
        console.log(err);
        sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
    }
});

router.get('/:username/:courseId', async function(req, res) {
    const username = req.params.username;
    const courseId = req.params.courseId;

    try {
        const grades = await Grade.findOne({ username, courseId });
        res.json(grades);
    } catch (err) {
        // reponse with the caught error
        console.log(err);
        sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
    }
});

router.post('/', async function(req, res) {
    const grade = req.body;

    try {
        const course = await Course.findById(grade.courseId);
        if (!course) {
            throw {
                message: `Course with ID=${grade.courseId} does not exists.`
            };
        }
        const student = await Course.findById(grade.username);
        if (!student || !student.roles.includes(roles.STUDENT)) {
            throw {
                message: `Student with username=${grade.username} does not exists.`
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

        const course = await User.findById(grade.username);
        if (!course) {
            throw {
                message: `Student with username=${grade.username} does not exists.`
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

// try {

// } catch (err) {
//     // reponse with the caught error
//     console.log(err);
//     sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
// }