'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { searchUsers, searchTweets } from '@/lib/api';
import { User, Tweet } from '@/types';
import Navbar from '@/components/Navbar';
import TweetCard from '@/components/TweetCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [userResults, setUserResults] = useState<User[]>([]);
  const [tweetResults, setTweetResults] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('type') || 'users');
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      if (activeTab === 'users') {
        const users = await searchUsers(query);
        setUserResults(users);
      } else {
        const tweets = await searchTweets(query);
        setTweetResults(tweets);
      }
    } catch (error) {
      console.error('Search failed:', error);
      if (activeTab === 'users') {
        setUserResults([]);
      } else {
        setTweetResults([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearched(false);
    setUserResults([]);
    setTweetResults([]);
  };

  const handleTweetDeleted = (tweetId: number) => {
    setTweetResults(tweetResults.filter(tweet => tweet.id !== tweetId));
  };

  // Auto-search when URL params are present
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    const urlType = searchParams.get('type');

    if (urlQuery) {
      setQuery(urlQuery);
      if (urlType === 'tweets' || urlType === 'users') {
        setActiveTab(urlType);
      }

      // Trigger search automatically
      const performSearch = async () => {
        setLoading(true);
        setSearched(true);

        try {
          if (urlType === 'tweets') {
            const tweets = await searchTweets(urlQuery);
            setTweetResults(tweets);
          } else {
            const users = await searchUsers(urlQuery);
            setUserResults(users);
          }
        } catch (error) {
          console.error('Search failed:', error);
        } finally {
          setLoading(false);
        }
      };

      performSearch();
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <Navbar />
      <div className="max-w-2xl mx-auto pt-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-primary">Search</h1>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="tweets">Tweets</TabsTrigger>
          </TabsList>
        </Tabs>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={activeTab === 'users' ? 'Search by username or display name...' : 'Search tweets...'}
              className="flex-1 px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {searched && !loading && (
          <div>
            {activeTab === 'users' ? (
              <div className="bg-card rounded-lg shadow border">
                {userResults.length === 0 ? (
                  <p className="p-8 text-center text-muted-foreground">No users found</p>
                ) : (
                  <div className="divide-y divide-border">
                    {userResults.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => router.push(`/${user.username}`)}
                        className="p-4 hover:bg-accent/50 cursor-pointer transition"
                      >
                        <div className="flex items-start gap-3">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.displayName}
                              className="w-12 h-12 rounded-full"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                              {user.displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="font-semibold text-foreground">{user.displayName}</div>
                            <div className="text-sm text-muted-foreground">@{user.username}</div>
                            {user.bio && (
                              <p className="mt-1 text-sm text-foreground/80">{user.bio}</p>
                            )}
                            <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                              <span><strong className="text-foreground">{user.tweetCount || 0}</strong> tweets</span>
                              <span><strong className="text-foreground">{user.followerCount || 0}</strong> followers</span>
                              <span><strong className="text-foreground">{user.followingCount || 0}</strong> following</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {tweetResults.length === 0 ? (
                  <div className="bg-card/80 backdrop-blur-sm p-8 text-center border-b">
                    <p className="text-muted-foreground">No tweets found</p>
                  </div>
                ) : (
                  tweetResults.map((tweet) => (
                    <TweetCard
                      key={tweet.id}
                      tweet={tweet}
                      onDelete={handleTweetDeleted}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
