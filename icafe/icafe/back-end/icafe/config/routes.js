'use strict';


var home = require('../app/controllers/HomeController');
var place = require('../app/controllers/PlaceController');
var comment = require('../app/controllers/CommentController');
var user = require('../app/controllers/UserController');
var favorite = require('../app/controllers/FavoriteController');
var gcm = require('../app/controllers/GCMController');
var movie = require('../app/controllers/MovieController');
var coffee = require('../app/controllers/CoffeeController');
var dish = require('../app/controllers/DishController');
var cartdish = require('../app/controllers/CartdishController');
var order = require('../app/controllers/OrderController');
var mongoose = require('mongoose');
var Place = mongoose.model('Place');

module.exports = function(router, passport) {
  Place.count({}, function(err, count) {
    if (count <= 0) {
      place.loadInitialPlaces();
    }
  })

  router.get('/', home.index);
  router.post('/addOrder',order.addOrder);
  router.get('/getUserOrder/:user_id',order.getUserOrder);
  router.get('/getTableOrder/:table',order.getTableOrder);
  router.put('/updateOrderStatus/:order_id',order.updateOrderStatus);
  router.post('/addCartdish',cartdish.addCartdish);
  router.post('/minusCartDish',cartdish.minusCartDish);
  router.get('/getUserCart/:user_id',cartdish.getUserCart);
  router.get('/getTableCart/:table',cartdish.getTableCart);
  router.delete('/clearUserCart/:user_id',cartdish.clearUserCart);
  router.delete('/clearTableCart/:table',cartdish.clearTableCart);
  router.post('/addDish',dish.addDish);
  router.post('/updateDish/:dish_id',dish.updateDish);
  router.get('/getDishById/:dish_id',dish.getDishById);
  router.get('/getAllDishes',dish.getAllDishes);
  router.get('/getRecommendedDishes',dish.getRecommendedDishes);
  router.get('/getDessertBreakfast',dish.getDessertBreakfast);
  router.get('/getDessertLunch',dish.getDessertLunch);
  router.get('/getDessertSupper',dish.getDessertSupper);
  router.get('/getSalad',dish.getSalad);
  router.get('/getStaple',dish.getStaple);
  router.get('/getDrink',dish.getDrink);
  router.get('/getSoup',dish.getSoup);
  router.get('/getSnack',dish.getSnack);
  router.delete('/deleteDish/:dish_id',dish.deleteDish);
  router.put('/addDishToRecommend/:dish_id',dish.addDishToRecommend);
  router.get('/getAdmin/:email',user.getAdmin);
  router.get('/getAllUsers',user.getAllUsers);
  router.put('/updateFrequency/:user_id',user.updateFrequency);
  router.delete('/deleteUser/:user_id',user.deleteUser);
  router.get('/getAllPlaces',place.getAllPlaces);
  router.get('/getPlaceByLocation', place.getPlaceByLocation);
  router.get('/getCinemas', place.getCinemas);
  router.get('/getRestaurants',place.getRestaurants);
  router.get('/getWineBars',place.getWineBars);
  router.get('/getCafes',place.getCafes);
  router.get('/getPlaceOrderByDistance', place.getPlaceOrderByDistance);
  router.get('/getPlaceByQRCode', place.getPlaceByQRCode);
  router.get('/getPlaceByKey/:keywords', place.getPlaceByKey);
  router.get('/getPlaceById/:shop_id', place.getPlaceById);
  router.get('/getCommentsByShop/:shop_id', comment.getCommentsByShop);
  router.get('/getCommentsByUser/:user_id', comment.getCommentsByUser);
  router.get('/getPlaceOrderByRating', place.getPlaceOrderByRating);
  router.post('/saveComment', comment.saveComment);
  router.post('/socialLogin/:type', user.socialLogin);
  router.post('/favorite', favorite.addFavorite);
  router.get('/favorite/:user_id', favorite.getFavorite);
  router.put('/updateInfo/:place_id', place.updateInfo);
  router.put('/updateUserInfo/:user_id', user.updateInfo);
  router.put('/setAdmin/:email', user.setAdmin);
  router.put('/setTableNumber/:email',user.setTableNumber);
  router.get('/sendMessage', gcm.sendMsg);
  router.get('/getAllPlayingMovies', movie.getAllPlayingMovies);
  router.get('/getMovieInfo/:movie_id', movie.getMovieInfo);
  router.get('/getAllCoffees',coffee.getAllCoffees);
  router.get('/getCoffeesByUserId/:user_id',coffee.getCoffeesByUserId);
  router.post('/addCoffee',coffee.addCoffee);
  router.delete('/deleteCoffee/:coffee_id',coffee.deleteCoffee);
  router.post('/updateCoffee/:coffee_id',coffee.updateCoffee);
  router.put('/upvoteCoffee/:coffee_id',coffee.incrementUpvote);

  router.post('/signup', function*(next) {
    var ctx = this
    yield passport.authenticate('local-signup', function*(err, user, info) {
      if (err) throw err
      if (user === false) {
        ctx.status = 401 
        ctx.body = { success: false , status: 401 }
      } else {
        ctx.body = { success: true, user: user }
      }
    }).call(this, next)
  });
  router.post('/login', function*(next) {
    var ctx = this
    yield passport.authenticate('local-login', function*(err, user, info) {

      if (err) throw err
      if (user === false) {
        ctx.status = 401
        ctx.body = { success: false , status: 401}
      } else {
        ctx.body = { success: true, user: user }
      }
    }).call(this, next)
  });
};
