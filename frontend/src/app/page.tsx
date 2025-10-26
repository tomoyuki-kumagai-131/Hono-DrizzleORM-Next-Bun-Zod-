'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getTimeline } from '@/lib/api';
import { Tweet } from '@/types';
import TweetComposer from '@/components/TweetComposer';
import TweetCard from '@/components/TweetCard';
import Navbar from '@/components/Navbar';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loadingTweets, setLoadingTweets] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchTimeline = async () => {
      if (user) {
        try {
          const timeline = await getTimeline();
          setTweets(timeline);
        } catch (error) {
          console.error('Failed to fetch timeline:', error);
        } finally {
          setLoadingTweets(false);
        }
      }
    };

    fetchTimeline();
  }, [user]);

  const handleTweetCreated = (newTweet: Tweet) => {
    setTweets([newTweet, ...tweets]);
  };

  const handleTweetDeleted = (tweetId: number) => {
    setTweets(tweets.filter(t => t.id !== tweetId));
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="max-w-2xl mx-auto">
        <TweetComposer onTweetCreated={handleTweetCreated} />

        <div className="mt-0">
          {loadingTweets ? (
            <div className="bg-white p-8 text-center text-gray-600">
              Loading tweets...
            </div>
          ) : tweets.length === 0 ? (
            <div className="bg-white p-8 text-center text-gray-600">
              No tweets yet. Follow some users or create your first tweet!
            </div>
          ) : (
            tweets.map((tweet) => (
              <TweetCard key={tweet.id} tweet={tweet} onDelete={handleTweetDeleted} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
