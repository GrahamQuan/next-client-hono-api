import { createApp } from '~/lib/create-app';
import routes from '~/routes';

const app = createApp();

app.route('/api', routes);

export default app;
