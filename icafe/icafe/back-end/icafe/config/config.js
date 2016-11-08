'use strict';


var path = require('path'),
    rootPath = path.normalize(__dirname + '/..');


module.exports = {
    // development configuration
    development: {
        db: 'mongodb://localhost/wom_dev',
        root: rootPath,
        app: {
            name: 'wom | Development',
            host: 'http://localhost',
            port: 1337
        }
    },
    // production configuration
    production: {
        db: 'mongodb://localhost/wom',
        root: rootPath,
        app: {
            name: 'wom',
            host: 'http://localhost',
            port: 80
        }
    }
};
