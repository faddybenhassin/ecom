import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  slug:      { type: String, required: true, unique: true },
  name:      { type: String, required: true },
  parent:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  image_url: { type: String },
}, { timestamps: true });

export const Category = mongoose.model('Category', CategorySchema);
