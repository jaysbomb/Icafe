'use strict';
var geodist = require('geodist');
var Promise = require('promise');
var co = require('co');
var Factual = require('factual-api');
var factual = new Factual('I00LjsxrMizsH8gkmm4BokaYOL6Yit9W2NK8eZgE', 'IT72U6Z6HZ3dKc0pdUTZcfjzx7893nLzL9F7e6pa');
var mongoose = require('mongoose');
var Place = mongoose.model('Place');
var Comment = mongoose.model('Comment');

exports.getAllPlaces = function *(){
    this.body = yield Place.find(function(err,places){});
}

exports.getCinemas = function*(next) {
  this.body = yield new Promise(function(fulfill, reject) {
    factual.get('/t/places', { filters: { category_ids: { "$includes_any": [332] } }, geo: { "$circle": { "$center": [52.2567, -7.1292], "$meters": 8000 } } }, function(error, res) {
      if (error) reject(error);
      else fulfill(res);
    })
  });
}

exports.getRestaurants = function*(next){
  this.body = yield new Promise(function(fulfill, reject){
     factual.get('/t/places', { filters: { category_ids: { "$includes_any": [347] } }, geo: { "$circle": { "$center": [52.2567, -7.1292], "$meters": 8000 } } }, function(error, res) {
      if (error) reject(error);
      else fulfill(res);
    })
  });
}

exports.getWineBars = function*(next){
  this.body = yield new Promise(function(fulfill, reject){
     factual.get('/t/places', { filters: { category_ids: { "$includes_any": [316] } }, geo: { "$circle": { "$center": [52.2567, -7.1292], "$meters": 8000 } } }, function(error, res) {
      if (error) reject(error);
      else fulfill(res);
    })
  });
}

exports.getCafes = function*(next){
  this.body = yield new Promise(function(fulfill, reject){
     factual.get('/t/places', { filters: { category_ids: { "$includes_any": [342] } }, geo: { "$circle": { "$center": [52.2567, -7.1292], "$meters": 8000 } } }, function(error, res) {
      if (error) reject(error);
      else fulfill(res);
    })
  });
}

exports.getPlaceByLocation = function*(next) {
  var params = this.request.query;
  var longitude = params.longitude;
  var latitude = params.latitude;
  var radius = (typeof params.radius === 'undefined') ? 10000 : params.radius;

  this.body = yield Place.find({}, function(err, places) {});
};

exports.getPlaceOrderByDistance = function*(next) {
  var params = this.request.query;
  var longitude = params.longitude;
  var latitude = params.latitude;
  var radius = (typeof params.radius === 'undefined') ? 10000 : params.radius;

  this.body = yield Place.find({}, null, { sort: { dist: 1 } }, function(err, places) {});
};

exports.getPlaceByQRCode = function*(next) {
  var shop_id = this.params.shop_id;
  this.body = yield Place.find({ "factual_id": qr_code }, function(err, places) {});
};

exports.getPlaceByKey = function*(next) {
  var key = this.params.keywords;
  this.body = yield Place.find({ "name": {'$regex': key} }, function(err, places) {});
};

exports.getPlaceById = function*(next) {
  var shop_id = this.params.shop_id;
  this.body = yield Place.findOne({ "_id": shop_id }, function(err, places) {});
};

exports.getPlaceOrderByRating = function*(next) {
  var shop_id = this.params.shop_id;
  var shops_arr = yield Comment.aggregate([{
    $group: {
      _id: '$place',
      ratingAvg: { $avg: '$rating' }
    }
  }], function(err, results) {});
  var shops = [];
  for (var i = 0; i < shops_arr.length; i++) {
    var shop_avg = shops_arr[i];

    var shop = yield Place.find({ "_id": shop_avg._id }, function(err, places) {});
    shop["ratingAvg"] = shop_avg.ratingAvg;
    shops.push(shop);

  }
  this.body = shops;
};

exports.updateInfo = function*(next) {
  var place_id = this.params.place_id;
  var input = this.request.body;
  var place = yield Place.findOne({ "_id": place_id }, function(err, place) {});
  place.tel = input.tel;
  place.website = input.website;
  place.owner = input.owner;
  this.body = yield place.save(function(err, place) {});
};

exports.loadInitialPlaces = function() {
  factual.get('/t/places', { filters: { category_ids: { "$includes_any": [332,347,316,342] } }, geo: { "$circle": { "$center": [52.2567, -7.1292], "$meters": 2500 } } }, function(error, res) {
    var places = res.data;
    for (var i = 0; i < places.length; i++) {
      var placeInfo = places[i];
      var place = new Place({
        name: placeInfo.name,
        factual_id: placeInfo.factual_id,
        longitude: placeInfo.longitude,
        latitude: placeInfo.latitude,
        region: placeInfo.region,
        tel: placeInfo.tel,
        website: placeInfo.website,
        address: placeInfo.address,
        dist: geodist({ lat: 52.2567, lon: -7.1292 }, { lat: placeInfo.latitude, lon: placeInfo.longitude }, { exact: true, unit: 'km' }).toFixed(1)
      });
      place.save(function(err) {
        if (err) throw err;
      });
    }
  })

};
