import { model, Schema } from "mongoose";

const userSchema = new Schema({
  user_name: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    unique: true
  } 
});

const User = model('User', userSchema)
export default User;