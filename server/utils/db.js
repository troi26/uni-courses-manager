const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// Configure db object
const db = {};

db.mongoose = mongoose;

db.user = require("../models/user").User;
db.course = require("../models/course");
db.grade = require("../models/grade").Grade;

db.ROLES = ["teacher", "admin", "student"];

module.exports = db;