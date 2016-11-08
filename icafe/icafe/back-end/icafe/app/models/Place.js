var mongoose = require('mongoose')
    Schema = mongoose.Schema;
   PlaceSchema = new mongoose.Schema({
        name: { 'type': String, 'default': 'empty text...' }
       , factual_id: { 'type': String, 'default': 'empty text...' }
       , latitude  : { type : String, 'default': 'empty text...' } 
       , longitude  : { type : String, 'default': 'empty text...' } 
       , createdAt : {type : Date, default : Date.now}
       , region  : { type : String, 'default': 'empty text...' } 
       , tel  : { type : String, 'default': 'empty text...' } 
       , website  : { 'type': String, 'default': 'empty text...' }
       , address :  { 'type': String, 'default': 'empty text...' }
       , dist: { 'type': Number, 'default': 0 }
       , owner: { type: Schema.Types.ObjectId, ref: 'User' }
  });

module.exports = mongoose.model('Place', PlaceSchema);