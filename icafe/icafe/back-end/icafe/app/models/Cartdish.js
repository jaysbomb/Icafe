var mongoose = require('mongoose')
    Schema = mongoose.Schema;
    CartdishSchema = new mongoose.Schema({
    	user : {type: Schema.Types.ObjectId, ref: 'User'},
    	dish : {type: Schema.Types.ObjectId, ref: 'Dish'},
    	amount : {type : Number, required: false},
    	table: {type : Number, require: true},
    });

module.exports = mongoose.model('Cartdish', CartdishSchema);