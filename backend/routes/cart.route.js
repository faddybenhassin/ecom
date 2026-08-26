import express from 'express'

import {
    getCart,
    updateCartItem,
    removeFromCart,
    addToCart,
    clearCart,
    mergeCart
} from '../controllers/cart.controller.js'

import { protect, adminOnly } from '../middleware/auth.js';


const router = express.Router()


// GET   /api/cart              → get cart (authenticated)
router.get('/cart', protect, getCart);

// POST  /api/cart              → add item to cart (authenticated)
router.post('/cart', protect, addToCart);

// PATCH /api/cart/:id          → update item (authenticated)
router.patch('/cart/:id', protect, updateCartItem);

// DELETE /api/cart/:id        → remove item (authenticated)
router.delete('/cart/:id', protect, removeFromCart);

// DELETE /api/cart            → clear cart (authenticated)
router.delete('/cart', protect, clearCart);

export default router