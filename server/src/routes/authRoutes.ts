import express from "express";
import { refresh, signIn } from "../controllers/authController.ts";
const router = express.Router()

// Routes
router.post('/signin', signIn)
router.post('/refresh', refresh)

export default router