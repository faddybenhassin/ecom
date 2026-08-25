import Cart from '../models/cart.module.js'


export async function getCart(req, res) {
    const cart = await Cart.findOne({ userId: req.session.user.id }).populate('items.variant')
    if(!cart){
        return res.status(404).json({ message: 'Cart not found'})
    }
    return res.status(200).json({cart, message: "cart found successfully"})
}

// controllers/cartController.js
export const updateCartItem = async (req, res) => {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.session.user.id;

    // Validation
    if (!quantity || quantity < 1) {
        return res.status(400).json({ error: "Quantity must be >= 1" });
    }

    if (!Number.isInteger(quantity)) {
        return res.status(400).json({ error: "Quantity must be an integer" });
    }

    // Fetch cart with item
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ error: "Item not in cart" });

    // Stock check against Variant
    const variant = await Variant.findById(item.variant);
    if (!variant) return res.status(404).json({ error: "Variant not found" });

    if (quantity > variant.stock) {
        return res.status(400).json({ 
        error: `Insufficient stock. Available: ${variant.stock}` 
        });
    }

    // Update
    item.quantity = quantity;
    await cart.save();

    return res.status(200).json({cart, message: "cart updated successfully"});
};

export async function removeFromCart(req,res ){
    const { itemId } = req.params;
    const userId = req.session.user.id;

    // Fetch cart with item
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ error: "Item not in cart" });


    // Delete
    item.deleteOne();
    await cart.save();

    return res.status(200).json({cart, message: "cart deleted successfully"});
}

export async function addToCart(req,res ){
    const { variantId, quantity } = req.body;
    const userId = req.session.user.id;

    // Validation
    if (!variantId || !quantity) {
      return res.status(400).json({ error: "variantId and quantity required" });
    }

    if (quantity < 1 || !Number.isInteger(quantity)) {
      return res.status(400).json({ error: "Quantity must be a positive integer" });
    }

    // Check Variant exists & has stock
    const variant = await Variant.findById(variantId);
    if (!variant) return res.status(404).json({ error: "Variant not found" });

    if (quantity > variant.stock) {
      return res.status(400).json({ 
        error: `Insufficient stock. Available: ${variant.stock}` 
      });
    }

    // Get or create Cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if variant already in cart
    const existingItem = cart.items.find(
      (item) => String(item.variant) === String(variantId)
    );


    if (existingItem) {
      // Update quantity if already in cart
      const newQty = existingItem.quantity + quantity;
      if (newQty > variant.stock) {
        return res.status(400).json({ 
          error: `Total would exceed stock. Available: ${variant.stock}` 
        });
      }
      existingItem.quantity = newQty;
    } else {
      // Add new item with price snapshot
      cart.items.push({
        variant: variantId,
        quantity,
        price: variant.price
      });
    }

    await cart.save();

    return res.status(201).json({cart, message: "item added successfully"});
}

export async function clearCart(req,res ){
    const userId = req.session.user.id;
    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { items: [] },
      { new: true }
    );

    if(!cart){
        return res.status(404).json({ message: 'Cart not found'})
    }

    return res.status(200).json({cart, message: "cart cleared successfully"})
}

export async function mergeCart(req,res ){
    
}