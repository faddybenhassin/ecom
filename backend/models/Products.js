import mongoose from "mongoose";


const ProductSchema = new mongoose.Schema({
  slug:        { type: String, required: true, unique: true },
  name:        { type: String, required: true },
  description: { type: String },
  brand:       { type: String },
  category:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  images:      [{ type: String }],
  is_active: { type: Boolean, default: true },
}, { timestamps: true });


export const Product = mongoose.model('Product', ProductSchema);
