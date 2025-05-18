
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, MessageCircle, Bookmark, Share2, Send, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../services/authService";
import { fetchNewsById, likeNews, bookmarkNews, shareNews, type News } from "../services/newsService";
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
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import CommentSection from "../components/comments/CommentSection";

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
  const [bookmarked, setBookmarked] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [commentsOpen, setCommentsOpen] = useState<boolean>(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authAction, setAuthAction] = useState<'like' | 'comment' | 'bookmark' | 'share'>('like');
  const isMobile = useIsMobile();
  
  // Check if comments should be opened from URL parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("openComments") === "true") {
      setCommentsOpen(true);
    }
  }, [location]);
  
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
      setLiked(!liked);
      
      if (user && article) {
        try {
          await likeNews(article.id, user.id);
        } catch (error) {
          setLiked(liked);
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
    requireAuth('share', async () => {
      // Try to use Web Share API if available
      if (navigator.share) {
        try {
          await navigator.share({
            title: article?.title || 'TMET Hub Article',
            text: article?.summary || '',
            url: window.location.href,
          });
          
          // Track share
          if (article) {
            try {
              await shareNews(article.id, user?.id);
            } catch (error) {
              console.error("Failed to track share:", error);
            }
          }
        } catch (err) {
          if ((err as Error).name !== 'AbortError') {
            toast({
              title: "Share",
              description: "Failed to share article",
              duration: 1500,
            });
          }
        }
      } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(window.location.href).then(() => {
          toast({
            title: "Link copied",
            description: "Article link copied to clipboard",
            duration: 1500,
          });
        });
        
        // Track share
        if (article) {
          try {
            await shareNews(article.id, user?.id);
          } catch (error) {
            console.error("Failed to track share:", error);
          }
        }
      }
    });
  };
  
  const handleComment = () => {
    requireAuth('comment', () => {
      setCommentsOpen(true);
    });
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
          <span className="text-xs mt-1">{article.likes_count}</span>
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
          <span className="text-xs mt-1">{article.comments_count || 0}</span>
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
              {article && <CommentSection newsId={article.id} />}
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        commentsOpen && (
          <div className="fixed inset-0 bg-black/30 z-50 flex justify-end">
            <div className="w-full max-w-md bg-background h-full p-4 overflow-y-auto animate-in slide-in-from-right">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Comments</h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setCommentsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {article && <CommentSection newsId={article.id} />}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default ArticleDetail;
