import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import { Product } from './models/product.module.js';
import { Category } from './models/category.module.js';
import { Variant } from './models/variant.module.js';

dotenv.config();

const categoriesSeed = [
  { name: 'Electronics', slug: 'electronics', image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Phones', slug: 'phones', parentSlug: 'electronics', image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Laptops', slug: 'laptops', parentSlug: 'electronics', image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Home', slug: 'home', image_url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Furniture', slug: 'furniture', parentSlug: 'home', image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80' },
];

const productsSeed = [
  {
    slug: 'aurora-phone-12',
    name: 'Aurora Phone 12',
    description: 'A slim smartphone with a bright OLED display and strong battery life.',
    brand: 'Aurora',
    categorySlug: 'phones',
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
    ],
    variants: [
      {
        sku: 'AUR-P12-BLK-128',
        attributes: { color: 'Black', storage: '128GB' },
        price: 799,
        compare_at_price: 999,
        inventory_qty: 24,
      },
      {
        sku: 'AUR-P12-WHT-256',
        attributes: { color: 'White', storage: '256GB' },
        price: 949,
        compare_at_price: 1099,
        inventory_qty: 12,
      },
    ],
  },
  {
    slug: 'nova-laptop-pro',
    name: 'Nova Laptop Pro',
    description: 'A powerful laptop built for work, design, and everyday productivity.',
    brand: 'Nova',
    categorySlug: 'laptops',
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80',
    ],
    variants: [
      {
        sku: 'NOVA-LP-16-512',
        attributes: { ram: '16GB', storage: '512GB' },
        price: 1299,
        compare_at_price: 1499,
        inventory_qty: 8,
      },
      {
        sku: 'NOVA-LP-32-1TB',
        attributes: { ram: '32GB', storage: '1TB' },
        price: 1599,
        compare_at_price: 1799,
        inventory_qty: 4,
      },
    ],
  },
  {
    slug: 'loom-chair',
    name: 'Loom Chair',
    description: 'An ergonomic chair with a soft seat and modern silhouette.',
    brand: 'Loom',
    categorySlug: 'furniture',
    images: [
      'https://images.unsplash.com/photo-1519947486511-46149fa0a254?auto=format&fit=crop&w=1200&q=80',
    ],
    variants: [
      {
        sku: 'LOOM-CHAIR-BLK',
        attributes: { color: 'Black', material: 'Mesh' },
        price: 219,
        compare_at_price: 299,
        inventory_qty: 15,
      },
      {
        sku: 'LOOM-CHAIR-GRY',
        attributes: { color: 'Gray', material: 'Fabric' },
        price: 239,
        compare_at_price: 319,
        inventory_qty: 10,
      },
    ],
  },
];

async function seedCategories() {
  const categoryMap = new Map();

  for (const categorySeed of categoriesSeed) {
    const parentCategory = categorySeed.parentSlug
      ? categoryMap.get(categorySeed.parentSlug)
      : null;

    const category = await Category.findOneAndUpdate(
      { slug: categorySeed.slug },
      {
        $set: {
          name: categorySeed.name,
          parent: parentCategory?._id ?? null,
          image_url: categorySeed.image_url ?? null,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    categoryMap.set(categorySeed.slug, category);
  }

  return categoryMap;
}

async function seedProducts(categoryMap) {
  let createdProducts = 0;
  let createdVariants = 0;

  for (const productSeed of productsSeed) {
    const category = categoryMap.get(productSeed.categorySlug);

    if (!category) {
      console.warn(`Skipping product ${productSeed.slug} because category ${productSeed.categorySlug} was not found.`);
      continue;
    }

    const product = await Product.findOneAndUpdate(
      { slug: productSeed.slug },
      {
        $set: {
          name: productSeed.name,
          description: productSeed.description,
          brand: productSeed.brand,
          category: category._id,
          images: productSeed.images,
          is_active: true,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    createdProducts += 1;

    for (const variantSeed of productSeed.variants) {
      await Variant.findOneAndUpdate(
        { sku: variantSeed.sku },
        {
          $set: {
            product: product._id,
            sku: variantSeed.sku,
            attributes: variantSeed.attributes,
            price: variantSeed.price,
            compare_at_price: variantSeed.compare_at_price,
            inventory_qty: variantSeed.inventory_qty,
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      createdVariants += 1;
    }
  }

  return { createdProducts, createdVariants };
}

async function main() {
  try {
    await connectDB();
    const categoryMap = await seedCategories();
    const summary = await seedProducts(categoryMap);

    console.log('Seed complete.');
    console.log(`Categories: ${categoriesSeed.length}`);
    console.log(`Products: ${summary.createdProducts}`);
    console.log(`Variants: ${summary.createdVariants}`);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();
