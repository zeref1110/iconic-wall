// components/PostList.tsx
"use client";

import { Post } from '@/types';
import PostItem from './PostItem';

type PostListProps = {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
};

export default function PostList({ posts, isLoading, error, onRetry }: PostListProps) {
  if (isLoading && posts.length === 0) {
    return <div className="text-center py-8 text-gray-500">Loading posts...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-2">{error}</p>
        <button
          onClick={onRetry}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return <div className="text-center py-8 text-gray-500">No posts yet. Be the first to share!</div>;
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostItem 
          key={post.id} 
          post={post} 
          isTemporary={post.id.startsWith('temp-')}
        />
      ))}
    </div>
  );
}