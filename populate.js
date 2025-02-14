#! /usr/bin/env node

console.log('Started loading data to DB!!');

var async = require('async')
var Actor = require('./models/Actor.js');
var Script = require('./models/Script.js');
var Notification = require('./models/Notification.js');
const _ = require('lodash');
const dotenv = require('dotenv');
var mongoose = require('mongoose');
var fs = require('fs')
const CSVToJSON = require("csvtojson");

var actors_list
var posts_list
var comments_list
var notifications_list
var notifications_reply_list

/**********************************************************************************************
                              Sort out the DB connections
***********************************************************************************************/

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);

dotenv.config({ path: '.env' });

var MongoClient = require('mongodb').MongoClient , assert = require('assert');

mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
var db = mongoose.connection;
mongoose.connection.on('error', (err) => 
{
    console.error(err);
    console.log('%s MongoDB connection error. Please make sure MongoDB is running.');
    process.exit(1);
});
 
/*************************************************************************************************
                                  Functions for different taks
*************************************************************************************************/
String.prototype.capitalize = function () // capitalize a string
{
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function insert_order(element, array) //sort out added comments based on time
{
    array.push(element);
    array.sort(function (a, b) 
    {
        return a.time - b.time;
    });
    return array;
}

function timeStringToNum(v) // Transform time from (e.g., -12:30) format to milliseconds
{
    var timeParts = v.split(":");
    if (timeParts[0] == "-0")
        return -1 * parseInt(((timeParts[0] * (60000 * 60)) + (timeParts[1] * 60000)), 10);
    else if (timeParts[0].startsWith('-'))
        return parseInt(((timeParts[0] * (60000 * 60)) + (-1 * (timeParts[1] * 60000))), 10);
    else
        return parseInt(((timeParts[0] * (60000 * 60)) + (timeParts[1] * 60000)), 10);
}

function randomIntFromInterval(min, max) 
{
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getLikes() // get a radom number of likes for a post
{
    var notRandomNumbers = [1, 1, 1, 2, 2, 2, 3, 3, 4, 4, 5, 6];
    var idx = Math.floor(Math.random() * notRandomNumbers.length);
    return notRandomNumbers[idx];
}

function getLikesComment() // get a radom number of likes for a comment
{
    var notRandomNumbers = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 3, 4];
    var idx = Math.floor(Math.random() * notRandomNumbers.length);
    return notRandomNumbers[idx];
}

function getReads(min, max) // get a number of times post has been read
{
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

/**************************************************************************************************
                                      Deleting existing DB collections       
***************************************************************************************************/
 
function dropCollections ()
{
  console.log("Dropping actors...");
  db.collections['actors'].drop(function (err) 
  {
    console.log('actors collection dropped');
  });

  console.log("Dropping scripts...");
  db.collections['scripts'].drop(function (err) 
  {
    console.log('scripts collection dropped');
  });

  console.log("Dropping notifications...");
  db.collections['notifications'].drop(function (err)
  {
    console.log('notifications collection dropped');
  });
}

/*****************************************************************************************************
                                  Convert CSV files to JSON format
******************************************************************************************************/
    
async function convertCSV2Json() 
{
    try {
        //synchronously read all csv files and convert them to JSON
         await console.log("Start reading data from .csv files")
         actors_list = await CSVToJSON().fromFile('./input/actors.csv');
         posts_list = await CSVToJSON().fromFile('./input/posts.csv');
         comments_list = await CSVToJSON().fromFile('./input/replies.csv');
         notifications_list = await CSVToJSON().fromFile('./input/notifications.csv');
         notifications_reply_list = await CSVToJSON().fromFile('./input/actor_replies.csv');

        //synchronously write all converted JSON output to .json files incase for future use

         //fs.writeFileSync("./input/actors.json", JSON.stringify(actors_list,null,4));
         //fs.writeFileSync("./input/posts.json", JSON.stringify(posts_list,null,4));
         //fs.writeFileSync("./input/replies.json", JSON.stringify(comments_list,null,4));
         //fs.writeFileSync("./input/notifications.json", JSON.stringify(notifications_list,null,4));
         //fs.writeFileSync("./input/actor_replies.json", JSON.stringify(notification_reply_list,null,4));
        await console.log("Done converting CVSs to JSONs")
    } catch (err) 
    {
        console.log('Error converting/writing data to json format', err);
    }
}

/*************************************************************************************************
                          Create Actors - Must be done before anything else
**************************************************************************************************/

function createActors ()
{
  console.log("starting populating actors...");
  async.each(actors_list, function (actor_raw, callback) 
  {
    actordetail = {};
    actordetail.profile = {};

    actordetail.profile.name = actor_raw.name
    actordetail.profile.location = actor_raw.location;
    actordetail.profile.picture = actor_raw.picture;
    actordetail.profile.bio = actor_raw.bio;
    actordetail.profile.age = actor_raw.age;
    actordetail.class = actor_raw.class;
    actordetail.username = actor_raw.username;

    var actor = new Actor(actordetail);

    actor.save(function (err)
    {
      if (err)
      {
        console.log("Something went wrong!!!");
        return -1;
      }

      console.log('New Actor: ' + actor.username);
      callback();
    });
  },function (err)
  {
    console.log("Done with all the ACTORS!!!");
  mongoose.connection.close();
  }
  );
}
/*************************************************************************************************
                                            Create posts
 *************************************************************************************************/
  
function createPosts()
{
  console.log("starting to populate posts...");
  
  async.each(posts_list, function (new_post, callback) 
  {
    Actor.findOne({ username: new_post.actor }, (err, act) => 
    {
      if (err) 
      { 
        console.log("Error populating posts..."); 
        console.log(err); 
        return; 
      }
      if (act) 
      {
        var postdetail = new Object();
        
        postdetail.likes =  new_post.likes; //getLikes();
        postdetail.dislikes_lc = new_post.dislikes_lc;
        postdetail.dislikes_hc = new_post.dislikes_hc;
        postdetail.protest = new_post.protest;          
	      postdetail.experiment_group = new_post.experiment_group;
        postdetail.post_id = new_post.id;
        postdetail.body = new_post.body;
        postdetail.class = new_post.class;
        postdetail.picture = new_post.picture;
        postdetail.lowread = getReads(6, 20);
        postdetail.highread = getReads(145, 203);
        postdetail.actor = act;
        postdetail.time = timeStringToNum(new_post.time);

        var script = new Script(postdetail);
        script.save(function (err) 
        {
          if (err) 
          {
            console.log("Something went wrong in Saving the POST!!!");
            callback(err);
          }
          console.log('Saved New Post: ' + script.id);
          callback();
        });
      }
      else 
      {
        //Else no ACTOR Found
        console.log("No Actor Found!!!");
        console.log("Actor Name:",new_post.actor);
        callback();
      }
    });
  }, function (err) 
  {
    if (err)
    {
      console.log("END IS WRONG!!!");
      callback(err);
    }
    console.log("Done with all the POSTS!!!")
    mongoose.connection.close();
  }
  );
}

/****************************************************************************************************
                         Create (attach) comments to actors posts
*****************************************************************************************************/
  
function createPostReplies()
{
  console.log("Starting adding post comments...");

  async.eachSeries(comments_list, function (new_replies, callback) 
  {
    Actor.findOne({ username: new_replies.actor }, (err, act) => 
    {
      if (act) 
      {
        Script.findOne({ post_id: new_replies.reply }, function (err, pr) 
        {
          if (pr) 
          {
            var comment_detail = new Object();

            comment_detail.body = new_replies.body
            comment_detail.commentID = new_replies.id;
            comment_detail.class = new_replies.class;
            comment_detail.module = new_replies.module;
            comment_detail.likes = getLikesComment();
            comment_detail.time = timeStringToNum(new_replies.time);
            comment_detail.actor = act;
            pr.comments.push(comment_detail);
            pr.comments.sort(function (a, b) { return a.time - b.time; });

            pr.save(function (err) 
            {
              if (err) 
              {
                console.log("@@@@@@@@@@@@@@@@Something went wrong in Saving COMMENT!!!");
                console.log("Error IN: " + new_replies.id);
                callback(err);
              }
              console.log('Added new Comment to Post: ' + pr.id);
              callback();
            });
          }
          else 
          {
            //Else no ACTOR Found
            console.log("############Error IN: " + new_replies.id);
            console.log("No POST Found!!!");
            callback();
          }
        });
          }
          else 
          {
            //Else no ACTOR Found
            console.log("****************Error IN: " + new_replies.id);
            console.log("No Actor Found!!!");
            callback();
          }
        });
  },function (err) 
  {
    if (err) 
    {
      console.log("END IS WRONG!!!");
      console.log(err);
      callback(err);
    }
    console.log("DONE adding comments to posts!!!");
    mongoose.connection.close();
  }
  );
}

/*************************************************************************************************
                              Create actor replies to user posts
*************************************************************************************************/
function createActor2UserReplies()
{
  console.log("starting adding actor replies to user posts...");
  
  async.each(notifications_reply_list, function (new_notify, callback)
  {
    Actor.findOne({ username: new_notify.actor }, (err, act) =>
    {
      if (err)
      {
        console.log("actorNotifyInstances error");
        console.log(err);
        return;
      }

      // console.log("start post for: "+new_post.id);

      if (act)
      {
      //console.log('Looking up Actor ID is : ' + act._id);

      var notifydetail = new Object();

      notifydetail.userPost = new_notify.userPostId;
      notifydetail.actor = act;
      notifydetail.notificationType = 'reply';
      notifydetail.replyBody = new_notify.body;
      notifydetail.time = timeStringToNum(new_notify.time);

      var notify = new Notification(notifydetail);
      notify.save(function (err)
      {
        if (err)
        {
          console.log("Something went wrong in saving actor replies!!!");
          // console.log(err);
          callback(err);
        }

        //console.log('Saved New Post: ' + script.id);
        console.log("saved a post");
        callback();
      });
      }// end if act
      else
      {
        //Else no ACTOR Found
        console.log("No Actor Found!!!");
        callback();
      }
      // console.log("BOTTOM OF SAVE");
    });
  },function (err)
  {
    if (err)
    {
      console.log("END IS WRONG!!!");
      // console.log(err);
      callback(err);
    }
    console.log("Done adding actor replies to user posts.!!!");
    mongoose.connection.close();
  }
  );
}

/****************************************************************************************************
                                   Creates Notifications
*****************************************************************************************************/

function createNotifications()
{
  console.log("starting adding notifictions...");
  async.each(notifications_list, function (new_notify, callback)
  {
    Actor.findOne({ username: new_notify.actor }, (err, act) =>
    {
      if (err)
      {
        console.log("Error creating notifications...");
        console.log(err);
        return;
      }

      // console.log("start post for: "+new_notify.id);
      if (act)
      {
        var notifydetail = new Object();

        if (new_notify.userPost >= 0 && !(new_notify.userPost === ""))
        {
          notifydetail.userPost = new_notify.userPost;
          //console.log('User Post is : ' + notifydetail.userPost);
        }
        else if (new_notify.userReply >= 0 && !(new_notify.userReply === ""))
        {
          notifydetail.userReply = new_notify.userReply;
          //console.log('User Reply is : ' + notifydetail.userReply);
        }
        else if (new_notify.actorReply >= 0 && !(new_notify.actorReply === ""))
        {
          notifydetail.actorReply = new_notify.actorReply;
          //console.log('Actor Reply is : ' + notifydetail.actorReply);
        }
        notifydetail.actor = act;
        notifydetail.notificationType = new_notify.type;
        notifydetail.time = timeStringToNum(new_notify.time);

        var notify = new Notification(notifydetail);
        notify.save(function (err)
        {
          if (err)
          {
            console.log("Something went wrong in Saving Notify!!!");
            // console.log(err);
            callback(err);
          }

          //console.log('Saved New Post: ' + script.id);
          console.log("saved a post");
          callback();
        });
      }// end of if aCT
      else
      {
        //Else no ACTOR Found
        console.log("No Actor Found!!!");
        callback();
      }

      // console.log("BOTTOM OF SAVE");
    });
  },function (err)
  {
    if (err)
    {
      console.log("END IS WRONG!!!");
      // console.log(err);
      callback(err);
    }
    console.log("Done with the Notifications!!!");
    mongoose.connection.close();
  }
  );    
}

/***************************************************************************************************
                            Populate DB using the following functions
****************************************************************************************************/

function promisify(inputFunction) 
{
    return new Promise(resolve => 
    {
        setTimeout(() => 
        {
            resolve(inputFunction());
        }, 2000);
    });
}

async function populateDB()
{
  try 
  {
    await convertCSV2Json(); // Convert CSVs to Json formats
    //await promisify(dropCollections); // Delete previous collections (if they exist)
    //await promisify(createActors);  // Populate actors info 
    //await promisify(createPosts);   // Populate Posts info
    //await promisify(createPostReplies); // Populate actor comments to posts
    //await promisify(createActor2UserReplies); // Populate actor replies to user posts
    await promisify(createNotifications); // Populate notofications info.
  } catch(e) 
  {
    console.log(e);
  }
 }

populateDB();
