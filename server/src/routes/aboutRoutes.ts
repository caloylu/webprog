import express from 'express';
import { getAbout } from '../controllers/aboutController.ts';
const router = express.Router()

router.get('/', getAbout)

export default router