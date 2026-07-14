import { Product } from "../models/Products";
import { Variant } from "../models/Variant";

export async function createVariant(req, res){
    try {
        const { 
            slug, 
            sku, 
            attributes, 
            price, 
            compare_at_price,
            inventory_qty
        } = req.body;
        

        if (!slug || !sku || price === undefined || price === null) {
            return res.status(400).json({
                error: "slug, sku, and price are required.",
            });
        }

        if (typeof price !== "number" || price <= 0) {
            return res.status(400).json({
                error: "price must be a positive number.",
            });
        }

        if (!attributes || Object.keys(attributes).length === 0) {
            return res.status(400).json({
                error: "attributes are required and cannot be empty.",
            });
        }

        if (compare_at_price !== undefined && compare_at_price !== null) {
            if (typeof compare_at_price !== "number" || compare_at_price <= price) {
                return res.status(400).json({
                    error: "compare_at_price must be a number greater than price.",
                });
            }
        }


        if (inventory_qty !== undefined && (typeof inventory_qty !== "number" || inventory_qty < 0)) {
            return res.status(400).json({
                error: "inventory_qty must be a non-negative number.",
            });
        }

        const product = await Product.findOne({slug}, '_id').lean();

        if (!product) {
            return res.status(404).json({
                error: "Product not found.",
            });
        }

        const variant = await Variant.create({
            product: product._id, 
            sku: sku.trim().toUpperCase(), 
            attributes, 
            price, 
            compare_at_price,
            inventory_qty
        });
    
        return res.status(201).json({
            message: "Variant created successfully.",
            variant,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                error: "A variant with this sku already exists.",
            });
        }

        console.error("Error in createVariant:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}


export async function updateVariant(req, res) {
}

export async function deleteVariant(req, res) {
}

export async function updateVariantInventory(req, res) {
}
