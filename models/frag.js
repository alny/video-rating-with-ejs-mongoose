var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var random = require('mongoose-simple-random');


var fragSchema = new Schema({

  title: String,
  videoLink: {type: String, unique: true},
  category: String,
  votes: {type: Number, default: 0},
  voteBy: [{ type: Schema.Types.ObjectId, ref: 'User'}],
  reports: {type: Number, default: 0},
  reportedBy: [{ type: Schema.Types.ObjectId, ref: 'User'}],
  ownByUser: {type: Schema.Types.ObjectId, ref: 'User'},
  date: { type: Date, default: Date.now }

});
fragSchema.plugin(random);

module.exports = mongoose.model('Frag', fragSchema);
