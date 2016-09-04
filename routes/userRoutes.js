var express = require('express');
var userRouter = express.Router();

userRouter.route('/addUser', function(req, res){
  pg.connect(connect, function(err, client, done){
    if(err){
      return console.error('error fetching', err);
    }
    client.query("INSERT INTO users(username) VALUES($1)", [req.body.username]);
    done();
    res.redirect('/');
  });
});

userRouter.route('/deleteUser', function(req, res){
  pg.connect(connect, function(err, client, done){
    if(err){
      return console.error('error fetching', err);
    }
    client.query("DELETE FROM users WHERE username=$1", [req.body.username]);
    done();
    res.redirect('/');
  });
});

module.exports = userRouter;