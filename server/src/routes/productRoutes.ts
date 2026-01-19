import express from 'express';
import { getAbout } from '../controllers/aboutController.ts';
import { getProducts } from '../controllers/productController.ts';
const router = express.Router()

router.get('/', getProducts)

export default router