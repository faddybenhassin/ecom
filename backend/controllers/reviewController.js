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
        console.error(error);
        return res.status(500).json({ error: "Failed to create review" });
    }
}

export async function updateReview(req, res) {
}

export async function deleteReview(req, res) {
}
