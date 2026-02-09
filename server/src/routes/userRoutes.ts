import express from 'express';
import { addUser, deleteUser, getUser, getUsers, updateUser } from '../controllers/userController.ts';

const router = express.Router()

router.get('/', getUsers)
router.get('/:id', getUser)
router.post('/', addUser)
router.put('/:id', updateUser)
router.delete('/:id', deleteUser)

export default router
