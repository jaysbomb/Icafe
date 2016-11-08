'use strict';

var passport = require('koa-passport');

exports.index = function*() {
  yield this.render('login/index', {
    title: 'Login'
  });
};
