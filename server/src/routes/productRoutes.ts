import express, { type ErrorRequestHandler } from 'express';
import multer from 'multer';
import { addProduct, deleteProduct, getProduct, getProducts, updateProduct, uploadProductImage } from '../controllers/productController.ts';
import { productImageUpload } from '../middlewares/productImageUpload.ts';
import requireAdmin from '../middlewares/requireAdmin.ts';

const router = express.Router()

router.get('/', getProducts)
router.post('/', requireAdmin, addProduct)
router.post('/:id/image', productImageUpload.single('image'), uploadProductImage)
router.get('/:id', getProduct)
router.put('/:id', requireAdmin, updateProduct)
router.delete('/:id', requireAdmin, deleteProduct)

const uploadErrorHandler: ErrorRequestHandler = (err, _req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            res.status(400).json({ error: true, message: "File too large (max 5 MB)." })
            return
        }
        res.status(400).json({ error: true, message: err.message })
        return
    }
    if (err instanceof Error && /only jpeg|png|gif|webp|image files/i.test(err.message)) {
        res.status(400).json({ error: true, message: err.message })
        return
    }
    next(err)
}

router.use(uploadErrorHandler)

export default router