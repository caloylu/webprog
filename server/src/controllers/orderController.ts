import type { RequestHandler } from "express"
import Order from "../models/order.ts";
import User from "../models/user.ts";
import Product from "../models/product.ts";

export const getOrders: RequestHandler = async (req, res) => {
    let params: any = {}
    if (req.query.find) {
        params = {
            $or: [{
                username: {
                    $regex: req.query.find,
                    $options: "i"
                }
            }, {
                status: {
                    $regex: req.query.find,
                    $options: "i"
                }
            }]
        }
    }
    const orders = await Order.find(params)
    res.send(orders)
}

export const getOrder: RequestHandler = async (req, res) => {
    const id = req.params.id
    console.log(id)
    const order = await Order.findById(id)
    console.log('Found Order:', order);
    res.send(order)
}

export const addOrder: RequestHandler = async (req, res) => {
    console.log(req.body)
    // use validation framework later
    if (!req.body.user_id || !req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
        res.status(422).send()
        return
    }
    try {
        const user_id = req.body.user_id
        const user = await User.findById(req.body.user_id)
        if (!user){
            res.status(404).json({
                error: true,
                message: `User id ${user_id} not found.`
            })
            return
        }
        const items = req.body.items
        let total_amount = 0
        for (const item of items) {
            const product = await Product.findById(item.product_id)
            if (!product) {
                res.status(404).json({
                    error: true,
                    message: `Product id ${item.product_id} not found.`
                })
                return
            }
            item.product_name = product.name 
            item.price = product.price 
            total_amount += item.qty * item.price
        }
        const order = await Order.create({
            user_id: user_id,
            username: user.user_name, 
            items: items,
            total_amount: total_amount
        })
        console.log('Created Order:', order);

        res.status(201).send(order)
    } catch (err: any) {
        if (err.code === 11000) {
            // Handle the duplicate key error
            res.status(409).json({
                error: true,
                message: "Duplicate record found: A document with this unique field already exists."
            });
        } else {
            // Handle other potential errors
            console.error(err);
            res.status(500).json({
                error: true,
                message: "An unexpected error occurred."
            });
        }
    }
}

export const updateOrder: RequestHandler = async (req, res) => {
    const id = req.params.id
    console.log(id)
    console.log(req.body)
    const order = await Order.findByIdAndUpdate(id, {
        status: req.body.status,
        items: req.body.items,
        total_amount: req.body.total_amount,
        //user_id: req.body.user_id,
    }, {
        returnDocument: 'after'
    })
    console.log('Updated Order:', order);
    if (order === null)
        res.status(404).send()
    else
        res.send(order)
}

export const deleteOrder: RequestHandler = async (req, res) => {
    const id = req.params.id
    console.log(req.body)
    const result = await Order.findByIdAndDelete(id)
    console.log('Deleted Order:', result);
    res.send(result)
}