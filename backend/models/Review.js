import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  product:           { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user:              { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating:            { type: Number, required: true, min: 1, max: 5 },
  title:             { type: String },
  body:              { type: String },
  verified_purchase: { type: Boolean, default: false },
}, { timestamps: true });

export const Review = mongoose.model('Review', ReviewSchema);
