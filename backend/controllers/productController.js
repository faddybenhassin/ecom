import { Product, Category, Variant, Review } from "../models/Products.js";

export async function getProductBySlug(req, res){
    try {
        const {slug} = req.params;
        const product = await Product.findOne({slug}).lean()
        if(!product){
            return res.status(404).json({error:"Product not found."})
        }
        return res.status(200).json(product)
    } catch (error) {
        console.error("Error in getProductBySlug:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}




export async function getProducts(req, res){
    try {
        const {category, maxPrice, minPrice, pageParam, limitParam, sortBy} = req.query;

        const page = Number(pageParam) || 1;
        const limit = Number(limitParam) || 20;
        const skip = (page - 1) * limit;

        if (page < 1) return res.status(400).json({error:"page must be >= 1"});
        if (limit < 1) return res.status(400).json({error:"limit must be >= 1"});

        let matchConditions = { is_active: true };

        if (category) {
            const foundCategory = await Category.findOne({ slug: category }).lean();
            if (!foundCategory) {
                return res.status(200).json({ products: [], total: 0, totalPages: 0 });
            }
            matchConditions.category = foundCategory._id;
        }

        const min = minPrice ? Number(minPrice) : null;
        const max = maxPrice ? Number(maxPrice) : null;
        if (min !== null && (isNaN(min) || min <= 0)) return res.status(400).json({error:"minimum price should be positive"});
        if (max !== null && (isNaN(max) || max <= 0)) return res.status(400).json({error:"maximum price should be positive"});
        if (min !== null && max !== null && min > max) return res.status(400).json({error:"minPrice cannot be greater than maxPrice"});

        const SORT_MAPPING = {
            price_asc:  { sortPrice: 1 },
            price_desc: { sortPrice: -1 },
            newest:     { createdAt: -1 },
            default:    { _id: -1 }
        };
        const finalSort = SORT_MAPPING[sortBy] || SORT_MAPPING.default;

        const pipeline = [
            { $match: matchConditions },
            { $lookup: { from: 'variants', localField: '_id', foreignField: 'product', as: 'variants' } },
            ...(min !== null || max !== null ? [
                { $addFields: {
                    variants: {
                        $filter: {
                            input: '$variants',
                            as: 'v',
                            cond: {
                                $and: [
                                    ...(min !== null ? [{ $gte: ['$$v.price', min] }] : []),
                                    ...(max !== null ? [{ $lte: ['$$v.price', max] }] : []),
                                ]
                            }
                        }
                    }
                }},
                { $match: { 'variants.0': { $exists: true } } }
            ] : []),
            { $addFields: { sortPrice: { [sortBy === 'price_desc' ? '$max' : '$min']: '$variants.price' } } },
            { $sort: finalSort },
            { $facet: {
                data: [{ $skip: skip }, { $limit: limit }, { $unset: 'sortPrice' }],
                totalCount: [{ $count: 'count' }]
            }}
        ];

        const result = await Product.aggregate(pipeline);
        const products = result[0].data || [];
        const total = result[0].totalCount[0]?.count || 0;

        return res.status(200).json({
            products,
            total,
            totalPages: Math.ceil(total / limit),
        });

    } catch (error) {
        console.error("Error in getProducts:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}


export async function getProductVariants(req, res){
    try {
        const {slug} = req.params;
        const product = await Product.findOne({slug}).lean()

        if(!product){
            return res.status(404).json({error:"Product not found."})
        }

        const variants = await Variant.find({product: product._id}).lean()
        return res.status(200).json(variants)
    } catch (error) {
        console.error("Error in getProductVariants:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}


export async function getProductReviews(req, res){
    try {
        const {slug} = req.params;

        const { page = 1, limit = 10 } = req.query;
        
        const product = await Product.findOne({slug}, '_id').lean()
        if(!product){
            return res.status(404).json({error:"Product not found."})
        }
        
        const skip = (Number(page) - 1) * Number(limit);

        const [reviews, total] = await Promise.all([
            Review.find({ product: product._id })
                .populate('user', 'display_name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            Review.countDocuments({ product: product._id })
        ]);

        return res.status(200).json({
            reviews,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit))
        });
    } catch (error) {
        console.error("Error in getProductReviews:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}



export async function createProduct(req, res){
    try {
        const { 
            slug, 
            name, 
            description, 
            brand, 
            categorySlug, 
            images, 
            is_active = true
        } = req.body;
        

        if (!slug || !name || !categorySlug) {
            return res.status(400).json({
                error: "slug, name, and categorySlug are required.",
            });
        }

        const category = await Category.findOne({slug: categorySlug}, '_id').lean();

        if (!category) {
            return res.status(404).json({
                error: "Category not found.",
            });
        }

        const product = await Product.create({
            slug,
            name,
            description,
            brand,
            category: category._id,
            images,
            is_active,
        });
    
        return res.status(201).json({
            message: "Product created successfully.",
            product,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                error: "A product with this slug already exists.",
            });
        }

        console.error("Error in createProduct:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function updateProduct(req, res){
    try {
        const {slug} = req.params;
        const { categorySlug, ...body} = req.body;

        const allowedFields = ['name', 'description', 'brand', 'images', 'is_active'];
        const updateFields = Object.fromEntries(
            allowedFields
                .filter(field => body[field] !== undefined)
                .map(field => [field, body[field]])
        );

        if (categorySlug !== undefined) {
            const category = await Category.findOne({ slug: categorySlug }, '_id').lean();
            if (!category) {
                return res.status(404).json({ error: "Category not found." });
            }
            updateFields.category = category._id;
        }

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ error: "No valid fields to update." });
        }

        const product = await Product.findOneAndUpdate({slug}, {$set: updateFields}, {new: true, runValidators: true})
        if(!product){
            return res.status(404).json({error:"Product not found."})
        }

        return res.status(200).json({
            message: "Product updated successfully.",
            product,
        });
        
    } catch (error) {
        console.error("Error in updateProduct:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}


export async function deleteProduct(){

}


