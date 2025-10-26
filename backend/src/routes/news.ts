import { Hono } from 'hono';

const app = new Hono();

// News API endpoint
app.get('/', async (c) => {
  const NEWS_API_KEY = process.env.NEWS_API_KEY;

  if (!NEWS_API_KEY) {
    // Return dummy data if no API key is set
    return c.json({
      articles: [
        {
          source: { name: 'TechCrunch' },
          title: 'Sample Tech News Article',
          description: 'This is a sample news article. Get your free News API key at newsapi.org',
          url: 'https://newsapi.org',
          urlToImage: 'https://via.placeholder.com/400x200',
          publishedAt: new Date().toISOString(),
        },
        {
          source: { name: 'The Verge' },
          title: 'Another Sample Article',
          description: 'Add NEWS_API_KEY to your .env file to see real news',
          url: 'https://newsapi.org',
          urlToImage: 'https://via.placeholder.com/400x200',
          publishedAt: new Date().toISOString(),
        },
      ],
    });
  }

  try {
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&category=technology&pageSize=5&apiKey=${NEWS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch news');
    }

    const data = await response.json();
    return c.json(data);
  } catch (error) {
    console.error('Error fetching news:', error);
    return c.json({ articles: [] }, 500);
  }
});

export default app;
