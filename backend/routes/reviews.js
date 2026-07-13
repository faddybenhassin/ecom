import express from "express";
import {
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// POST   /api/reviews              → create a review (authenticated)
router.post("/reviews", protect, createReview);

// PATCH  /api/reviews/:id          → update own review (authenticated)
router.patch("/reviews/:id", protect, updateReview);

// DELETE /api/reviews/:id          → delete own review (authenticated)
router.delete("/reviews/:id", protect, deleteReview);

export default router;
