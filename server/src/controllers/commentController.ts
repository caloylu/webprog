import type { RequestHandler } from "express"
import Comment from "../models/comment.ts"
import User from "../models/user.ts"
import Post from "../models/post.ts"
import { getAuthUserId } from "../middlewares/requireAuth.ts"

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
        const tokenUserId = getAuthUserId(req.get("authorization") ?? "")
        if (!tokenUserId) {
            return res.status(401).json({ message: "Unauthorized" })
        }
        if (!req.body.post_id) {
            return res.status(422).json({ message: "post_id is required" })
        }
        if (req.body.content === undefined || String(req.body.content).trim() === "") {
            return res.status(422).json({ message: "content is required" })
        }
        const user = await User.findById(tokenUserId)
        if (!user) {
            return res.status(404).json({
                error: true,
                message: `User id ${tokenUserId} not found.`
            })
        }
        const post = await Post.findById(req.body.post_id)
        if (!post) {
            return res.status(404).json({
                error: true,
                message: "Post not found."
            })
        }

        const data = new Comment({
            post_id: req.body.post_id,
            user_id: user._id,
            user_name: user.user_name,
            content: String(req.body.content).trim(),
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
        const tokenUserId = getAuthUserId(req.get("authorization") ?? "")
        if (!tokenUserId) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const existing = await Comment.findById(id)
        if (!existing)
            return res.status(404).json({ message: "Comment not found" })

        if (existing.user_id.toString() !== tokenUserId) {
            return res.status(403).json({
                error: true,
                message: "You can only edit your own comments."
            })
        }

        const nextContent = String(req.body.content ?? "").trim()
        if (!nextContent) {
            return res.status(422).json({ message: "content is required" })
        }

        const comment = await Comment.findByIdAndUpdate(
            id,
            { content: nextContent },
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