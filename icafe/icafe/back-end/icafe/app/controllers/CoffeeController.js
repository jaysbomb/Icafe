'use strict';
var Promise = require('promise');
var mongoose = require('mongoose');
	Promise = mongoose.Promise;
var Coffee = mongoose.model('Coffee');

exports.getAllCoffees = function *(next){
    this.body = yield Coffee.find(function(err,places){});
};

exports.getCoffeesByUserId = function *(next){
	var user_id = this.params.user_id;
	this.body = yield Coffee.find({"user": user_id},function(err,coffees){});
};

exports.addCoffee = function *(next){
	var input = this.request.body;
	var isExisting = yield Coffee.find({"user": input.user, "name": input.name, 
		"shopname":input.shopname},function(err,coffees){}).populate('coffee');

	if(isExisting.length == 0){
		var coffee = new Coffee({
			name: input.name,
			shopname: input.shopname,
			user: input.user,
			username: input.username,
			latitude: input.latitude,
			longitude: input.longitude,
			price: input.price,
			rating: input.rating,
		});
		this.body = yield coffee.save(function(err,data){});
	} else{
		this.body = {"status": 500, "msg": "added already"};
	}
};

exports.deleteCoffee = function *(next){
	var coffee_id = this.params.coffee_id;
	var coffee = yield Coffee.findOne({"_id": coffee_id, },function(err,coffees){});
	if(coffee.name){
		this.body = yield Coffee.findByIdAndRemove({ "_id": coffee_id }, function(err, data) {});		
	}else{
		this.body = {"status": 500, "msg": "no coffee found"};
	}	
};

exports.updateCoffee = function *(next){
	var coffee_id = this.params.coffee_id;
	var input = this.request.body;
	var coffee = yield Coffee.findOne({"_id": coffee_id, },function(err,coffees){});
	if(coffee){
		coffee.name = input.name;
		coffee.price = input.price;
		coffee.rating = input.rating;
		this.body = yield coffee.save(function(err,data){});
	}else{
		this.body = {"status": 500, "msg": "no coffee found"};
	}
};

exports.incrementUpvote = function *(next){
	var coffee_id = this.params.coffee_id;
	var coffee = yield Coffee.findOne({"_id": coffee_id, },function(err,coffees){});
	if(coffee){
		coffee.upvotes += 1;
		this.body = yield coffee.save(function(err,data){});
	}else{
		this.body = {"status": 500, "msg": "no coffee found"};
	}
};