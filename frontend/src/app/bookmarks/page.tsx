'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tweet } from '@/types';
import { getBookmarks } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import TweetCard from '@/components/TweetCard';
import Navbar from '@/components/Navbar';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    loadBookmarks();
  }, [user, router]);

  const loadBookmarks = async () => {
    try {
      const data = await getBookmarks();
      setBookmarks(data);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (tweetId: number) => {
    setBookmarks(bookmarks.filter(tweet => tweet.id !== tweetId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <Navbar />
      <div className="max-w-2xl mx-auto">
        <div className="bg-card/80 backdrop-blur-sm border-b shadow-sm p-4">
          <h1 className="text-2xl font-bold text-foreground">Bookmarks</h1>
        </div>

        {bookmarks.length === 0 ? (
          <div className="bg-card/80 backdrop-blur-sm p-8 text-center border-b">
            <p className="text-muted-foreground mb-4">You haven't bookmarked any tweets yet</p>
            <button
              onClick={() => router.push('/')}
              className="text-primary hover:underline"
            >
              Browse tweets
            </button>
          </div>
        ) : (
          <div>
            {bookmarks.map((tweet) => (
              <TweetCard
                key={tweet.id}
                tweet={tweet}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
