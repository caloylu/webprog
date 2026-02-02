import { model, Schema } from "mongoose";

const productSchema = new Schema({

  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  price: Number,
  qty: Number

}, {
  timestamps: true
});

const Product = model ('Product', productSchema);
export default Product;