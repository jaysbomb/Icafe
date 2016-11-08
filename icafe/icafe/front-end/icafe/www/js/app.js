angular.module('starter', ['ionic', 'starter.controllers',
  'LocalStorageModule', 'ion-autocomplete',
  'ngCordova', 'ngProgressLite', 'ionic-ratings',
  "firebase",
])

.run(function($ionicPlatform, $rootScope, localStorageService, $state,
    ngProgressLite, $cordovaPush, $timeout, $ionicPopup) {
    $ionicPlatform.ready(function() {
      var androidConfig = {
        "senderID": "789884280346",
      };
      $cordovaPush.register(androidConfig).then(function(result) {

      }, function(err) {

      })

      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {

        StatusBar.styleDefault();
      }
      $rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {
        switch (notification.event) {
          case 'registered':
            if (notification.regid.length > 0) {
              localStorageService.set('gcm_id', notification.regid);
            }
            break;
          case 'message':
            var alertPopup = $ionicPopup.alert({
              title: 'WOM',
              template: notification.payload.wom
            });
            break;
          case 'error':
            alert('GCM error = ' + notification.msg);
            break;

          default:
            alert('An unknown GCM event has occurred');
            break;
        }
      });
    });

    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams) {
      ngProgressLite.start();
      $timeout(function() {
        ngProgressLite.done();
      }, 1000);
      // if (localStorageService.get('user') == null && toState.url != "/signup") {
      //   $state.go('login');
      // }

    });

  })
  .constant('Base_Url', 'http://localhost:1337')


.config(function($stateProvider, $urlRouterProvider, ngProgressLiteProvider) {
  $stateProvider
    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'AppCtrl'
    })

  .state('app.search', {
      url: '/search',
      views: {
        'menuContent': {
          templateUrl: 'templates/search.html',
          controller: 'SearchCtrl'
        }
      }
    })
    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl'
    })
    .state('signup', {
      url: '/signup',
      templateUrl: 'templates/signup.html',
      controller: 'SignupCtrl'
    })
    .state('app.favorites', {
      url: '/favorites',
      views: {
        'menuContent': {
          templateUrl: 'templates/favorites.html',
          controller: 'FavoritesCtrl'
        }
      }
    })
    .state('app.shoplist', {
      url: '/shoplist',
      views: {
        'menuContent': {
          templateUrl: 'templates/shoplist.html',
          controller: 'ShoplistCtrl'
        }
      }
    })
    .state('app.restaurantlist', {
      url: '/restaurantlist',
      views: {
        'menuContent': {
          templateUrl: 'templates/restaurantlist.html',
          controller: 'RestaurantlistCtrl'
        }
      }
    })
    .state('app.cart', {
      url: '/cart',
      views:{
        'menuContent': {
          templateUrl: 'templates/cart.html',
          controller: 'CartCtrl'
        } 
      }
    })
    .state('app.recommend', {
      url: '/recommend',
      views:{
        'menuContent': {
          templateUrl: 'templates/recommend.html',
          controller: 'RecommendCtrl'
        } 
      }
    })
    .state('app.salad', {
      url: '/salad',
      views:{
        'menuContent': {
          templateUrl: 'templates/salad.html',
          controller: 'SaladCtrl'
        } 
      }
    })
    .state('app.staple', {
      url: '/staple',
      views:{
        'menuContent': {
          templateUrl: 'templates/staple.html',
          controller: 'StapleCtrl'
        } 
      }
    })
    .state('app.dessert', {
      url: '/dessert',
      views:{
        'menuContent': {
          templateUrl: 'templates/dessert.html',
          controller: 'DessertCtrl'
        } 
      }
    })
    .state('app.drink', {
      url: '/drink',
      views:{
        'menuContent': {
          templateUrl: 'templates/drink.html',
          controller: 'DrinkCtrl'
        } 
      }
    })
    .state('app.soup', {
      url: '/soup',
      views:{
        'menuContent': {
          templateUrl: 'templates/soup.html',
          controller: 'SoupCtrl'
        } 
      }
    })
    .state('app.snack', {
      url: '/snack',
      views:{
        'menuContent': {
          templateUrl: 'templates/snack.html',
          controller: 'SnackCtrl'
        } 
      }
    })
    .state('app.setmeal', {
      url: '/setmeal',
      views:{
        'menuContent': {
          templateUrl: 'templates/setmeal.html',
          controller: 'SetmealCtrl'
        } 
      }
    })
    .state('app.dishes', {
      url: '/dishes',
      views:{
        'menuContent': {
          templateUrl: 'templates/dishes.html',
          controller: 'DishesCtrl'
        } 
      }
    })
    .state('app.pay', {
      url: '/pay',
      views:{
        'menuContent': {
          templateUrl: 'templates/pay.html',
          controller: 'PayCtrl'
        } 
      }
    })
    .state('app.order', {
      url: '/order',
      views:{
        'menuContent': {
          templateUrl: 'templates/order.html',
          controller: 'OrderCtrl'
        } 
      }
    })
    .state('app.users', {
      url: '/users',
      views:{
        'menuContent': {
          templateUrl: 'templates/users.html',
          controller: 'UsersCtrl'
        } 
      }
    })
    .state('app.cinemalist', {
      url: '/cinemalist',
      views: {
        'menuContent': {
          templateUrl: 'templates/cinemalist.html',
          controller: 'CinemalistCtrl'
        }
      }
    })
    .state('app.winebar', {
      url: '/winebarlist',
      views: {
        'menuContent': {
          templateUrl: 'templates/winebarlist.html',
          controller: 'WinebarlistCtrl'
        }
      }
    })
    .state('app.cafe', {
      url: '/cafelist',
      views: {
        'menuContent': {
          templateUrl: 'templates/cafelist.html',
          controller: 'CafelistCtrl'
        }
      }
    })
    .state('app.movie', {
      url: '/movielist',
      views: {
        'menuContent': {
          templateUrl: 'templates/movielist.html',
          controller: 'MovielistCtrl'
        }
      }
    })
    .state('app.coffeelist',{
      url: '/coffeelist',
      views: {
        'menuContent':{
          templateUrl: 'templates/coffeelist.html',
          controller: 'CoffeeListCtrl'
        }
      }
    })
    .state('app.moviefinder', {
      url: '/moviefinder',
      views: {
        'menuContent': {
          templateUrl: 'templates/movie-finder.html',
          controller: 'MovieFinderCtrl'
        }
      }
    })
    .state('app.movieDetails', {
      url: '/movieDetails',
      views: {
        'menuContent': {
          templateUrl: 'templates/movie-comments.html',
          controller: 'MovieCommentCtrl'
        }
      }
    })
    .state('app.commentlist', {
      url: '/commentlist',
      views: {
        'menuContent': {
          templateUrl: 'templates/commentlist.html',
          controller: 'CommentCtrl'
        }
      }
    })
    .state('app.defaultsettings', {
      url: '/defaultsettings',
      views: {
        'menuContent': {
          templateUrl: 'templates/defaultsettings.html',
          controller: 'DefaultSettingsCtrl'
        }
      }
    })
    .state('logout', {
      url: '/logout',
      controller: 'LogoutCtrl'
    })
    .state('app.admin', {
      url: '/admin',
      views: {
        'menuContent': {
          templateUrl: 'templates/admin.html',
          controller: 'AdminCtrl'
        }
      }
    })
    .state('app.shopSetting', {
      url: '/admin-shop-setting',
      views: {
        'menuContent': {
          templateUrl: 'templates/admin-shop-setting.html',
          controller: 'AdminShopSettingCtrl'
        }
      }
    })
    .state('app.single', {
      url: '/shop',
      views: {
        'menuContent': {
          templateUrl: 'templates/shop.html',
          controller: 'ShopCtrl'
        }
      },
      onEnter: function() {
        console.log("enter")
      }
    });
  ngProgressLiteProvider.settings.speed = 1000;
  $urlRouterProvider.otherwise('/app/recommend');
});
