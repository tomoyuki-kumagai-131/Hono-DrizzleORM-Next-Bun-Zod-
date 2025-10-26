import axios from 'axios';
import { AuthResponse, User, Tweet } from '@/types';

const API_URL = 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const signup = async (data: {
  username: string;
  email: string;
  password: string;
  displayName: string;
}): Promise<AuthResponse> => {
  const response = await api.post('/auth/signup', data);
  return response.data;
};

export const login = async (data: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

// Users
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/users/me');
  return response.data;
};

export const getUserByUsername = async (username: string): Promise<User> => {
  const response = await api.get(`/users/${username}`);
  return response.data;
};

export const getUserTweets = async (username: string): Promise<Tweet[]> => {
  const response = await api.get(`/users/${username}/tweets`);
  return response.data;
};

export const followUser = async (username: string): Promise<void> => {
  await api.post(`/users/${username}/follow`);
};

export const unfollowUser = async (username: string): Promise<void> => {
  await api.delete(`/users/${username}/follow`);
};

// Tweets
export const getTimeline = async (): Promise<Tweet[]> => {
  const response = await api.get('/tweets/timeline');
  return response.data;
};

export const createTweet = async (content: string): Promise<Tweet> => {
  const response = await api.post('/tweets', { content });
  return response.data;
};

export const deleteTweet = async (id: number): Promise<void> => {
  await api.delete(`/tweets/${id}`);
};

export const likeTweet = async (id: number): Promise<void> => {
  await api.post(`/tweets/${id}/like`);
};

export const unlikeTweet = async (id: number): Promise<void> => {
  await api.delete(`/tweets/${id}/like`);
};
