// app/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import UserProfile from '../components/UserProfile';
import PostForm from '../components/PostForm';
import PostList from '../components/PostList';
import { supabase } from '@/lib/supabase';
import { Post } from '@/types';

export default function WallPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setError('Failed to load posts. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel('realtime posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        () => fetchPosts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleNewPost = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handleReplacePost = (tempId: string, realPost: Post) => {
    setPosts(prev =>
      prev.map(post => post.id === tempId ? realPost : post)
    );
  };

  const handleRemoveTempPost = (tempId: string) => {
    setPosts(prev => prev.filter(post => post.id !== tempId));
  };

  return (
    <>
      <Header />
      <div className=' mx-auto px-4 sm:px-6 lg:px-8'>
        <div className=" flex flex-col md:flex-row gap-6 p-4">
          <div className=" md:w-1/4 min-w-[200px] sticky top-20 self-start h-fit">
            <UserProfile />
          </div>
          <div className=" md:w-3/4">
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <h2 className="text-xl font-semibold mb-4">Wall</h2>

              <PostForm
                onNewPost={handleNewPost}
                onReplacePost={handleReplacePost}
                onRemoveTempPost={handleRemoveTempPost} />
            </div>

            <PostList
              posts={posts}
              isLoading={isLoading}
              error={error}
              onRetry={fetchPosts} />
          </div>
        </div>
      </div>
    </>
  );
}
