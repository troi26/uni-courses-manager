const jwt = require('jsonwebtoken');
var moment = require('moment');
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../utils/db');
const { Router } = require('express');
const e = require('express');
const { user } = require('../utils/db');
const sendErrorResponse = require("./utils").sendErrorResponse;
const roles = require('../models/user').roles;
const Course = db.course;
const User = db.user;

const router = express.Router();

const specialties = {
    CS: "Computer Sciences",
    I: "Informatics",
    M: "Mathematics",
    SE: "Software Engineering",
    IS: "Informational Systems",
    AM: "Applied Mathematics"
};

router.post('/:userId', async function (req, res) {
    // validate user`s data
    const course = req.body;
    const userId = req.params.userId;
    try {
        console.log(userId);
        const user = await User.findById(userId);
        if (!user.roles.includes(roles.ADMIN) && !user.roles.includes(roles.TEACHER)) {
            throw {
                message: "Not authorized to add courses."
            }
        }
        if (!Object.keys(specialties).includes(course.targetSpeciality)) {
            throw {
                message: "Unknown specialty",
            }
        }
        const response = await Course.findOne({ name: course.name });
        if (response) {
            console.log("FOUND: ", response);
            throw {
                message: 'Course name "' + course.name + '" is already taken'
            };
        } else {
            console.log("not found");
        }
    
        const courseDoc = new Course(course);

        // try to save user
        const created = await courseDoc.save();
        res.status(201).location(`/api/courses/${created.id}`).json(created);
        
    } catch (err) {
        // reponse with the caught error
        console.log(err);
        sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
    }
});

router.get('/', async function (req, res) {
    // validate user`s data
    try {
        const result = await Course.find();
        res.json(result);
    } catch (err) {
        // reponse with the caught error
        console.log(err);
        sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
    }
});

router.get('/:courseId', async function (req, res) {
    const courseId = req.params.courseId;
    try {
        const course = await Course.findById(courseId);
        if (!course) {
            throw {
                message: "Wanted course does not exists."
            };
        }
        res.json(course);
    } catch (err) {
        sendErrorResponse(req, res, 500, err.message, err);
    }
});

router.get('/lecturer/:userId', async function (req, res) {
    const userId = req.params.userId;
    try {
        const courses = await Course.find({ lecturers: userId });
        const coursesOwned = await Course.find({ owner: userId });
        res.json(courses.concat(coursesOwned));
    } catch (err) {
        sendErrorResponse(req, res, 500, err.message, err);
    }
});

router.put('/:userId/:courseId', async function (req, res) {
    const userId = req.params.userId;
    const courseId = req.params.courseId;
    const modifiedCourse = req.body;

    try {
        if (courseId !== course) {
            throw {
                message: "Course`s id and the path id are different.",
            }
        }

        const user = await User.findById(userId);
        
        if (userId !== course.owner && !user.roles.includes(roles.ADMIN)) {
            throw {
                message: "Not authorized for this action."
            };
        }

        const exist = await Course.findById(courseId);
        if (!exist) {
            throw {
                message: "Wanted course does not exists."
            }
        }
        if (exist.owner !== modifiedCourse.owner) {
            throw {
                message: "To change the owner of the course please use \"/api/course/transfer/{courseId}/{userFrom}/{userTo}\" call."
            }
        }

        const modifiedCourseModel = new Course(course);

        const modified = await Course.updateOne(modifiedCourseModel);
        res.json(modified);
    } catch (err) {
        sendErrorResponse(req, res, 500, err.message, err);
    }
});

router.patch("/transfer/:courseId/:userFrom/:userTo", async function (req, res) {
    const userFromId = req.params.userFrom;
    const userToId = req.params.userTo;
    const courseId = req.params.courseId;
    try {
        const course = await Course.findById(courseId);
        const userFrom = await User.findById(userFromId);
        const userTo = await User.findById(userToId);

        if (!userFrom) {
            throw {
                message: "Owner can not be found."
            }
        }

        if (!userTo) {
            throw {
                message: "Targeted owner does not exist."
            }
        }
    
        if (userFromId !== course.owner && !userFrom.roles.includes(roles.ADMIN)) {
            throw {
                message: "Not authorized for this action."
            }
        }

        course.owner = userToId;
        const modified = new Course(course);

        await Course.updateOne(modified);
        res.json(modified);
    } catch (err) {
        sendErrorResponse(req, res, 500, err.message, err);
    }
});

// Remove a course if its yours or if you are an admin
router.delete('/:userId/:courseId', async function (req, res) {
    const userId = req.params.userId;
    const courseId = req.params.courseId;
    try {
        const user = await User.findById(userId);

        const course = await Course.findById(courseId);
        
        if (userId !== course.owner && !user.roles.includes(roles.ADMIN)) {
            throw {
                message: "Not authorized for this action."
            };
        }

        if (!course) {
            throw {
                message: "Wanted course does not exists."
            };
        }

        if (moment(course.startDate).diff(moment(), 'seconds') <= 0) {
            throw {
                message: "This course has already started."
            };
        }

        const removed = await Course.findOneAndRemove({ _id: courseId });
        res.json(removed);
    } catch (err) {
        sendErrorResponse(req, res, 500, err.message, err);
    }
});

// Enrol for the course
router.patch("/enroll/:courseId/:userId", async function (req, res) {
    const courseId = req.params.courseId;
    const userId = req.params.userId;

    try {
        const user = await User.findById(userId);
        const course = await Course.findById(courseId);
        if (!user) {
            throw {
                message: "Specified user does not exist.",
            };
        }

        if (!user.roles.includes(roles.STUDENT)) {
            throw {
                message: "Specified user has to be a student.",
            };
        }

        if (!course) {
            throw {
                message: "Specified course does not exist.",
            };
        }

        if (moment(course.startDate).diff(moment(), 'seconds') <= 0) {
            throw {
                message: "This course has already started."
            };
        }

        course.enrolments = course.enrolments.filter(e => e !== userId).concat([userId]);

        const modified = new Course(course);
        await Course.updateOne(modified)
        res.json(modified);

    } catch (err) {
        sendErrorResponse(req, res, 500, err.message, err);
    }
});

// Close course enrolment
router.patch("/cancelenrollment/:courseId/:userId", async function (req, res) {
    // Check if logged user is owner of the course or a lecturer of it
    const courseId = req.params.courseId;
    const userId = req.params.userId;

    try {
        const course = await Course.findById(courseId);

        if (!course) {
            throw {
                message: "Specified course does not exist.",
            };
        }

        if (moment(course.startDate).diff(moment(), 'seconds') <= 0) {
            throw {
                message: "Can not cancel your enrollment, because this course has already been started."
            };
        }

        course.enrolments = course.enrolments.filter(e => e !== userId);

        const modified = new Course(course);
        await Course.updateOne(modified)
        res.json(modified);
    } catch (err) {
        sendErrorResponse(req, res, 500, err.message, err);
    }
});

module.exports = router;