var mongoose = require('mongoose')
    Schema = mongoose.Schema;
   FavoriteSchema = new mongoose.Schema({
       	user: { type: Schema.Types.ObjectId, ref: 'User' }
       , createdAt : {type : Date, default : Date.now}
       , place : { type: Schema.Types.ObjectId, ref: 'Place' }
  });

module.exports = mongoose.model('Favorite', FavoriteSchema);