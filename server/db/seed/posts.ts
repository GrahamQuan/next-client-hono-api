import { seed } from 'drizzle-seed';
// import { v7 as uuidv7 } from 'uuid';
import { db } from '~/db';
import { posts } from '~/db/schema';

export const seedPosts = async () => {
  const count = 5;

  // await seed(db, { posts }, { count });
  await seed(db, { posts }, { count }).refine((f) => ({
    posts: {
      columns: {
        // id: uuidv7() as any,
        // id: f.valuesFromArray({
        //   values: generateUUIDv7List(count),
        // }),
        id: f.uuid(),
        // id: f.default({ defaultValue: uuidv7() }),
        title: f.loremIpsum({ sentencesCount: 3 }),
        content: f.loremIpsum({ sentencesCount: 8 }),
        createdAt: f.date(),
        updatedAt: f.date(),
        archivedAt: f.default({ defaultValue: null }),
      },
    },
  }));
};
