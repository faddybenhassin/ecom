import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema({
  product:          { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  sku:              { type: String, required: true, unique: true },
  attributes:       { type: Map, of: String },
  price:            { type: Number, required: true, min: 0 },
  compare_at_price: { type: Number },
  inventory_qty:    { type: Number, default: 0 },
}, { timestamps: true });

VariantSchema.index({ product: 1, attributes: 1 }, { unique: true });

export const Variant = mongoose.model('Variant', VariantSchema);
