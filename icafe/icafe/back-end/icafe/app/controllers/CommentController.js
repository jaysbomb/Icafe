'use strict';

var gcm = require('node-gcm');
var message = new gcm.Message();
var Promise = require('promise');
var mongoose = require('mongoose'),
    Promise = mongoose.Promise;
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');

var sender = new gcm.Sender('AIzaSyBN94xyDvcaz_UHa5VhmgblORq9ENigtL4');

exports.getCommentsByShop = function *(next) {
	var shop_id = this.params.shop_id;
  this.body = yield Comment.find({"place": shop_id}, function (err, docs) {}).populate('user');
};

exports.getCommentsByUser = function *(next) {
	var user_id = this.params.user_id;
  this.body = yield Comment.find({"user": user_id}, function (err, docs) {}).populate('place');
};

exports.saveComment = function *(next) {
	var input = this.request.body;
	
	var p = new Promise();
	var comment = new Comment({
		user: input.user,
		rating: input.rating,
		text: input.text,
		place: input.place
	});

	var owner = yield User.findOne({ "_id": input.owner }, function(err, user) {});
	if(owner) {
		if(owner.gcm_id) {
				message.addData('wom', "You have recieved a new comment!")
				var gcm_id = [owner.gcm_id];
				sender.send(message, { registrationTokens: gcm_id}, function(err, response) {
				  if (err) console.error(err);
				  else console.log(response);
				});
		}
	}
	
	this.body = yield comment.save(function(err, data) {});
};