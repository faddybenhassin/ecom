import express from "express";
import {
  createVariant,
  updateVariant,
  deleteVariant,
  updateVariantInventory,
} from "../controllers/variantController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// POST   /api/variants             → create a new variant (admin)
router.post("/variants", protect, adminOnly, createVariant);

// PATCH  /api/variants/:sku        → update variant fields (admin)
router.patch("/variants/:sku", protect, adminOnly, updateVariant);

// DELETE /api/variants/:sku        → remove a variant (admin)
router.delete("/variants/:sku", protect, adminOnly, deleteVariant);

// PATCH  /api/variants/:sku/inventory → update stock for a variant (admin)
router.patch("/variants/:sku/inventory", protect, adminOnly, updateVariantInventory);

export default router;
