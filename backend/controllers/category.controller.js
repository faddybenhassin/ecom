import { Category } from "../models/category.module.js";
import { Product } from "../models/product.module.js";

function buildCategoryTree(categories) {
    const map = {};
    const roots = [];

    categories.forEach(cat => {
        map[cat._id] = { ...cat, children: [] };
    });

    categories.forEach(cat => {
        if (cat.parent) {
            map[cat.parent]?.children.push(map[cat._id]);
        } else {
            roots.push(map[cat._id]);
        }
    });

    return roots;
}


export async function getCategories(req, res) {
    try {
        const categories = await Category.find()
            .select('slug name parent image_url')
            .sort({ name: 1 })
            .lean();

        const categoryTree = buildCategoryTree(categories);
        return res.status(200).json({count: categories.length, tree: categoryTree});
    } catch (error) {
        console.error("Error in getCategories:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function getCategoryBySlug(req, res) {
    try {
        const { slug } = req.params;
    
        const category = await Category.findOne({ slug: slug }).lean();
        if(!category){
            return res.status(404).json({error: "Category not found"});
        }
    
        return res.status(200).json(category);
        
    } catch (error) {
        console.error("Error in getCategoryBySlug:", error);
        return res.status(500).json({ error: "Internal server error" });
    }

}

export async function createCategory(req, res) {
    try {
        const { slug, name, parent, image_url } = req.body;

        if(!slug || !name){
            return res.status(400).json({error: "Slug and name are required"});
        }

        const parentCategory = parent ? await Category.findOne({ slug: parent }).lean() : undefined;
        if(parent && !parentCategory){
            return res.status(404).json({error: "Parent category not found"});
        }

        const category = await Category.create({
            slug: slug.toLowerCase().trim(),
            name: name.trim(),
            parent: parentCategory ? parentCategory._id : null,
            image_url
        })

        return res.status(201).json(category);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ error: "Slug already exists" });
        }

        console.error("Error in createCategory:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function updateCategory(req, res) {
}

export async function deleteCategory(req, res) {
    try{
        const { slug } = req.params;
    
        const category = await Category.findOne({slug})
        
        if(!category){
            return res.status(404).json({error: "Category not found"});
        }
    
        const childCount = await Category.countDocuments({ parent: category._id });
        const productCount = await Product.countDocuments({ category: category._id });
        let promotedCount = 0;
        
        if (childCount > 0) {
            if (req.query.promote === 'true') {
                const result = await Category.updateMany(
                    { parent: category._id },
                    { parent: category.parent ?? null }
                );
                promotedCount = result.modifiedCount;
            } else {
                return res.status(400).json({
                    error: `Cannot delete: ${childCount} subcategor${childCount > 1 ? 'ies' : 'y'} still reference this category`,
                });
            }
        }

        if (productCount > 0) {
            return res.status(400).json({
                message: `Cannot delete: ${productCount} product(s) still reference this category`,
            });
        }
    
        await category.deleteOne();
    
        return res.status(200).json({
            message: promotedCount > 0
                ? `Category deleted successfully. ${promotedCount} subcategor${promotedCount > 1 ? 'ies' : 'y'} promoted to ${category.parent ? 'parent category' : 'top level'}.`
                : "Category deleted successfully."
            ,promotedCount
        });
        
    } catch(error){
        console.error("Error in deleteCategory:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}