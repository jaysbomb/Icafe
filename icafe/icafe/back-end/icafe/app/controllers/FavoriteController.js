'use strict';

var Promise = require('promise');
var mongoose = require('mongoose'),
  Promise = mongoose.Promise;
var Favorite = mongoose.model('Favorite');


exports.getFavorite = function*(next) {
  var user_id = this.params.user_id;
  this.body = yield Favorite.find({ "user": user_id }, function(err, favorites) {}).populate('place');
};

exports.addFavorite = function*(next) {
  var input = this.request.body;

  var isExisting = yield Favorite.find({ "user": input.user, "place": input.place }, function(err, favorites) {}).populate('place');

  if (isExisting.length == 0) {
    var favorite = new Favorite({
      user: input.user,
      place: input.place
    });
    this.body = yield favorite.save(function(err, data) {});
  } else {

    this.body = { "status": 500, "msg": "added already" }
  }

};
