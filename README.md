# Project workspace for University of Bath REPHRAIN

This is a rough description to run the Web App on your local machine:

01) you need to install nodejs package and npm (node package manager) .

02) I use node (v14.21.3) and npm (v 6.14.18). These packages and other dependencies are listed in the package.json file. I suggest sticking with these versions for compatibility reasons due to some of the dependencies are a bit outdated/deprecated, but they should not cause any issues.

03) You need to install these modules (dependencies) before anything else by running [npm install] in the command line.

04)There will be some comments about some older packages etc. make sure the installation of modules is successful and at a later time you may upgrade the packages if you wish to do so.

05) Create Database - a free account on Atlas MongoDB on the free cluster and follow the instructions on the website. https://www.mongodb.com/cloud/atlas/register (you could refer to Truman's instruction paper to help set up the account on MongoDB as well).

06) Fill the first two lines in the environment .env file (hidden file) with your DB URLs of the online database after copying them from your account at MongoDB cluster. The .env file is also used to put the URL for the final survey if you wish the app to redirect users to a final survey after the experiment.

07) After you create the Database and updated the .env file, you need to populate the database using the populate script. You could populate all the collections (tables) at once or one by one (as you could tell from the end of the populate script).

08) After the database is created, run the command [npm run dev] (or [node app.js]) to run the app locally listening on port 3000.

09) Direct your browser to http://localhost:3000

10) Make sure the database urls and the username:password within the URLs are correct in the .env file, otherwise, the app won't run.

11) This is only to run the app locally.

12) Several platforms could be used to host the web app (i.e., Heroku, Amazon Web Sevices)- However, I find Amazon ElasticBeansTalk probably the easist option for starters  https://aws.amazon.com/elasticbeanstalk/.

GoodLuck :)

