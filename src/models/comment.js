const mongoose = require('mongoose');

const { DateTime } = require('luxon');

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  content: {
    type: String,
    required: true,
    length: {
      min: 1,
    },
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
});

// CommentSchema.virtual('created_at_formatted').get(function () {
//   return DateTime.fromJSDate(this.created_at).toLocaleString(DateTime.DATE_MED) + ' - ' + DateTime.fromJSDate(this.created_at).toLocaleString(DateTime.TIME_24_SIMPLE);
// });

CommentSchema.virtual('created_at_formatted').get(function () {
  // return DateTime.fromISO(this.created_at).toLocaleString(DateTime.DATE_MED) + ' - ' + DateTime.fromISO(this.created_at).toLocaleString(DateTime.TIME_24_SIMPLE);

  return DateTime.fromISO(this.created_at);
});

module.exports = mongoose.model('Comment', CommentSchema);
