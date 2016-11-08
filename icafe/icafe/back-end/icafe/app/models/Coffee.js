var mongoose = require('mongoose')
    Schema = mongoose.Schema;
    CoffeeSchema = new mongoose.Schema({
    	name: {type: String, required: false},
    	shopname: {type: String, required: false},
    	user : {type: Schema.Types.ObjectId, ref: 'User'},
    	username: {type : String, required: false},
    	latitude  : { type : String, 'default': 'empty text...' },
        longitude  : { type : String, 'default': 'empty text...' },
        price : {type : Number, required: false},
        rating : { type : Number, 'default': 0}
    });

module.exports = mongoose.model('Coffee', CoffeeSchema);