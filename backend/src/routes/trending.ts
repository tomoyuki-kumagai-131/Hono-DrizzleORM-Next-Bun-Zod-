import { Hono } from 'hono';
import { db } from '../db';
import { tweets } from '../db/schema';
import { desc, sql } from 'drizzle-orm';

const app = new Hono();

interface TrendingWord {
  word: string;
  count: number;
}

// Get trending words/hashtags
app.get('/', async (c) => {
  try {
    // Get recent tweets (last 7 days)
    const recentTweets = await db.query.tweets.findMany({
      orderBy: [desc(tweets.createdAt)],
      limit: 1000,
      columns: {
        content: true,
      },
    });

    // Extract words and hashtags
    const wordCount = new Map<string, number>();

    recentTweets.forEach(tweet => {
      const content = tweet.content.toLowerCase();

      // Extract hashtags
      const hashtags = content.match(/#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uAC00-\uD7AF]+/g) || [];
      hashtags.forEach(tag => {
        const count = wordCount.get(tag) || 0;
        wordCount.set(tag, count + 1);
      });

      // Extract words (excluding common stop words)
      const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'as', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'of', 'to', 'in', 'for', 'with', 'by', 'from', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'and', 'but', 'or', 'if', 'because', 'that', 'this', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'who', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'me', 'him', 'us', 'them']);

      const words = content
        .replace(/#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uAC00-\uD7AF]+/g, '') // Remove hashtags
        .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
        .replace(/[^\w\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uAC00-\uD7AF]/g, ' ') // Remove special chars
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.has(word));

      words.forEach(word => {
        if (word && word.length > 2) {
          const count = wordCount.get(word) || 0;
          wordCount.set(word, count + 1);
        }
      });
    });

    // Sort by count and get top 10
    const trending: TrendingWord[] = Array.from(wordCount.entries())
      .map(([word, count]) => ({ word, count }))
      .filter(item => item.count > 1) // Only show words that appear more than once
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return c.json({ trending });
  } catch (error) {
    console.error('Failed to get trending words:', error);
    return c.json({ trending: [] });
  }
});

export default app;
