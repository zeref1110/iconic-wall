// types/index.ts
export type Post = {
  id: string;
  author: string;
  content: string;
  created_at: string;
  photo_url?: string | null;
   error?: boolean;
};