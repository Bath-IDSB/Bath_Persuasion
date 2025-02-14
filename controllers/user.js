const bluebird = require('bluebird');
const crypto = bluebird.promisifyAll(require('crypto'));
const nodemailer = require('nodemailer');
const passport = require('passport');
const moment = require('moment');
const User = require('../models/User');
const Notification = require('../models/Notification.js');

/****************************************************************************************************************
*                                       GET /login * Login page.
*****************************************************************************************************************/
exports.getLogin = (req, res) => 
{
  if (req.user) 
  {
    return res.redirect('/');
  }
  res.render('account/login', 
  {
    title: 'Login'
  });

};

/****************************************************************************************************************
*                                       Get Notifcation Bell signal
*****************************************************************************************************************/
exports.checkBell = (req, res) => 
{
  if (req.user) 
  {
    var user = req.user;

    Notification.find({ $or: [ { userPost: user.numPosts }, { actorReply: user.numActorReplies } ] })
    //Notification.find({ $or: [ { userPost: { $lte: user.numPosts } }, { actorReply: { $lte: user.numActorReplies } } ] })
        .populate('actor')
        .exec(function (err, notification_feed) 
        {
          if (err) 
            { 
              return next(err); 
            }
          if (notification_feed.length == 0)
          {
            //peace out - send empty page - 
            //or deal with replys or something IDK
            console.log("No User Posts yet. Bell is black");
            return res.send({result:false}); 
          }
          //We have values we need to check
          //When this happens
          else
          {
            for (var i = 0, len = notification_feed.length; i < len; i++) {

              //Do all things that reference userPost (read,like, actual copy of ActorReply)
              if (notification_feed[i].userPost >= 0)
              {
                var userPostID = notification_feed[i].userPost;
                //this can cause issues if not found - should check on later
                var user_post = user.getUserPostByID(userPostID);
                var time_diff = Date.now() - user_post.absTime;
                if (user.lastNotifyVisit)
                {
                  var past_diff = user.lastNotifyVisit - user_post.absTime;
                }
                
                else
                {
                  var past_diff = 0;
                }

                if(notification_feed[i].time <= time_diff && notification_feed[i].time > past_diff)
                {
                  
                  if ((notification_feed[i].notificationType == "read") && (user.transparency != "no"))
                    return res.send({result:true});
                  if (notification_feed[i].notificationType != "read")
                    return res.send({result:true});
                }

              }//UserPost

            }//for loop
            //end of for loop and no results, so no new stuff
            console.log("&&Bell Check&& End of For Loop, no Results")
            res.send({result:false});
          }
        });//Notification exec
  }
  else
  {
  console.log("No req.user")
  return res.send({result:false});
  }
}; //end of check bell

/*********************************************************************************************************** 
 *                               POST /login * Sign in using email and password.
 ***********************************************************************************************************/
exports.postLogin = (req, res, next) => 
{
  //req.assert('email', 'Email is not valid').isEmail();
  //req.assert('password', 'Password cannot be blank').notEmpty();
  //req.sanitize('email').normalizeEmail({ remove_dots: false });


  const errors = req.validationErrors();

  if (errors) 
  {
    req.flash('errors', errors);
    return res.redirect('/login');
  }

  passport.authenticate('local', (err, user, info) => 
  {
    if (err) { return next(err); }
    if (!user) 
    {
      req.flash('errors', info);
      return res.redirect('/login');
    }

    if (!(user.active)) 
    {
      console.log("FINAL");
      //Need to capture this in a var
      var post_url = process.env.POST_SURVEY+user.prolificID;
      console.log("last url is "+post_url)
      req.flash('final', { msg: post_url });
      return res.redirect('/login');
    }
    req.logIn(user, (err) => 
    {
      if (err) 
      { 
        return next(err); 
      }
      //req.flash('success', { msg: 'Success! You are logged in. Please be respectful to others.'});
      res.redirect(req.session.returnTo || '/');
    });
  })(req, res, next);
}; //end post login

/************************************************************************************************************
 *  GET /logout * Log out. TODO - add code to take survey?? or check if you have seen experinetal post yet
 ************************************************************************************************************/
exports.logout = (req, res) => 
{
  // Users can only logout after they finish their sessions
  if(!(req.user.active))
  {
    req.session.destroy();
    req.logout();
    res.redirect('/login');
  }
  else
  {
    res.redirect('/');
  }
};
/************************************************************************************************************
 *                                          GET /signup * Signup page.
 ************************************************************************************************************/
exports.getSignup = (req, res) => 
{
  if (req.user) 
  {
    return res.redirect('/');
  }
  res.render('account/signup', 
  {
    title: 'Create Account'
  });
};
/*************************************************************************************************************
 *                                  POST /signup * Create a new local account.
 *************************************************************************************************************/
exports.postSignup = (req, res, next) => 
{
  //req.assert('email', 'Email is not valid').isEmail();
  //req.assert('password', 'Password must be at least 4 characters long').len(4);
  //req.assert('confirmPassword', 'Passwords do not match').equals(req.body.prolificID);
  //req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) 
  {
    req.flash('errors', errors);
    return res.redirect('/signup');
  }

  /***************************************************************************************************
  *                                   Place Experimental Varibles Here!
  ****************************************************************************************************/
  //var var_num = 4;
  //var result = ['var1', 'var2','var3', 'var4'][Math.floor(Math.random() * var_num)]
 // var result = ['low:low', 'low:high','high:low', 'high:high'][Math.floor(Math.random() * 4)]
  
  //var resultArray = result.split(':');
  //[0] is script_type, [1] is post_nudge
 
  var var_num = 3;
  //var result = ['var1', 'var2','var3', 'var4'][Math.floor(Math.random() * var_num)]
  var result = ['control', 'consensus_lc','consensus_hc'][Math.floor(Math.random() * var_num)]

  const user = new User(
  {
    email: " ",
    password: " ",
    prolificID: req.body.prolificID,
    username: req.body.username,
    group: result,
    active: true,
    ui: 'no', //ui or no
    notify: "no", //no, low or high (not used anymore)
    //efficacy: resultArray[0], //low - high
    //responsibility: resultArray[1], // low - high
    lastNotifyVisit : (Date.now()),
    createdAt: (Date.now()),
    switchedOffAt: new Date("February 18, 1900 00:00:00") //Initial value
  });

  
   /*User.findOne({ prolificID: req.body.prolificID},{active: true}, (err, current) =>
   {
      if (err) 
        { 
          return next(err); 
        }
  
  console.log(current.active);
});*/

  User.findOne({ prolificID: req.body.prolificID, active: {$in:[true,false]}}, (err, existingUser) => 
  {
    if (err) 
    { 
      return next(err);
    }
    
    if (existingUser) 
    {

      if(existingUser.active)
      {
         console.log(existingUser.active);
         req.flash('errors', { msg: 'Account with this ID is currently active.' });
         return res.redirect('/login');
      }
      else
      {
        console.log("Account inactive (done the study) ");
        //Need to capture this in a var
        var post_url = process.env.POST_SURVEY+user.prolificID;
        console.log("last url is "+post_url)
        req.flash('final', { msg: post_url });
        return res.redirect('/login');
      }
    }

    user.save((err) => 
    {
      if (err) 
      { 
        return next(err); 
      }
      
      req.logIn(user, (err) => 
      {
        if (err) 
        {
          return next(err);
        }
        res.redirect('/account/signup_info');
      });
    });
  });
}; //end of post-sign-up 

/*************************************************************************************************************
 *                               POST /account/profile | /Update profile information.
 *************************************************************************************************************/
exports.postSignupInfo = (req, res, next) => 
{
  User.findById(req.user.id, (err, user) => 
  {
    if (err) 
    {
      return next(err); 
    }
    //user.email = req.body.email || '';
    user.profile.name = req.body.name || '';
    user.profile.location = req.body.location || '';
    user.profile.bio = req.body.bio || '';

    if (req.file)
    {
      console.log("Changeing Picture now to: "+ req.file.filename);
      user.profile.picture = req.file.filename;
    }

    user.save((err) => 
    {
      if (err) 
      {
        if (err.code === 11000) 
        {
          req.flash('errors', { msg: 'The email address you have entered is already associated with an account.' });
          return res.redirect('/signup_info');
        }
        return next(err);
      }
    //req.flash('success', { msg: 'Profile information has been updated.' });
    
    console.log("User Group:",user.group); //redirect to the assigned group.
    res.redirect('/com');
    });
  });
}; //end of post-signup-info

/****************************************************************************************************************
 *                                           GET /account | Profile page.
 ****************************************************************************************************************/
exports.getAccount = (req, res) => 
{
  res.render('account/profile', 
  {
    title: 'Account Management'
  });
};
/****************************************************************************************************************
 *                                          GET /signup_info | * Signup Info page.
 ****************************************************************************************************************/
exports.getSignupInfo = (req, res) => 
{
  res.render('account/signup_info', 
  {
    title: 'Add Information'
  });
};
/****************************************************************************************************************
 *                                          GET /account | * Profile page.
 ****************************************************************************************************************/
exports.getMe = (req, res) =>
{ 

/*User.findById(req.user.id).exec(function (err, user) 
  {
    if (!(req.user.active))
    {
      var post_url = process.env.POST_SURVEY+user.prolificID; 
      console.log("last url is "+post_url);
      req.logout();
      return res.redirect(post_url);
    }
  });*/

  User.findById(req.user.id)
  .populate({ 
       path: 'posts.reply',
       model: 'Script',
       populate: 
       {
         path: 'actor',
         model: 'Actor'
       } 
    })
  .populate({ 
       path: 'posts.actorAuthor',
       model: 'Actor'
    })
  .populate({ 
       path: 'posts.comments.actor',
       model: 'Actor'
    })
  .exec(function (err, user) 
  {
    if (err)
      {
        return next(err); 
      }

    if (!(user.active))
    {
      var post_url = process.env.POST_SURVEY+user.prolificID; 
      console.log("last url is "+post_url);
      req.logout();
      return res.redirect(post_url);
    }
    
      var allPosts = user.getPostsAndReplies();
      //var allPosts = user.getPosts();
      res.render('me', { posts: allPosts.reverse() });
  });
}; //end of get Me
/*****************************************************************************************************************
 *                                 POST /account/profile |  Update profile information.
 *****************************************************************************************************************/
exports.postUpdateProfile = (req, res, next) => 
{
  //req.assert('email', 'Please enter a valid email address.').isEmail();
  //req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) 
  {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  User.findById(req.user.id, (err, user) => 
  {
    if (err) 
      { 
        return next(err); 
      }
    //user.email = req.body.email || '';
    user.profile.name = req.body.name || '';
    user.profile.gender = req.body.gender || '';
    user.profile.location = req.body.location || '';
    user.profile.website = req.body.website || '';
    user.profile.bio = req.body.bio || '';

    if (req.file)
    {
      console.log("Changeing Picture now to: "+ req.file.filename);
      user.profile.picture = req.file.filename;
    }

    user.save((err) => 
    {
      if (err) 
      {
        if (err.code === 11000) 
        {
          req.flash('errors', { msg: 'The email address you have entered is already associated with an account.' });
          return res.redirect('/account');
        }
        return next(err);
      }
      req.flash('success', { msg: 'Profile information has been updated.' });
      res.redirect('/account');
    });
  }); //end findbyId
}; //end of post update profile


/******************************************************************************************************************
 *                                Turn off all old accounts (send final email). Groundhog admin accounts
 ******************************************************************************************************************/
exports.stillActive = () => 
{
  User.find().where('active').equals(true).exec(    
  function(err, users)
  {
    
    if (err) // handle error
    {
      console.log('failed: ' + err);
    } 
    else 
    {
      // Check all users
      for (var i = users.length - 1; i >= 0; i--) 
      {
        console.log("Looking at user: "+users[i].prolificID);      
        var time_diff = Date.now() - users[i].createdAt;

        var session_length = (17*60*1000);  // 2 mins extra to log users out

        console.log("Time passed: "+(time_diff/(60*1000)).toFixed(2) + " mins");  
        console.log("Session length: "+session_length/(60*1000)+" mins");
        console.log("--------------------------------------------------------");
        
        if (time_diff >= session_length)
        {
            if (users[i].isAdmin)
            {
              users[i].createdAt = Date.now();
              
              users[i].save((err) => 
              {
                if (err) 
                  { 
                    return next(err); 
                  }
              console.log("Switch over to new day");
              });
            }
            else  //normal user, turn off
            {
              users[i].active = false; 
              console.log("turning off user "+users[i].prolificID);
              //users[i].switchedOffAt = Date.now();
              var post_uri = process.env.POST_SURVEY+users[i].prolificID; 
              console.log("last uri is "+post_uri);

              users[i].save((err) => 
              {
                if (err) 
                { 
                  return next(err); 
                }
                console.log("Success in turning off");
              });
            } //end else (normal user)
        } //end IF Session margin.
      } //end of for  
    } //end of else (not error)     
  });
}; //end of stillActive

/// Check user status


exports.getStatus = (req, res, next) =>
{ 
  //User.find({}).select({"active":1}).exec(function(err, status){
    User.findById(req.user.id).select({"active":1,"prolificID":1}).exec(function(err, status){
        if(err){
            console.log(err);
        } else {
            res.send(status);
            console.log(status.prolificID,status.active);
        }
    });
}

// posting redirection time
exports.postStatus = (req, res, next) =>
{ 
  
 User.findById(req.user.id, (err, user) => 
  {
    if (err) 
      { 
        return next(err); 
      }
    user.switchedOffAt=req.body.finishTime;
    console.log("user finished @:",user.switchedOffAt);

  user.save((err) => 
    {
      if (err) 
      { 
        return next(err); 
      }
    });  //user.save(done);
    
  });
}

/*******************************************************************************************************************
 *                                  Basic information on Users that Finished the study
 *******************************************************************************************************************/
exports.userTestResults = (req, res) => 
{
  //if (!req.user.isAdmin) //only admin can do this
  //{
    //res.redirect('/');
  //}
  //else //we are admin
  //{
      User.find().where('active').equals(false).exec(
        function(err, users)
        {
        if (err) // handle error 
        {
          console.log('failed: ' + err);
        } 
        else 
      {
        // Check all active users
        
        for (var i = users.length - 1; i >= 0; i--) 
        {  
          console.log("@@@@@@@@@@Looking at user "+users[i].prolificID);      
          var time_diff = Date.now() - users[i].createdAt;
          var three_days = 259200000;
          var one_day =     86400000;
          
          //users[i].completed=false;
          if (!users[i].completed) //check if completed or not yet 
          {
            /*
            //check logs
            var day = [0,0,0];
            for (var j = users[i].log.length - 1; j >= 0; j--) {

              var logtime = users[i].log[j].time - users[i].createdAt;
              //console.log("logtime is "+logtime);
              

              //day one
              if (logtime <= one_day)
              {
                day[0]++;
                //console.log("!!!DAY1");
              }
              //day two
              else if ((logtime >=one_day) && (logtime <= (one_day *2))) 
              {
                day[1]++;
                //console.log("!!!DAY2");
              }
              //day 3
              else if ((logtime >=(one_day *2)) && (logtime <= three_days))
              {
                day[2]++;
                //console.log("!!!DAY3");
              }

            }//end of LOG for loop
          
            console.log("@@@@@@@@days are d1:"+day[0]+" d2:"+day[1]+" d3:"+day[2]);
            //Logged in at least twice a day, and posted at least 3 times
            */

           /*for (var j = users[i].blockAndReportLog.length - 1; j >= 0; j--) 
            {

              if(blockAndReportLog.p)
            }*/

           //if (users[i].numPosts >= 1 && users.numReplies>=1 && users.messaged.length>=1)
            if ((users[i].numPosts >= 0) && ((users[i].numReplies>=0)|| (users[i].numComments>=0) || 
               (users[i].numPostLikes>=1) || (users[i].numCommentLikes>=1) || (users[i].numPostFlags>=1) || 
               (users[i].numCommentFlags>=1) || (users[i].messaged.length>=1)||
               (users[i].blocked.length>=1)||(users[i].reported.length>=1))) 

            {
              users[i].completed = true;
              
              users[i].save((err) => 
              {
                if (err) 
                {
                  return next(err); 
                }
              console.log("I'm Finished!!!!");
              });
            }
          }//if User.completed
          
        }//for loop for all users!  

        res.render('completed', { users: users});
      }///else no error    
    });//User.Find()
  //}
}; //end of user test results.
