var express    = require('express');
var path       = require('path');
var browserify = require("browserify-middleware");
var bodyParser = require('body-parser');

var Utils      = require('./utils.js');
var db         = require('./db.js');

var app        = express();

app.use(express.static(path.join(__dirname, "../client/public")));
app.use(bodyParser.json());
app.use(function(err, req, res, next){
  console.log("Error!", err);
  next();
})

app.get('/app-bundle.js',
browserify(path.join(__dirname, '../client/main.js'), {
   transform: [ [ require('babelify'), { presets: ["es2015", "react"] } ] ]
 })
);

// client asking for art data
app.get('/art', function(req,res) {
  //retrieve all art from db
  db.collection('art').find()
  .then((art) => {
    res.send(art)
  })
})

app.post('/signUp', function(req, res) {
 var username = req.body.username;
 var password = req.body.password;

 db.collection('users').find({username: username})
 .then((user) => {
   if(user[0]){
    console.log('bad request');
     res.status(400).end("bad request");
     res.set("Connection", "close");
   } else {
     return Utils.hashPassword(password)
   }
 })
 .then(function(hash){
   return db.collection('users').insert({username: username, password: hash});
 })
 .then(function(obj){
   var sessionId = Utils.createSessionId();
   return db.collection('sessions').insert({id: obj._id, sessionId: sessionId});
 })
 .then(function(obj){  
   res.send(JSON.stringify(obj.sessionId));
 })
})

// Logs in current user as long as username is in users collection and provided a valid password
app.post('/login', function(req, res) {
 var username = req.body.username;
 var password = req.body.password;
 var userID;

  db.collection('users')
    .find({username: username})
    .then((userObj) => {
      if(!userObj) {
        res.end(400, "Invalid username/Password")
      } else {
        userID = userObj[0]._id;
        return Utils.comparePassword(userObj[0].password, password)
      }
    })
    .then((isValidPassword) => {
      if(!isValidPassword) {
        res.sendStatus(401, "Invalid Username/password");
      } else {
        return db.collection('sessions')
          .insert({ id: userID, sessionId: Utils.createSessionId() })
      }
    })
    .then((userObj) => {
      res.send(JSON.stringify(userObj.sessionId))
    })
})

// Will add a favorite with userId and artId to the favorites collection if not already present.
// If it is present it will remove the userId and artId from favorites collection
app.post('/favorites/:artId', function(req, res) {
  var artId = req.params.artId;
  var sessionId;
  var userID = '';

  // Checks to see if user has a cookie.
  //  True : assign cookie to sessionID
  //  False: send a 403("Forbidden") status back to client
  if(req.headers.cookie) {
    sessionId = req.headers.cookie.substring(10);
  } else {
    res.sendStatus(403)
  }

  // Finds the users session object using sessionId from cookie
  db.collection('sessions')
    .find({sessionId: sessionId})
    .then((returnedSession) => {
      userID = returnedSession[0].id
    })
    .then(() => {
      //Check to see if the user has already favorited the artwork
      return db.collection('favorites').find({
        $and : [
        { userId: { $eq: userID } },
        { artId : { $eq: artId } } ]
      })
    .then((isEqual) => {
      // Checks to see if user has already favorited :artId
      // False: add userId and artId to favorites collection
      if(!isEqual[0]) {
        db.collection('favorites')
          .insert({ userId: userID, artId: artId })
      } else {
        // True: remove userId and artId from favorites collection
        db.collection('favorites')
        .find({ userId: userID, artId: artId })
        .then((returnedDocument) => {
          db.collection('favorites')
          .remove({ _id: returnedDocument[0]._id })
        })
      }
    })
  })
  res.send()
})

app.post('/like/:id', function(req, res){
  var artId = req.params.id;
  var sessionId = req.body.cookie.substring(10);
  var userId;

  if(!sessionId){
    res.sendStatus(401)
  } else {
    return db.collection('sessions').find({ sessionId: sessionId })
    })
    .then((users) => {
      // Get user id from session
      userId = users[0].id;
      return db.collection('users').find({ _id: userId })
    })
    .then((users) => {
      // Check if user exists
      if(users[0]){
        return db.collection('likes').find({ userId: userId, artId: artId })
      } else {
        // User doesn't exist, send back -bad request-
        res.sendStatus(400)
      }
    })
    .then((likes) => {
      // Check if user has already liked the art
        if(likes[0]){
          // if so then the user will unlike the art
          return db.collection('likes').remove({ userId: userId, artId: artId })
        } else {
          // if not then the user will like the art
          return db.collection('likes').insert({ userId: userId, artId: artId })
        }

    })
    .then((result) => {
      res.send({ "Status": "Success" })
    })
  }
})


// Run server on port 4040
var port = 4040;
app.listen(port);
console.log('Server is listening to port: ' + port)