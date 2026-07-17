import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  product:           { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user:              { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating:            { type: Number, required: true, min: 1, max: 5 },
  title:             { type: String, required: true, trim: true, maxlength: 120 },
  body:              { type: String, required: true, trim: true, maxlength: 5000 },
  verified_purchase: { type: Boolean, default: false },
}, { timestamps: true });

ReviewSchema.index({ user: 1, product: 1 }, { unique: true });

export const Review = mongoose.model('Review', ReviewSchema);
