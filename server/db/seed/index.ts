import { seedPosts } from './posts';

async function seed() {
  await seedPosts();
}

seed();
