import express from "express"
import { addComment, getComments, updateComment, deleteComment } from "../controllers/commentController.ts";
const router = express.Router()

// Routes
router.get('/', getComments)
router.get('/:id', getComments)
router.post('/', addComment)
router.put('/:id', updateComment)
router.delete('/:id', deleteComment)

export default router