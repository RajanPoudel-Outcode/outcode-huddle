// Load env first
import dotenv from 'dotenv';
dotenv.config();

import { User } from '@/features/auth/models/user.model';
import { Category } from '@/features/categories/models/category.model';
import { ContentPage } from '@/features/content/models/content-page.model';
import { Faq } from '@/features/faq/models/faq.model';
import { Product } from '@/features/products/models/product.model';
import { SupportRequest } from '@/features/support/models/support-request.model';
import { Wishlist } from '@/features/wishlist/models/wishlist.model';
import { connectionDatabase } from '@/shared/utils/db';
import bcryptjs from 'bcryptjs';
import mongoose from 'mongoose';
import { categoriesSeed } from '../data/categories.seed';
import { contentSeed } from '../data/content.seed';
import { faqSeed } from '../data/faq.seed';
import { productsSeed } from '../data/products.seed';
import { supportSeed } from '../data/support.seed';

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
  const insertedProducts = await Product.insertMany(
    productsSeed.map((p) => ({ ...p, review: [] })),
  );
  const featured = productsSeed.filter((p) => p.isFeatured).length;
  console.log(`  • ${insertedProducts.length} products (${featured} featured)`);

  console.log('Seeding users…');
  await seedUsers();

  console.log('Seeding FAQs…');
  await Faq.deleteMany({});
  await Faq.insertMany(faqSeed);
  console.log(`  • ${faqSeed.length} FAQs`);

  console.log('Seeding content pages…');
  await ContentPage.deleteMany({});
  await ContentPage.insertMany(contentSeed);
  console.log(`  • ${contentSeed.length} content pages (${contentSeed.map((c) => c.type).join(', ')})`);

  console.log('Seeding wishlist…');
  await Wishlist.deleteMany({});
  const demoUser = await User.findOne({ email: 'user@shop.com' });
  if (demoUser) {
    // Pre-fill the demo user's wishlist with a few featured products.
    const picks = insertedProducts
      .filter((p) => p.isFeatured)
      .slice(0, 3)
      .map((p) => p._id);
    if (picks.length) {
      await Wishlist.create({ user: demoUser._id.toString(), products: picks });
      console.log(`  • ${picks.length} products wishlisted for ${demoUser.email}`);
    }
  }

  console.log('Seeding support requests…');
  await SupportRequest.deleteMany({});
  if (demoUser) {
    const requests = supportSeed(demoUser._id.toString());
    await SupportRequest.insertMany(requests);
    console.log(`  • ${requests.length} support requests for ${demoUser.email}`);
  }

  console.log('\n✅ Seed complete.');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(async (err) => {
  console.error('❌ Seed failed:', err);
  await mongoose.disconnect();
  process.exit(1);
});
