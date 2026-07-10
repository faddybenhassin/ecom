import express from "express";
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductVariants,
  getProductReviews,
} from "../controllers/productController.js";

// import {
//   createVariant,
//   updateVariant,
//   deleteVariant,
//   updateVariantInventory,
// } from "../controllers/variantController.js";

// import {
//   getCategories,
//   getCategoryBySlug,
//   createCategory,
//   updateCategory,
//   deleteCategory,
//   getCategoryProducts,
// } from "../controllers/categoryController.js";

// import {
//   createReview,
//   updateReview,
//   deleteReview,
// } from "../controllers/reviewController.js";

import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// ─────────────────────────────────────────────
// PRODUCT ROUTES
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// // VARIANT ROUTES
// // ─────────────────────────────────────────────

// // POST   /api/variants             → create variant for a product (admin)
// router.post("/variants", protect, adminOnly, createVariant);

// // PATCH  /api/variants/:sku        → update price/attributes (admin)
// router.patch("/variants/:sku", protect, adminOnly, updateVariant);

// // DELETE /api/variants/:sku        → delete a variant (admin)
// router.delete("/variants/:sku", protect, adminOnly, deleteVariant);

// // PATCH  /api/variants/:sku/inventory → adjust inventory_qty (admin)
// router.patch("/variants/:sku/inventory", protect, adminOnly, updateVariantInventory);

// // ─────────────────────────────────────────────
// // CATEGORY ROUTES
// // ─────────────────────────────────────────────

// // GET  /api/categories             → list all categories as nested tree
// router.get("/categories", getCategories);

// // GET  /api/categories/:slug       → single category + its children
// router.get("/categories/:slug", getCategoryBySlug);

// // GET  /api/categories/:slug/products → products under this category
// router.get("/categories/:slug/products", getCategoryProducts);

// // POST   /api/categories           → create category (admin)
// router.post("/categories", protect, adminOnly, createCategory);

// // PATCH  /api/categories/:slug     → update category (admin)
// router.patch("/categories/:slug", protect, adminOnly, updateCategory);

// // DELETE /api/categories/:slug     → delete category (admin)
// router.delete("/categories/:slug", protect, adminOnly, deleteCategory);

// // ─────────────────────────────────────────────
// // REVIEW ROUTES
// // ─────────────────────────────────────────────

// // POST   /api/reviews              → submit a review (authenticated user)
// // verified_purchase is set server-side by checking order history
// router.post("/reviews", protect, createReview);

// // PATCH  /api/reviews/:id          → edit own review (authenticated user)
// router.patch("/reviews/:id", protect, updateReview);

// // DELETE /api/reviews/:id          → delete own review (authenticated user)
// router.delete("/reviews/:id", protect, deleteReview);

export default router;