var mongoose = require('mongoose')
    Schema = mongoose.Schema;
    OrderSchema = new mongoose.Schema({
    	user : {type: Schema.Types.ObjectId, ref: 'User'},
    	dish : {type: Array, required: true},
    	dishamount : {type: Array, required: true},
    	totalprice : {type : Number, required: true},
    	table: {type : Number, require: true},
    	createdAt: { type: Date, default: Date.now },
    	bankname: {type: String, required: false},
    	bankcard: {type: String, required: false},
        status: {type : Number, require: true},
    });

module.exports = mongoose.model('Order', OrderSchema);