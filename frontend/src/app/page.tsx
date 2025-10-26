'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getTimeline } from '@/lib/api';
import { Tweet } from '@/types';
import TweetComposer from '@/components/TweetComposer';
import TweetCard from '@/components/TweetCard';
import Navbar from '@/components/Navbar';
import NewsSidebar from '@/components/NewsSidebar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loadingTweets, setLoadingTweets] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'following'>('all');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchTimeline = async () => {
      if (user) {
        setLoadingTweets(true);
        try {
          const timeline = await getTimeline(activeTab);
          setTweets(timeline);
        } catch (error) {
          console.error('Failed to fetch timeline:', error);
        } finally {
          setLoadingTweets(false);
        }
      }
    };

    fetchTimeline();
  }, [user, activeTab]);

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
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 flex gap-6">
        {/* Left Sidebar - News */}
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <NewsSidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-2xl">
          <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'following')} className="w-full">
            <div className="bg-card/80 backdrop-blur-sm border-b shadow-sm">
              <TabsList className="w-full h-14 bg-transparent rounded-none border-0 p-0 gap-0">
                <TabsTrigger
                  value="all"
                  className="flex-1 rounded-none h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none relative data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-1 data-[state=active]:after:bg-primary data-[state=active]:after:rounded-t-full data-[state=active]:text-primary font-semibold transition-all"
                >
                  For You
                </TabsTrigger>
                <TabsTrigger
                  value="following"
                  className="flex-1 rounded-none h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none relative data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-1 data-[state=active]:after:bg-primary data-[state=active]:after:rounded-t-full data-[state=active]:text-primary font-semibold transition-all"
                >
                  Following
                </TabsTrigger>
              </TabsList>
            </div>

            <TweetComposer onTweetCreated={handleTweetCreated} />

            <TabsContent value={activeTab} className="mt-0">
              {loadingTweets ? (
                <div className="bg-card/80 backdrop-blur-sm p-12 text-center border-b">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="mt-4 text-muted-foreground">Loading tweets...</p>
                </div>
              ) : tweets.length === 0 ? (
                <div className="bg-card/80 backdrop-blur-sm p-12 text-center border-b">
                  <p className="text-muted-foreground text-lg">No tweets yet. Follow some users or create your first tweet!</p>
                </div>
              ) : (
                tweets.map((tweet) => (
                  <TweetCard key={tweet.id} tweet={tweet} onDelete={handleTweetDeleted} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </main>

        {/* Right Sidebar - Empty for now */}
        <aside className="hidden xl:block w-80 flex-shrink-0">
          {/* Future: Trending topics, Who to follow, etc. */}
        </aside>
      </div>
    </div>
  );
}
