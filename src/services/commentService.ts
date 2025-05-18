
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
  try {
    // First try to query with profile join
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profile:profiles(username, avatar_url)
      `)
      .eq('news_id', newsId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching comments with profiles:", error);
      
      // Fallback to just fetching comments without profile data
      const { data: commentsOnly, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('news_id', newsId)
        .order('created_at', { ascending: false });
      
      if (commentsError) {
        throw commentsError;
      }
      
      // Transform to match CommentType - ensure null profile
      return (commentsOnly || []).map(comment => ({
        ...comment,
        profile: null
      })) as CommentType[];
    }
    
    // Handle potential errors in the profile relation by ensuring proper structure
    return (data || []).map(item => {
      // Check if profile is an error object (failed relation)
      // Use type guard to check if profile exists and has an 'error' property
      if (item.profile && typeof item.profile === 'object' && 'error' in item.profile) {
        return {
          ...item,
          profile: null // Replace error object with null
        } as unknown as CommentType;
      }
      return item as unknown as CommentType;
    });
  } catch (error) {
    console.error("Error in fetchComments:", error);
    throw error;
  }
}

export async function addComment(comment: NewCommentType): Promise<CommentType | null> {
  try {
    // First try to insert and return with profile data
    const { data, error } = await supabase
      .from('comments')
      .insert([comment])
      .select(`
        *,
        profile:profiles(username, avatar_url)
      `)
      .single();
    
    if (error) {
      console.error("Error adding comment with profile:", error);
      
      // Fallback to just inserting without returning profile data
      const { data: commentOnly, error: insertError } = await supabase
        .from('comments')
        .insert([comment])
        .select('*')
        .single();
      
      if (insertError) {
        throw insertError;
      }
      
      return {
        ...commentOnly,
        profile: null
      } as CommentType;
    }
    
    // Handle potential errors in the profile relation
    // Use type guard to check if profile exists and has an 'error' property
    if (data && data.profile && typeof data.profile === 'object' && 'error' in data.profile) {
      return {
        ...data,
        profile: null
      } as unknown as CommentType;
    }
    
    return data as unknown as CommentType;
  } catch (error) {
    console.error("Error in addComment:", error);
    throw error;
  }
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
