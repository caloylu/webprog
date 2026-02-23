import { model, Schema } from "mongoose";

const productSchema = new Schema({

  name: {
    type: String,
    required:  [true, 'Name is required'],
    unique: true
  },
  description:{ 
    type: String,
    required:  [true, 'Description is required'],
  },
  price: {
    type: Number,
    required:  [true, 'Price is required'],
  },
  qty: {
    type: Number,
    required:  [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
}, {
  timestamps: true
});

const Product = model ('Product', productSchema);
export default Product;