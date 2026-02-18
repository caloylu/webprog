import express from "express"
import { addOrder, deleteOrder, getOrder, getOrders, updateOrder } from "../controllers/orderController.ts";
const router = express.Router()

// Routes
router.get('/', getOrders)
router.get('/:id', getOrder)
router.post('/', addOrder)
router.put('/:id', updateOrder)
router.delete('/:id', deleteOrder)

export default router