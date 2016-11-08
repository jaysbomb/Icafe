'use strict';
var mdb  = require('moviedb')('1b6d9c3a33ddf7223dfd66a4d06cf3a7');

exports.getAllPlayingMovies = function*(next) {
  this.body = yield new Promise(function(fulfill, reject) {
    mdb.miscNowPlayingMovies(function(err, res) {
    	if (err) reject(error);
      else fulfill(res);
    });
  });
};

exports.getMovieInfo = function*(next) {
	var movie_id = this.params.movie_id;
  this.body = yield new Promise(function(fulfill, reject) {
    mdb.movieInfo({id: movie_id}, function(err, res) {
    	if (err) reject(error);
      else fulfill(res);
    });
  });
};
