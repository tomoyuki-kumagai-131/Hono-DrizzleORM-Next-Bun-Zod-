'use client';

import { useState } from 'react';
import { createTweet } from '@/lib/api';
import { Tweet } from '@/types';

interface TweetComposerProps {
  onTweetCreated: (tweet: Tweet) => void;
}

export default function TweetComposer({ onTweetCreated }: TweetComposerProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const newTweet = await createTweet(content);
      onTweetCreated(newTweet);
      setContent('');
    } catch (error) {
      console.error('Failed to create tweet:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening?"
          maxLength={280}
          rows={3}
          className="w-full p-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-black"
        />
        <div className="flex justify-between items-center mt-3">
          <span className="text-sm text-gray-500">{content.length}/280</span>
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="bg-blue-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Posting...' : 'Tweet'}
          </button>
        </div>
      </form>
    </div>
  );
}
