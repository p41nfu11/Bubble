
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./controllers')
  , http = require('http')
  , path = require('path')
  , mongoose = require('mongoose')
  , expressmongoose = require('express-mongoose')
  , passport = require('passport')
  , facebookStrategy = require('passport-facebook').Strategy
  , config = require('./config');

var app = express();

// all environments
mongoose.connect('mongodb://localhost/bubble_1');
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/fbauth', passport.authenticate('facebook', {scope:'email'}));
app.get('/fbauthed', passport.authenticate('facebook',{ 
  failureRedirect: '/',
  successRedirect: '/home'
}));
app.get('/logout', function(req, res){
	req.logOut();
	res.redirect('/');
});
app.get('/error', function(req,res){
	res.redirect('/');
});



app.get('/', routes.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


//setting for passport
passport.serializeUser(function(user,done)
{
	done(null, user.id);
});

passport.deserializeUser(function(id, done){
	user.findOne({_id : id}, function(err, user){
		done(err,user);
	});
});

passport.use(new facebookStrategy({
	clientID: config.fb.appId,
	clientSecret: config.fb.appSecret,
	callbackURL: config.fb.url + 'fbauthed',
}, function(accessToken, refreshToken, profile, done)
	{
		process.nextTick(function(){
			var query = user.findOne({'fbId': profile.id});
			query.exec(function(err, oldUser){
				
				if(oldUser)
				{
					done(null, oldUser);
				}
				else{
					var newUser = new user();
					newUser.fbId = profile.id;
					newUser.name = profile.displayName;
					newUser.email = profile.emails[0].value;
					newUser.fbUserName = profile.username;
					newUser.bio = profile.bio || "...";
					newUser.credits = 5;
					console.log(newUser);
					newUser.save(function(err){
						if(err){
							throw err;
						}
						done(null, newUser);
					});
				}
			});
			
		});
	}
));
