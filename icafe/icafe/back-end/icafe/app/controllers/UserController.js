'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Promise = mongoose.Promise;

exports.getAdmin = function *(next){
  var email = this.params.email;
  this.body = yield User.findOne({"email": email, },function(err,users){});
}

exports.getAllUsers = function *(next){
    this.body = yield User.find(function(err,users){});
};

exports.deleteUser = function *(next){
  var user_id = this.params.user_id;
  var user = yield User.findOne({"_id": user_id, },function(err,users){});
  if(user){
    this.body = yield User.findByIdAndRemove({ "_id": user_id }, function(err, data) {});   
  }else{
    this.body = {"status": 500, "msg": "no user found"};
  } 
};

exports.updateFrequency = function *(next){
  var user_id = this.params.user_id;
  var input = this.request.body;
  var user = yield User.findOne({ "_id": user_id }, function(err, user) {});
  if (input.frequency) {
    user.frequency = input.frequency;
  }
  this.body = yield user.save(function(err, user) {});
}

exports.updateInfo = function*(next) {
  var user_id = this.params.user_id;
  var input = this.request.body;
  var user = yield User.findOne({ "_id": user_id }, function(err, user) {});
  if (input.email) {
    user.email = input.email;
  }

  if (input.gcm_id) {
    user.gcm_id = input.gcm_id;
  }
  this.body = yield user.save(function(err, user) {});
};

exports.setAdmin = function*(next) {
  var email = this.params.email;
  var input = this.request.body;
  var user = yield User.findOne({ "email": email }, function(err, user) {});

  user.isAdmin = input.isAdmin;
  this.body = yield user.save(function(err, user) {});
};

exports.setTableNumber = function*(next){
  var email = this.params.email;
  var input = this.request.body;
  var user = yield User.findOne({ "email": email }, function(err, user) {});
  user.table = input.table;
  this.body = yield user.save(function(err, user) {});
}

exports.socialLogin = function*(next) {
  var socialType = this.params.type;
  var input = this.request.body;
  if (socialType === 'facebook') {
    console.log(input)
    var existUser = yield User.findOne({ facebook_id: input.id }, function(err, user) {});
    if (existUser) {
      this.body = existUser;
    } else {
      var user = new User({
        facebook_id: input.id
      });
      this.body = yield user.save(function(err, user) {});
    }
  } else if (socialType === 'twitter') {
    var existUser = yield User.findOne({ twitter_id: input.id }, function(err, user) {});
    if (existUser) {
      this.body = existUser;
    } else {
      var user = new User({
        twitter_id: input.id
      });
      this.body = yield user.save(function(err, user) {});
    }
  }

};
