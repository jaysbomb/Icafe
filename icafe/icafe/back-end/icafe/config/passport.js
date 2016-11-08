'use strict';
var mongoose = require('mongoose'),
    LocalStrategy = require('passport-local').Strategy,
    Promise = mongoose.Promise;

var User = mongoose.model('User');

module.exports = function(passport, config) {
    
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findOne({ _id: id }, function (err, user) {
            done(err, user);
        });
    });

    passport.use('local-login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        },
        function(email, password, done) {
            
            User.findOne({ email: email }, function (err, user) {
                
                if (err) { return done(err); }

                if (!user) {
                    return done(null, false, { message: 'Unknown user' });
                }

                if (!user.authenticate(password)) {
                    return done(null, false, { message: 'Invalid password' });
                }

                return done(null, user);
            });
        }
    ));

    passport.use('local-signup', new LocalStrategy(
     {  
        usernameField: 'name',
        useremailField : 'email',
        passwordField : 'password',
        passReqToCallback : true},
      function(req, email, password, done) {
       
        User.findOne({ email: req.body.email }, function (err, user) {
        
            if (err) { return done(err); }
            if (!user) {
                
              var p = new Promise();
             var user = new User({
                name: req.body.name,
                email:  req.body.email,
                password: req.body.password,
                avatar_id : req.body.avatar_id,
             });
              user.save(function(error, data) {
                  if (error) {
                    p.reject(error);
                  } else {
                    p.resolve(null, data);
                  }
                });
               return done(null, user);
            }else{
                return done(null, false);
            }
        });
      }
    ));
};
