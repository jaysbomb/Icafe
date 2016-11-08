var mongoose = require('mongoose')
    Schema = mongoose.Schema;
    DishSchema = new mongoose.Schema({
    	name: {type: String, required: false},
    	category: {type: String, required: false},
        description: {type: String, required: false},
        price : {type : Number, required: false},
        isRecommended: { type: Boolean, default: false },
        period: {type: String, required: false},
    });

module.exports = mongoose.model('Dish', DishSchema);