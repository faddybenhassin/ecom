import mongoose from 'mongoose'


const CartItemSchema = new mongoose.Schema({
    variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Variant', required: true },
    quantity: { type: Number, required: true},
}, { timestamps: true });



const CartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    items: [CartItemSchema],
}, { timestamps: true });


export const Cart = mongoose.model('Cart', CartSchema);
// export const CartItem = mongoose.model('CartItem', CartItemSchema);  