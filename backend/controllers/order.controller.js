import Order from '../models/order.module.js'
import Cart from '../models/cart.module.js'
import Variant from '../models/variant.module.js'



export async function createOrder(req,res ){
    const { userId } = req.session.user.id;
    const cart = await Cart.findOne({ userId });

    if (!cart || cart.items.length === 0) {
        return res.status(404).json({ message: 'Cart is empty' });
    }

    let orderItems = []
    let totalAmount = 0


    for (const item of cart.items) {
        const variant = await Variant.findById(item.variant);

        if (!variant) {
            return res.status(404).json({ message: `Variant not found: ${item.variant}` });
        }

        if (item.quantity > variant.inventory_qty) {
            return res.status(400).json({ 
                message: `Insufficient stock for ${variant.sku}. Available: ${variant.inventory_qty}` 
            });
        }

        orderItems.push({
            variantId: item.variant,
            sku: variant.sku,
            quantity: item.quantity,
            snapshotPrice: variant.price,
            snapshotAttributes: variant.attributes
        });

        totalAmount += variant.price * item.quantity;
    }

    for (const item of orderItems) {
        await Variant.findByIdAndUpdate(item.variantId, {
            $inc: { inventory_qty: -item.quantity }
        });
    }


     const order = await Order.create({
        userId,
        items: orderItems,
        totalAmount,
        status: 'pending'
    });

    await Cart.findByIdAndDelete(cart._id);

    return res.status(201).json({message: "order created successfully"})
}

export async function getOrders(req,res ){
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const query = { user: req.session.user.id };
    if (status) query.status = status;

    const orders = await Order.find(query)
        .populate('items.variant', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

    const total = await Order.countDocuments(query);
    
    res.json({
        orders,
        pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
        },
    });
}

export async function getOrder(req,res ){

}

export async function updateOrderStatus(req,res ){

}

export async function cancelOrder(req,res ){

}