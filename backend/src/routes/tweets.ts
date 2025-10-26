import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db';
import { tweets, likes, follows, users } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { eq, desc, and, inArray, sql } from 'drizzle-orm';

const app = new Hono();

const createTweetSchema = z.object({
  content: z.string().min(1).max(280),
});

// Get timeline (tweets from followed users + own tweets)
app.get('/timeline', authMiddleware, async (c) => {
  const userId = c.get('userId');

  // Get users that current user follows
  const following = await db.query.follows.findMany({
    where: eq(follows.followerId, userId),
  });

  const followingIds = following.map(f => f.followingId);
  const allUserIds = [...followingIds, userId];

  // Get tweets from followed users and self
  const timelineTweets = await db.query.tweets.findMany({
    where: allUserIds.length > 0 ? inArray(tweets.userId, allUserIds) : eq(tweets.userId, userId),
    orderBy: [desc(tweets.createdAt)],
    with: {
      user: {
        columns: {
          password: false,
        },
      },
      likes: true,
    },
    limit: 50,
  });

  // Add like count and isLiked status
  const tweetsWithMeta = timelineTweets.map(tweet => ({
    ...tweet,
    likeCount: tweet.likes.length,
    isLiked: tweet.likes.some(like => like.userId === userId),
  }));

  return c.json(tweetsWithMeta);
});

// Create a tweet
app.post('/', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    const data = createTweetSchema.parse(body);

    const [newTweet] = await db.insert(tweets).values({
      content: data.content,
      userId,
    }).returning();

    const tweetWithUser = await db.query.tweets.findFirst({
      where: eq(tweets.id, newTweet.id),
      with: {
        user: {
          columns: {
            password: false,
          },
        },
        likes: true,
      },
    });

    return c.json({
      ...tweetWithUser,
      likeCount: 0,
      isLiked: false,
    }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation error', details: error.errors }, 400);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get a specific tweet
app.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'));

  const tweet = await db.query.tweets.findFirst({
    where: eq(tweets.id, id),
    with: {
      user: {
        columns: {
          password: false,
        },
      },
      likes: true,
    },
  });

  if (!tweet) {
    return c.json({ error: 'Tweet not found' }, 404);
  }

  // Get userId from auth if available
  const authHeader = c.req.header('Authorization');
  let userId = null;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const { verifyToken } = await import('../utils/auth');
    const payload = await verifyToken(token);
    userId = payload?.userId;
  }

  return c.json({
    ...tweet,
    likeCount: tweet.likes.length,
    isLiked: userId ? tweet.likes.some(like => like.userId === userId) : false,
  });
});

// Delete a tweet
app.delete('/:id', authMiddleware, async (c) => {
  const id = parseInt(c.req.param('id'));
  const userId = c.get('userId');

  const tweet = await db.query.tweets.findFirst({
    where: eq(tweets.id, id),
  });

  if (!tweet) {
    return c.json({ error: 'Tweet not found' }, 404);
  }

  if (tweet.userId !== userId) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  await db.delete(tweets).where(eq(tweets.id, id));

  return c.json({ message: 'Tweet deleted' });
});

// Like a tweet
app.post('/:id/like', authMiddleware, async (c) => {
  const tweetId = parseInt(c.req.param('id'));
  const userId = c.get('userId');

  const tweet = await db.query.tweets.findFirst({
    where: eq(tweets.id, tweetId),
  });

  if (!tweet) {
    return c.json({ error: 'Tweet not found' }, 404);
  }

  // Check if already liked
  const existingLike = await db.query.likes.findFirst({
    where: and(eq(likes.userId, userId), eq(likes.tweetId, tweetId)),
  });

  if (existingLike) {
    return c.json({ error: 'Already liked' }, 400);
  }

  await db.insert(likes).values({
    userId,
    tweetId,
  });

  return c.json({ message: 'Tweet liked' });
});

// Unlike a tweet
app.delete('/:id/like', authMiddleware, async (c) => {
  const tweetId = parseInt(c.req.param('id'));
  const userId = c.get('userId');

  const existingLike = await db.query.likes.findFirst({
    where: and(eq(likes.userId, userId), eq(likes.tweetId, tweetId)),
  });

  if (!existingLike) {
    return c.json({ error: 'Not liked yet' }, 400);
  }

  await db.delete(likes).where(
    and(eq(likes.userId, userId), eq(likes.tweetId, tweetId))
  );

  return c.json({ message: 'Tweet unliked' });
});

export default app;
