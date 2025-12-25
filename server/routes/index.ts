import { createAppRouter } from '~/lib/factory';
import auth from '~/routes/auth';
import bucket from '~/routes/bucket/bucket.controller';
import posts from '~/routes/posts/posts.controller';

const routes = createAppRouter();

routes.get('/health', (c) => {
  return c.text('ok');
});

routes.route('/auth', auth);
routes.route('/posts', posts);
routes.route('/bucket', bucket);

export default routes;
