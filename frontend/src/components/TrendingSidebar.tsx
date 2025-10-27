'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Hash } from 'lucide-react';

interface TrendingWord {
  word: string;
  count: number;
}

export default function TrendingSidebar() {
  const [trending, setTrending] = useState<TrendingWord[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/trending');
        setTrending(response.data.trending || []);
      } catch (error) {
        console.error('Failed to fetch trending words:', error);
        setTrending([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();

    // Refresh every 5 minutes
    const interval = setInterval(fetchTrending, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleWordClick = (word: string) => {
    // Navigate to search page with the word
    router.push(`/search?q=${encodeURIComponent(word)}&type=tweets`);
  };

  if (loading) {
    return (
      <Card className="sticky top-4 border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Trending
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (trending.length === 0) {
    return (
      <Card className="sticky top-4 border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Trending
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No trending topics yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-4 border shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3 bg-gradient-to-r from-card to-card/50">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary animate-pulse" />
          <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Trending
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-1">
          {trending.map((item, index) => (
            <div
              key={item.word}
              onClick={() => handleWordClick(item.word)}
              className="group p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {index + 1}
                    </span>
                    {item.word.startsWith('#') ? (
                      <Hash className="w-4 h-4 text-primary flex-shrink-0" />
                    ) : null}
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {item.word}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.count.toLocaleString()} {item.count === 1 ? 'tweet' : 'tweets'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
