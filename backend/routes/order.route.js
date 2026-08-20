import express from 'express'

import {
    createOrder,
    getOrders,
    getOrder,
    updateOrderStatus,
    cancelOrder
} from '../controllers/order.controller.js'

import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router()

// NOTE: checkout is weird now with all the payment stuff do the other stuff then handle this

// POST /api/orders → create order (authenticated)
router.post('/orders', protect, createOrder);

// GET /api/orders → get orders (authenticated)
router.get('/orders', protect, getOrders);

// GET /api/orders/:id → get order (authenticated)
router.get('/orders/:id', protect, getOrder);

// PATCH /api/orders/:id/status → update order (authenticated + admin only)
router.patch('/orders/:id/status', protect, adminOnly, updateOrderStatus);

// POST /api/orders/:id/cancel → cancel order (authenticated)
router.post('/orders/:id/cancel', protect, cancelOrder);

export default router