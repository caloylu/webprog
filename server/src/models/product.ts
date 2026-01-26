import { model, Schema } from "mongoose";

const productSchema = new Schema({
  name: String,
  description: String,
  price: Number,
  qty: Number

}, {
  timestamps: true
});

const Product = model ('Product', productSchema);
export default Product;