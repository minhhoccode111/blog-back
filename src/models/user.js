const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  fullname: {
    type: String,
    required: true,
    length: {
      min: 1,
      max: 50,
    },
  },
  username: {
    type: String,
    required: true,
    length: {
      min: 8,
    },
  },
  password: {
    type: String,
    required: true,
    length: {
      min: 8,
      max: 32,
    },
  },
  isCreator: {
    type: Boolean,
    required: true,
  },
});

UserSchema.virtual('created_at_formatter').get(function () {
  return DateTime.fromJSDate(this.created_at).toLocaleString(DateTime.DATE_MED) + ' - ' + DateTime.fromJSDate(this.created_at).toLocaleString(DateTime.TIME_24_SIMPLE);
});

module.exports = mongoose.model('User', UserSchema);
