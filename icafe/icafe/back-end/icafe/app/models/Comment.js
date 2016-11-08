var mongoose = require('mongoose')
    Schema = mongoose.Schema;
   CommentSchema = new mongoose.Schema({
       user: { type: Schema.Types.ObjectId, ref: 'User' }
       , rating : { type : Number, 'default': 0 }
       , text  : { type : String, 'default': 'empty text...' } 
       , createdAt : {type : Date, default : Date.now}
       , place : { type: Schema.Types.ObjectId, ref: 'Place' }
  });

module.exports = mongoose.model('Comment', CommentSchema);