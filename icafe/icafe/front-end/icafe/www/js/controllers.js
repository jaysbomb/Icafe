angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $http, $ionicModal, $timeout,
  localStorageService, ngProgressLite, $state, $cordovaBarcodeScanner) {
  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.user = localStorageService.get('user');
    $http.get("http://localhost:1337/getAdmin/admin@admin.com")
        .then(function(response){
          // console.log(response.data.table);
          $scope.tableNumber = response.data.table;
        })
    $scope.openSub = function(name) {
      $scope.submenu = true;
      $scope.selection = 'sub';
    }
    $scope.openSub2 = function(name) {
      $scope.submenu = true;
      $scope.selection = 'sub2';
    }
    $scope.backToMain = function() {
      $scope.submenu = false;
      $scope.selection = 'main';
    }
    
    if($scope.user != null){
      $scope.goLogin = "Logout";
      $scope.loginOrNot = false;
      if($scope.user.isAdmin && $scope.user.isAdmin == true){
        $scope.showAdmin = true;
      }else{
        $scope.showAdmin = false;
      }
      $http.get("http://localhost:1337/getUserCart/" + $scope.user._id )
        .then(function(response){
          // console.log(response.data.length);
          $scope.cartNumber = response.data.length; 
        })


    }else{
      $scope.loginOrNot = true;
      $scope.goLogin = "Go Login";
       $http.get("http://localhost:1337/getAdmin/admin@admin.com")
        .then(function(response){
          console.log(response.data.table);
          $scope.tableNumber = response.data.table;
          $http.get("http://localhost:1337/getTableCart/" + $scope.tableNumber )
          .then(function(response){
            console.log(response.data.length);
            $scope.cartNumber = response.data.length; 
          })
        })
      
    } // end of if user exist
    
  });

  $scope.goToCart = function(){
    $state.go('app.cart');
  }
  $scope.goToLogin = function(){
    $state.go('login');
  }
})

.controller('ShopCtrl', function($scope, $http, Base_Url, localStorageService,
  $ionicLoading, $compile, $ionicPopup, $ionicModal, $window, $firebaseArray) {

  $scope.shop = localStorageService.get('shop');
  $scope.user = localStorageService.get('user');
  var commentsRef = new Firebase("https://wit-wom.firebaseio.com/" + $scope.shop._id);
  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.comments = $firebaseArray(commentsRef);
    var gcm_id = localStorageService.get('gcm_id');
    if (gcm_id) {
      $http.put(Base_Url + "/updateUserInfo/" + $scope.user._id, { gcm_id: gcm_id }).then(function(response) {
        console.log(response);
      });
    }
  });

  $ionicModal.fromTemplateUrl('templates/postcomment.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.openModal = function() {
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  var rating;
  $scope.ratingsObject = {
    iconOn: 'ion-ios-star',
    iconOff: 'ion-ios-star-outline',
    iconOnColor: 'rgb(200, 200, 100)',
    iconOffColor: 'rgb(200, 100, 100)',
    rating: 0,
    minRating: 1,
    readOnly: true,
    callback: function(rating) {
      $scope.ratingsCallback(rating);
    }
  };

  $scope.ratingsCallback = function(rating) {
    this.rating = rating
  };

  $scope.post = function(comment) {
    var owner = null;
    if ($scope.shop.owner) {
      owner = $scope.shop.owner;
    }
    var comment_post_server = {
      'user': $scope.user._id,
      'place': $scope.shop._id,
      'rating': this.rating,
      'text': comment,
      'owner': owner
    }
    var comment_post_firebase = {
      'user': $scope.user.email,
      'place': $scope.shop._id,
      'rating': this.rating,
      'text': comment,
      'timestamp': Date.now()
    }
    $scope.comments.$add(comment_post_firebase).then(function() {
      var alertPopup = $ionicPopup.alert({
        title: 'WOM',
        template: 'Your comment has been posted!'
      });
      $scope.closeModal();
    });

    $http.post(Base_Url + "/saveComment", comment_post_server)
      .then(function(response) {});
  }

  function initialize() {
    var myLatlng = new google.maps.LatLng($scope.shop.latitude, $scope.shop.longitude);

    var mapOptions = {
      center: myLatlng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("shopmap"),
      mapOptions);

    var contentString = "<p>" + $scope.shop.name + "</p>";
    var compiled = $compile(contentString)($scope);

    var infowindow = new google.maps.InfoWindow({
      content: compiled[0]
    });

    var marker = new google.maps.Marker({
      position: myLatlng,
      map: map,
      title: 'WOM'
    });

    google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map, marker);
    });

    $scope.map = map;
  }
  google.maps.event.addDomListener(window, 'load', initialize);
  initialize();

  $scope.add_fav = function(shop) {
    var data = {
      "place": shop._id,
      "user": $scope.user._id,
    }
    $http.post(Base_Url + "/favorite", data)
      .then(function(response) {
        if (response.data.msg == "added already") {
          var alertPopup = $ionicPopup.alert({
            title: 'WOM',
            template: 'This shop has been saved already!'
          });
        } else {
          var alertPopup = $ionicPopup.alert({
            title: 'WOM',
            template: 'This shop has been saved successfully!'
          });
        }
      });

  }
})

.controller('ShoplistCtrl', function($scope, $http, Base_Url, $state,
    localStorageService, $cordovaGeolocation) {
    $scope.$on('$ionicView.beforeEnter', function() {
      var posOptions = { timeout: 10000, enableHighAccuracy: false };
      $cordovaGeolocation
        .getCurrentPosition(posOptions)
        .then(function(position) {
          var lat = position.coords.latitude
          var lng = position.coords.longitude
        }, function(err) {
        });

      if(JSON.parse(localStorage.getItem("ranking")) == null){
         $http.get(Base_Url + "/getPlaceOrderByDistance")
          .then(function(response) {
          $scope.shops = response.data;
        });
      }
      else if(JSON.parse(localStorage.getItem("ranking")).id == 1){
        $http.get(Base_Url + "/getPlaceOrderByDistance")
        .then(function(response) {
          $scope.shops = response.data;
        });
      }else if(JSON.parse(localStorage.getItem("ranking")).id == 2){
        $http.get(Base_Url + "/getPlaceOrderByRating")
        .then(function(response) {
          $scope.shops_popularity = response.data;
          var shops = [];
          $scope.shops_popularity.map(function(current_array){
            current_array.map(function(shop){
              shops.push(shop);
            })
          })
          $scope.shops = shops;
      });
      }
      
    });

    $scope.$on("change_ranking_shoplist",function(d,data){
      if(data.name == "Popularity"){
        localStorage.setItem("ranking",data);
        $http.get(Base_Url + "/getPlaceOrderByRating")
        .then(function(response) {
          $scope.shops_popularity = response.data;
          var shops = [];
          $scope.shops_popularity.map(function(current_array){
            current_array.map(function(shop){
              shops.push(shop);
            })
          })
          $scope.shops = shops;
      });
      }else{
        $http.get(Base_Url + "/getPlaceOrderByDistance")
        .then(function(response) {
          $scope.shops = response.data;
          console.log($scope.shops);
      });
      }
    })

    $scope.search = function(key){
     $http.get(Base_Url + "/getPlaceByKey/" + key)
      .then(function(response) {
        $scope.shops = response.data;
      });
    }

    $scope.clear = function(){
      $http.get(Base_Url + "/getPlaceOrderByDistance")
        .then(function(response) {
          $scope.shops = response.data;
      });
      document.getElementById('search_input').value = "";
    }

    $scope.go = function(shop) {
      localStorageService.set('shop', shop);
      $state.go('app.single');
    }

  })
  .controller('CoffeeListCtrl',function($scope,$http,Base_Url,localStorageService,
    $ionicPopup,$ionicModal,$compile,$window){
    $scope.user = localStorageService.get('user');

    $scope.$on('$ionicView.beforeEnter',function(){ 
      $http.get(Base_Url + "/coffees")
        .then(function(response){
          console.log(response[0]);
          // var all_coffees = response.data;
          // localStorageService.set('coffees',all_coffees);
        })
    });

    var rating;
      $scope.ratingsObject = {
        iconOn: 'ion-ios-star',
        iconOff: 'ion-ios-star-outline',
        iconOnColor: 'rgb(200, 200, 100)',
        iconOffColor: 'rgb(200, 100, 100)',
        rating: 0,
        minRating: 1,
        readOnly: true,
        callback: function(rating) {
          $scope.ratingsCallback(rating);
        }
      };

      $scope.ratingsCallback = function(rating) {
        this.rating = rating;
      };

    $ionicModal.fromTemplateUrl('templates/addcoffee.html',{scope: $scope,animation: 'slide-in-up'})
      .then(function(modaladd) {
        $scope.modaladd = modaladd;
    });

    $scope.openAddModal = function() {
      $scope.modaladd.show();
    };
    $scope.closeAddModal = function() {
      $scope.modaladd.hide();
      setTimeout(function(){
        location.reload();
      },2500);
    };
    $scope.$on('$destroy', function() {
      $scope.modaladd.remove();
    });

    $scope.addcoffee = function(coffee_name,coffee_price,coffee_shop){
        var coffee_post = {
          'name': coffee_name,
          'shopname':coffee_shop.name,
          'user': $scope.user._id,
          'username': $scope.user.name,
          'price': coffee_price,
          'latitude': coffee_shop.latitude,
          'longitude': coffee_shop.longitude,
          'rating': this.rating,
      }

        $http.post(Base_Url + "/addCoffee", coffee_post)
          .then(function(response){
            if(response.data.status == 500){
              var alertPopup = $ionicPopup.alert({
              title: 'WOM',
              template: 'You have already added this coffee!'
              });
              $scope.closeAddModal();
            }else{
              var alertPopup = $ionicPopup.alert({
              title: 'WOM',
              template: 'Add successfully!'
              });
              $scope.closeAddModal();            
            }
          });
        }

    $ionicModal.fromTemplateUrl('templates/editcoffee.html', {
    scope: $scope,
    animation: 'slide-in-up'
    }).then(function(modaledit) {
      $scope.modaledit = modaledit;
    });

    $scope.openEditModal = function(coffee) {
      $scope.current_coffee = coffee;
      $scope.modaledit.show();
    };
    $scope.closeEditModal = function() {
      $scope.modaledit.hide();
      setTimeout(function(){
        location.reload();
      },2500);
    };
    $scope.$on('$destroy', function() {
      $scope.modaledit.remove();
    });

    $scope.deletecoffee = function(){
      $http.delete(Base_Url + "/deleteCoffee/" + $scope.current_coffee._id)
        .then(function(response){
          if(response.data.status == 500){
            var alertPopup = $ionicPopup.alert({
            title: 'WOM',
            template: 'No coffee found!'
            });
            $scope.closeEditModal();
          }else{
            var alertPopup = $ionicPopup.alert({
            title: 'WOM',
            template: 'Delete successfully!'
            });
            $scope.closeEditModal();
          }
        });
    }

    $scope.updatecoffee = function(coffee_name,coffee_price){        
      var coffee_update = {
        'name': coffee_name,
        'price': coffee_price,
        'rating': this.rating,
      }
      $http.post(Base_Url + "/updateCoffee/" + $scope.current_coffee._id, coffee_update)
        .then(function(response){
          if(response.data.status == 500){
            var alertPopup = $ionicPopup.alert({
            title: 'WOM',
            template: 'No coffee founded!'
            });
            $scope.closeEditModal();
          }else{
            var alertPopup = $ionicPopup.alert({
            title: 'WOM',
            template: 'Update successfully!'
            });
            $scope.closeEditModal();
          }
      });
    }

    function initialize() {
      var myLatlng = new google.maps.LatLng("52.263398", "-7.119431");
      var mapOptions = {
        center: myLatlng,
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      var map = new google.maps.Map(document.getElementById("coffeesmap"),
        mapOptions);

      var coffees = localStorageService.get('coffees');
      for(i in coffees){
        var coffee_location = { lat: Number(parseFloat(coffees[i].latitude)),
           lng: Number(parseFloat(coffees[i].longitude)) };
        var marker = new google.maps.Marker({
          position: coffee_location,
          map: map,
          title: 'WOM'
        });
        // marker.setMap(map);
        attachMessage(marker,i);
        // $scope.map = map;
      } // end of for loop

    function attachMessage(marker,i) {
      var contentString = "<p>" + coffees[i].name + "<br/>" + 
          "Shop: " + coffees[i].shopname + "<br/>" + 
          "Rating: " + coffees[i].rating + "🌟 <br/>" + 
          "Posted By: " + coffees[i].username + "<br/>" + 
          "</p>";
      var infowindow = new google.maps.InfoWindow({
        content: contentString,
       });
      google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map, marker);
      });
    }
      
    } // end of initialize()
    google.maps.event.addDomListener(window, 'load', initialize);
    initialize();
  })

  .controller('CinemalistCtrl', function($scope, $http, Base_Url, $state,
    localStorageService, $cordovaGeolocation) {
    $scope.$on('$ionicView.beforeEnter', function() {
      $http.get(Base_Url + "/getCinemas")
        .then(function(response) {
          $scope.cinemas = response.data;
        });
    });

    $scope.go = function(shop) {
      localStorageService.set('shop', shop);
      $state.go('app.single');
    }
  })

  .controller('RestaurantlistCtrl', function($scope, $http, Base_Url, $state,
    localStorageService, $cordovaGeolocation) {
    $scope.$on('$ionicView.beforeEnter', function() {
      $http.get(Base_Url + "/getRestaurants")
        .then(function(response) {
          $scope.restaurants = response.data;
        });
    });

    $scope.go = function(shop) {
      localStorageService.set('shop', shop);
      $state.go('app.single');
    }
  })

  .controller('WinebarlistCtrl', function($scope, $http, Base_Url, $state,
    localStorageService, $cordovaGeolocation) {
    $scope.$on('$ionicView.beforeEnter', function() {
      $http.get(Base_Url + "/getWineBars")
        .then(function(response) {
          $scope.winebars = response.data;
        });
    });

    $scope.go = function(shop) {
      localStorageService.set('shop', shop);
      $state.go('app.single');
    }
  })

  .controller('CafelistCtrl', function($scope, $http, Base_Url, $state,
    localStorageService, $cordovaGeolocation) {
    $scope.$on('$ionicView.beforeEnter', function() {
      $http.get(Base_Url + "/getCafes")
        .then(function(response) {
          $scope.cafes = response.data;
        });
    });

    $scope.go = function(shop) {
      localStorageService.set('shop', shop);
      $state.go('app.single');
    }
  })

  .controller('MovielistCtrl', function($scope, $http, Base_Url, $state,
    localStorageService, $cordovaGeolocation) {
    $scope.$on('$ionicView.beforeEnter', function() {
      $http.get(Base_Url + "/getAllPlayingMovies")
        .then(function(response) {
          $scope.movies = response.data;
        });
    });

    $scope.go = function(movie) {
      localStorageService.set('movie', movie);
      $state.go('app.movieDetails');
    }
  })

  .controller('LogoutCtrl', function($scope, $http, Base_Url, $state, localStorageService) {
    $scope.$on('$ionicView.beforeEnter', function() {
      localStorageService.clearAll();
      $state.go('login');
    });
  })
  .controller('AdminCtrl', function($scope, $http, Base_Url, $state, localStorageService) {
    $scope.$on('$ionicView.beforeEnter', function() {
      $scope.setting = function() {
        $state.go("app.shopSetting")
      }
      $scope.userProfile = function() {
        console.log("userProfile");
      }
    });
  })
  .controller('AdminShopSettingCtrl', function($scope, $ionicPopup, $http, Base_Url, $state, localStorageService) {
    $scope.$on('$ionicView.beforeEnter', function() {
      $scope.user = localStorageService.get('user');

      $http.get(Base_Url + "/getPlaceById/" + $scope.user.ownShop)
        .then(function(response) {
          $scope.shop = response.data;
        });

    });

    $scope.setting = function(shop) {
      var data = {
        tel: shop.tel,
        website: shop.website,
        owner: $scope.user._id
      }
      $http.put(Base_Url + "/updateInfo/" + shop._id, data).then(function(response) {
        var alertPopup = $ionicPopup.alert({
          title: 'WOM',
          template: 'This shop details has been updated!'
        })
      });
    }
  })
  .controller('CommentCtrl', function($scope, $http, Base_Url, $state, localStorageService) {
    $scope.$on('$ionicView.beforeEnter', function() {
      $scope.user = localStorageService.get('user');
      $http.get(Base_Url + "/getCommentsByUser/" + $scope.user._id)
        .then(function(response) {
          $scope.comments = response.data.reverse();
        });
    });

    $scope.go = function(shop) {
      localStorageService.set('shop', shop);
      $state.go('app.single')
    }
  })

.controller('LoginCtrl', function($ionicPopup, $scope, $state, $http, Base_Url, $ionicModal, localStorageService, $cordovaOauth) {
  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.user = localStorageService.get('user');
    if ($scope.user) {
      $state.go('app.recommend');
    }
  });

  $scope.orderwithoutaccount = function(){
    $state.go('app.recommend');
  }

  $scope.doLogin = function(user) {
    $http.post(Base_Url + "/login", user)
      .then(function(response) {
        // console.log(response);
        if (response.data.status == 401) {
          var alertPopup = $ionicPopup.alert({
            title: 'WOM',
            template: 'Email or Password Wrong!'
          });
        } else {
          localStorageService.set('user', response.data.user);
          $http.put(Base_Url + "/updateFrequency/" + response.data.user._id, 
            { frequency: response.data.user.frequency + 1 }).then(function(response) {
            // console.log(response);
          });
          $state.go('app.recommend');
        }
      });
  }
})

.controller('SearchCtrl', function($scope, $state, $http, Base_Url, localStorageService) {
  $scope.data = { "shops": [], "search": '' }
  $scope.search = function(key) {
    $http.get(Base_Url + "/getPlaceByKey/" + key)
      .then(function(response) {
        $scope.data.shops = response.data;
      });
  }
  $scope.go = function(shop) {
    localStorageService.set('shop', shop);
    $state.go('app.single')
  }
  $scope.clear = function(){
      $scope.data.shops = null;
  document.getElementById('search_page').value = "";
  }

})

.controller('FavoritesCtrl', function($scope, $state, $http, Base_Url, localStorageService) {
  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.user = localStorageService.get('user');

    $http.get(Base_Url + "/favorite/" + $scope.user._id)
      .then(function(response) {
        $scope.shops = response.data.reverse();
      });

  })


})

.controller('SignupCtrl', function($ionicPopup, $ionicModal, $scope, $state, $http, Base_Url, localStorageService) {
    $scope.avatars = [{avatar_id: 1},{avatar_id: 10},{avatar_id: 11},{avatar_id: 8}];
    
    $scope.choose_avatar = function(avatar){
      localStorage.setItem('avatar_id',avatar.avatar_id);
      $scope.closeModal();
      var alertPopup = $ionicPopup.alert({
      title: 'WOM',
      template: 'Successfully!'
      });
    };

    $ionicModal.fromTemplateUrl('templates/avatar.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.openModal = function() {
      $scope.modal.show();
    };
    $scope.closeModal = function() {
      $scope.modal.hide();
    };
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });

  $scope.doSignup = function(user) {
    var avatar_id = localStorage.getItem('avatar_id');
    if(user.password == user.password_confirmation){
      user.avatar_id = avatar_id;
      $http.post(Base_Url + "/signup", user)
        .then(function(response) {
        if (response.data.success == true) {
        localStorageService.set('user', response.data.user);
        $state.go('app.shoplist')
        }else{
          console.log(response);
        }
      });
    }else{
      var alertPopup = $ionicPopup.alert({
      title: 'WOM',
      template: 'Two passwords are not the same!'
      });
    }
  }

})

.controller('MovieFinderCtrl', function($scope, $state, $http, Base_Url, localStorageService, $cordovaBarcodeScanner) {
    $scope.scan = function() {
      $cordovaBarcodeScanner
        .scan()
        .then(function(barcodeData) {
          if(barcodeData){
            console.log("BardCode", barcodeData)
            $http.get(Base_Url + "/getMovieInfo/" + barcodeData.text)
            .then(function(response) {
              localStorageService.set('movie', response.data);
              $state.go('app.movieDetails')
            });
          }else{
            var alertPopup = $ionicPopup.alert({
            title: 'WOM',
            template: 'Movie Not Found!'
            });
          }
        }, function(error) {

        });
    }
  })

  .controller('MovieCommentCtrl', function($scope, $http, Base_Url, localStorageService,
  $ionicLoading, $compile, $ionicPopup, $ionicModal, $window, $firebaseArray) {
     $scope.movie = localStorageService.get('movie');
    var commentsRef = new Firebase("https://wit-wom.firebaseio.com/" + $scope.movie.id);
    $scope.$on('$ionicView.beforeEnter', function() {
      $scope.user = localStorageService.get('user');
      $scope.comments = $firebaseArray(commentsRef);
    });
    $ionicModal.fromTemplateUrl('templates/postcomment.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.openModal = function() {
      $scope.modal.show();
    };
    $scope.closeModal = function() {
      $scope.modal.hide();
    };
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
    var rating;
    $scope.ratingsObject = {
      iconOn: 'ion-ios-star',
      iconOff: 'ion-ios-star-outline',
      iconOnColor: 'rgb(200, 200, 100)',
      iconOffColor: 'rgb(200, 100, 100)',
      rating: 0,
      minRating: 1,
      readOnly: true,
      callback: function(rating) {
        $scope.ratingsCallback(rating);
      }
    };

    $scope.ratingsCallback = function(rating) {
      this.rating = rating
    };

    $scope.post = function(comment) {
      var comment_post_firebase = {
        'movie': $scope.movie.id,
        'rating': this.rating,
        'text': comment,
        'timestamp': Date.now()
      }
      $scope.comments.$add(comment_post_firebase).then(function() {
        var alertPopup = $ionicPopup.alert({
          title: 'WOM',
          template: 'Your comment has been posted!'
        });
        $scope.closeModal();
      });
    }
  })

.controller('CartCtrl', function($scope, $state, $http, Base_Url, localStorageService, $cordovaBarcodeScanner,$ionicPopup) {
     $scope.$on('$ionicView.beforeEnter', function() {
      $scope.user = localStorageService.get('user');
      if($scope.user){
        $http.get(Base_Url + "/getUserCart/" + $scope.user._id)
        .then(function(response) {
          $scope.currentUserCart = response.data;
          $scope.cartItems = [];
          $scope.cartItemsAmount = [];
          $scope.cartItemsId = [];
          $scope.totalPrice = 0;
          for(var i = 0; i < $scope.currentUserCart.length; i++){
            $scope.cartItemsAmount.push($scope.currentUserCart[i].amount);
            $scope.cartItemsId.push($scope.currentUserCart[i]);
            $http.get(Base_Url + "/getDishById/" + $scope.currentUserCart[i].dish )
            .then(function(response) {
              for(var i = 0; i < $scope.currentUserCart.length; i++){
                // console.log($scope.currentUserCart[i]);
                var price = response.data[0].price * $scope.currentUserCart[i].amount;
                $scope.totalPrice += Math.floor(price / $scope.currentUserCart.length);
                
              } 
              console.log(response.data[0].price);
              $scope.cartItems.push(response.data[0]);
              console.log($scope.cartItems)
            });
          }
        });
      }else{
        $http.get("http://localhost:1337/getAdmin/admin@admin.com")
        .then(function(response){
          console.log(response.data.table);
          $scope.tableNumber = response.data.table;
          $http.get(Base_Url + "/getTableCart/" + $scope.tableNumber)
          .then(function(response) {
            $scope.currentUserCart = response.data;
            $scope.cartItems = [];
            $scope.cartItemsAmount = [];
            $scope.cartItemsId = [];
            $scope.totalPrice = 0;
            for(var i = 0; i < $scope.currentUserCart.length; i++){
              $scope.cartItemsAmount.push($scope.currentUserCart[i].amount);
              $scope.cartItemsId.push($scope.currentUserCart[i]);
              $http.get(Base_Url + "/getDishById/" + $scope.currentUserCart[i].dish )
              .then(function(response) {
                for(var i = 0; i < $scope.currentUserCart.length; i++){
                  // console.log($scope.currentUserCart[i]);
                  var price = response.data[0].price * $scope.currentUserCart[i].amount;
                  $scope.totalPrice += Math.floor(price / $scope.currentUserCart.length);
                  
                } 
                console.log(response.data[0].price);
                $scope.cartItems.push(response.data[0]);
                console.log($scope.cartItems)
              });
            }
          });
        })

        
      }
      
      
    });

    $scope.closeAddModal = function() {
          setTimeout(function(){
            location.reload();
          },2500);
    };

    $scope.addOne = function(dish){
      console.log(dish)
      if($scope.user){
        var cartdish_post = {
          'user': $scope.user._id,
          'dish': dish.dish,
          'amount': 1,
        }
      }else{
        var cartdish_post = {
          'table': $scope.tableNumber,
          'dish': dish.dish,
          'amount': 1,
        }
      }
      
      $http.post(Base_Url + '/addCartdish', cartdish_post)
        .then(function(response){
            var alertPopup = $ionicPopup.alert({
            title: 'Icafe',
            template: 'Add successfully!'
            });
            $scope.closeAddModal();            
        })
    }

    $scope.minusOne = function(dish){
      if($scope.user){
        var cartdish_post = {
        'user': $scope.user._id,
        'dish': dish.dish,
        'id': dish._id,
        'amount': 1,
      }
      }else{
        var cartdish_post = {
          'table': $scope.tableNumber,
          'dish': dish.dish,
          'id': dish._id,
          'amount': 1,
        }
      }
      
      $http.post(Base_Url + '/minusCartdish', cartdish_post)
        .then(function(response){
            var alertPopup = $ionicPopup.alert({
            title: 'Icafe',
            template: 'Update successfully!'
            });
            $scope.closeAddModal();            
        })
    }

    $scope.clearCart = function(){
      if($scope.user){
        $http.delete(Base_Url + '/clearUserCart/' + $scope.user._id)
        .then(function(response){
            var alertPopup = $ionicPopup.alert({
            title: 'Icafe',
            template: 'Clear successfully!'
            });
            $scope.closeAddModal();            
        })
      }else{
        $http.delete(Base_Url + '/clearTableCart/' + $scope.tableNumber)
        .then(function(response){
            var alertPopup = $ionicPopup.alert({
            title: 'Icafe',
            template: 'Clear successfully!'
            });
            $scope.closeAddModal();            
        })
      }
    }

    $scope.goCheck = function(){
        $state.go('app.pay');
    }
})

.controller('RecommendCtrl', function($scope, $state, $http, Base_Url, localStorageService, $cordovaBarcodeScanner,$ionicPopup) {
    $scope.$on('$ionicView.beforeEnter', function() {
      $http.get(Base_Url + "/getRecommendedDishes")
        .then(function(response) {
          console.log(response);
          $scope.recommendlist = response.data;
        });
    });

    $scope.closeAddModal = function() {
      setTimeout(function(){
        location.reload();
      },2500);
    };

    $scope.addtocart = function(dish){
      console.log(dish);
      // console.log($scope.user._id)
      if($scope.user){
        var cartdish_post = {
          'table': $scope.tableNumber,
          'user': $scope.user._id,
          'dish': dish._id,
          'amount': 1,
        }
      }else{
        var cartdish_post = {
          'table': $scope.tableNumber,
          'dish': dish._id,
          'amount': 1,
        }
      }

      $http.post(Base_Url + '/addCartdish', cartdish_post)
        .then(function(response){
            var alertPopup = $ionicPopup.alert({
            title: 'Icafe',
            template: 'Add successfully!'
            });
            $scope.closeAddModal();            
        })
    }
})

.controller('SaladCtrl', function($scope, $state, $http, Base_Url, localStorageService, $cordovaBarcodeScanner,$ionicPopup,$timeout) {
    $scope.$on('$ionicView.beforeEnter', function() {     
      $http.get(Base_Url + "/getSalad")
        .then(function(response) {
          console.log(response);
          $scope.saladlist = response.data;
        });
    });

    
   
})

.controller('StapleCtrl', function($scope, $state, $http, Base_Url, localStorageService, $cordovaBarcodeScanner,$ionicPopup) {
    $scope.$on('$ionicView.beforeEnter', function() {
      $http.get(Base_Url + "/getStaple")
        .then(function(response) {
          console.log(response);
          $scope.staplelist = response.data;
        });
    });
})

.controller('DessertCtrl', function($scope, $state, $http, Base_Url, localStorageService, $cordovaBarcodeScanner,$ionicPopup) {
    $scope.$on('$ionicView.beforeEnter', function() {
      var date = new Date();
      var hour = date.getHours();
      if(hour >= 0 && hour <= 9){
        $http.get(Base_Url + "/getDessertBreakfast")
          .then(function(response) {
            console.log(response);
            $scope.dessertlist = response.data;
        });
        console.log("breakfast")
      }else if(hour > 9 && hour <= 14){
        $http.get(Base_Url + "/getDessertLunch")
          .then(function(response) {
            console.log(response);
            $scope.dessertlist = response.data;
        });
        console.log("lunch")
      }else{
        $http.get(Base_Url + "/getDessertSupper")
          .then(function(response) {
            console.log(response);
            $scope.dessertlist = response.data;
        });
        console.log("supper")
      } 
    });

     setTimeout(function(){
         location.reload();
     },10000);

    $scope.closeAddModal = function() {
      setTimeout(function(){
        location.reload();
      },2500);
    };
    $scope.$on('$destroy', function() {
      $scope.modaladd.remove();
    });

    $scope.addToCart = function(dish){
      console.log(dish);
      if($scope.user){
        var cartdish_post = {
          'user': $scope.user._id,
          'dish': dish._id,
          'amount': 1,
        }
      }else{
        var cartdish_post = {
          'table': $scope.tableNumber,
          'dish': dish._id,
          'amount': 1,
        }
      }

      $http.post(Base_Url + '/addCartdish', cartdish_post)
        .then(function(response){
            var alertPopup = $ionicPopup.alert({
            title: 'Icafe',
            template: 'Add successfully!'
            });
            $scope.closeAddModal();            
        })
    }
})

.controller('DrinkCtrl', function($scope, $state, $http, Base_Url, localStorageService, $cordovaBarcodeScanner,$ionicPopup) {
    $scope.$on('$ionicView.beforeEnter', function() {
      $http.get(Base_Url + "/getDrink")
        .then(function(response) {
          console.log(response);
          $scope.drinklist = response.data;
        });
    }); 
})

.controller('SoupCtrl', function($scope, $state, $http, Base_Url, localStorageService, $cordovaBarcodeScanner,$ionicPopup) {
    $scope.$on('$ionicView.beforeEnter', function() {
      $http.get(Base_Url + "/getSoup")
        .then(function(response) {
          console.log(response);
          $scope.souplist = response.data;
        });
    });
})

.controller('SnackCtrl', function($scope, $state, $http, Base_Url, localStorageService, $cordovaBarcodeScanner,$ionicPopup) {
    $scope.$on('$ionicView.beforeEnter', function() {
      $http.get(Base_Url + "/getSnack")
        .then(function(response) {
          console.log(response);
          $scope.snacklist = response.data;
        });
    }); 
})

.controller('SetmealCtrl', function($scope, $state, $http, Base_Url, localStorageService, $cordovaBarcodeScanner,$ionicPopup) {
    $scope.value = 2500; 
})

.controller('DishesCtrl', function($scope, $state, $http, Base_Url, localStorageService,$ionicModal,$ionicPopup) {
    $scope.$on('$ionicView.beforeEnter',function(){ 
      $http.get(Base_Url + "/getAllDishes")
      .then(function(response){
        console.log(response["data"]);
        $scope.all_dishes = response["data"];
      })
    });

    $ionicModal.fromTemplateUrl('templates/settablenumber.html',{scope: $scope,animation: 'slide-in-up'})
      .then(function(modalsettablenumber) {
        $scope.modalsettablenumber = modalsettablenumber;
    });

    $scope.openSetTableModal = function() {
      $scope.modalsettablenumber.show();
    };
    $scope.closeSetTableModal = function() {
      $scope.modalsettablenumber.hide();
      setTimeout(function(){
        location.reload();
      },2500);
    };
    $scope.$on('$destroy', function() {
      $scope.modalsettablenumber.remove();
    });

    $scope.settablenumber = function(tablenumber){
      console.log(tablenumber);
      $http.put(Base_Url + "/setTableNumber/admin@admin.com", { table: tablenumber }).then(function(response) {
        console.log(response);
      });
      $scope.closeSetTableModal();
    }

    $ionicModal.fromTemplateUrl('templates/addsetdish.html',{scope: $scope,animation: 'slide-in-up'})
      .then(function(modaladdsetdish) {
        $scope.modaladdsetdish = modaladdsetdish;
    });

    $scope.openAddModal = function() {
      $scope.modaladdsetdish.show();
    };
    $scope.closeAddModal = function() {
      $scope.modaladdsetdish.hide();
      setTimeout(function(){
        location.reload();
      },2500);
    };
    $scope.$on('$destroy', function() {
      $scope.modaladdsetdish.remove();
    });

    $ionicModal.fromTemplateUrl('templates/editdish.html', {
    scope: $scope,
    animation: 'slide-in-up'
    }).then(function(modaledit) {
      $scope.modaledit = modaledit;
    });

    $scope.openEditModal = function(dish) {
      $scope.current_dish = dish;
      $scope.modaledit.show();
    };
    $scope.closeEditModal = function() {
      $scope.modaledit.hide();
      setTimeout(function(){
        location.reload();
      },2500);
    };
    $scope.$on('$destroy', function() {
      $scope.modaledit.remove();
    });

    
    $ionicModal.fromTemplateUrl('templates/adddish.html',{scope: $scope,animation: 'slide-in-up'})
      .then(function(modaladd) {
        $scope.modaladd = modaladd;
    });

    $scope.openAddModal = function() {
      $scope.modaladd.show();
    };
    $scope.closeAddModal = function() {
      $scope.modaladd.hide();
      setTimeout(function(){
        location.reload();
      },2500);
    };
    $scope.$on('$destroy', function() {
      $scope.modaladd.remove();
    });

    $scope.updatedish = function(dish_name,dish_price,dish_description,dish_category,dish_period){
        var dish_update = {
        'name': dish_name,
        'price': dish_price,
        'description': dish_description,
        'category': dish_category,
        'period': dish_period,
      }
      $http.post(Base_Url + "/updateDish/" + $scope.current_dish._id, dish_update)
        .then(function(response){
          if(response.data.status == 500){
            var alertPopup = $ionicPopup.alert({
            title: 'Icafe',
            template: 'No dish found!'
            });
            $scope.closeEditModal();
          }else{
            var alertPopup = $ionicPopup.alert({
            title: 'Icafe',
            template: 'Update successfully!'
            });
            $scope.closeEditModal();
          }
      });
    }

    $scope.adddish = function(dish_name,dish_price,dish_description,dish_category,dish_period){
      dish_price = parseInt(dish_price, 10);
      console.log(dish_name,dish_price,dish_description,dish_category);
      var dish_post = {
        'name': dish_name,
        'price': dish_price,
        'description': dish_description,
        'category': dish_category,
        'period': dish_period,
      }

      $http.post(Base_Url + '/addDish', dish_post)
        .then(function(response){
          if(response.data.status == 500){
            var alertPopup = $ionicPopup.alert({
              title: 'Icafe',
              template: 'You have already added this dish!'
              });
              $scope.closeAddModal();
          }else{
              var alertPopup = $ionicPopup.alert({
              title: 'Icafe',
              template: 'Add successfully!'
              });
              $scope.closeAddModal();            
            }
        })
    }

    $scope.addtorecommend = function(){
        $http.put(Base_Url + "/addDishToRecommend/" + $scope.current_dish._id)
        .then(function(response){
          if(response.data.status == 500){
            var alertPopup = $ionicPopup.alert({
            title: 'Icafe',
            template: 'Already added!'
            });
            $scope.closeEditModal();
          }else{
            var alertPopup = $ionicPopup.alert({
            title: 'Icafe',
            template: 'Added successfully!'
            });
            $scope.closeEditModal();
          }
        });
    }    

    $scope.deletedish = function(){
      $http.delete(Base_Url + "/deleteDish/" + $scope.current_dish._id)
        .then(function(response){
          if(response.data.status == 500){
            var alertPopup = $ionicPopup.alert({
            title: 'Icafe',
            template: 'No dish found!'
            });
            $scope.closeEditModal();
          }else{
            var alertPopup = $ionicPopup.alert({
            title: 'Icafe',
            template: 'Delete successfully!'
            });
            $scope.closeEditModal();
          }
        });
    }

    $scope.categories = ['Salad','Staple','Dessert','Drink','Soup','Snack'];
    $scope.periods = ['Breakfast','Lunch','Supper'];

})

.controller('UsersCtrl', function($scope, $state, $http, Base_Url, localStorageService, $cordovaBarcodeScanner,$ionicPopup) {
    $scope.$on('$ionicView.beforeEnter',function(){ 
      $http.get(Base_Url + "/getAllUsers")
      .then(function(response){
        console.log(response["data"]);
        $scope.all_users = response["data"];
      })
    });

    $scope.deleteuser = function(user) {
     var confirmPopup = $ionicPopup.confirm({
       template: 'Are you sure you want to delete this user?'
     });
     confirmPopup.then(function(res) {
       if(res) {
         $http.delete(Base_Url + "/deleteUser/" + user._id)
          .then(function(response){
            var alertPopup = $ionicPopup.alert({
            title: 'Icafe',
            template: 'User Deleted successfully!'
            });
        });
        setTimeout(function(){
          location.reload();
        },2500);
       } else {
         console.log('close modal');
       }
     });
   };
})

.controller('PayCtrl', function($scope, $state, $http, Base_Url, localStorageService, $cordovaBarcodeScanner,$ionicPopup) {
    $scope.$on('$ionicView.beforeEnter', function() {
      $scope.user = localStorageService.get('user');
      if($scope.user){
        $http.get(Base_Url + "/getUserCart/" + $scope.user._id)
        .then(function(response) {
          $scope.currentUserCart = response.data;
          $scope.cartItems = [];
          $scope.cartItemsAmount = [];
          $scope.cartItemsId = [];
          $scope.totalPrice = 0;
          for(var i = 0; i < $scope.currentUserCart.length; i++){
            $scope.cartItemsAmount.push($scope.currentUserCart[i].amount);
            localStorage.setItem("cartItemsAmount",$scope.cartItemsAmount);
            $scope.cartItemsId.push($scope.currentUserCart[i]);
            $http.get(Base_Url + "/getDishById/" + $scope.currentUserCart[i].dish )
            .then(function(response) {
              for(var i = 0; i < $scope.currentUserCart.length; i++){
                // console.log($scope.currentUserCart[i]);
                var price = response.data[0].price * $scope.currentUserCart[i].amount;
                $scope.totalPrice += Math.floor(price / $scope.currentUserCart.length);
                
              } 
              // console.log(response.data[0].price);
              $scope.cartItems.push(response.data[0]);
              localStorage.setItem("cartItems",$scope.cartItems);
              // console.log($scope.cartItems)
            });
          }
        });
      }else{
        $http.get("http://localhost:1337/getAdmin/admin@admin.com")
        .then(function(response){
          console.log(response.data.table);
          $scope.tableNumber = response.data.table;
          $http.get(Base_Url + "/getTableCart/" + $scope.tableNumber)
          .then(function(response) {
            $scope.currentUserCart = response.data;
            $scope.cartItems = [];
            $scope.cartItemsAmount = [];
            $scope.cartItemsId = [];
            $scope.totalPrice = 0;
            for(var i = 0; i < $scope.currentUserCart.length; i++){
              $scope.cartItemsAmount.push($scope.currentUserCart[i].amount);
              $scope.cartItemsId.push($scope.currentUserCart[i]);
              $http.get(Base_Url + "/getDishById/" + $scope.currentUserCart[i].dish )
              .then(function(response) {
                for(var i = 0; i < $scope.currentUserCart.length; i++){
                  // console.log($scope.currentUserCart[i]);
                  var price = response.data[0].price * $scope.currentUserCart[i].amount;
                  $scope.totalPrice += Math.floor(price / $scope.currentUserCart.length);
                  
                } 
                console.log(response.data[0].price);
                $scope.cartItems.push(response.data[0]);
                console.log($scope.cartItems)
              });
            }
          });
        }) 
      }
        if($scope.user){
          // console.log($scope.user)
          $scope.username = $scope.user.name;
          $scope.useremail = $scope.user.email;
          $scope.tablenumber = $scope.tableNumber;
        }else{
          $scope.username = "User not loggedin";
          $scope.useremail = "User not loggedin";
          $http.get("http://localhost:1337/getAdmin/admin@admin.com")
          .then(function(response){
            // console.log(response.data.table);
            $scope.tableNumber = response.data.table;
            $scope.tablenumber = $scope.tableNumber;
          })   
        }
    }); // end of before enter

    $scope.generateOrder = function(cardnumber,cardname){
      $scope.user = localStorageService.get('user');
      if($scope.user){
        $http.get(Base_Url + "/getUserCart/" + $scope.user._id)
        .then(function(response) {
          $scope.currentUserCart = response.data;
          $scope.cartItems = [];
          $scope.cartItemsAmount = [];
          $scope.cartItemsId = [];
          $scope.totalPrice = 0;
          for(var i = 0; i < $scope.currentUserCart.length; i++){
            $scope.cartItemsAmount.push($scope.currentUserCart[i].amount);
            localStorage.setItem("cartItemsAmount",$scope.cartItemsAmount);
            $scope.cartItemsId.push($scope.currentUserCart[i]);
            $http.get(Base_Url + "/getDishById/" + $scope.currentUserCart[i].dish )
            .then(function(response) {
              for(var i = 0; i < $scope.currentUserCart.length; i++){
                // console.log($scope.currentUserCart[i]);
                var price = response.data[0].price * $scope.currentUserCart[i].amount;
                $scope.totalPrice += Math.floor(price / $scope.currentUserCart.length);
                
              } 
              // console.log(response.data[0].price);
              $scope.cartItems.push(response.data[0]);
              localStorage.setItem("cartItems",$scope.cartItems);
              // console.log($scope.cartItems)
            });
          }
        });
        console.log($scope.user._id,cardnumber,cardname,$scope.tableNumber,
          $scope.cartItemsAmount,$scope.cartItems,$scope.totalPrice);
        var orderdata = {
          "user": $scope.user._id,
          "bankname": cardname,
          "bankcard": cardnumber.toString(),
          "table": $scope.tableNumber,
          "dish": $scope.cartItems,
          "dishamount": $scope.cartItemsAmount,
          "price": $scope.totalPrice,
          "status": 0,
        }
        $http.post(Base_Url + "/addOrder", orderdata)
          .then(function(response) {
              var alertPopup = $ionicPopup.alert({
                title: 'ICAFE',
                template: 'Order generated successfully!'
              });
          });
        $state.go('app.order');
      }else{
        $http.get("http://localhost:1337/getAdmin/admin@admin.com")
        .then(function(response){
          console.log(response.data.table);
          $scope.tableNumber = response.data.table;
          $http.get(Base_Url + "/getTableCart/" + $scope.tableNumber)
          .then(function(response) {
            $scope.currentUserCart = response.data;
            $scope.cartItems = [];
            $scope.cartItemsAmount = [];
            $scope.cartItemsId = [];
            $scope.totalPrice = 0;
            for(var i = 0; i < $scope.currentUserCart.length; i++){
              $scope.cartItemsAmount.push($scope.currentUserCart[i].amount);
              $scope.cartItemsId.push($scope.currentUserCart[i]);
              $http.get(Base_Url + "/getDishById/" + $scope.currentUserCart[i].dish )
              .then(function(response) {
                for(var i = 0; i < $scope.currentUserCart.length; i++){
                  // console.log($scope.currentUserCart[i]);
                  var price = response.data[0].price * $scope.currentUserCart[i].amount;
                  $scope.totalPrice += Math.floor(price / $scope.currentUserCart.length);
                  
                } 
                console.log(response.data[0].price);
                $scope.cartItems.push(response.data[0]);
                console.log($scope.cartItems)
              });
            }
          });
        });
        console.log(cardnumber);
        var orderdata = {
          "bankname": cardname,
          "bankcard": cardnumber.toString(),
          "table": $scope.tableNumber,
          "dish": $scope.cartItems,
          "dishamount": $scope.cartItemsAmount,
          "price": $scope.totalPrice,
          "status": 0,
        }
        $http.post(Base_Url + "/addOrder", orderdata)
          .then(function(response) {
              var alertPopup = $ionicPopup.alert({
                title: 'ICAFE',
                template: 'Order generated successfully!'
              });
              $state.go('app.order');
          });
      } // end of if else
      
    }
})

.controller('OrderCtrl', function($scope, $state, $http, Base_Url, localStorageService, $cordovaBarcodeScanner,$ionicPopup) {
    $scope.$on('$ionicView.beforeEnter', function() {
      $scope.user = localStorageService.get('user');
      if($scope.user){
          $http.get(Base_Url + "/getUserOrder/" + $scope.user._id)
          .then(function(response){
            if(response){
              console.log(response.data);
              $scope.showorder = true
              $scope.orderid = response.data._id;
              $scope.ordername = response.data.bankname;
              $scope.ordercreatetime = response.data.createdAt;
              $scope.ordertablenumber = response.data.table;
              $scope.orderprice = response.data.totalprice;
              $scope.orderbankcard = response.data.bankcard;
              $scope.orderdishamount = response.data.dishamount;
              $scope.orderdish = response.data.dish;
              $scope.orderstatus = response.data.status;

              $http.delete(Base_Url + '/clearUserCart/' + $scope.user._id)
              .then(function(response){             
              })
            }else{
              $scope.showorder = false;
              console.log("No order on this user name");
            }
          })
      }else{
        $http.get(Base_Url + "/getAdmin/admin@admin.com")
        .then(function(response){
          $scope.tableNumber = response.data.table;
           $http.get(Base_Url + "/getTableOrder/" + $scope.tableNumber)
          .then(function(response){
            if(response){
              $scope.showorder = true;
              console.log(response.data);
              $scope.orderid = response.data._id;
              $scope.ordername = response.data.bankname;
              $scope.ordercreatetime = response.data.createdAt;
              $scope.ordertablenumber = response.data.table;
              $scope.orderprice = response.data.totalprice;
              $scope.orderbankcard = response.data.bankcard;
              $scope.orderdishamount = response.data.dishamount;
              $scope.orderdish = response.data.dish;
              $scope.orderstatus = response.data.status;
              console.log($scope.orderdishamount,$scope.orderdish);

              $scope.cartItems = [];
              $scope.totalPrice = 0;
              for(var i = 0; i < $scope.orderdish.length; i++){
                $http.get(Base_Url + "/getDishById/" + $scope.orderdish[i]._id)
                .then(function(response) {
                  $scope.cartItems.push(response.data[0]);
                  console.log($scope.cartItems)
                });
              }

              $http.delete(Base_Url + '/clearTableCart/' + $scope.tableNumber)
              .then(function(response){             
              })
            }else{
              $scope.showorder = false;
              console.log("No order on this table");
            }            
          })
        })
         
      }
      
    }); 
})
