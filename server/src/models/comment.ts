import { model, Schema } from "mongoose";

const commentSchema = new Schema({

  post_id: {
    type: Schema.Types.ObjectId,
    required: [true, 'Post ID is required'],
    ref: 'Post'
  },

  user_id: {
    type: Schema.Types.ObjectId,
    required: [true, 'User ID is required'],
    ref: 'User'
  },

  user_name: {
    type: String,
    required: [true, 'User name is required'],
    trim: true
  },

  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true
  },

  comment_id: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  }

}, {
  timestamps: true
});

const Comment = model('Comment', commentSchema);
export default Comment;