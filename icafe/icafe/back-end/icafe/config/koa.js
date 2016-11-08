'use strict';


var jade = require('koa-jade');

var env = process.env.NODE_ENV || 'development';


module.exports = function(app, router, config) {

    
    app.use(jade.middleware({
        viewPath: config.root + '/app/views',
        noCache: env === 'development',
        locals: {
            pkg: require('../package.json')
        }
    }));
    
    app.use(router.routes());
    app.use(router.allowedMethods());
};
