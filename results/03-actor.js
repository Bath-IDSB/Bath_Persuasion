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
//5bb3a93ad9fd14471bf3977d
//5bb3a93ad9fd14471bf39791
//5bb3a93ad9fd14471bf39792
//5bb3a93ad9fd14471bf397c8
var bully_messages = ["5bb3a93ad9fd14471bf3977d",
"5bb3a93ad9fd14471bf39791",
"5bb3a93ad9fd14471bf39792",
"5bb3a93ad9fd14471bf397c8"];
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
      interAction_writer.pipe(fs.createWriteStream('results/actor.csv'));

      for (var i = users.length - 1; i >= 0; i--) 
      {
        var interAction = {};

        interAction.id = users[i].prolificID;

        interAction.time="-";
        interAction.action="-";
        interAction.report_issue="-";
        interAction.pvt_message="-";
        interAction.actorName="-";

        console.log("In User "+ users[i].prolificID);
        //console.log("In User Number "+ i);

        //per blockAndReportLog

      if(users[i].blockAndReportLog.length >0) 
      {
         for (var k = users[i].blockAndReportLog.length - 1; k >= 0; k--) 
          {
            var temp = {};
            temp = JSON.parse(JSON.stringify(interAction));

              temp.actorName=users[i].blockAndReportLog[k].actorName;
              temp.action=users[i].blockAndReportLog[k].action;
              temp.report_issue=users[i].blockAndReportLog[k].report_issue;
              temp.pvt_message=users[i].blockAndReportLog[k].pvt_message;
              temp.time=users[i].blockAndReportLog[k].time;
          
              interAction_array.push(temp);
          }
      }
     else
      interAction_writer.write(interAction);
    }//for each user

    /*
    for (var zz = 0; zz < mlm_array.length; zz++) {
      //console.log("writing user "+ mlm_array[zz].email);
      //console.log("writing Bully Post "+ mlm_array[zz].BullyingPost);
      mlm_writer.write(mlm_array[zz]);
    }
    */
    
    console.log("Interaction Table should be "+ interAction_array.length);
      for (var zz = 0; zz < interAction_array.length; zz++) {
      //console.log("writing user "+ mlm_array[zz].email);
      console.log("writing interActions for user "+ zz);
      interAction_writer.write(interAction_array[zz]);
    }
    interAction_writer.end();
    console.log('Wrote Actor-based interActions!');
    mongoose.connection.close();
  });
