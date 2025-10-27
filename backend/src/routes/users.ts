import { Hono } from 'hono';
import { db } from '../db';
import { users, tweets, follows, likes, notifications } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { eq, and, desc, sql, or, like } from 'drizzle-orm';

const app = new Hono();

// Get current user profile
app.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId');

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      password: false,
    },
  });

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  // Get follower and following counts
  const followerCount = await db.$count(follows, eq(follows.followingId, userId));
  const followingCount = await db.$count(follows, eq(follows.followerId, userId));
  const tweetCount = await db.$count(tweets, eq(tweets.userId, userId));

  return c.json({
    ...user,
    followerCount,
    followingCount,
    tweetCount,
  });
});

// Search users
app.get('/search', async (c) => {
  const query = c.req.query('q');

  if (!query || query.trim() === '') {
    return c.json({ error: 'Search query is required' }, 400);
  }

  const searchResults = await db.query.users.findMany({
    where: or(
      like(users.username, `%${query}%`),
      like(users.displayName, `%${query}%`)
    ),
    columns: {
      password: false,
    },
    limit: 20,
  });

  // Get follower and following counts for each user
  const usersWithCounts = await Promise.all(
    searchResults.map(async (user) => {
      const followerCount = await db.$count(follows, eq(follows.followingId, user.id));
      const followingCount = await db.$count(follows, eq(follows.followerId, user.id));
      const tweetCount = await db.$count(tweets, eq(tweets.userId, user.id));

      return {
        ...user,
        followerCount,
        followingCount,
        tweetCount,
      };
    })
  );

  return c.json(usersWithCounts);
});

// Get user profile by username
app.get('/:username', async (c) => {
  const username = c.req.param('username');

  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
    columns: {
      password: false,
    },
  });

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  // Get follower and following counts
  const followerCount = await db.$count(follows, eq(follows.followingId, user.id));
  const followingCount = await db.$count(follows, eq(follows.followerId, user.id));
  const tweetCount = await db.$count(tweets, eq(tweets.userId, user.id));

  // Check if current user is following this user
  const authHeader = c.req.header('Authorization');
  let isFollowing = false;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const { verifyToken } = await import('../utils/auth');
    const payload = await verifyToken(token);
    if (payload) {
      const follow = await db.query.follows.findFirst({
        where: and(
          eq(follows.followerId, payload.userId),
          eq(follows.followingId, user.id)
        ),
      });
      isFollowing = !!follow;
    }
  }

  return c.json({
    ...user,
    followerCount,
    followingCount,
    tweetCount,
    isFollowing,
  });
});

// Get user's tweets
app.get('/:username/tweets', async (c) => {
  const username = c.req.param('username');

  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  const userTweets = await db.query.tweets.findMany({
    where: eq(tweets.userId, user.id),
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

  // Get userId from auth if available
  const authHeader = c.req.header('Authorization');
  let userId = null;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const { verifyToken } = await import('../utils/auth');
    const payload = await verifyToken(token);
    userId = payload?.userId;
  }

  const tweetsWithMeta = userTweets.map(tweet => ({
    ...tweet,
    likeCount: tweet.likes.length,
    isLiked: userId ? tweet.likes.some(like => like.userId === userId) : false,
  }));

  return c.json(tweetsWithMeta);
});

// Follow a user
app.post('/:username/follow', authMiddleware, async (c) => {
  const username = c.req.param('username');
  const userId = c.get('userId');

  const userToFollow = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  if (!userToFollow) {
    return c.json({ error: 'User not found' }, 404);
  }

  if (userToFollow.id === userId) {
    return c.json({ error: 'Cannot follow yourself' }, 400);
  }

  // Check if already following
  const existingFollow = await db.query.follows.findFirst({
    where: and(
      eq(follows.followerId, userId),
      eq(follows.followingId, userToFollow.id)
    ),
  });

  if (existingFollow) {
    return c.json({ error: 'Already following' }, 400);
  }

  await db.insert(follows).values({
    followerId: userId,
    followingId: userToFollow.id,
  });

  // Create notification for the followed user
  await db.insert(notifications).values({
    type: 'follow',
    userId: userToFollow.id, // User being followed receives notification
    actorId: userId, // User who followed
  });

  return c.json({ message: 'User followed' });
});

// Unfollow a user
app.delete('/:username/follow', authMiddleware, async (c) => {
  const username = c.req.param('username');
  const userId = c.get('userId');

  const userToUnfollow = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  if (!userToUnfollow) {
    return c.json({ error: 'User not found' }, 404);
  }

  const existingFollow = await db.query.follows.findFirst({
    where: and(
      eq(follows.followerId, userId),
      eq(follows.followingId, userToUnfollow.id)
    ),
  });

  if (!existingFollow) {
    return c.json({ error: 'Not following' }, 400);
  }

  await db.delete(follows).where(
    and(
      eq(follows.followerId, userId),
      eq(follows.followingId, userToUnfollow.id)
    )
  );

  return c.json({ message: 'User unfollowed' });
});

export default app;
