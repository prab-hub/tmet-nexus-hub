
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, MessageCircle, Bookmark, Share2, Send, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../services/authService";
import { fetchNewsById, likeNews, bookmarkNews, shareNews, checkUserInteractions, type News } from "../services/newsService";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useIsMobile } from "../hooks/use-mobile";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import CommentSection from "../components/comments/CommentSection";
import { supabase } from "@/integrations/supabase/client";

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [article, setArticle] = useState<News | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [bookmarked, setBookmarked] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [commentsOpen, setCommentsOpen] = useState<boolean>(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authAction, setAuthAction] = useState<'like' | 'comment' | 'bookmark' | 'share'>('like');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Check if comments should be opened from URL parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("openComments") === "true") {
      setCommentsOpen(true);
    }
  }, [location]);
  
  // Check if the current user has liked or bookmarked this article
  useEffect(() => {
    if (isAuthenticated && user && article) {
      const checkInteractions = async () => {
        try {
          const interactions = await checkUserInteractions(article.id, user.id);
          setLiked(interactions.liked);
          setBookmarked(interactions.bookmarked);
        } catch (error) {
          console.error("Error checking user interactions:", error);
        }
      };
      
      checkInteractions();
    }
  }, [isAuthenticated, user, article]);
  
  useEffect(() => {
    async function loadArticle() {
      if (!id) return;
      
      try {
        setLoading(true);
        console.log("Fetching article with ID:", id);
        const newsItem = await fetchNewsById(id);
        console.log("Fetched article:", newsItem);
        if (newsItem) {
          setArticle(newsItem);
          setLikeCount(newsItem.likes_count || 0);
        } else {
          setError("Article not found");
        }
      } catch (err) {
        console.error("Error loading article:", err);
        setError("Failed to load article");
      } finally {
        setLoading(false);
      }
    }
    
    loadArticle();
  }, [id]);
  
  const requireAuth = (action: 'like' | 'comment' | 'bookmark' | 'share', callback: () => void) => {
    if (isAuthenticated) {
      callback();
    } else {
      setAuthAction(action);
      setAuthDialogOpen(true);
    }
  };
  
  const handleLike = async () => {
    requireAuth('like', async () => {
      const newLikedState = !liked;
      setLiked(newLikedState);
      
      // Update like count immediately for better UX
      setLikeCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));
      
      if (user && article) {
        try {
          await likeNews(article.id, user.id);
        } catch (error) {
          // Revert the UI if the API call fails
          setLiked(liked);
          setLikeCount(prev => liked ? prev - 1 : prev + 1);
          toast({
            title: "Error",
            description: "Failed to update like status",
            duration: 3000,
          });
        }
      }
    });
  };
  
  const handleBookmark = async () => {
    requireAuth('bookmark', async () => {
      setBookmarked(!bookmarked);
      
      toast({
        title: bookmarked ? "Removed from bookmarks" : "Added to bookmarks",
        description: article?.title,
        duration: 1500,
      });

      if (user && article) {
        try {
          await bookmarkNews(article.id, user.id);
        } catch (error) {
          setBookmarked(bookmarked);
          toast({
            title: "Error",
            description: "Failed to update bookmark status",
            duration: 3000,
          });
        }
      }
    });
  };
  
  const handleShare = async () => {
    // Create shareable URL - no auth required
    const shareUrl = window.location.href;
        
    try {
      // Use native share if available
      if (navigator.share) {
        await navigator.share({
          title: article?.title || 'TMET Hub Article',
          text: article?.summary || '',
          url: shareUrl,
        });
        
        // Track successful share
        if (article && user) {
          try {
            await shareNews(article.id, user.id);
            toast({
              title: "Success",
              description: "Article shared successfully",
              duration: 1500,
            });
          } catch (error) {
            console.error("Failed to track share:", error);
          }
        }
        return;
      }
      
      // Fallback to clipboard for desktop
      await navigator.clipboard.writeText(shareUrl);
      
      // Open share modal with more options
      setShareModalOpen(true);
      
      // Track share via copy to clipboard
      if (article && user) {
        try {
          await shareNews(article.id, user.id);
        } catch (error) {
          console.error("Failed to track share:", error);
        }
      }
      
      toast({
        title: "Link copied",
        description: "Article link copied to clipboard. Choose a platform to share to.",
        duration: 1500,
      });
    } catch (err) {
      console.error("Share error:", err);
      toast({
        title: "Share failed",
        description: "Could not share the article. Try copying the link manually.",
        duration: 1500,
        variant: "destructive"
      });
    }
  };
  
  const handleComment = () => {
    requireAuth('comment', () => {
      setCommentsOpen(true);
    });
  };

  const handleCloseComments = () => {
    setCommentsOpen(false);
  };

  const navigateToAuth = () => {
    // Save current location to return after auth
    navigate('/auth', { state: { from: location.pathname + location.search } });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleImageError = () => {
    const MAX_RETRIES = 8;
    if (retryCount < MAX_RETRIES) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setImageError(false);
      }, 1000 + (retryCount * 500));
    } else {
      setImageError(true);
    }
  };

  const getBackupImage = () => {
    if (!article) return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80';
    
    const category = article.categories && article.categories[0] ? article.categories[0] : 'default';
    switch(category) {
      case 'technology': 
        return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80';
      case 'telecom':
        return 'https://images.unsplash.com/photo-1546027658-7aa750153465?auto=format&fit=crop&w=1200&q=80';
      case 'media':
        return 'https://images.unsplash.com/photo-1626812754718-79351472df4f?auto=format&fit=crop&w=1200&q=80';
      case 'entertainment':
        return 'https://images.unsplash.com/photo-1603190287605-e6ade32fa852?auto=format&fit=crop&w=1200&q=80';
      case 'trending':
        return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80';
      default:
        return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80';
    }
  };

  const imageUrl = imageError ? getBackupImage() : (article?.image_url || getBackupImage());

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-2">Loading article...</h2>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-2">Error loading article</h2>
          <p className="text-gray-500">{error}</p>
          <Button className="mt-4" onClick={handleGoBack}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }).format(date);
    } catch (error) {
      return 'Unknown date';
    }
  };

  const imageHeight = isMobile ? "h-80" : "h-96";
  
  return (
    <div className="min-h-screen w-full relative pb-20">
      <div className={`w-full relative ${imageHeight}`}>
        <div className="w-full h-full">
          <img
            src={imageUrl}
            alt={article.title}
            className="w-full h-full object-cover"
            onError={handleImageError}
            key={`${imageUrl}-${retryCount}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
        </div>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleGoBack}
          className="absolute top-4 left-4 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center mb-2">
            <img 
              src={article.source_image_url || 'https://placehold.co/50?text=News'} 
              alt={article.source || ''} 
              className="w-8 h-8 rounded-full mr-2 object-cover border border-white/20"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://placehold.co/50?text=News";
              }}
            />
            <span className="text-white/90 text-sm font-medium">{article.source || 'Unknown Source'}</span>
            <span className="text-white/70 text-xs ml-auto">{formatDate(article.news_date)}</span>
          </div>
          <h1 className="text-white text-2xl md:text-3xl font-bold">{article.title}</h1>
        </div>
      </div>

      <div className="px-4 py-6 max-w-5xl mx-auto">
        <div className="flex flex-wrap gap-2 mb-4">
          {article.categories && article.categories.map((category) => (
            <Badge key={category} className="bg-primary/20 text-primary">
              {category}
            </Badge>
          ))}
          {article.tags && article.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-secondary/20 text-secondary">
              {tag}
            </Badge>
          ))}
        </div>
        
        <p className="text-lg font-medium mb-6">{article.summary}</p>
        
        <div className="prose max-w-none">
          {article.content ? (
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          ) : (
            <p className="text-gray-500">
              {article.summary || "This is a placeholder for the full article content. In a real application, this would display the complete article text with proper formatting."}
            </p>
          )}
        </div>
      </div>

      <div className="fixed bottom-20 right-4 flex flex-col items-center space-y-6">
        <div className="flex flex-col items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`rounded-full bg-black/30 backdrop-blur-sm border border-white/10 ${liked ? 'text-red-500' : 'text-white'} transition-transform hover:scale-110`}
            onClick={handleLike}
          >
            <Heart className="h-5 w-5" fill={liked ? "currentColor" : "none"} />
          </Button>
          <span className="text-xs mt-1 font-medium bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full text-white">{likeCount}</span>
        </div>
        <div className="flex flex-col items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-black/30 backdrop-blur-sm border border-white/10 text-white transition-transform hover:scale-110"
            onClick={handleComment}
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          <span className="text-xs mt-1 font-medium bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full text-white">{article?.comments_count || 0}</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`rounded-full bg-black/30 backdrop-blur-sm border border-white/10 ${bookmarked ? 'text-yellow-500' : 'text-white'} transition-transform hover:scale-110`}
          onClick={handleBookmark}
        >
          <Bookmark className="h-5 w-5" fill={bookmarked ? "currentColor" : "none"} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-black/30 backdrop-blur-sm border border-white/10 text-white transition-transform hover:scale-110"
          onClick={handleShare}
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Authentication Dialog */}
      <AlertDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Authentication Required</AlertDialogTitle>
            <AlertDialogDescription>
              {authAction === 'like' && "You need to sign in to like articles."}
              {authAction === 'comment' && "You need to sign in to comment on articles."}
              {authAction === 'bookmark' && "You need to sign in to bookmark articles."}
              {authAction === 'share' && "You need to sign in to share articles."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={navigateToAuth}>Sign In</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Comments Drawer (Mobile) or Side Panel (Desktop) */}
      {isMobile ? (
        <Drawer open={commentsOpen} onOpenChange={setCommentsOpen}>
          <DrawerContent className="max-h-[85vh] px-0">
            <DrawerHeader className="border-b">
              <DrawerTitle>Comments</DrawerTitle>
              <DrawerClose className="absolute right-4 top-4">
                <X className="h-4 w-4" />
              </DrawerClose>
            </DrawerHeader>
            <div className="px-4 py-2 overflow-y-auto h-full">
              {article && <CommentSection newsId={article.id} onClose={handleCloseComments} />}
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        commentsOpen && (
          <div className="fixed inset-0 bg-black/30 z-50 flex justify-end">
            <div className="w-full max-w-md bg-background h-full p-4 overflow-y-auto animate-in slide-in-from-right">
              {article && <CommentSection newsId={article.id} onClose={handleCloseComments} />}
            </div>
          </div>
        )
      )}
      
      {/* Share Options Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShareModalOpen(false)}>
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-medium mb-4">Share this article</h3>
            <div className="grid grid-cols-3 gap-4">
              <button 
                className="flex flex-col items-center justify-center p-3 hover:bg-gray-100 rounded-lg"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast({ title: "Link copied", duration: 1500 });
                  setShareModalOpen(false);
                }}
              >
                <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                </div>
                <span className="text-xs">Copy Link</span>
              </button>
              <button 
                className="flex flex-col items-center justify-center p-3 hover:bg-gray-100 rounded-lg"
                onClick={() => {
                  window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article?.title || '')}`, '_blank');
                  setShareModalOpen(false);
                }}
              >
                <div className="w-10 h-10 flex items-center justify-center bg-[#1DA1F2] text-white rounded-full mb-2">X</div>
                <span className="text-xs">Twitter</span>
              </button>
              <button 
                className="flex flex-col items-center justify-center p-3 hover:bg-gray-100 rounded-lg"
                onClick={() => {
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
                  setShareModalOpen(false);
                }}
              >
                <div className="w-10 h-10 flex items-center justify-center bg-[#1877F2] text-white rounded-full mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </div>
                <span className="text-xs">Facebook</span>
              </button>
              <button 
                className="flex flex-col items-center justify-center p-3 hover:bg-gray-100 rounded-lg"
                onClick={() => {
                  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank');
                  setShareModalOpen(false);
                }}
              >
                <div className="w-10 h-10 flex items-center justify-center bg-[#0A66C2] text-white rounded-full mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </div>
                <span className="text-xs">LinkedIn</span>
              </button>
              <button 
                className="flex flex-col items-center justify-center p-3 hover:bg-gray-100 rounded-lg"
                onClick={() => {
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(article?.title || '')} ${encodeURIComponent(window.location.href)}`, '_blank');
                  setShareModalOpen(false);
                }}
              >
                <div className="w-10 h-10 flex items-center justify-center bg-[#25D366] text-white rounded-full mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <span className="text-xs">WhatsApp</span>
              </button>
              <button 
                className="flex flex-col items-center justify-center p-3 hover:bg-gray-100 rounded-lg"
                onClick={() => {
                  window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article?.title || '')}`, '_blank');
                  setShareModalOpen(false);
                }}
              >
                <div className="w-10 h-10 flex items-center justify-center bg-[#0088cc] text-white rounded-full mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.2 8.4c.5.38.8.96.8 1.6v10a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V10a3 3 0 0 1 3-3h14c.64 0 1.22.3 1.6.78"></path><path d="M3 9l9 6l9-6"></path></svg>
                </div>
                <span className="text-xs">Telegram</span>
              </button>
            </div>
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShareModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleDetail;
