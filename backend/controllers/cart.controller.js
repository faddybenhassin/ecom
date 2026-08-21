import Cart from '../models/cart.module.js'


export async function getCart(req, res) {
    const cart = await Cart.findOne({ userId: req.session.user.id }).populate('items.variant')
    if(!cart){
        return res.status(404).json({ message: 'Cart not found'})
    }
    return res.status(200).json({cart, message: "cart found successfully"})
}

export async function updateCartItem(req,res ){

}

export async function removeFromCart(req,res ){
    
}

export async function addToCart(req,res ){
    
}

export async function clearCart(req,res ){
    
}

export async function mergeCart(req,res ){
    
}