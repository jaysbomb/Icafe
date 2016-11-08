'use strict';

var mongoose = require('mongoose'),
    validator = require('node-mongoose-validator'),
    crypto = require('crypto');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: {type: String, required: false},
    email: { type: String, required: false },
    frequency: {type: Number, default: 0},
    hashed_password: { type: String, required: false },
    isAdmin: { type: Boolean, default: false },
    table: {type: Number, required:false},
    ownShop: { type: Schema.Types.ObjectId, ref: 'Place' },
    avatar_id : {type: Number, required:false},

    salt: { type: String, required: false },
    facebook_id: { type: String, required: false },
    twitter_id: { type: String, required: false },
    gcm_id: { type: String, required: false },
    createdAt: { type: Date, default: Date.now }
});


UserSchema
    .virtual('password')
    .set(function(password) {
        this._password = password;
        this.salt = mongoose.model('User').makeSalt();
        this.hashed_password = this.encryptPassword(password);
    });


UserSchema.path('email').validate(validator.isEmail(), 'Please provide a valid email address.');
UserSchema.path('email').validate(function(email, cb) {
    var User = mongoose.model('User');

    if (this.isNew || this.isModified('email')) {
        User.find({ email: email }).exec(function(err, users) {
            cb(err || users.length === 0);
        });
    } else {
        cb(true);
    }
}, 'The email provided already exists.');


UserSchema.methods = {

    authenticate: function(plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    },

    encryptPassword: function(password) {
        if (!password)
            return '';

        try {
            return crypto.createHmac('sha256', this.salt).update(password).digest('hex');
        } catch (err) {
            return '';
        }
    }
};

UserSchema.statics = {

    makeSalt: function() {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    }
};

mongoose.model('User', UserSchema);
