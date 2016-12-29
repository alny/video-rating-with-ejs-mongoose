var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({

  email: {type: String, unique: true, lowercase: true},
  facebook: String,
  tokens: Array,
  role: String,
  date: { type: Date, default: Date.now },
  profile: {
    name: { type: String, default: ''},
    picture: { type: String, default: ''}
},

myFrags: [{ type: Schema.Types.ObjectId, ref: 'Frag'}]

});

module.exports = mongoose.model('User', userSchema);
