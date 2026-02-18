import { model, Schema } from "mongoose";

const orderItemSchema = new Schema({
    product_id: String,
    product_name: String,
    qty: Number,
    price: Number,
})

const orderSchema = new Schema({
    user_id: String,
    username: String,
    status: {
        type: String,
        enum: ['New', 'Posted', 'Processing', 'Processed', 'Canceled'],
        default: 'New'
    },
    items: [orderItemSchema],
    total_amount: Number,
}, {
    timestamps: true
})

const Order = model('Order', orderSchema)

export default Order