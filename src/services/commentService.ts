
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Define comment types
export type CommentType = {
  id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  user_id: string;
  news_id: string;
  parent_id?: string | null;
  profile: {
    username?: string;
    avatar_url?: string;
  } | null;
};

// Standalone functions for direct import
export async function fetchComments(newsId: string, commentsOnly: boolean = false): Promise<CommentType[]> {
  try {
    let query = supabase
      .from('comments')
      .select('*, profile:profiles(username, avatar_url)')
      .eq('news_id', newsId)
      .order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    console.log('Fetched comments:', data); // Debug log to see what's coming back
    
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
        } as unknown as CommentType;
      }
      return item as unknown as CommentType;
    });
  } catch (error) {
    console.error('Error in fetchComments:', error);
    return [];
  }
}

export async function addComment(commentData: { 
  content: string; 
  news_id: string; 
  user_id: string;
  parent_id?: string | null;
}): Promise<CommentType | null> {
  try {
    console.log('Adding comment with data:', commentData); // Debug data being sent
    
    // Insert the comment
    const { data, error } = await supabase
      .from('comments')
      .insert([commentData])
      .select('*')
      .single();
    
    if (error) {
      console.error('Error adding comment:', error);
      return null;
    }
    
    console.log('Comment added successfully:', data); // Log the successful insertion
    
    if (!data) {
      return null;
    }
    
    // Fetch the profile information to match the expected return type
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', commentData.user_id)
      .maybeSingle();
      
    if (profileError) {
      console.error('Error fetching profile data:', profileError);
    }
    
    // Combine the comment with profile data
    const commentWithProfile = {
      ...data,
      profile: profileData || null
    } as unknown as CommentType;
    
    return commentWithProfile;
  } catch (error) {
    console.error('Error in addComment:', error);
    return null;
  }
}

export async function deleteComment(commentId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);
    
    if (error) {
      console.error('Error deleting comment:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteComment:', error);
    return false;
  }
}

export async function updateComment(commentId: string, content: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('comments')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', commentId);
    
    if (error) {
      console.error('Error updating comment:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateComment:', error);
    return false;
  }
}

// Hook that provides toast notifications along with the comment functions
export function useComments() {
  const { toast } = useToast();
  
  const fetchCommentsWithToast = async (newsId: string, commentsOnly: boolean = false): Promise<CommentType[]> => {
    try {
      return await fetchComments(newsId, commentsOnly);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load comments. Please try again later.',
        variant: 'destructive',
      });
      return [];
    }
  };
  
  const addCommentWithToast = async (commentData: {
    content: string;
    news_id: string;
    user_id: string;
    parent_id?: string | null;
  }): Promise<CommentType | null> => {
    try {
      const result = await addComment(commentData);
      if (result) {
        toast({
          title: 'Success',
          description: 'Your comment was posted successfully.',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to add comment. Please try again later.',
          variant: 'destructive',
        });
      }
      return result;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while adding your comment.',
        variant: 'destructive',
      });
      return null;
    }
  };
  
  const deleteCommentWithToast = async (commentId: string): Promise<boolean> => {
    try {
      const result = await deleteComment(commentId);
      if (result) {
        toast({
          title: 'Success',
          description: 'Comment deleted successfully.',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete comment. Please try again later.',
          variant: 'destructive',
        });
      }
      return result;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while deleting the comment.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateCommentWithToast = async (commentId: string, content: string): Promise<boolean> => {
    try {
      const result = await updateComment(commentId, content);
      if (result) {
        toast({
          title: 'Success',
          description: 'Comment updated successfully.',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update comment. Please try again later.',
          variant: 'destructive',
        });
      }
      return result;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while updating the comment.',
        variant: 'destructive',
      });
      return false;
    }
  };
  
  return {
    fetchComments: fetchCommentsWithToast,
    addComment: addCommentWithToast,
    deleteComment: deleteCommentWithToast,
    updateComment: updateCommentWithToast,
  };
}
