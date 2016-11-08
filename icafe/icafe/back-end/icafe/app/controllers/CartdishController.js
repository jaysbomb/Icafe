'use strict';
var Promise = require('promise');
var mongoose = require('mongoose');
	Promise = mongoose.Promise;
var Cartdish = mongoose.model('Cartdish');

exports.addCartdish = function *(next){
	var input = this.request.body;
	console.log(input)
	if(input.user){
		var isCartdish = yield Cartdish.findOne({"user": input.user, "dish": input.dish,},function(err,cartdish){});
		if(!isCartdish){
			var cartdish = new Cartdish({
				user: input.user,
				dish: input.dish,
				amount: input.amount,
			});
			this.body = yield cartdish.save(function(err,data){});
		}else{
			var cartdish = yield Cartdish.findOne({"user": input.user, "dish": input.dish,},function(err,cartdish){});
			if(cartdish){
				cartdish.amount += 1 ;
				this.body = yield cartdish.save(function(err,data){});
			}
		}
	}else{
		var isCartdish = yield Cartdish.findOne({"table": input.table, "dish": input.dish,},function(err,cartdish){});
		if(!isCartdish){
			var cartdish = new Cartdish({
				table: input.table,
				dish: input.dish,
				amount: input.amount,
			});
			this.body = yield cartdish.save(function(err,data){});
		}else{
			var cartdish = yield Cartdish.findOne({"table": input.table, "dish": input.dish,},function(err,cartdish){});
			if(cartdish){
				cartdish.amount += 1 ;
				this.body = yield cartdish.save(function(err,data){});
			}
		}
	}
	
};

exports.minusCartDish = function *(next){
	var input = this.request.body;
	if(input.user){
		var cartdish = yield Cartdish.findOne({"user": input.user, "dish": input.dish,},function(err,cartdish){});
		if(cartdish.amount - 1 == 0){
			this.body = yield Cartdish.findByIdAndRemove({"_id":input.id}, function(err, data) {});
		}else{
			cartdish.amount -= 1 ;
			this.body = yield cartdish.save(function(err,data){});
		}
	}else{
		var cartdish = yield Cartdish.findOne({"table": input.table, "dish": input.dish,},function(err,cartdish){});
		if(cartdish.amount - 1 == 0){
			this.body = yield Cartdish.findByIdAndRemove({"_id":input.id}, function(err, data) {});
		}else{
			cartdish.amount -= 1 ;
			this.body = yield cartdish.save(function(err,data){});
		}
	}

	
}

exports.clearUserCart = function *(next){
	var user_id = this.params.user_id;
	this.body = yield Cartdish.remove({ "user": user_id }, function(err, data) {});
}

exports.clearTableCart = function *(next){
	var table = this.params.table;
	this.body = yield Cartdish.remove({ "table": table }, function(err, data) {});
}

exports.getUserCart = function *(next){
	var user_id = this.params.user_id;
	this.body = yield Cartdish.find({"user": user_id},function(err,dishes){});
}

exports.getTableCart = function *(next){
	var table = this.params.table;
	this.body = yield Cartdish.find({"table": table},function(err,dishes){});
}

