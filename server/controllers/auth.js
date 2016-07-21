var express = require('express');
var passport   = require("passport");
var LocalStrategy   = require('passport-local').Strategy;

var Favorite = require('../models/favorite');
var Utils = require(path.join(__dirname, '../utils.js'));
var db = require(path.join(__dirname, '../db.js'));

var router = express.Router();
module.exports = router;


//////////////////// REDONE //////////////////////////

router.post('/signup', passport.authenticate('local-signup'), function(req, res) {
    console.log("auth.js line 51-passport sign up")
    // successRedirect: '/',
    // failureRedirect: '/signup',
    // failureFlash: true
    var username = req.body.username;
    var password = req.body.password;
    console.log("req",req.sessionID)
    console.log("res",res.body)
  
    res.send(JSON.stringify(obj.sessionId));
  })

// router.post('/signUp', function(req, res) {
//   const username = req.body.username;
//   const password = req.body.password;

//   Auth.getUser(username)
//   .then(user => {
//     if(user[0]){
//       res.statusMessage = "Username taken."
//       res.status(400).end();
//     } else {
//       return Auth.signUp(username, password);
//     }
//   })
//   .then(user =>
//     Auth.createSession(user._id)
//   )
//   .then(session => {
//     res.send(JSON.stringify(session.sessionId));
//   })
// })

//////*******//////
//////*******//////
//////*******//////
//////*******//////
//////*******//////
//////*******//////

router.post('/login', passport.authenticate('local-login', function(req, res)
  {
    var username = req.body.username;
    var password = req.body.password;
    var userID;
     db.collection('users')
    .find({username: username})
    .then((userObj) => {
      if(!userObj[0]) {
        res.statusMessage = "Incorrect username or password"
        res.status(400).end();
      } else {
        userID = userObj[0]._id;
        return Utils.comparePassword(userObj[0].password, password)
      }
    })
    .then((isValidPassword) => {
      if(!isValidPassword) {
        res.statusMessage = "Incorrect username or password"
        res.status(401).end();
      } else {
        return db.collection('sessions')
          .insert({ id: userID, sessionId: Utils.createSessionId() })
      }
    })
    .then((userObj) => {
      res.send(JSON.stringify(userObj.sessionId))
    })
})


  // // app.get('/', function(req, res){
  // //   res.render('index.ejs');
  // // });

  // app.get('/login', function(req, res){
  //   res.render('login.ejs', { message: req.flash('loginMessage') });
  // });
  

//   router.post('/login', function(req, res) {
//   const username = req.body.username;
//   const password = req.body.password;
//   let userId;

//   Auth.getUser(username)
//     .then(user => {
//       if(!user[0]) {
//         res.statusMessage = "Incorrect username or password"
//         res.status(400).end();
//       } else {
//         userId = user[0]._id;
//         return utils.comparePassword(user[0].password, password)
//       }
//     })
//     .then(isValidPassword => {
//       if(!isValidPassword) {
//         res.statusMessage = "Incorrect username or password"
//         res.status(401).end();
//       } else {
//         return Auth.createSession(userId)
//       }
//     })
//     .then(session => {
//       res.send(JSON.stringify(session.sessionId))
//     })
// })


//////*******//////
//////*******//////
//////*******//////
//////*******//////
//////*******//////
//////*******//////








  app.get('/signup', function(req, res){
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });


  


  app.get('/profile', isLoggedIn, function(req, res){
    res.render('profile.ejs', { user: req.user });
  });

  app.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email']}));

  app.get('/auth/facebook/callback', 
    passport.authenticate('facebook', { successRedirect: '/profile',
                                        failureRedirect: '/' }));


  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  })
};

function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()){
    return next();
  }

  res.redirect('/login');
}






// router.get('/username', function(req, res) {
//   var sessionId;

//   if(req.headers.cookieheader) {
//     sessionId = req.headers.cookieheader.substring(10);
//   } else {
//     res.sendStatus(401);
//   }
//   // Find the sessionId in sessions collection
//   Auth.getSession(sessionId)
//     // Grab the user id from the sessions collection
//     .then(session =>
//       Auth.getUserById(session[0].id)
//     )
//     // Send back just the username to client
//     .then(user => {
//       res.send(JSON.stringify(user[0].username))
//     })
// })




// router.get('/user', function(req, res) {
//   var sessionId;

//   if(req.headers.cookieheader) {
//     sessionId = req.headers.cookieheader.substring(10);
//   } else {
//     res.sendStatus(401);
//   }
//   // Find the sessionId in sessions collection
//   Auth.getSession(sessionId)
//      // Grab the user id from the sessions collection
//     .then(session => {
//       res.send(session[0].id)
//     })
// })
