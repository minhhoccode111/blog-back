const RateLimit = require('express-rate-limit');
const createError = require('http-errors');
const compression = require('compression');
const express = require('express');
const logger = require('morgan');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');

const debug = require('debug')('xxxxxxxxxxxxxxxxxxxx-debug-xxxxxxxxxxxxxxxxxxxx');

// connect database
const mongoose = require('mongoose');
// not throw an error when we try to query the property that not explicitly defined on Schema
mongoose.set('strictQuery', false);
// development database string
const dev_db_url = '';

// if production db is not defined then use the development
const mongoDB = process.env.MONGODB_URI || dev_db_url;

main()
  .then(() => debug('connected to database'))
  .catch((err) => debug('an error occur: ', err));

async function main() {
  await mongoose.connect(mongoDB);
}

// db models, for authentication
const User = require('./src/models/user');

const app = express();

// reduce fingerprinting
app.disable('x-powered-by');

// rate limit // TODO change to 20 in production
const limiter = RateLimit({ windowMs: 1 * 60 * 1000, max: 200 }); // max 200/min
app.use(limiter);

// compress responses for performance
app.use(compression());

// security HTTP header
app.use(helmet());

// basic setup
app.use(logger('dev')); // logger
app.use(express.json()); // parse json to js object
app.use(express.urlencoded({ extended: false })); //  parse form data
app.use(express.static(path.join(__dirname, 'public'))); // server things in public

// passport to authenticate a jwt
const passport = require('passport');
// will be call jwt.sign() to create a object, and secret and option like algorithm and time expire
const jwt = require('jsonwebtoken');
// a passport strategy to authentication by passport.use(new JwtStrategy(options, verify))
const JwtStrategy = require('passport-jwt').Strategy;
// to choose ways to extract json web token from request
const ExtractJwt = require('passport-jwt').ExtractJwt;
// option jwt
const options = {
  // extract json web token using Bearer in header
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  // secret
  secretOrKey: process.env.SECRET,
};

app.use(passport.initialize());

// This is called when passport.authenticate() middleware is called in /login route
// to use jwt strategy and verify user
passport.use(
  new JwtStrategy(options, async (payload, done) => {
    try {
      const user = await User.findOne({ username: payload.username }).exec();
      if (!user) return done(null, false);
      return done(null, user); // user can be accessed req.user in the following middleware chain
    } catch (err) {
      return done(err, false);
    }
  })
);

// handle login
app.post('/login', async (req, res, next) => {
  // extract data from form
  const username = req.body.username;
  const password = req.body.password;
  // check valid login
  const user = await User.findOne({ username }).exec();
  const valid = await bcrypt.compare(password, user?.password);
  if (user === null || !valid) {
    res.status(401).json({ message: 'Auth failed' });
  } else {
    const token = jwt.sign({ username }, process.env.SECRET, { expiresIn: 120 });
    res.status(200).json({
      message: 'Auth passed',
      token,
    });
  }
});

// handle signup
app.post('/signup', (req, res) => {
  // TODO
});

// handle posts
const postsRoute = require('./src/routes/posts'); // post related TODO
const { create } = require('domain');
app.use('/posts', passport.authenticate('jwt', { session: false }), postsRoute); // route for api

// if no route handle the request mean it a 404
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  // we can only access the err object in res.locals.error if development, else it's an empty object
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // log the error
  debug(`the error object: `, err);

  // send the error json to client
  res.status(err.status || 500).json({ message: err.message });
});

module.exports = app;
