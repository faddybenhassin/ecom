import express from "express";
import {
  createVariant,
  updateVariant,
  deleteVariant,
  updateVariantInventory,
} from "../controllers/variantController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.post("/variants", protect, adminOnly, createVariant);
router.patch("/variants/:sku", protect, adminOnly, updateVariant);
router.delete("/variants/:sku", protect, adminOnly, deleteVariant);
router.patch("/variants/:sku/inventory", protect, adminOnly, updateVariantInventory);

export default router;
