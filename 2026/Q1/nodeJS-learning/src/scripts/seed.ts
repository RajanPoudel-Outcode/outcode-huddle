// Load env first
import dotenv from 'dotenv';
dotenv.config();

import { User } from '@/features/auth/models/user.model';
import { Category } from '@/features/categories/models/category.model';
import { Product } from '@/features/products/models/product.model';
import { connectionDatabase } from '@/shared/utils/db';
import bcryptjs from 'bcryptjs';
import mongoose from 'mongoose';
import { categoriesSeed } from '../data/categories.seed';
import { productsSeed } from '../data/products.seed';

const seedUsers = async (): Promise<void> => {
  const users = [
    { name: 'Admin User', email: 'admin@shop.com', password: 'Admin@123', type: 'Admin' as const },
    { name: 'Demo User', email: 'user@shop.com', password: 'User@1234', type: 'User' as const },
  ];

  for (const u of users) {
    const hashed = await bcryptjs.hash(u.password, 12);
    await User.updateOne(
      { email: u.email },
      { $set: { name: u.name, password: hashed, type: u.type } },
      { upsert: true }
    );
    console.log(`  • user ${u.email} (${u.type}) — password: ${u.password}`);
  }
};

const seed = async (): Promise<void> => {
  await connectionDatabase();

  console.log('Seeding categories…');
  await Category.deleteMany({});
  await Category.insertMany(categoriesSeed);
  console.log(`  • ${categoriesSeed.length} categories`);

  console.log('Seeding products…');
  await Product.deleteMany({});
  await Product.insertMany(productsSeed.map((p) => ({ ...p, review: [] })));
  const featured = productsSeed.filter((p) => p.isFeatured).length;
  console.log(`  • ${productsSeed.length} products (${featured} featured)`);

  console.log('Seeding users…');
  await seedUsers();

  console.log('\n✅ Seed complete.');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(async (err) => {
  console.error('❌ Seed failed:', err);
  await mongoose.disconnect();
  process.exit(1);
});
