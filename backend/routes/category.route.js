import express from "express";
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryProducts,
} from "../controllers/category.controller.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// GET    /api/categories           → list all categories
router.get("/categories", getCategories);

// GET    /api/categories/:slug     → single category by slug
router.get("/categories/:slug", getCategoryBySlug);

// POST   /api/categories           → create category (admin)
router.post("/categories", protect, adminOnly, createCategory);

// PATCH  /api/categories/:slug     → update category fields (admin)
router.patch("/categories/:slug", protect, adminOnly, updateCategory);

// DELETE /api/categories/:slug     → delete a category (admin)
router.delete("/categories/:slug", protect, adminOnly, deleteCategory);

export default router;
