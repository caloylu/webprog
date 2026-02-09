import { model, Schema } from "mongoose";

const postSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  content: String,
  published: Boolean,
  user_id: String,
  username: String,
}, {
  timestamps: true
})

const post = model('post', postSchema)

export default post
