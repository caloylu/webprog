import express from 'express';
import { getAbout, getError } from '../controllers/aboutController.ts';
const router = express.Router()

// Routes
router.get('/', getAbout)
router.get('/error', getError)

export default router