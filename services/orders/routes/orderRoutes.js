import express from 'express';
import { createOrder, getMyOrders, getCookOrders, updateOrderStatus } from '../controllers/orderController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyToken, createOrder);
router.get('/my', verifyToken, getMyOrders);
router.get('/cook', verifyToken, getCookOrders);
router.patch('/:id/status', verifyToken, updateOrderStatus);

export default router;