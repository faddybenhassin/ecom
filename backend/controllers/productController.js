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

        const SORT_MAPPING = {
            price_asc:  { price: 1 },
            price_desc: { price: -1 },
            newest:     { createdAt: -1 },
            rating:     { rating: -1 },
            default:    { _id: -1 }
        };
        const sortOrder = SORT_MAPPING[sortBy] || SORT_MAPPING.default;

        
        if(page < 1){
            return res.status(400).json({error:"page must be >= 1"})
        }
        if (limit < 1) {
            return res.status(400).json({ error: "limit must be >= 1" });
        }
        
        const skip = (page - 1) * limit;
        let matchConditions = { is_active: true };
    
        // Handle Category filtering without an aggregation lookup
        if (category) {
            const foundCategory = await Category.findOne({ slug: category }).lean();
            if (!foundCategory) {
                // If category doesn't exist, return empty data early instead of running a heavy pipeline
                return res.status(200).json({ products: [], total: 0, totalPages: 0 });
            }
            matchConditions.category = foundCategory._id;
        }
    
        let pipeline = [{ $match: matchConditions }];
        const hasPriceFilter = maxPrice || minPrice;

        if(hasPriceFilter){

            pipeline.push(
                {
                    $lookup: {
                        from: 'variants', 
                        localField: '_id',     
                        foreignField: 'product',        
                        as: 'variants'       
                    }
                },
            );
            
            
            if (maxPrice || minPrice) {
                let filterConditions = [];
                let min;
                let max;
                
                if(maxPrice){
                    max = Number(maxPrice)
                    if(isNaN(max) || max <= 0) return res.status(400).json({error:"maximum price should be positive"})
                        filterConditions.push({ $lte: ['$$v.price', max] });
                }
                if(minPrice){
                    min = Number(minPrice)
                    if(isNaN(min) || min <= 0) return res.status(400).json({error:"minimum price should be positive"})
                        filterConditions.push({ $gte: ['$$v.price', min] });
                }
                
                if (minPrice && maxPrice && min > max) {
                    return res.status(400).json({ error: "minPrice cannot be greater than maxPrice" });
                }
                
                pipeline.push(
                    {
                        $addFields: { // use addFields to alter the variants field and filter out the ones with price less than maxprice
                            variants: {
                                $filter: {
                                    input: '$variants',
                                    as: 'v',
                                    cond: { $and: filterConditions}
                                }
                            }
                        }
                    },
                    {
                        $match: { 'variants.0': { $exists: true } }
                    }
                );
            }
            
        }
        pipeline.push({
            $facet: {
                data: [
                // sort now if we dont need to do a heavy look up
                ...(sortBy !== 'price_asc' && sortBy !== 'price_desc' ? [{ $sort: sortOrder }] : []),
                { $skip: skip },
                { $limit: limit },
                ...(!hasPriceFilter ? [
                    {$lookup: {
                        from: 'variants', 
                        localField: '_id',     
                        foreignField: 'product',        
                        as: 'variants'       
                    }
                }]:[]),
                ...(sortBy === 'price_asc' || sortBy === 'price_desc' ? [{ $sort: sortOrder }] : []),
            ],
            totalCount: [
                { $count: 'count' }
            ]
            }
        });
    
    
        const result = await Product.aggregate(pipeline);

        const products = result[0].data || [];
        const total = result[0].totalCount[0]?.count || 0;
        const totalPages = Math.ceil(total / limit);
    
        return res.status(200).json({
            products,
            total,
            totalPages,
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

export async function updateProduct(){

}


export async function deleteProduct(){

}


