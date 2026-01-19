import express from "express"
import { getUsers } from "../controllers/userController.ts";
const router = express.Router()

// Routes
router.get('/', getUsers)

export default router