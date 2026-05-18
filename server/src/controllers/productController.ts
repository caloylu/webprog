import type { RequestHandler } from "express"
import fs from "fs/promises"
import path from "path"
import Product from "../models/product.ts";

async function removeImageFile(imageUrl: string | null | undefined) {
    if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.startsWith("/uploads/")) {
        return
    }
    const abs = path.join(process.cwd(), imageUrl.replace(/^\//, ""))
    try {
        await fs.unlink(abs)
    } catch {
        /* ignore missing file */
    }
}

//type SortValues = 'name' | 'description' | 'price' | 'qty'
export type SortType = {
    [key: string]: number
}

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
    const page = parseInt(req.query?.page as string) || 1
    const limit = parseInt(req.query?.pagesize as string) || 10
    const skip = (page - 1) * limit
    const sort: SortType = {}
    const sortField = req.query?.sort as string || 'name'
    const sortDir = parseInt(req.query?.sortdir as string) || 1
    sort[sortField] = sortDir
    const products = await Product.find(params)
        //@ts-ignore
        .sort(sort)
        .skip(skip).limit(limit)
    const totalCount = await Product.find(params).countDocuments()
    res.send({
        products: products,
        totalCount: totalCount,
        currentPage: page
    })
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
    // use validation framework
    const data = new Product({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        qty: req.body.qty,
    })
    const error = data.validateSync()
    //console.log(error)
    if (error) {
        res.status(422).json(error)
        return
    }
    try {
        const product = await data.save()
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
    try {
        const product = await Product.findByIdAndUpdate(id, {
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            qty: req.body.qty,
        }, {
            returnDocument: 'after'
        })
        console.log('updated product:', product);
        if (product === null)
            res.status(404).send()
        else
            res.send(product)
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

export const deleteProduct: RequestHandler = async (req, res) => {
    const id = req.params.id
    console.log(req.body)
    const product = await Product.findByIdAndDelete(id)

    if (product === null)
        res.status(404).send()
    else {
        await removeImageFile(product.imageUrl ?? undefined)
        res.send(product)
    }
}

type MulterRequest = Parameters<RequestHandler>[0] & { file?: Express.Multer.File }

export const uploadProductImage: RequestHandler = async (req, res) => {
    const reqWithFile = req as MulterRequest
    try {
        if (!reqWithFile.file) {
            return res.status(400).json({
                error: true,
                message: "Image file is required.",
            })
        }
        const id = req.params.id
        const product = await Product.findById(id)
        if (!product) {
            await fs.unlink(reqWithFile.file.path).catch(() => { })
            return res.status(404).json({ error: true, message: "Product not found." })
        }
        await removeImageFile(product.imageUrl ?? undefined)
        const publicPath = `/uploads/products/${reqWithFile.file.filename}`
        const updated = await Product.findByIdAndUpdate(
            id,
            { imageUrl: publicPath },
            { returnDocument: "after" }
        )
        res.send(updated)
    } catch (err: any) {
        if (reqWithFile.file?.path) {
            await fs.unlink(reqWithFile.file.path).catch(() => { })
        }
        const message = err?.message ?? "Failed to upload image."
        res.status(400).json({ error: true, message })
    }
}
