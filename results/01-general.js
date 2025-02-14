#! /usr/bin/env node

console.log('This data export script is running!!!!');

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
var mlm_writer = csvWriter();


//5bb3a93ad9fd14471bf3977d
//5bb3a93ad9fd14471bf39791
//5bb3a93ad9fd14471bf39792
//5bb3a93ad9fd14471bf397c8

/*var bully_messages = ["5bb3a93ad9fd14471bf3977d",
"5bb3a93ad9fd14471bf39791",
"5bb3a93ad9fd14471bf39792",
"5bb3a93ad9fd14471bf397c8"];*/

/*var bully_messages = ["6291e78e2a2fc9159d9cd7ce",
"6291e78e2a2fc9159d9cd7ca",
"6291e78d2a2fc9159d9cd7c6",
"6291e78f2a2fc9159d9cd7d2"]; // heroku*/
var bully_stats = [];


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

mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI, { 
  useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true});
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});


 /*Script.find().where('comments.class').equals('bullying').populate({
  path:'feedAction.post',
  model:'Script'
}).exec(function(err,script){

console.log(script.length);

for (var i = script.length - 1; i >= 0; i--) 
    {
      //bully_messages[i]=script[i].comments[0].id;
      bully_messages[i]=script[i].comments[0].id;
      console.log("Bully message:"+i,bully_messages[i]);
    }
});*/


/*var query = Script.find().where('comments.class').equals('bullying');

  query.exec(function(err,script){
  for (var i = script.length - 1; i >= 0; i--) 
    {
      bully_messages[i]=script[i].comments[0].id;
      bully_posts[i]=script[i].id
      bully_postsID[i]=script[i].post_id;
      console.log(bully_postsID[i],bully_posts[i],bully_messages[i]);
    }
  });*/


/*const findBullyMessages = async () => { 
    try {  return await Script.find().where('comments.class').equals('bullying');
    } catch(err) { console.log(err) }
}

bully_messages=findBullyMessages().then();*/


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



/*query.exec(function(err,script)
{
console.log(script.length);

for (var i = script.length - 1; i >= 0; i--) 
    {
      bully_messages[i]=script[i].comments[0].id;
      bully_posts[i]=script[i].id
      bully_postsID[i]=script[i].post_id;
      console.log(bully_postsID[i],bully_posts[i],bully_messages[i]);
    }
    //return bully_messages; 
});*/


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
      mlm_writer.pipe(fs.createWriteStream('results/general.csv'));

      for (var i = users.length - 1; i >= 0; i--) 
      {
        var mlm = {};

        mlm.prolificID = users[i].prolificID;

        mlm.StartDate = new Date(users[i].createdAt).toLocaleString({timeZone: 'UTC'});
        mlm.FinishDate = new Date(users[i].switchedOffAt).toLocaleString({timeZone: 'UTC'});
        
        console.log("In User "+ users[i].prolificID);
        //console.log("In User Number "+ i);

        mlm.ui_group = users[i].group;

        if (users[i].profile.picture)
        {
          mlm.ProfilePicture = 1;
        }
        else
        {
          mlm.ProfilePicture = 0;
        }
        
        if (users[i].profile.location)
        {
          mlm.ProfileLocation = 1;
        }
        else
        {
          mlm.ProfileLocation = 0;
        }

        if (users[i].profile.bio)
        {
          mlm.ProfileBio = 1;
        }
        else
        {
          mlm.ProfileBio = 0;
        }

        var parser = new UAParser();

        if(users[i].log[0])
        {

          if (parser.setUA(users[i].log[0].userAgent).getDevice().type)
          {
            mlm.Device = parser.setUA(users[i].log[0].userAgent).getDevice().type;
          }
          else
            mlm.Device = "Computer";

          mlm.Broswer = parser.setUA(users[i].log[0].userAgent).getBrowser().name;

          mlm.OS = parser.setUA(users[i].log[0].userAgent).getOS().name;
        }//if Log exists
        else{
          mlm.Device = "NA";
          mlm.Broswer = "NA";
          mlm.OS = "NA";
        }
        
        mlm.notificationpage = 0;
        mlm.generalpagevisit = 0;
        
        for(var z = 0; z < users[i].pageLog.length; ++z)
        {
            if(users[i].pageLog[z].page == "Notifications")
              mlm.notificationpage++;
            else
              mlm.generalpagevisit++;
        }

        if (users[i].completed)
        {
          mlm.CompletedStudy = 1;
        }
        else
        {
          mlm.CompletedStudy = 0;
        }

        if(users[i].messaged.length>0)
        {
          mlm.messaged = users[i].messaged.length;
        }
        else
        {
          mlm.messaged = 0;
        }

        if(users[i].reported.length>0)
        {
          mlm.reported = users[i].reported.length;
        }
        else
        {
          mlm.reported = 0;
        }

        if(users[i].blocked.length>0)
        {
          mlm.blocked = users[i].blocked.length;
        }
        else
        {
          mlm.blocked = 0;
        }

        //per feedAction
        mlm.GeneralLikeNumber = 0;
        mlm.GeneralFlagNumber = 0;
        mlm.GeneralCommentFlagNumber=0;
        mlm.GeneralCommentLikeNumber=0;

        mlm.LikedBullyPosts=0;
        mlm.FlaggedBullyPosts=0;
        mlm.LikedBullyComments=0;
        mlm.FlaggedBullyComments=0;
        
        //per feedAction
        for (var k = users[i].feedAction.length - 1; k >= 0; k--) 
        {
          //is a bully Victim message
          /*if(users[i].feedAction[k].post.id == bully_posts[0] || 
             users[i].feedAction[k].post.id == bully_posts[1] || 
             users[i].feedAction[k].post.id == bully_posts[2] ||
             users[i].feedAction[k].post.id == bully_posts[3])*/
          //console.log("Look up action ID: "+ users[i].feedAction[k].id);
          //console.log("Look up action POST : " + users[i].feedAction[k].post);
          
          //console.log(util.inspect(users[i].feedAction[k], false, null))
          if(users[i].feedAction[k].post == null)
          {
            console.log("@$@$@$@$@ action ID NOT FOUND: "+users[i].feedAction[k].id);
          }

          //not a bully message
          else 
          {
            //total number of likes
            if(users[i].feedAction[k].liked)
            {
              mlm.GeneralLikeNumber++;

             if(users[i].feedAction[k].post.id == bully_posts[0] || 
             users[i].feedAction[k].post.id == bully_posts[1] || 
             users[i].feedAction[k].post.id == bully_posts[2] ||
             users[i].feedAction[k].post.id == bully_posts[3])
             {
              console.log("Liked Bully Post: ",users[i].feedAction[k].post.id);
              mlm.LikedBullyPosts++;
              }

            }

            //total number of flags
            if(users[i].feedAction[k].flagTime[0])
            {
              mlm.GeneralFlagNumber++;

             if(users[i].feedAction[k].post.id == bully_posts[0] || 
             users[i].feedAction[k].post.id == bully_posts[1] || 
             users[i].feedAction[k].post.id == bully_posts[2] ||
             users[i].feedAction[k].post.id == bully_posts[3])
             {
              console.log("Flagged Bully Post: ",users[i].feedAction[k].post.id);
              mlm.FlaggedBullyPost++;
              }
            }

          }
          
          for (var j = users[i].feedAction[k].comments.length - 1; j >= 0; j--)
          { 
            if(users[i].feedAction[k].comments[j] == null)
            {
              //console.log("@$@$@$@$@ action ID NOT FOUND: "+users[i].feedAction[k].comments.id);
            }
            else
            {
             if(users[i].feedAction[k].comments[j].flagged)
              {
                mlm.GeneralCommentFlagNumber++;

             if(users[i].feedAction[k].comments[j].comment == bully_messages[0] || 
             users[i].feedAction[k].comments[j].comment == bully_messages[1] || 
             users[i].feedAction[k].comments[j].comment == bully_messages[2] ||
             users[i].feedAction[k].comments[j].comment  == bully_messages[3])
                {
                  console.log("Flagged Bully Comment: ",users[i].feedAction[k].comments[j].comment);
                  mlm.FlaggedBullyComments++;
                }

              }

              if(users[i].feedAction[k].comments[j].liked)
                {
                  mlm.GeneralCommentLikeNumber++;

                  if(users[i].feedAction[k].comments[j].comment == bully_messages[0] || 
                     users[i].feedAction[k].comments[j].comment == bully_messages[1] || 
                     users[i].feedAction[k].comments[j].comment == bully_messages[2] ||
                     users[i].feedAction[k].comments[j].comment  == bully_messages[3])
                  {
                    console.log("Liked Bully Comment: ",users[i].feedAction[k].comments[j].comment);
                    mlm.LikedBullyComments++;
                  }
                }
            }
          }

        }//for Per FeedAction

      //mlm.GeneralReplyNumber = users[i].numReplies + 1;
      mlm.GeneralPostNumber = users[i].numPosts + 1;
      mlm.GeneralCommentNumber = users[i].numComments + 1;
        
      mlm_writer.write(mlm);

    }//for each user

    /*
    for (var zz = 0; zz < mlm_array.length; zz++) {
      //console.log("writing user "+ mlm_array[zz].email);
      //console.log("writing Bully Post "+ mlm_array[zz].BullyingPost);
      mlm_writer.write(mlm_array[zz]);
    }
    */
    /*console.log("Post Table should be "+ sur_array.length);
      for (var zz = 0; zz < sur_array.length; zz++) {
      //console.log("writing user "+ mlm_array[zz].email);
      console.log("writing Post for user "+ zz);
      s_writer.write(sur_array[zz]);
    }*/

    console.log(bully_posts,bully_postsID,bully_messages);
    mlm_writer.end();
    console.log('Wrote Overall Figures!');
    mongoose.connection.close();
  });
