
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Define comment types
export type CommentType = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  news_id: string;
  profile: {
    username?: string;
    avatar_url?: string;
  } | null;
};

export function useComments() {
  const { toast } = useToast();
  
  /**
   * Fetch comments for a specific news article
   */
  async function fetchComments(newsId: string, commentsOnly: boolean = false): Promise<CommentType[]> {
    try {
      let query = supabase
        .from('comments')
        .select('*, profile:profiles(username, avatar_url)')
        .eq('news_id', newsId)
        .order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching comments:', error);
        toast({
          title: 'Error',
          description: 'Failed to load comments. Please try again later.',
          variant: 'destructive',
        });
        return [];
      }
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // If commentsOnly is true, return just the comments without profile info
      if (commentsOnly) {
        return (data || []).map(comment => ({
          ...comment,
          profile: null
        })) as CommentType[];
      }
      
      // Handle potential errors in the profile relation by ensuring proper structure
      return (data || []).map(item => {
        // Safely check if profile has an error by first verifying profile exists
        const profile = item.profile || {};
        const hasError = typeof profile === 'object' && 'error' in profile;
        
        if (hasError) {
          return {
            ...item,
            profile: null
          } as CommentType;
        }
        return item as CommentType;
      });
    } catch (error) {
      console.error('Error in fetchComments:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while loading comments.',
        variant: 'destructive',
      });
      return [];
    }
  }
  
  /**
   * Add a new comment
   */
  async function addComment(newsId: string, content: string, userId: string): Promise<CommentType | null> {
    try {
      // Insert the comment
      const { data: commentData, error: commentError } = await supabase
        .from('comments')
        .insert([
          { news_id: newsId, content, user_id: userId }
        ])
        .select('*, profile:profiles(username, avatar_url)')
        .single();
      
      if (commentError) {
        console.error('Error adding comment:', commentError);
        toast({
          title: 'Error',
          description: 'Failed to add comment. Please try again later.',
          variant: 'destructive',
        });
        return null;
      }
      
      if (!commentData) {
        return null;
      }
      
      // Handle potential errors in the profile relation
      const data = commentData;
      const profile = data.profile || {};
      const hasError = typeof profile === 'object' && 'error' in profile;
      
      if (hasError) {
        return {
          ...data,
          profile: null
        } as CommentType;
      }
      
      return data as CommentType;
    } catch (error) {
      console.error('Error in addComment:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while adding your comment.',
        variant: 'destructive',
      });
      return null;
    }
  }
  
  /**
   * Delete a comment
   */
  async function deleteComment(commentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
      
      if (error) {
        console.error('Error deleting comment:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete comment. Please try again later.',
          variant: 'destructive',
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in deleteComment:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while deleting the comment.',
        variant: 'destructive',
      });
      return false;
    }
  }
  
  return {
    fetchComments,
    addComment,
    deleteComment,
  };
}
