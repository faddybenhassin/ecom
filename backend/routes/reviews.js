import express from "express";
import {
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/reviews", protect, createReview);
router.patch("/reviews/:id", protect, updateReview);
router.delete("/reviews/:id", protect, deleteReview);

export default router;
