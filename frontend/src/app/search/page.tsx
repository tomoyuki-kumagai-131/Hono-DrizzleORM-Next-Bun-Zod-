'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { searchUsers } from '@/lib/api';
import { User } from '@/types';
import Navbar from '@/components/Navbar';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const users = await searchUsers(query);
      setResults(users);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <Navbar />
      <div className="max-w-2xl mx-auto pt-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-primary">Search Users</h1>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by username or display name..."
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
          <div className="bg-card rounded-lg shadow border">
            {results.length === 0 ? (
              <p className="p-8 text-center text-muted-foreground">No users found</p>
            ) : (
              <div className="divide-y divide-border">
                {results.map((user) => (
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
        )}
      </div>
    </div>
  );
}
