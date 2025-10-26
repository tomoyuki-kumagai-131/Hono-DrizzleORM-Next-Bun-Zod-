'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Tweet } from '@/types';
import { likeTweet, unlikeTweet, deleteTweet, bookmarkTweet, unbookmarkTweet } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, Bookmark, Trash2 } from 'lucide-react';

interface TweetCardProps {
  tweet: Tweet;
  onDelete?: (tweetId: number) => void;
}

export default function TweetCard({ tweet, onDelete }: TweetCardProps) {
  const [isLiked, setIsLiked] = useState(tweet.isLiked);
  const [likeCount, setLikeCount] = useState(tweet.likeCount);
  const [isBookmarked, setIsBookmarked] = useState(tweet.isBookmarked || false);
  const { user } = useAuth();

  const handleLike = async () => {
    try {
      if (isLiked) {
        await unlikeTweet(tweet.id);
        setIsLiked(false);
        setLikeCount(likeCount - 1);
      } else {
        await likeTweet(tweet.id);
        setIsLiked(true);
        setLikeCount(likeCount + 1);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleBookmark = async () => {
    try {
      if (isBookmarked) {
        await unbookmarkTweet(tweet.id);
        setIsBookmarked(false);
      } else {
        await bookmarkTweet(tweet.id);
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this tweet?')) {
      try {
        await deleteTweet(tweet.id);
        onDelete?.(tweet.id);
      } catch (error) {
        console.error('Failed to delete tweet:', error);
      }
    }
  };

  return (
    <Card className="border-0 border-b rounded-none hover:bg-accent/50 transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Link href={`/${tweet.user.username}`}>
            <Avatar className="h-12 w-12 ring-2 ring-border hover:ring-primary/30 transition-all">
              <AvatarImage src={tweet.user.avatar || undefined} alt={tweet.user.displayName} />
              <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-semibold">
                {tweet.user.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/${tweet.user.username}`}
                    className="font-bold text-foreground hover:underline decoration-2 underline-offset-2"
                  >
                    {tweet.user.displayName}
                  </Link>
                  <span className="text-muted-foreground text-sm">
                    @{tweet.user.username}
                  </span>
                  <span className="text-muted-foreground text-sm">·</span>
                  <span className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(tweet.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
              {user?.id === tweet.userId && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <p className="mt-3 text-foreground whitespace-pre-wrap break-words leading-relaxed">
              {tweet.content}
            </p>

            <div className="mt-4 flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`flex items-center gap-2 rounded-full transition-all ${
                  isLiked
                    ? 'text-red-500 hover:text-red-600 hover:bg-red-500/10 dark:hover:bg-red-500/20'
                    : 'text-muted-foreground hover:text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/20'
                }`}
              >
                <Heart className={`h-5 w-5 transition-transform hover:scale-110 ${isLiked ? 'fill-current' : ''}`} />
                {likeCount > 0 && <span className="text-sm font-medium">{likeCount}</span>}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className={`flex items-center gap-2 rounded-full transition-all ${
                  isBookmarked
                    ? 'text-primary hover:text-primary/80 hover:bg-primary/10'
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                }`}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
              >
                <Bookmark className={`h-5 w-5 transition-transform hover:scale-110 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
