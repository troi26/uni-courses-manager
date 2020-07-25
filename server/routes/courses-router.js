const jwt = require('jsonwebtoken');
var moment = require('moment');
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../utils/db');
const e = require('express');
const sendErrorResponse = require("./utils").sendErrorResponse;
const authenticateTokenMiddleware = require('../middlewares/auth.middleware');
const roles = require('../models/user').roles;
const Course = db.course;
const User = db.user;
const Grade = db.grade;

const router = express.Router();

const specialties = {
    CS: "Computer Sciences",
    I: "Informatics",
    M: "Mathematics",
    SE: "Software Engineering",
    IS: "Informational Systems",
    AM: "Applied Mathematics"
};

router.post('/', authenticateTokenMiddleware, async function (req, res) {
    // validate user`s data
    const course = req.body;
    const userId = course.owner;
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

router.get('/user/enroled/:userId', authenticateTokenMiddleware, async function (req, res) {
    const loggedId = req.user.sub;
    const userId = req.params.userId;

    try {
        if (loggedId !== userId) {
            throw {
                message: "Logged user can see only the courses he is enroled into.",
            };
        }
        let courses = await Course.find();
        courses = courses.filter(c => c.enrolments.includes(userId));
        const courseIds = courses.map(c => c.id);
        const grades = await Grade.find({ $and: [ {userId: loggedId }, {courseId:{ $in: courseIds}}]});

        courses.map(c => {
            const grade = grades.find(g => g.courseId === c.id);
            return {
                ...c,
                grade: grade ? grade : null,
            };
        })

        res.json(courses);
    } catch (err) {
        // reponse with the caught error
        console.log(err);
        sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
    }
});

router.get('/', authenticateTokenMiddleware, async function (req, res) {
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

router.get('/:courseId', authenticateTokenMiddleware, async function (req, res) {
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

router.put('/:userId/:courseId', authenticateTokenMiddleware, async function (req, res) {
    console.log("HERE");
    const userId = req.params.userId;
    const courseId = req.params.courseId;
    const modifiedCourse = req.body;
    const loggedId = req.user.sub;

    try {
        if (courseId !== modifiedCourse.id) {
            throw {
                message: "Course`s id and the path id are different.",
            }
        }

        const logged = await User.findById(loggedId);
        
        if (loggedId !== modifiedCourse.owner && !logged.roles.includes(roles.ADMIN)) {
            throw {
                message: "Not authorized for this action."
            };
        }
        console.log(courseId);
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
        console.log(modifiedCourse);

        await Course.findByIdAndUpdate(courseId, modifiedCourse);
        res.json(modifiedCourse);
    } catch (err) {
        sendErrorResponse(req, res, 500, err.message, err);
    }
});

router.patch("/transfer/:courseId/:userFrom/:userTo", authenticateTokenMiddleware, async function (req, res) {
    const userFromId = req.params.userFrom;
    const userToId = req.params.userTo;
    const courseId = req.params.courseId;
    const loggedId = req.user.sub;
    try {
        const course = await Course.findById(courseId);
        const userFrom = await User.findById(userFromId);
        const userTo = await User.findById(userToId);
        const logged = await User.findById(loggedId);

        if (!loggedId) {
            throw {
                message: "Logged user can not be found."
            }
        }

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
    
        if (!(loggedId === userFromId && userFromId === course.owner) && !logged.roles.includes(roles.ADMIN)) {
            throw {
                message: "Not authorized for this action."
            }
        }

        course.owner = userToId;

        await Course.findByIdAndUpdate(courseId, course);
        res.json(course);
    } catch (err) {
        sendErrorResponse(req, res, 500, err.message, err);
    }
});

// Remove a course if its yours or if you are an admin
router.delete('/:userId/:courseId', authenticateTokenMiddleware, async function (req, res) {
    const userId = req.params.userId;
    const courseId = req.params.courseId;
    const loggedId = req.user.sub;
    try {

        const course = await Course.findById(courseId);
        const logged = await User.findById(loggedId);
        
        if (!(loggedId === userId && userId !== course.owner) && !logged.roles.includes(roles.ADMIN)) {
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

        const removed = await Course.findByIdAndRemove(courseId);
        res.json(removed);
    } catch (err) {
        sendErrorResponse(req, res, 500, err.message, err);
    }
});

// Enrol for the course
router.patch("/enrol/:courseId/:userId", authenticateTokenMiddleware, async function (req, res) {
    const courseId = req.params.courseId;
    const userId = req.params.userId;
    const loggedId = req.user.sub;

    try {
        const user = await User.findById(userId);
        const course = await Course.findById(courseId);
        const logged = await User.findById(loggedId);

        if (!user) {
            throw {
                message: "Specified user does not exist.",
            };
        }

        if (!logged) {
            throw {
                message: "Logged user does not exist.",
            };
        }

        if (loggedId !== userId && !logged.roles.includes(roles.ADMIN) &&
            loggedId !== course.owner) {
            throw {
                message: "Not authorized for this action.",
            };
        }

        if (!logged.roles.includes(roles.STUDENT)) {
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
            console.log(course, course.startDate, moment(course.startDate), moment());
            throw {
                message: "This course has already started."
            };
        }
        // console.log(course);

        course.enrolments = course.enrolments.filter(e => e !== userId).concat([userId]);

        await Course.findByIdAndUpdate(course._id, course)
        res.json(course);

    } catch (err) {
        sendErrorResponse(req, res, 500, err.message, err);
    }
});

// Close course enrolment
router.patch("/cancelenrolment/:courseId/:userId", authenticateTokenMiddleware, async function (req, res) {
    // Check if logged user is owner of the course or a lecturer of it
    const courseId = req.params.courseId;
    const userId = req.params.userId;
    const loggedId = req.user.sub;

    try {
        const course = await Course.findById(courseId);
        const logged = await User.findById(loggedId);

        if (!course) {
            throw {
                message: "Specified course does not exist.",
            };
        }

        if (loggedId !== userId && !logged.roles.includes(roles.ADMIN) &&
            loggedId !== course.owner) {
            throw {
                message: "Not authorized for this action.",
            };
        }

        if (moment(course.startDate).diff(moment(), 'seconds') <= 0) {
            throw {
                message: "Can not cancel your enrolment, because this course has already been started."
            };
        }

        course.enrolments = course.enrolments.filter(e => e !== userId);

        await Course.findByIdAndUpdate(course._id, course)
        res.json(course);
    } catch (err) {
        sendErrorResponse(req, res, 500, err.message, err);
    }
});

module.exports = router;