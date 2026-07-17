import express from "express";
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductVariants,
  getProductReviews,
} from "../controllers/productContro.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// GET  /api/products               → list all active products (paginated)
// Query params: ?category=&brand=&minPrice=&maxPrice=&page=&limit=
router.get("/products", getProducts);

// GET  /api/products/:slug         → single product by slug
router.get("/products/:slug", getProductBySlug);

// GET  /api/products/:slug/variants → all variants for a product
router.get("/products/:slug/variants", getProductVariants);

// GET  /api/products/:slug/reviews  → all reviews for a product
router.get("/products/:slug/reviews", getProductReviews);

// POST   /api/products             → create product (admin)
router.post("/products", protect, adminOnly, createProduct);

// PATCH  /api/products/:slug       → update product fields (admin)
router.patch("/products/:slug", protect, adminOnly, updateProduct);

// DELETE /api/products/:slug       → soft delete via is_active=false (admin)
router.delete("/products/:slug", protect, adminOnly, deleteProduct);

export default router;