import type { RequestHandler } from "express"
import User from "../models/user.ts";
import { hashPassword } from "./authController.ts";

export const getUsers: RequestHandler = async (req, res) => {
    const users = await User.find()
    res.send(users)
}

export const getUser: RequestHandler = async (req, res) => {
    const id = req.params.id
    const user = await User.findById(id)
    res.send(user)
}
export const addUser: RequestHandler = async (req, res) => {
    if (!req.body.user_name || !req.body.email || !req.body.password) {
        res.status(422).json({
            error: true,
            message: "Username, email, and password are required.",
        })
        return
    }
    const hash = await hashPassword(req.body.password)
    try {
        const emailNorm = String(req.body.email).trim().toLowerCase()
        const user = await User.create({
            user_name: String(req.body.user_name).trim(),
            email: emailNorm,
            password: hash,
        })

        res.status(201).send(user)

    } catch (err: any) {
        if (err.code === 11000) {
            res.status(409).json({
                error: true,
                message: "Duplicate record found."
            });
        } else {
            res.status(500).json({
                error: true,
                message: "Unexpected error."
            });
        }
    }
}

export const updateUser: RequestHandler = async (req, res) => {
    const id = req.params.id
    console.log(id)
    console.log(req.body)
    const hash = await hashPassword(req.body.password)
    const user = await User.findByIdAndUpdate(id, {
        user_name: req.body.user_name,
        email: req.body.email,
        password: hash,
    }, {
        returnDocument: 'after'
    })

    if (user === null)
        res.status(404).send()
    else
        res.send(user)
}
export const deleteUser: RequestHandler = async (req, res) => {
    const id = req.params.id
    const result = await User.findByIdAndDelete(id)

    if (result === null)
        res.status(404).send()
    else
        res.send(result)
}