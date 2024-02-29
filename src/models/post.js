const mongoose = require('mongoose');

const { DateTime } = require('luxon');

const Schema = mongoose.Schema;

const PostSchema = new Schema(
  {
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
    published: {
      type: Boolean,
      required: true,
    },
    createdAt: {
      type: Date,
      default: () => new Date(Date.now()),
    },
  },
  { toJSON: { virtuals: true } }
);

PostSchema.virtual('contentPreview').get(function () {
  if (this.content.length > 150) return this.content.slice(0, 148) + '...';
  return this.content;
});

PostSchema.virtual('titlePreview').get(function () {
  if (this.title.length > 50) return this.title.slice(0, 48) + '...';
  return this.title;
});

PostSchema.virtual('createdAtFormatted').get(function () {
  return DateTime.fromJSDate(this.createdAt).toLocaleString(DateTime.DATE_MED) + ' - ' + DateTime.fromJSDate(this.createdAt).toLocaleString(DateTime.TIME_24_SIMPLE);
});

PostSchema.virtual('url').get(function () {
  return `/api/v1/posts/${this._id}`;
});

module.exports = mongoose.model('Post', PostSchema);
