#! /usr/bin/env node

console.log('This data export is running!!!!');

const async = require('async')
const Actor = require('./models/Actor.js');
const Script = require('./models/Script.js');
const User = require('./models/User.js');
const _ = require('lodash');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs')
var UAParser = require('ua-parser-js');
const util = require('util');

var csvWriter = require('csv-write-stream');
var s_writer = csvWriter();

var humanizeDuration= require("humanize-duration");


//5bb3a93ad9fd14471bf3977d
//5bb3a93ad9fd14471bf39791
//5bb3a93ad9fd14471bf39792
//5bb3a93ad9fd14471bf397c8
var bully_messages = ["5bb3a93ad9fd14471bf3977d",
"5bb3a93ad9fd14471bf39791",
"5bb3a93ad9fd14471bf39792",
"5bb3a93ad9fd14471bf397c8"];
var bully_stats = [];
var sur_array = [];

Array.prototype.sum = function() {
    return this.reduce(function(a,b){return a+b;});
};

var mlm_array = [];

dotenv.config({ path: '.env' });

var MongoClient = require('mongodb').MongoClient
 , assert = require('assert');

/**
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI, 
  {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true});
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

User.find()
  .where('active').equals(false)
  .populate({ 
         path: 'feedAction.post',
         model: 'Script',
         populate: {
           path: 'actor',
           model: 'Actor'
         } 
      })
  .exec(    
    function(err, users){
      s_writer.pipe(fs.createWriteStream('results/user.csv'));

      for (var i = users.length - 1; i >= 0; i--) 
      {
        var sur = {};

        sur.prolificID = users[i].prolificID;
        sur.username = users[i].username;
        sur.StartDate = new Date(users[i].createdAt).toLocaleString({timeZone: 'UTC'});
        sur.OffDate = new Date(users[i].switchedOffAt).toLocaleString({timeZone: 'UTC'});
        console.log("In User "+ users[i].prolificID);
        //console.log("In User Number "+ i);

        //per feedAction

        sur.post_id = "";
        sur.post_body = "";
        sur.post_picture = "";
        sur.post_liked = "";
        sur.post_absTime = "";
        sur.post_relativeTime = "";

        sur.comment_id="";
        sur.comment_isUser="";
        sur.comment_actor="";
        sur.comment_body="";
        sur.comment_liked="";
        sur.comment_flagged="";
        sur.new_comment="";
        sur.comment_absTime="";
        sur.comment_relativeTime="";

        console.log("User has "+ users[i].posts.length+" Posts");
        
      if(users[i].posts.length >0)
      {
        for (var j = users[i].posts.length - 1; j >= 0; j--) 
        { 
          var temp1 = {};
          temp1 = JSON.parse(JSON.stringify(sur));

            //if((users[i].posts[j].liked))
           //{
            temp1.post_id = users[i].posts[j].postID;
            temp1.post_body = users[i].posts[j].body;
            temp1.post_picture = users[i].posts[j].picture;
            temp1.post_liked = users[i].posts[j].liked;
            temp1.post_absTime = new Date(Number(users[i].posts[j].absTime)).toLocaleString({timeZone: 'UTC'});
            temp1.post_relativeTime = humanizeDuration(Number(users[i].posts[j].relativeTime));

            sur_array.push(temp1);
            //}
          if(users[i].posts[j].comments.length>0)
          {
            for (var k = users[i].posts[j].comments.length - 1; k >= 0; k--)
            {
              var temp2 = {};
              temp2 = JSON.parse(JSON.stringify(sur));
              
              temp2.comment_id=users[i].posts[j].comments[k].commentID;
              temp2.comment_isUser=users[i].posts[j].comments[k].isUser;
              temp2.comment_actor=users[i].posts[j].comments[k].actor;
              temp2.comment_body=users[i].posts[j].comments[k].body;
              temp2.comment_liked=users[i].posts[j].comments[k].liked;
              temp2.comment_flagged=users[i].posts[j].comments[k].flagged;
              temp2.new_comment=users[i].posts[j].comments[k].new_comment;
              if(users[i].posts[j].comments[k].absTime)
              temp2.comment_absTime=new Date(Number(users[i].posts[j].comments[k].absTime)).toLocaleString({timeZone: 'UTC'});
              else
              temp2.comment_absTime="";  
              temp2.comment_relativeTime=humanizeDuration(Number(users[i].posts[j].comments[k].time));

              sur_array.push(temp2);
            } 
          }

        }
      }
      else
      s_writer.write(sur);
    }//for each user

    /*
    for (var zz = 0; zz < mlm_array.length; zz++) {
      //console.log("writing user "+ mlm_array[zz].email);
      //console.log("writing Bully Post "+ mlm_array[zz].BullyingPost);
      mlm_writer.write(mlm_array[zz]);
    }
    */
    console.log("Post Table should be "+ sur_array.length);
      for (var zz = 0; zz < sur_array.length; zz++) {
      //console.log("writing user "+ mlm_array[zz].email);
      console.log("writing Post for user "+ zz);
      s_writer.write(sur_array[zz]);
    }
    s_writer.end();
    console.log('Wrote POSTS!');
    mongoose.connection.close();
  });
