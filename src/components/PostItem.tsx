import Image from 'next/image';
import { Post } from '@/types';

type PostItemProps = {
  post: Post;
  isTemporary?: boolean;
};

export default function PostItem({ post, isTemporary = false }: PostItemProps) {
  return (
    <div className={`border p-4 rounded-lg ${isTemporary ? 'opacity-70' : ''}`}>
      {isTemporary && (
        <div className="text-xs text-gray-500 mb-1">Posting...</div>
      )}
      <div className="flex items-center gap-2">
        <span className="font-bold">{post.author}</span>
        <span className="text-gray-500 text-sm">
          {new Date(post.created_at).toLocaleString()}
        </span>
      </div>
      <p className="mt-2">{post.content}</p>
      
      {/* Replace your img tag with this optimized Image component */}
      {post.photo_url && (
        <div className="mt-2 relative w-full max-w-2xl rounded-md overflow-hidden aspect-[4/3]">
      <Image
        src={post.photo_url}
        alt="Post content"
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 50vw"
        quality={85}
        priority // Faster loading for important content
        unoptimized={!post.photo_url.startsWith('/')} // Keep optimization for local only
      />
      </div>

      )}
      
      {post.error && (
        <div className="text-red-500 text-sm mt-2">
          Failed to post: {post.error}
        </div>
      )}
    </div>
  );
}