// components/PostForm.tsx
"use client";

import { useState } from 'react';
import { PaperPlaneIcon } from '@radix-ui/react-icons';
import { supabase } from '@/lib/supabase';
import { Post } from '@/types';
import { v4 as uuidv4 } from 'uuid';

type PostFormProps = {
  onNewPost: (post: Post) => void;
  onReplacePost: (tempId: string, realPost: Post) => void;
  onRemoveTempPost: (tempId: string) => void;
};

export default function PostForm({ onNewPost, onReplacePost, onRemoveTempPost }: PostFormProps) {
  const [content, setContent] = useState('');
  const [remainingChars, setRemainingChars] = useState(280);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setRemainingChars(280 - newContent.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsUploading(true);
    setError(null);

    const tempId = `temp-${uuidv4()}`;
    const tempPost: Post = {
      id: tempId,
      author: 'Jazzer Giancarlo M. Ancheta',
      content,
      created_at: new Date().toISOString(),
      photo_url: null,
    };

    onNewPost(tempPost);

    try {
      let photo_url = null;
      if (selectedFile) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(selectedFile.type)) {
          throw new Error('Only JPG, PNG, and GIF files are allowed');
        }
        if (selectedFile.size > 5 * 1024 * 1024) {
          throw new Error('File size must be less than 5MB');
        }

        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('wall-photos')
          .upload(fileName, selectedFile);

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message || JSON.stringify(uploadError)}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('wall-photos')
          .getPublicUrl(uploadData.path);

        photo_url = publicUrl;
      }

      const { data: realPost, error: insertError } = await supabase
        .from('posts')
        .insert({
          author: 'Jazzer Giancarlo M. Ancheta',
          content,
          photo_url,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      onReplacePost(tempId, realPost);

      setContent('');
      setRemainingChars(280);
      setSelectedFile(null);
    } catch (err: unknown) {
    let errorMessage = 'Post failed: unknown error';

    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === 'object' && err !== null) {
      errorMessage = JSON.stringify(err);
    }

    setError(errorMessage);
    console.error('Post failed:', err);
    onRemoveTempPost(tempId);

    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What's on your mind?"
            rows={3}
            maxLength={280}
            value={content}
            onChange={handleContentChange}
            disabled={isUploading}
          />
          <div className="text-right text-sm text-gray-500">
            {remainingChars} characters remaining
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="cursor-pointer text-blue-600 hover:text-blue-800">
              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/gif"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                disabled={isUploading}
              />
              Click to add photo (optional)
            </label>
            <div className="text-xs text-gray-500 mt-1">
              JPG, PNG, GIF up to 5MB
            </div>
            {selectedFile && (
              <div className="text-xs text-green-600 mt-1">
                Selected: {selectedFile.name}
                <button
                  type="button"
                  className="ml-2 text-red-500"
                  onClick={() => setSelectedFile(null)}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
            disabled={!content.trim() || isUploading}
          >
            <PaperPlaneIcon className="mr-2" />
            {isUploading ? 'Posting...' : 'Share'}
          </button>
        </div>
      </form>
    </>
  );
}
