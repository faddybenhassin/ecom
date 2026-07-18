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

export async function getCategoryProducts(req, res) {
}

export async function createCategory(req, res) {
}

export async function updateCategory(req, res) {
}

export async function deleteCategory(req, res) {
}
