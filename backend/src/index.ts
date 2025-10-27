import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import authRoutes from './routes/auth';
import tweetRoutes from './routes/tweets';
import userRoutes from './routes/users';
import bookmarkRoutes from './routes/bookmarks';
import newsRoutes from './routes/news';
import trendingRoutes from './routes/trending';
import notificationRoutes from './routes/notifications';

const app = new Hono();

// Middleware
app.use('/*', cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 600,
}));

// Routes
app.route('/api/auth', authRoutes);
app.route('/api/tweets', tweetRoutes);
app.route('/api/users', userRoutes);
app.route('/api/bookmarks', bookmarkRoutes);
app.route('/api/news', newsRoutes);
app.route('/api/trending', trendingRoutes);
app.route('/api/notifications', notificationRoutes);

app.get('/', (c) => {
  return c.json({ message: 'Twitter API with Hono' });
});

const port = 4000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
