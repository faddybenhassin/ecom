export async function getCart(req, res) {
    const cart = await Cart.findOne({ userId: req.session.user.id }).populate('items.variant')
    if(!cart){
        return res.status(404).json({ message: 'Cart not found'})
    }
    return res.status(200).json({cart, message: "cart found successfully"})
}