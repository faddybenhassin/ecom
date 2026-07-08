import { Product, Category } from "../models/Products";

export async function getProductBySlug(){

}







// add sorting
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

export async function createProduct(){

}


export async function updateProduct(){

}


export async function deleteProduct(){

}

export async function getProductVariants(){

}

export async function getProductReviews(){

}
