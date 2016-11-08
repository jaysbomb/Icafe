'use strict';

var koa = require('koa'),
    router = require('koa-router')(),
    fs = require('fs'),
    mongoose = require('mongoose'),
    json = require('koa-json'),
    bodyParser = require('koa-bodyparser'),
    session = require('koa-session'),
    passport = require('koa-passport'),
    cors = require('kcors');

var config = require('./config/config')[process.env.NODE_ENV || 'development'];

var app = koa();
app.use(json({ pretty: false, param: 'pretty' }));
app.use(bodyParser());
app.use(cors());
app.keys = ['secret']
app.use(session(app))
fs.readdirSync(__dirname + '/app/models').forEach(function (file) {
    if(~file.indexOf('.js')) require(__dirname + '/app/models/' + file);
})

app.use(passport.initialize())
app.use(passport.session())
require('./config/passport')(passport)

var connect = function() {
    var options = { server: { socketOptions: { keepAlive: 1 } } };
    mongoose.connect(config.db, options);
};
connect();

mongoose.connection.on('error', console.log);
mongoose.connection.on('disconnected', connect);


require('./config/routes')(router, passport);


require('./config/koa')(app, router, config);

var port = process.argv[2] || config.app.port || 1337;
app.listen(port, function() {
    console.log('Server started on port ' + port);
});
