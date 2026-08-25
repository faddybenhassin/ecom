import mongoose from 'mongoose'


const OrderItemSchema = new mongoose.Schema({
    variant: { type: mongoose.Schema.Types.ObjectId, ref: 'Variant', required: true },
    sku: { type: String, required: true },  // Snapshot the SKU for the record
    quantity: { type: Number, required: true },
    snapshotPrice: { type: Number, required: true },  // Price at time of purchase
    snapshotAttributes: { type: Map, of: String },  // e.g., { size: 'M', color: 'blue' }
}, { timestamps: false });

const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true},
    status: { 
        type: String, 
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    }
}, {timestamps: true})


export default mongoose.model('Order', OrderSchema);