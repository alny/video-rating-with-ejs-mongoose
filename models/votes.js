var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var voteSchema = new Schema({

  email: {type: String, unique: true, lowercase: true},
  facebook: String,
  tokens: Array,
  role: String,
  profile: {
    name: { type: String, default: ''},
    picture: { type: String, default: ''}
},

myFrags: [{ type: Schema.Types.ObjectId, ref: 'Frag'}]

});

module.exports = mongoose.model('Vote', voteSchema);
