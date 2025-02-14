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
var interAction_writer = csvWriter();

var humanizeDuration= require("humanize-duration");

//5bb3a93ad9fd14471bf3977d
//5bb3a93ad9fd14471bf39791
//5bb3a93ad9fd14471bf39792
//5bb3a93ad9fd14471bf397c8

/*var bully_comments = ["62612cb0e0c27dce711d254c",
"62612cb0e0c27dce711d2544",
"62612cb0e0c27dce711d2548",
"62612cb0e0c27dce711d2550"];*/

/*var bully_comments = ["6284b03271862528038dfa56",
"6284b03271862528038dfa4e",
"6284b03271862528038dfa5a",
"6284b03271862528038dfa52"];*/


/*var bully_comments = ["6291e78e2a2fc9159d9cd7ce",
"6291e78e2a2fc9159d9cd7ca",
"6291e78d2a2fc9159d9cd7c6",
"6291e78f2a2fc9159d9cd7d2"]; */ // heroku

var bully_stats = [];
var interAction_array = [];

Array.prototype.sum = function() {
    return this.reduce(function(a,b){return a+b;});
};

dotenv.config({ path: '.env' });

var MongoClient = require('mongodb').MongoClient
 , assert = require('assert');

/**
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI, 
{useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});


bully_messages=[];
bully_posts=[];
bully_postsID=[];
   
var messages=Script.find()
    .where('comments.class')
    .equals('bullying');

    messages.exec(function(err,script)
      {
        for (var i = script.length - 1; i >= 0; i--) 
          {
            bully_messages[i]=script[i].comments[0].id;
            bully_posts[i]=script[i].id
            bully_postsID[i]=script[i].post_id;
          //  console.log(bully_postsID[i],bully_posts[i],bully_messages[i]);
          }
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
      interAction_writer.pipe(fs.createWriteStream('results/feed.csv'));

for (var i = users.length - 1; i >= 0; i--) 
{
        var interAction = {};
  
        console.log("In User "+ users[i].prolificID);
        //console.log("In User Number "+ i);

        //interAction.prolificID = "";
        //interAction.StartDate = "";
        //interAction.OffDate = "";

        interAction.prolificID = users[i].prolificID;
        interAction.StartDate = new Date(users[i].createdAt).toLocaleString({timeZone: 'UTC'});
        interAction.OffDate = new Date(users[i].switchedOffAt).toLocaleString({timeZone: 'UTC'});

        interAction.post_id="";
        interAction.post_liked="";
        interAction.post_likeTime="";
        interAction.post_flagTime="";
        interAction.post_Type="";
        //interAction.post_replyTime="";

        interAction.comment_id="";
        interAction.comment_liked="";
        interAction.comment_likeTime="";
        interAction.comment_flagged="";
        interAction.comment_flagTime=""; 
        interAction.comment_Type="";

        interAction.new_comment="";
        interAction.new_comment_id="";
        interAction.new_comment_body="";
        interAction.new_comment_absTime="";
        //interAction.new_commentTime="";
        interAction.new_comment_relativeTime="";

        //per feedAction
  
  if(users[i].feedAction.length >0)
  {
    for (var k = users[i].feedAction.length - 1; k >= 0; k--) 
    {
          var temp1 = {};
          temp1 = JSON.parse(JSON.stringify(interAction));

          //is a bully Victim message
          //if(users[i].feedAction[k].post.id == bully_messages[0] || users[i].feedAction[k].post.id == bully_messages[1] || users[i].feedAction[k].post.id == bully_messages[2]||users[i].feedAction[k].post.id == bully_messages[3])
          //console.log("Look up action ID: "+users[i].feedAction[k].id);
          //console.log("Look up action POST : "+users[i].feedAction[k].post);
          
          //console.log(util.inspect(users[i].feedAction[k], false, null))
            
          temp1.post_id=users[i].feedAction[k].post.id;

          if((users[i].feedAction[k].liked || users[i].feedAction[k].flagTime!=""))
           {
            
            if(users[i].feedAction[k].liked)
            temp1.post_liked=users[i].feedAction[k].liked;
            else
            temp1.post_liked="";

            if(users[i].feedAction[k].likeTime !="")
            temp1.post_likeTime= new Date(Number(users[i].feedAction[k].likeTime)).toLocaleString({timeZone: 'UTC'});
            else
            temp1.post_likeTime="";

            if(users[i].feedAction[k].flagTime!="")  
            temp1.post_flagTime= new Date(Number(users[i].feedAction[k].flagTime)).toLocaleString({timeZone: 'UTC'});
            else
            temp1.post_flagTime="";

            if(users[i].feedAction[k].post.id == bully_posts[0] || 
              users[i].feedAction[k].post.id == bully_posts[1] || 
              users[i].feedAction[k].post.id == bully_posts[2] ||
              users[i].feedAction[k].post.id == bully_posts[3])
              temp1.post_Type="Bully";

            /*if(users[i].feedAction[k].replyTime=="")
            {
            //temp1.post_replyTime=humanizeDuration(Number(users[i].feedAction[k].replyTime));
            //else
            //temp1.post_replyTime=""; 
            interAction_array.push(temp1); 
            }*/
            interAction_array.push(temp1);
          }
          for (var j = users[i].feedAction[k].comments.length - 1; j >= 0; j--)
          {
            var temp2 = {};
                temp2 = JSON.parse(JSON.stringify(interAction));

              temp2.post_id=users[i].feedAction[k].post.id;
              temp2.comment_id= users[i].feedAction[k].comments[j].comment;
              temp2.comment_liked=users[i].feedAction[k].comments[j].liked;
          
              //if(users[i].feedAction[k].comments[j].likeTime !="")
              if(users[i].feedAction[k].comments[j].liked)
              {
               temp2.comment_liked = users[i].feedAction[k].comments[j].liked;
               temp2.comment_likeTime = new Date(Number(users[i].feedAction[k].comments[j].likeTime[0])).toLocaleString({timeZone: 'UTC'});
               //temp2.comment_likeTime = users[i].feedAction[k].comments[j].likeTime;
              }
              //else
              //temp2.comment_likeTime ="";

              if(users[i].feedAction[k].comments[j].flagged)
              {
               temp2.comment_flagged = users[i].feedAction[k].comments[j].flagged;
               temp2.comment_flagTime = new Date(Number(users[i].feedAction[k].comments[j].flagTime)).toLocaleString({timeZone: 'UTC'});
               //console.log(users[i].feedAction[k].comments[j].comment,temp.comment_flagged,temp.comment_flagTime);
              }

              if(users[i].feedAction[k].comments[j].comment == bully_messages[0] || 
                 users[i].feedAction[k].comments[j].comment == bully_messages[1] || 
                 users[i].feedAction[k].comments[j].comment == bully_messages[2] ||
                 users[i].feedAction[k].comments[j].comment == bully_messages[3])
              temp2.comment_Type="Bully";
              
              temp2.new_comment=users[i].feedAction[k].comments[j].new_comment;
              temp2.new_comment_id=users[i].feedAction[k].comments[j].new_comment_id;
              temp2.new_comment_body=users[i].feedAction[k].comments[j].comment_body;
              
              if(users[i].feedAction[k].comments[j].new_comment)
              temp2.new_comment_absTime= new Date(users[i].feedAction[k].comments[j].absTime).toLocaleString({timeZone: 'UTC'});
              
              if(users[i].feedAction[k].comments[j].time>0)
              temp2.new_comment_relativeTime= humanizeDuration(Number(users[i].feedAction[k].comments[j].time));
              else
              temp2.new_comment_relativeTime="";
            interAction_array.push(temp2);
          }   //for comment[j]      
          //interAction_array.push(temp1);
        //console.log(temp.comment_flagged); 
    } // for Feed Action
  }//else part   
  else
  {
    interAction_writer.write(interAction);
  }
} //for user
          
    /*
    for (var zz = 0; zz < mlm_array.length; zz++) {
      //console.log("writing user "+ mlm_array[zz].email);
      //console.log("writing Bully Post "+ mlm_array[zz].BullyingPost);
      mlm_writer.write(mlm_array[zz]);
    }
    */
    console.log("Feed Interaction Table should be "+ interAction_array.length);
      for (var zz = 0; zz < interAction_array.length; zz++) {
      //console.log("writing user "+ mlm_array[zz].email);
      console.log("writing feed interAction"+ zz);
      interAction_writer.write(interAction_array[zz]);
    }
    interAction_writer.end();
    console.log('Wrote feed-based interActions!');
    mongoose.connection.close();
  });