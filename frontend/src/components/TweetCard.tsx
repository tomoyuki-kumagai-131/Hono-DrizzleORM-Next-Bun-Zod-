'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Tweet } from '@/types';
import { likeTweet, unlikeTweet, deleteTweet } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface TweetCardProps {
  tweet: Tweet;
  onDelete?: (tweetId: number) => void;
}

export default function TweetCard({ tweet, onDelete }: TweetCardProps) {
  const [isLiked, setIsLiked] = useState(tweet.isLiked);
  const [likeCount, setLikeCount] = useState(tweet.likeCount);
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
    <div className="bg-white border-b border-gray-200 p-4 hover:bg-gray-50 transition">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            {tweet.user.displayName.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <Link
                href={`/${tweet.user.username}`}
                className="font-bold text-gray-900 hover:underline"
              >
                {tweet.user.displayName}
              </Link>
              <span className="ml-2 text-gray-500">
                @{tweet.user.username} · {formatDistanceToNow(new Date(tweet.createdAt), { addSuffix: true })}
              </span>
            </div>
            {user?.id === tweet.userId && (
              <button
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Delete
              </button>
            )}
          </div>

          <p className="mt-2 text-gray-900 whitespace-pre-wrap break-words">{tweet.content}</p>

          <div className="mt-3 flex gap-6">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 group ${
                isLiked ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              <svg
                className={`w-5 h-5 ${isLiked ? 'fill-current' : 'group-hover:fill-current'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span className="text-sm">{likeCount}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
