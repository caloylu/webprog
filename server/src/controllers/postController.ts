import type { RequestHandler } from "express"
import Post from "../models/post.ts";
import User from "../models/user.ts";

export const getPosts: RequestHandler = async (req, res) => {
    let params: any = {}
    if (req.query.find) {
        params = {
            $or: [{
                title: {
                    $regex: req.query.find,
                    $options: "i"
                }
            }, {
                content: {
                    $regex: req.query.find,
                    $options: "i"
                }
            }]
        }
    }
    const posts = await Post.find(params)
    res.send(posts)
}

export const getPost: RequestHandler = async (req, res) => {
    const id = req.params.id
    console.log(id)
    const post = await Post.findById(id)
    console.log('Found post:', post);
    res.send(post)
}

export const addPost: RequestHandler = async (req, res) => {
    console.log(req.body)
    // use validation framework later
    if (req.body.title === undefined || req.body.title === '') {
        res.status(422).send()
        return
    }
    try {
        const user_id = req.body.user_id
        const user = await User.findById(user_id)
        if (!user) {
            res.status(404).json({
                error: true,
                message: `User id ${user_id} not found.`
            })
            return
        }
        const post = await Post.create({
            title: req.body.title,
            content: req.body.content,
            published: req.body.published,
            user_id: user_id,
            username: user.name,
        })
        console.log('Created post:', post);

        res.status(201).send(post)
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

export const updatePost: RequestHandler = async (req, res) => {
    const id = req.params.id
    console.log(id)
    console.log(req.body)
    const post = await Post.findByIdAndUpdate(id, {
        title: req.body.title,
        content: req.body.content,
        published: req.body.published,
        //user_id: req.body.user_id,
    }, {
        returnDocument: 'after'
    })
    console.log('Updated post:', post);
    if (post === null)
        res.status(404).send()
    else
        res.send(post)
}

export const deletePost: RequestHandler = async (req, res) => {
    const id = req.params.id
    console.log(req.body)
    const result = await Post.findByIdAndDelete(id)
    console.log('Deleted post:', result);
    res.send(result)
}







