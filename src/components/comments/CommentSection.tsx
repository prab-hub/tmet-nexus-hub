
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Send, CornerDownRight, Trash, Edit, X } from "lucide-react";
import { useAuth } from "../../services/authService";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import { 
  addComment,
  fetchComments, 
  deleteComment,
  updateComment,
  type CommentType 
} from "../../services/commentService";
import { supabase } from "@/integrations/supabase/client";

interface CommentSectionProps {
  newsId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ newsId }) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [userProfiles, setUserProfiles] = useState<Record<string, any>>({});

  useEffect(() => {
    loadComments();
    if (user) {
      fetchUserProfile(user.id);
    }
  }, [newsId, user]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }
      
      if (data) {
        setUserProfiles(prev => ({
          ...prev,
          [userId]: data
        }));
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    }
  };

  const loadComments = async () => {
    try {
      setLoading(true);
      const fetchedComments = await fetchComments(newsId);
      setComments(fetchedComments);
      
      // Fetch profiles for all unique user IDs in comments
      const userIds = Array.from(new Set(fetchedComments.map(comment => comment.user_id)));
      await Promise.all(userIds.map(userId => fetchUserProfile(userId)));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to comment",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const comment = await addComment({
        content: newComment,
        news_id: newsId,
        parent_id: replyTo,
        user_id: user.id,
      });
      
      // Optimistic UI update
      if (comment) {
        // If we have profile data in our local state, use it
        const updatedComment = {
          ...comment,
          profile: userProfiles[user.id] || comment.profile
        };
        setComments(prevComments => [updatedComment, ...prevComments]);
      }
      
      setNewComment("");
      setReplyTo(null);
      
      toast({
        title: "Comment added",
        description: "Your comment has been posted",
      });
      
      loadComments(); // Reload comments to get proper thread structure
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
      console.error("Error posting comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;
    
    try {
      setLoading(true);
      await updateComment(commentId, editContent);
      
      // Update comment in UI
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === commentId 
            ? { ...comment, content: editContent, updated_at: new Date().toISOString() } 
            : comment
        )
      );
      
      setEditingComment(null);
      setEditContent("");
      
      toast({
        title: "Comment updated",
        description: "Your comment has been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update comment",
        variant: "destructive",
      });
      console.error("Error updating comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      setLoading(true);
      await deleteComment(commentId);
      
      // Remove comment from UI
      setComments(prevComments => 
        prevComments.filter(comment => comment.id !== commentId)
      );
      
      toast({
        title: "Comment deleted",
        description: "Your comment has been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
      console.error("Error deleting comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (comment: CommentType) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditContent("");
  };

  // Function to format the display name
  const getDisplayName = (comment: CommentType) => {
    // First check if we have the user profile in our local state
    if (userProfiles[comment.user_id]?.username) {
      return userProfiles[comment.user_id].username;
    }
    
    // Then check if the comment has profile data
    if (comment.profile && comment.profile.username) {
      return comment.profile.username;
    }
    
    // If user is viewing their own comment but username isn't set
    if (user && user.id === comment.user_id && user.email) {
      return user.email.split('@')[0];
    }
    
    return "Anonymous User";
  };

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  // Get avatar URL
  const getAvatarUrl = (comment: CommentType) => {
    // First check if we have the user profile in our local state
    if (userProfiles[comment.user_id]?.avatar_url) {
      return userProfiles[comment.user_id].avatar_url;
    }
    
    // Then check if the comment has profile data
    if (comment.profile && comment.profile.avatar_url) {
      return comment.profile.avatar_url;
    }
    
    return null;
  };

  // Group comments by parent_id to easily find replies
  const commentsByParent: Record<string, CommentType[]> = {};
  
  // First, collect all root comments (no parent)
  const rootComments: CommentType[] = [];
  
  comments.forEach(comment => {
    if (!comment.parent_id) {
      rootComments.push(comment);
    } else {
      if (!commentsByParent[comment.parent_id]) {
        commentsByParent[comment.parent_id] = [];
      }
      commentsByParent[comment.parent_id].push(comment);
    }
  });

  // Sort root comments by created_at (newest first)
  rootComments.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Component to render a single comment and its replies recursively
  const renderComment = (comment: CommentType, level = 0) => {
    const isAuthor = user && user.id === comment.user_id;
    const replies = commentsByParent[comment.id] || [];
    const displayName = getDisplayName(comment);
    const avatarUrl = getAvatarUrl(comment);
    
    // Sort replies by created_at (oldest first)
    replies.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    return (
      <div key={comment.id} className={`mb-4 ${level > 0 ? 'pl-6 border-l border-gray-200' : ''}`}>
        <div className="flex items-start">
          <Avatar className="h-8 w-8 mr-3">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={displayName} />
            ) : (
              <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">{displayName}</span>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                {comment.updated_at !== comment.created_at && " (edited)"}
              </span>
            </div>

            {editingComment === comment.id ? (
              <div>
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full mb-2"
                  rows={2}
                />
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={cancelEditing}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleEditComment(comment.id)}
                    disabled={loading}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm">{comment.content}</p>
                <div className="flex gap-4 mt-2">
                  <button 
                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                    onClick={() => setReplyTo(comment.id)}
                  >
                    <CornerDownRight className="h-3 w-3 mr-1" /> Reply
                  </button>
                  
                  {isAuthor && (
                    <>
                      <button 
                        className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                        onClick={() => startEditing(comment)}
                      >
                        <Edit className="h-3 w-3 mr-1" /> Edit
                      </button>
                      <button 
                        className="text-xs text-red-400 hover:text-red-600 flex items-center"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <Trash className="h-3 w-3 mr-1" /> Delete
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Render replies */}
        <div className="mt-3">
          {replies.map(reply => renderComment(reply, level + 1))}
        </div>
        
        {/* Show reply box if this comment is selected for reply */}
        {replyTo === comment.id && (
          <div className="mt-3 pl-11">
            <div className="flex gap-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your reply..."
                className="resize-none flex-1"
                rows={1}
              />
              <div className="flex flex-col gap-1">
                <Button 
                  size="sm" 
                  className="p-2 h-auto" 
                  disabled={!newComment.trim() || loading}
                  onClick={handleSubmitComment}
                >
                  <Send className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-2 h-auto" 
                  onClick={() => setReplyTo(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {isAuthenticated ? (
        <div className="flex gap-3 mb-6">
          <Avatar className="h-8 w-8">
            {userProfiles[user?.id]?.avatar_url ? (
              <AvatarImage src={userProfiles[user.id].avatar_url} />
            ) : (
              <AvatarFallback>{user?.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your comment..."
              className="resize-none flex-1"
              rows={1}
            />
            <Button 
              className="self-start" 
              size="icon" 
              disabled={!newComment.trim() || loading}
              onClick={handleSubmitComment}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-md text-center mb-6">
          <p>Sign in to join the conversation</p>
          <Button 
            className="mt-2" 
            variant="outline"
            onClick={() => {
              const currentPath = window.location.pathname + window.location.search;
              window.location.href = `/auth?redirect=${encodeURIComponent(currentPath)}`;
            }}
          >
            Sign In
          </Button>
        </div>
      )}

      {loading && comments.length === 0 ? (
        <div className="text-center py-4">Loading comments...</div>
      ) : comments.length > 0 ? (
        <div>
          {rootComments.map(comment => renderComment(comment))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          No comments yet. Be the first to share your thoughts!
        </div>
      )}
    </div>
  );
};

export default CommentSection;
