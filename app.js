const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors')

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth')
const postRouter = require('./routes/posts')
const uploadRouter = require('./routes/upload')
const conversationRouter = require('./routes/conversation')
const messageRouter = require('./routes/messages')

const app = express();

const mongoose = require('mongoose')
const dotenv = require('dotenv')
const helmet = require('helmet')
const morgan = require('morgan')

dotenv.config()

// database connection
mongoose.connect(process.env.MONGO_URL, () => {
    console.log("MongoDB connection successful")
})

// serve static file
app.use('/api/images', express.static(path.join(__dirname, 'public/images')))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// middleware
app.use(cors())
app.options('*', cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet())
app.use(morgan("common"))

// route
app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/posts', postRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/conversations', conversationRouter)
app.use('/api/messages', messageRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
