import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema({
  product:          { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  sku:              { type: String, required: true, unique: true },
  attributes:       { type: Map, of: String },
  price:            { type: Number, required: true },
  compare_at_price: { type: Number },
  inventory_qty:    { type: Number, default: 0 },
}, { timestamps: true });

export const Variant = mongoose.model('Variant', VariantSchema);
