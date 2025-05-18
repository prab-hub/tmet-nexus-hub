
import { supabase } from "@/integrations/supabase/client";

export type CommentType = {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  news_id: string;
  user_id: string;
  parent_id: string | null;
  profile?: {
    username: string | null;
    avatar_url: string | null;
  } | null;
};

export type NewCommentType = {
  content: string;
  news_id: string;
  user_id: string;
  parent_id: string | null;
};

export async function fetchComments(newsId: string): Promise<CommentType[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      profile:profiles(username, avatar_url)
    `)
    .eq('news_id', newsId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
  
  return (data || []) as CommentType[];
}

export async function addComment(comment: NewCommentType): Promise<CommentType | null> {
  const { data, error } = await supabase
    .from('comments')
    .insert([comment])
    .select(`
      *,
      profile:profiles(username, avatar_url)
    `)
    .single();
  
  if (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
  
  return data as CommentType;
}

export async function updateComment(commentId: string, content: string): Promise<void> {
  const { error } = await supabase
    .from('comments')
    .update({ 
      content,
      updated_at: new Date().toISOString()
    })
    .eq('id', commentId);
  
  if (error) {
    console.error("Error updating comment:", error);
    throw error;
  }
}

export async function deleteComment(commentId: string): Promise<void> {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);
  
  if (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
}
