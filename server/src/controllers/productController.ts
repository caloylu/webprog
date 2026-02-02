import type { RequestHandler } from "express"
import Product from "../models/product.ts";

export const getProducts: RequestHandler = async (req, res) => {
    let params: any = {}
    if (req.query.find) {
        params = {
            $or: [{
                name: {
                    $regex: req.query.find,
                    $options: "i"
                }
            }, {
                description: {
                    $regex: req.query.find,
                    $options: "i"
                }
            }]
        }
    }
    const products = await Product.find(params)
    res.send(products)
}

export const getProduct: RequestHandler = async (req, res) => {
    const id = req.params.id
    console.log(id)
    const product = await Product.findById(id)
    console.log('Found product:', product)
    res.send(product)
}

export const addProduct: RequestHandler = async (req, res) => {
    console.log(req.body)
    // use validation framework later
    if (req.body.name === undefined || req.body.name === '') {
        res.status(422).send()
        return
    }
    try {
        const product = await Product.create({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            qty: req.body.qty,
        })
        console.log('Created product:', product);
        res.status(201).send(product)
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

export const updateProduct: RequestHandler = async (req, res) => {
    const id = req.params.id
    console.log(id)
    console.log(req.body)
    const product = await Product.findByIdAndUpdate(id, {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        qty: req.body.qty,
    }, {
        returnDocument: 'after'
    })
    console.log('Updated product:', product);

    if (product === null)
        res.status(404).send()
    else
        res.send(product)
}

export const deleteProduct: RequestHandler = async (req, res) => {
    const id = req.params.id
    console.log(req.body)
    const result = await Product.findByIdAndDelete(id)
    res.send(result)
}
