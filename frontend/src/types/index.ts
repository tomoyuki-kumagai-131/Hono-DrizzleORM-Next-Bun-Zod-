export interface User {
  id: number;
  username: string;
  email: string;
  displayName: string;
  bio?: string | null;
  avatar?: string | null;
  createdAt?: Date;
  followerCount?: number;
  followingCount?: number;
  tweetCount?: number;
  isFollowing?: boolean;
}

export interface Tweet {
  id: number;
  content: string;
  userId: number;
  createdAt: Date;
  user: User;
  likes: Like[];
  likeCount: number;
  isLiked: boolean;
}

export interface Like {
  id: number;
  userId: number;
  tweetId: number;
  createdAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}
