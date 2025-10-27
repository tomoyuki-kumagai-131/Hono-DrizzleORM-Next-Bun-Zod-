'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Search, Bookmark, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import NotificationsDropdown from '@/components/NotificationsDropdown';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="bg-background/80 backdrop-blur-md border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent hover:from-primary/90 hover:to-primary/60 transition-all">
              Twitter
            </Link>
            <ThemeToggle />
          </div>

          {user && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild className="rounded-full">
                <Link href="/search" className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">Search</span>
                </Link>
              </Button>

              <NotificationsDropdown />

              <Button variant="ghost" size="sm" asChild className="rounded-full">
                <Link href="/bookmarks" className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4" />
                  <span className="hidden sm:inline">Bookmarks</span>
                </Link>
              </Button>

              <Button variant="ghost" size="sm" asChild className="rounded-full">
                <Link href={`/${user.username}`}>
                  @{user.username}
                </Link>
              </Button>

              <Button variant="outline" size="sm" onClick={handleLogout} className="rounded-full">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Logout</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
