import type { RequestHandler } from "express"
import Comment from "../models/comment.ts"

// GET all comments (optional filter by post_id)
export const getComments: RequestHandler = async (req, res) => {
    try {
        const params: any = {}

        if (req.query.post_id) {
            params.post_id = req.query.post_id
        }

        const comments = await Comment.find(params).sort({ createdAt: -1 })
        res.send(comments)

    } catch (error) {
        res.status(500).json({ message: "Error fetching comments" })
    }
}



export const getCommentById: RequestHandler = async (req, res) => {
    try {
        const id = req.params.id
        const comment = await Comment.findById(id)

        if (!comment)
            return res.status(404).json({ message: "Comment not found" })

        res.send(comment)

    } catch (error) {
        res.status(500).json({ message: "Error fetching comment" })
    }
}


export const addComment: RequestHandler = async (req, res) => {
    try {
        const data = new Comment({
            post_id: req.body.post_id,
            user_id: req.body.user_id,
            user_name: req.body.user_name,
            content: req.body.content,
            comment_id: req.body.comment_id || null
        })

        const error = data.validateSync()

        if (error) {
            return res.status(422).json({
                _message: error.message,
                message: error.message,
                errors: error.errors
            })
        }

        const comment = await data.save()
        res.status(201).send(comment)

    } catch (err: any) {
        console.error(err)
        res.status(500).json({
            error: true,
            message: "Failed to create comment"
        })
    }
}

export const updateComment: RequestHandler = async (req, res) => {
    try {
        const id = req.params.id

        const comment = await Comment.findByIdAndUpdate(
            id,
            { content: req.body.content },
            { returnDocument: "after" }
        )

        if (!comment)
            return res.status(404).json({ message: "Comment not found" })

        res.send(comment)

    } catch (error) {
        res.status(500).json({ message: "Failed to update comment" })
    }
}



export const deleteComment: RequestHandler = async (req, res) => {
    try {
        const id = req.params.id

        const comment = await Comment.findByIdAndDelete(id)

        if (!comment)
            return res.status(404).json({ message: "Comment not found" })

        res.json({ message: "Comment deleted successfully" })

    } catch (error) {
        res.status(500).json({ message: "Failed to delete comment" })
    }
}