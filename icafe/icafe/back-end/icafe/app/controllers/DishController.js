'use strict';
var Promise = require('promise');
var mongoose = require('mongoose');
	Promise = mongoose.Promise;
var Dish = mongoose.model('Dish');

exports.getDishById = function *(next){
	var dish_id = this.params.dish_id;
	this.body = yield Dish.find({"_id": dish_id},function(err,dish){});
}

exports.addDish = function *(next){
	var input = this.request.body;
	var isExisting = yield Dish.find({"name": input.name, "category": input.category, 
		},function(err,coffees){}).populate('dish');

	if(isExisting.length == 0){
		var dish = new Dish({
			name: input.name,
			category: input.category,
			description: input.description,
			price: input.price,
			period: input.period,
		});
		this.body = yield dish.save(function(err,data){});
	} else{
		this.body = {"status": 500, "msg": "added already"};
	}
};

exports.getAllDishes = function *(next){
    this.body = yield Dish.find(function(err,dishes){});
};

exports.updateDish = function *(next){
	var dish_id = this.params.dish_id;
	var input = this.request.body;
	var dish = yield Dish.findOne({"_id": dish_id, },function(err,dish){});
	if(dish){
		dish.name = input.name;
		dish.price = input.price;
		dish.description = input.description;
		dish.category = input.category;
		dish.period = input.period;
		this.body = yield dish.save(function(err,data){});
	}else{
		this.body = {"status": 500, "msg": "no dish found"};
	}
}

exports.deleteDish = function *(next){
	var dish_id = this.params.dish_id;
	var dish = yield Dish.findOne({"_id": dish_id, },function(err,dishes){});
	if(dish){
		this.body = yield Dish.findByIdAndRemove({ "_id": dish_id }, function(err, data) {});		
	}else{
		this.body = {"status": 500, "msg": "no dish found"};
	}	
};

exports.addDishToRecommend = function *(next){
	var dish_id = this.params.dish_id;
	var dish = yield Dish.findOne({"_id": dish_id, },function(err,dishes){});
	if(dish.isRecommended == true){
		this.body = {"status": 500, "msg": "Already in recommend list"};
	}else{
		dish.isRecommended = true;
		this.body = yield dish.save(function(err, dish) {});
	}
}

exports.getRecommendedDishes = function *(next){
	this.body = yield Dish.find({"isRecommended": true},function(err,dishes){});
}

exports.getDessertBreakfast = function *(next){
	this.body = yield Dish.find({"category": "Dessert", "period":"Breakfast"},function(err,dishes){});
}

exports.getDessertLunch = function *(next){
	this.body = yield Dish.find({"category": "Dessert", "period":"Lunch"},function(err,dishes){});
}

exports.getDessertSupper = function *(next){
	this.body = yield Dish.find({"category": "Dessert", "period":"Supper"},function(err,dishes){});
}

exports.getSalad = function *(next){
	this.body = yield Dish.find({"category": "Salad"},function(err,dishes){});
}

exports.getStaple = function *(next){
	this.body = yield Dish.find({"category": "Staple"},function(err,dishes){});
}

exports.getDrink = function *(next){
	this.body = yield Dish.find({"category": "Drink"},function(err,dishes){});
}

exports.getSoup = function *(next){
	this.body = yield Dish.find({"category": "Soup"},function(err,dishes){});
}

exports.getSnack = function *(next){
	this.body = yield Dish.find({"category": "Snack"},function(err,dishes){});
}


