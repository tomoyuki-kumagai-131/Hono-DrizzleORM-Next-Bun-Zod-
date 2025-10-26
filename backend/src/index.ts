import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import authRoutes from './routes/auth';
import tweetRoutes from './routes/tweets';
import userRoutes from './routes/users';

const app = new Hono();

// Middleware
app.use('/*', cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// Routes
app.route('/api/auth', authRoutes);
app.route('/api/tweets', tweetRoutes);
app.route('/api/users', userRoutes);

app.get('/', (c) => {
  return c.json({ message: 'Twitter API with Hono' });
});

const port = 4000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
