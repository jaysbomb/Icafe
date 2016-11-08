'use strict';
var Promise = require('promise');
var mongoose = require('mongoose');
	Promise = mongoose.Promise;
var Order = mongoose.model('Order');

exports.addOrder = function *(next){
	var input = this.request.body;
	if(input.user){
		var order = new Order({
			user : input.user,
			dish : input.dish,
			dishamount : input.dishamount,
			totalprice : input.price,
			table : input.table,
			bankname : input.bankname,
			bankcard : input.bankcard,
			status: input.status,
		});
		this.body = yield order.save(function(err,data){});
	}else{
		console.log(input.bankcard);
		var order = new Order({
			dish : input.dish,
			dishamount : input.dishamount,
			totalprice : input.price,
			table : input.table,
			bankname : input.bankname,
			bankcard : input.bankcard,
			status: input.status,
		});
		this.body = yield order.save(function(err,data){});
	}
}

exports.getUserOrder = function *(next){
	var user_id = this.params.user_id;
	// this.body = yield Order.find({"user": user_id},function(err,dishes){});
	var orders = yield Order.find({"user": user_id},function(err,dishes){});
	for(var i = 0; i < orders.length; i++){
		if(orders[i].status == 0){
			this.body = orders[i];
		}
	}
}

exports.getTableOrder = function *(next){
	var table = this.params.table;
	var order = yield Order.find({"table": table},function(err,dishes){});
	for(var i = 0; i < order.length; i++){
		if(order[i].user == undefined){
			this.body = order[i];
		}
	}
}

exports.updateOrderStatus = function *(next){
	var order_id = this.params.order_id;
	var input = this.request.body;
	var order = yield Order.findOne({"_id": order_id, },function(err,order){});
	if(order){
		order.status = input.status;
		this.body = yield order.save(function(err,data){});
	}else{
		this.body = {"status": 500, "msg": "no order found"};
	}
}