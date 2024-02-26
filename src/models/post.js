const mongoose = require('mongoose');

const { DateTime } = require('luxon');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: {
    type: String,
    required: true,
    length: {
      min: 1,
    },
  },
  content: {
    type: String,
    required: true,
    length: {
      min: 1,
    },
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  extension: String,
  published: {
    type: Boolean,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

PostSchema.virtual('content_preview').get(function () {
  if (this.content.length > 150) return this.content.slice(0, 148) + '...';
  return this.content;
});

PostSchema.virtual('title_preview').get(function () {
  if (this.title.length > 50) return this.title.slice(0, 48) + '...';
  return this.title;
});

PostSchema.virtual('created_at_formatted').get(function () {
  return DateTime.fromJSDate(this.created_at).toLocaleString(DateTime.DATE_MED) + ' - ' + DateTime.fromJSDate(this.created_at).toLocaleString(DateTime.TIME_24_SIMPLE);
});

PostSchema.virtual('url').get(function () {
  return `/api/v1/posts/${this._id}`;
});

PostSchema.virtual('image').get(function () {
  if (this.extension !== null) return this._id + '.' + this.extension;
  return null;
});

module.exports = mongoose.model('Post', PostSchema);
