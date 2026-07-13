import express from "express";
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryProducts,
} from "../controllers/categoryController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/categories", getCategories);
router.get("/categories/:slug", getCategoryBySlug);
router.get("/categories/:slug/products", getCategoryProducts);
router.post("/categories", protect, adminOnly, createCategory);
router.patch("/categories/:slug", protect, adminOnly, updateCategory);
router.delete("/categories/:slug", protect, adminOnly, deleteCategory);

export default router;
