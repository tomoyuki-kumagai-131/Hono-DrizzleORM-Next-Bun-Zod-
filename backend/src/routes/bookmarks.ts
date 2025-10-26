import { Hono } from 'hono';
import { db } from '../db';
import { bookmarks, tweets } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { eq, and, desc } from 'drizzle-orm';

const app = new Hono();

// Get user's bookmarks
app.get('/', authMiddleware, async (c) => {
  const userId = c.get('userId');

  const userBookmarks = await db.query.bookmarks.findMany({
    where: eq(bookmarks.userId, userId),
    orderBy: [desc(bookmarks.createdAt)],
    with: {
      tweet: {
        with: {
          user: {
            columns: {
              password: false,
            },
          },
          likes: true,
          bookmarks: true,
        },
      },
    },
  });

  // Transform bookmarks to include tweet metadata
  const bookmarksWithMeta = userBookmarks.map(bookmark => ({
    ...bookmark.tweet,
    likeCount: bookmark.tweet.likes.length,
    isLiked: bookmark.tweet.likes.some(like => like.userId === userId),
    isBookmarked: true,
    bookmarkedAt: bookmark.createdAt,
  }));

  return c.json(bookmarksWithMeta);
});

// Bookmark a tweet
app.post('/:tweetId', authMiddleware, async (c) => {
  const tweetId = parseInt(c.req.param('tweetId'));
  const userId = c.get('userId');

  const tweet = await db.query.tweets.findFirst({
    where: eq(tweets.id, tweetId),
  });

  if (!tweet) {
    return c.json({ error: 'Tweet not found' }, 404);
  }

  // Check if already bookmarked
  const existingBookmark = await db.query.bookmarks.findFirst({
    where: and(
      eq(bookmarks.userId, userId),
      eq(bookmarks.tweetId, tweetId)
    ),
  });

  if (existingBookmark) {
    return c.json({ error: 'Already bookmarked' }, 400);
  }

  await db.insert(bookmarks).values({
    userId,
    tweetId,
  });

  return c.json({ message: 'Tweet bookmarked' });
});

// Remove bookmark
app.delete('/:tweetId', authMiddleware, async (c) => {
  const tweetId = parseInt(c.req.param('tweetId'));
  const userId = c.get('userId');

  const existingBookmark = await db.query.bookmarks.findFirst({
    where: and(
      eq(bookmarks.userId, userId),
      eq(bookmarks.tweetId, tweetId)
    ),
  });

  if (!existingBookmark) {
    return c.json({ error: 'Bookmark not found' }, 404);
  }

  await db.delete(bookmarks).where(
    and(
      eq(bookmarks.userId, userId),
      eq(bookmarks.tweetId, tweetId)
    )
  );

  return c.json({ message: 'Bookmark removed' });
});

export default app;
