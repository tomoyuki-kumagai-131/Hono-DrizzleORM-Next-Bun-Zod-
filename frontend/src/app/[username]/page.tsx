'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserByUsername, getUserTweets, followUser, unfollowUser } from '@/lib/api';
import { User, Tweet } from '@/types';
import TweetCard from '@/components/TweetCard';
import Navbar from '@/components/Navbar';

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser) {
        try {
          const [userData, userTweets] = await Promise.all([
            getUserByUsername(username),
            getUserTweets(username),
          ]);
          setUser(userData);
          setTweets(userTweets);
          setIsFollowing(userData.isFollowing || false);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [username, currentUser]);

  const handleFollow = async () => {
    if (!user) return;

    try {
      if (isFollowing) {
        await unfollowUser(user.username);
        setIsFollowing(false);
        setUser({
          ...user,
          followerCount: (user.followerCount || 0) - 1,
        });
      } else {
        await followUser(user.username);
        setIsFollowing(true);
        setUser({
          ...user,
          followerCount: (user.followerCount || 0) + 1,
        });
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    }
  };

  const handleTweetDeleted = (tweetId: number) => {
    setTweets(tweets.filter(t => t.id !== tweetId));
  };

  if (authLoading || loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <Navbar />
        <div className="max-w-2xl mx-auto mt-8 bg-card p-8 text-center border rounded-lg">
          <h1 className="text-2xl font-bold text-foreground">User not found</h1>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser.id === user.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <Navbar />

      <main className="max-w-2xl mx-auto">
        <div className="bg-card/80 backdrop-blur-sm border-b shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-3xl font-bold">
                {user.displayName.charAt(0).toUpperCase()}
              </div>

              <div>
                <h1 className="text-2xl font-bold text-foreground">{user.displayName}</h1>
                <p className="text-muted-foreground">@{user.username}</p>

                {user.bio && (
                  <p className="mt-3 text-foreground">{user.bio}</p>
                )}

                <div className="flex gap-6 mt-3 text-sm">
                  <div>
                    <span className="font-bold text-foreground">{user.followingCount || 0}</span>
                    <span className="text-muted-foreground ml-1">Following</span>
                  </div>
                  <div>
                    <span className="font-bold text-foreground">{user.followerCount || 0}</span>
                    <span className="text-muted-foreground ml-1">Followers</span>
                  </div>
                  <div>
                    <span className="font-bold text-foreground">{user.tweetCount || 0}</span>
                    <span className="text-muted-foreground ml-1">Tweets</span>
                  </div>
                </div>
              </div>
            </div>

            {!isOwnProfile && (
              <button
                onClick={handleFollow}
                className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                  isFollowing
                    ? 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                }`}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        <div className="mt-0">
          {tweets.length === 0 ? (
            <div className="bg-card/80 backdrop-blur-sm p-8 text-center text-muted-foreground border-b">
              No tweets yet
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
