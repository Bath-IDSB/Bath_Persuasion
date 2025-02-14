/**
 * Module dependencies.
 */
const express = require('express');
const _ = require('lodash');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
var schedule = require('node-schedule');

const multer = require('multer');
//Math.random().toString(36)+'00000000000000000').slice(2, 10) + Date.now()

var m_options = multer.diskStorage({ destination : path.join(__dirname, 'uploads') ,
  filename: function (req, file, cb) {
    var prefix = req.user.id + Math.random().toString(36).slice(2, 10);
    cb(null, prefix + file.originalname.replace(/[^A-Z0-9]+/ig, "_"));
  }
});

var userpost_options = multer.diskStorage({ destination : path.join(__dirname, 'uploads/user_post') ,
  filename: function (req, file, cb) {
    var lastsix = req.user.id.substr(req.user.id.length - 6);
    var prefix = lastsix + Math.random().toString(36).slice(2, 10);
    cb(null, prefix + file.originalname.replace(/[^A-Z0-9]+/ig, "_"));
  }
});

var useravatar_options = multer.diskStorage({ destination : path.join(__dirname, 'uploads/user_post') ,
  filename: function (req, file, cb) {
    var prefix = req.user.id + Math.random().toString(36).slice(2, 10);
    cb(null, prefix + file.originalname.replace(/[^A-Z0-9]+/ig, "_"));
  }
});

//const upload = multer({ dest: path.join(__dirname, 'uploads') });
const upload= multer({ storage: m_options });
const userpostupload= multer({ storage: userpost_options });
const useravatarupload= multer({ storage: useravatar_options });

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: '.env' });

/**
 * Controllers (route handlers).
 */
const actorsController = require('./controllers/actors');
const scriptController = require('./controllers/script');
const homeController = require('./controllers/home');
const userController = require('./controllers/user');
const notificationController = require('./controllers/notification');
const apiController = require('./controllers/api');
//const contactController = require('./controllers/contact');

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise;

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
//mongoose.connect(process.env.MONGOLAB_TEST || process.env.PRO_MONGOLAB_URI, { useMongoClient: true });
//mongoose.connect(process.env.MONGOLAB_TEST || process.env.MONGOLAB_URI, { useNewUrlParser: true });
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

// Try to prevent app crash in case of uncaught exceptions or unhandeled rejects. 
process.on('uncaughtException', (error, origin) => {
    console.log('----- Uncaught exception -----')
    console.log(error)
    console.log('----- Exception origin -----')
    console.log(origin)
})

process.on('unhandledRejection', (reason, promise) => {
    console.log('----- Unhandled Rejection at -----')
    console.log(promise)
    console.log('----- Reason -----')
    console.log(reason)
})

/*********************************************************************************************
                    CRON JOBS  Check if users are still active 12 and 20
*********************************************************************************************/

var rule = new schedule.RecurrenceRule();

rule.second = new schedule.Range(0, 59, 5);
//rule.minute = new schedule.Range(0, 59, 1);
schedule.scheduleJob(rule, function()
{
  //console.log(rule);
  console.log('@@@@@@######@@@@@@@@#########@@@@@@@@@@@@########');
  console.log('@@@@@@######@@@@Checking active users!!!!!');
  console.log('@@@@@@######@@@@@@@@#########@@@@@@@@@@@@########');
  userController.stillActive();
});

/******************************************************************************************
                                 Express configuration.
 *****************************************************************************************/
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(expressStatusMonitor());
//app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true, parameterLimit: 100000, limit: '50mb',}));
app.use(bodyParser.urlencoded({ extended: true}));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  rolling: false,
  cookie: {
    path: '/',
    httpOnly: true,
    secure: false,
    maxAge: (20*60*1000) // 20 for the session
    //maxAge: 7200000 
  },
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    url: process.env.MONGOLAB_TEST || process.env.MONGOLAB_URI,
    autoReconnect: true,
    clear_interval: 3600
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req, res, next) => {
  if ((req.path === '/api/upload') || (req.path === '/post/new') || (req.path === '/account/profile') || (req.path === '/account/signup_info_post')) {
    console.log("Not checking CSRF - out path now");
    //console.log("@@@@@request is " + req);
    next();
  } else {
    lusca.csrf()(req, res, next);
  }
});

app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user &&
      req.path !== '/login' &&
      req.path !== '/signup' &&
      req.path !== '/bell' &&
      !req.path.match(/^\/auth/) &&
      !req.path.match(/\./)) {
    console.log("@@@@@path is now");
    console.log(req.path);
    req.session.returnTo = req.path;
  } else if (req.user &&
      req.path == '/account') {
    console.log("!!!!!!!path is now");
    console.log(req.path);
    req.session.returnTo = req.path;
  }
  next();
});

var csrf = lusca({ csrf: true });

function check(req, res, next) {
    console.log("@@@@@@@@@@@@Body is now ");
    console.log(req.body);
    next();
}

app.use('/public',express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
app.use('/semantic',express.static(path.join(__dirname, 'semantic'), { maxAge: 31557600000 }));
app.use(express.static(path.join(__dirname, 'uploads'), { maxAge: 31557600000 }));
app.use('/post_pictures', express.static(path.join(__dirname, 'post_pictures'), { maxAge: 31557600000 }));
app.use('/profile_pictures',express.static(path.join(__dirname, 'profile_pictures'), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */

app.get('/', passportConfig.isAuthenticated, scriptController.getScript);
app.post('/post/new', userpostupload.single('picinput'), check, csrf, scriptController.newPost);

app.post('/account/profile', passportConfig.isAuthenticated, useravatarupload.single('picinput'), check, csrf, userController.postUpdateProfile);
//app.post('/api/upload', upload.single('myFile'), apiController.postFileUpload);

/*app.get('/tos', function (req, res) {
  res.render('tos', {
    title: 'TOS'
  });
})*/

app.get('/com', function (req, res) { //comunity rules for ll group
  res.render('com', {
    title: 'Community Rules'
  });
});

/*app.get('/comll', function (req, res) { //commmunity rules for the lh group
  res.render('comll', {
    title: 'Community Rules'
  });
});

app.get('/comlh', function (req, res) { //commmunity rules for the lh group
  res.render('comlh', {
    title: 'Community Rules'
  });
});

app.get('/comhl', function (req, res) { //commmunity rules for the hl group
  res.render('comhl', {
    title: 'Community Rules'
  });
});


app.get('/comhh', function (req, res) { //commmunity rules for the hh group
  res.render('comhh', {
    title: 'Community Rules'
  });
});*/

app.get('/info',passportConfig.isAuthenticated, function (req, res) {
  res.render('info', {
    title: 'User Docs'
  });
});

app.get('/profile_info', passportConfig.isAuthenticated, function (req, res) {
  res.render('profile_info', {
    title: 'Profile Introductions'
  });
});

//User's Page
app.get('/me', passportConfig.isAuthenticated, userController.getMe);

//app.get('/completed', userController.userTestResults);

app.get('/notifications', passportConfig.isAuthenticated, notificationController.getNotifications);

/*app.get('/test_comment', function (req, res) {  //Testing
  res.render('test', {
    title: 'Test Comments'
  });
});*/


/*app.get('/test_ui', function (req, res) {  //Testing
  res.render('test_ui', {
    title: 'Test UI Features'
  });
});*/


/*app.get('/thankyou', function (req, res) {  //Testing Adding user album 
  res.render('thankyou', {
    title: 'Thank you.'
  });
});*/

app.get('/login', userController.getSignup);
app.post('/login', userController.postSignup);

//app.get('/login', userController.getLogin);
//app.post('/login', userController.postLogin);

app.get('/logout', userController.logout);


//app.get('/forgot', userController.getForgot);
//app.post('/forgot', userController.postForgot);
//app.get('/reset/:token', userController.getReset);
//app.post('/reset/:token', userController.postReset);
//app.get('/signup', userController.getSignup);
//app.post('/signup', userController.postSignup);

app.get('/account/signup_info', passportConfig.isAuthenticated, userController.getSignupInfo);
app.post('/account/signup_info_post', passportConfig.isAuthenticated, useravatarupload.single('picinput'), check, csrf, userController.postSignupInfo);

app.post('/account/profile', passportConfig.isAuthenticated, useravatarupload.single('picinput'), check, csrf, userController.postUpdateProfile);

//app.get('/contact', contactController.getContact);
//app.post('/contact', contactController.postContact);

app.get('/account', passportConfig.isAuthenticated, userController.getAccount);
//app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);

//See actors
//app.get('/actors', actorsController.getActors); //list all actors [testing]

app.get('/user/:userId', passportConfig.isAuthenticated, actorsController.getActor);
app.post('/user', passportConfig.isAuthenticated, actorsController.postBlockOrReport);

app.get('/bell', passportConfig.isAuthenticated, userController.checkBell);

//getScript
app.get('/feed', passportConfig.isAuthenticated, scriptController.getScript);
app.post('/feed', passportConfig.isAuthenticated, scriptController.postUpdateFeedAction);
app.post('/pro_feed', passportConfig.isAuthenticated, scriptController.postUpdateProFeedAction);
app.post('/userPost_feed', passportConfig.isAuthenticated, scriptController.postUpdateUserPostFeedAction);

app.get('/user_status', passportConfig.isAuthenticated, userController.getStatus);
app.post('/post_status', passportConfig.isAuthenticated, userController.postStatus);

//get a list of script feed [for testing] 
//app.get('/scriptfeed', passportConfig.isAuthenticated, scriptController.getScriptFeed);

/**
 * API examples routes.
 */
//app.get('/api', apiController.getApi);

///Upload files and get them back
//app.get('/api/upload', apiController.getFileUpload);
//app.post('/api/upload', upload.single('myFile'), apiController.postFileUpload);

/**
 * Error Handler.
 */
app.use(errorHandler());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env')); 
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
