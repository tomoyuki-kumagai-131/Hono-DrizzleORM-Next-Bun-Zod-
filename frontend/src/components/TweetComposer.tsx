'use client';

import { useState } from 'react';
import { createTweet } from '@/lib/api';
import { Tweet } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send } from 'lucide-react';

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

  const remaining = 280 - content.length;
  const isOverLimit = remaining < 0;

  return (
    <div className="bg-gradient-to-b from-card to-card/50 border-b p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening?"
          maxLength={300}
          rows={3}
          className="resize-none text-base focus-visible:ring-primary bg-background"
        />
        <div className="flex justify-between items-center">
          <Badge
            variant={isOverLimit ? "destructive" : remaining < 20 ? "secondary" : "outline"}
            className="font-mono"
          >
            {remaining}
          </Badge>
          <Button
            type="submit"
            disabled={loading || !content.trim() || isOverLimit}
            size="default"
            className="rounded-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Tweet
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
