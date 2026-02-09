import express from "express"
import { addPost, deletePost, getPost, getPosts, updatePost } from "../controllers/postController.ts";
const router = express.Router()

// Routes
router.get('/', getPosts)
router.get('/:id', getPost)
router.post('/', addPost)
router.put('/:id', updatePost)
router.delete('/:id', deletePost)

export default router