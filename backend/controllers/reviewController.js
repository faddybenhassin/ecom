import { Review } from "../models/Review.js";
import { Product } from "../models/Products.js"

export async function createReview(req, res) {
    try {
        const userId = req.session.user.id;
        const { slug, rating, title, body, verified_purchase} = req.body;
    
    
        if (!slug || rating === undefined || rating === null || !title || !body) {
            return res.status(400).json({ error: "slug, rating, title, and body are required" });
        }

        if (typeof rating !== "number" || rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Rating must be a number between 1 and 5" });
        }

        if (body.length > 5000) {
            return res.status(400).json({ error: "Body must be under 5000 characters" });
        }
        if(title.length > 120) {
            return res.status(400).json({ error: "Title must be under 120 characters" });
        }

        const proudct = await Product.findOne({ slug }).lean();
        if(!product){
            return res.status(404).json({ message: "Product not found"})
        }
        const review = await Review.create({
            product: product._id,
            user: userId,
            rating,
            title,
            body
        });
    
        return res.status(201).json({
            message: "Review created successfully.",
            review,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ error: "You've already reviewed this product" });
        }
        console.error("Error in createReview:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function updateReview(req, res) {
    try {
        const { reviewId } = req.params;
        const { rating, title, body } = req.body;

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({ error: "Invalid review ID" });
        }

        if (rating !== undefined && rating !== null) {
            if (typeof rating !== "number" || rating < 1 || rating > 5) {
                return res.status(400).json({ error: "Rating must be a number between 1 and 5" });
            }
        }
        if (body !== undefined && body.trim().length === 0) {
            return res.status(400).json({ error: "Body cannot be empty" });
        }
        if (body && body.length > 5000) {
            return res.status(400).json({ error: "Body must be under 5000 characters" });
        }
        if (title !== undefined && title.trim().length === 0) {
            return res.status(400).json({ error: "Title cannot be empty" });
        }
        if (title && title.length > 120) {
            return res.status(400).json({ error: "Title must be under 120 characters" });
        }

        const updates = Object.fromEntries(
            Object.entries({ rating, title, body }).filter(([, v]) => v !== undefined)
        );

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "No valid fields to update." });
        }

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ error: "Review not found." });
        }

        // Ownership check
        if (String(review.user) !== String(req.session.user.id) && req.session.user.role !== "admin") {
            return res.status(403).json({ error: "Not authorized to edit this review." });
        }

        Object.assign(review, updates);
        await review.save({ validateModifiedOnly: true });

        return res.status(200).json({
            message: "Review updated successfully.",
            review,
        });
    } catch (error) {
        console.error("Error in updateReview:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function deleteReview(req, res) {
    try {
        const { reviewId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({ error: "Invalid review ID" });
        }

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ error: "Review not found." });
        }

        // Ownership check
        if (String(review.user) !== String(req.session.user.id) && req.session.user.role !== "admin") {
            return res.status(403).json({ error: "Not authorized to edit this review." });
        }

        await review.deleteOne();

        return res.status(200).json({ message: "Review deleted successfully." });

    } catch (error) {
        console.error("Error in deleteReview:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
