const express = require('express')
const usersRouter = require('./routes/users-router').router;
const coursesRouter = require('./routes/courses-router');
// const chatRouter = require('./routes/chat-router');
// const gradesRouter = require('./routes/grades-router');
const sendErrorResponse = require('./routes/utils.js').sendErrorResponse;
const db_name = 'courses-manager';

const db = require('./utils/db');

const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = 9010;

app.use(express.json({limit: '50mb'}));


app.use(function (err, req, res, next) {
    console.error(err.stack)
    sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err);
});

app
    .use('/api/courses', coursesRouter)
    // .use('/api/users/chat', chatRouter)
    // .use('/api/users/grades', gradesRouter)
    .use('/api/users', usersRouter);

const connectionOptions = { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false };
db.mongoose.connect("mongodb://localhost:27017/" + db_name, connectionOptions)
    .then(() => {
        console.log(`Connection established to ${db_name}.`);
            
        app.listen(port, () => {
            console.log(`Example app listening at http://localhost:${port}`)
        });
    });

// MongoClient.connect(url, { useUnifiedTopology: true }, function (err, con) {
//     if (err) throw err;
//     app.locals.db = con.db(db_name);
//     console.log(`Connection established to ${db_name}.`);
//     app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
// });