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


const VariantSchema = new mongoose.Schema({
  product:          { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  sku:              { type: String, required: true, unique: true },
  attributes:       { type: Map, of: String },
  price:            { type: Number, required: true },
  compare_at_price: { type: Number },
  inventory_qty:    { type: Number, default: 0 },
}, { timestamps: true });

const CategorySchema = new mongoose.Schema({
  name:      { type: String, required: true },
  slug:      { type: String, required: true, unique: true },
  parent:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  image_url: { type: String },
}, { timestamps: true });

const ReviewSchema = new mongoose.Schema({
  product:           { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user:              { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating:            { type: Number, required: true, min: 1, max: 5 },
  title:             { type: String },
  body:              { type: String },
  verified_purchase: { type: Boolean, default: false },
}, { timestamps: true });



export const Product = mongoose.model('Product', ProductSchema);
export const Variant = mongoose.model('Variant', VariantSchema);
export const Category = mongoose.model('Category', CategorySchema);
export const Review = mongoose.model('Review', ReviewSchema);
