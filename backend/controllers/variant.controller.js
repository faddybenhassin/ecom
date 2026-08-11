import { Product } from "../models/product.module.js";
import { Variant } from "../models/variant.module.js";

export async function createVariant(req, res){
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

    try {
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
        throw error;
    }
}


export async function updateVariant(req, res) {
    const { sku } = req.params;
    const { 
        slug,
        attributes, 
        price, 
        compare_at_price,
        inventory_qty
    } = req.body;


    const existingVariant = await Variant.findOne({ sku }, 'price');
    if (!existingVariant) {
        return res.status(404).json({ error: "Variant not found." });
    }

    const updateFields = {};

    if (slug !== undefined) {
        const product = await Product.findOne({ slug }, '_id').lean();
        if (!product) {
            return res.status(404).json({ error: "Product not found." });
        }
        updateFields.product = product._id;
    }

    if(price !== undefined){
        if (typeof price !== "number" || price <= 0) {
            return res.status(400).json({
                error: "price must be a positive number.",
            });
        }
        updateFields.price = price;
    }

    if (attributes !== undefined) {
        if (
            typeof attributes !== "object" ||
            attributes === null ||
            Array.isArray(attributes) ||
            Object.keys(attributes).length === 0 ||
            Object.values(attributes).some(v => typeof v !== "string")
        ) {
            return res.status(400).json({
                error: "attributes must be a non-empty object with string values.",
            });
        }
        updateFields.attributes = attributes;
    }


    if (compare_at_price !== undefined && compare_at_price !== null) {
        const effectivePrice = updateFields.price ?? existingVariant.price;
        if (typeof compare_at_price !== "number" || compare_at_price <= effectivePrice) {
            return res.status(400).json({
                error: "compare_at_price must be a number greater than price.",
            });
        }
        updateFields.compare_at_price = compare_at_price;
    }

    if(inventory_qty !== undefined){
        if (typeof inventory_qty !== "number" || inventory_qty < 0) {
            return res.status(400).json({
                error: "inventory_qty must be a non-negative number.",
            });
        }
        updateFields.inventory_qty = inventory_qty;
    }

    if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ error: "No valid fields to update." });
    }

    Object.assign(existingVariant, updateFields);
    await existingVariant.save();

    return res.status(200).json({
        message: "Variant updated successfully.",
        variant: existingVariant
    });
}

export async function deleteVariant(req, res) {
    const { sku } = req.params;
    const variant = await Variant.findOneAndDelete({sku})
    if(!variant){
        return res.status(404).json({error:"Variant not found."})
    }

    return res.status(200).json({message: "Variant deleted successfully.",})
}
