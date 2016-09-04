var express = require('express');
var app = express();
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;

var local = false;

if(local){
	cbURL = 'http://localhost:3000/login/facebook/return';
	cnct = 'postgres://ryan:password@localhost/somedb'
}else{
	cbURL = 'https://fitsesh.herokuapp.com/login/facebook/return';
	cnct = (process.env.DATABASE_URL || 'postgres://iopymwpptebiud:YWHmmGfhmYDY3DKAoIuhu2C85M@ec2-23-21-58-144.compute-1.amazonaws.com:5432/d9cca2ob0r8h5v');
}

var pg = require('pg'),
  bodyParser = require('body-parser'),
  path = require('path');

pg.defaults.ssl = !local;

//var connect = "postgres://ryan:password@localhost/somedb"
var connect = cnct;

app.set('port', (process.env.PORT || 3000));

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

passport.use(new Strategy({
    clientID: '1032451400184652',
    clientSecret: '6640678d88db3c3b0d7815f22c4896f2',
    callbackURL: cbURL
  },
  function(accessToken, refreshToken, profile, cb) {
    // In this example, the user's Facebook profile is supplied as the user
    // record.  In a production-quality application, the Facebook profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    return cb(null, profile);
  }));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());


// Define routes.
app.get('/',
  function(req, res) {
	pg.connect(connect, function(err, client) {
	  if (err) throw err;
	  console.log('Connected to postgres! Getting schemas...');
      client.query('SELECT * FROM users', function(err, result){
        if(err){
          return console.error('error fetching', err);  
        }
        console.log("!!! USERNAME IS: " + result.rows);
        res.render('home', {user: req.user, users: result.rows});
      });
	});
});

app.get('/login',
  function(req, res){
    res.render('login');
  });

app.get('/login/facebook',
  passport.authenticate('facebook'));

app.get('/login/facebook/return', 
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout/facebook', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/logout/facebook/return', 
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.post('/addUser', function(req, res){
  pg.connect(connect, function(err, client, done){
    if(err){
      return console.error('error fetching', err);
    }
    client.query("INSERT INTO users(username) VALUES($1)", [req.body.username]);
    done();
    res.redirect('/');
  });
});

app.post('/deleteUser', function(req, res){
  pg.connect(connect, function(err, client, done){
    if(err){
      return console.error('error fetching', err);
    }
    client.query("DELETE FROM users WHERE username=$1", [req.body.username]);
    done();
    res.redirect('/');
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});