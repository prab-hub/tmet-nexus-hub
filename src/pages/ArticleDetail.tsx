
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NewsLayout from "../components/NewsLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../services/authService";
import { fetchNewsById, likeNews, bookmarkNews, shareNews, type News } from "../services/newsService";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useIsMobile } from "../hooks/use-mobile";

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [article, setArticle] = useState<News | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState<boolean>(false);
  const [bookmarked, setBookmarked] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    async function loadArticle() {
      if (!id) return;
      
      try {
        setLoading(true);
        const newsItem = await fetchNewsById(id);
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
  
  const handleLike = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like articles",
        duration: 3000,
      });
      return;
    }

    // Optimistic UI update
    setLiked(!liked);
    
    if (user && article) {
      try {
        await likeNews(article.id, user.id);
      } catch (error) {
        // Revert optimistic update on error
        setLiked(liked);
        toast({
          title: "Error",
          description: "Failed to update like status",
          duration: 3000,
        });
      }
    }
  };
  
  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to bookmark articles",
        duration: 3000,
      });
      return;
    }

    // Optimistic UI update
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
        // Revert optimistic update on error
        setBookmarked(bookmarked);
        toast({
          title: "Error",
          description: "Failed to update bookmark status",
          duration: 3000,
        });
      }
    }
  };
  
  const handleShare = async () => {
    if (article) {
      try {
        await shareNews(article.id, user?.id);
      } catch (error) {
        console.error("Failed to track share:", error);
      }
    }
    
    toast({
      title: "Share",
      description: "Sharing functionality would be implemented here",
      duration: 1500,
    });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleImageError = () => {
    const MAX_RETRIES = 5;
    if (retryCount < MAX_RETRIES) {
      // Try again with a delay
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        // Force re-render the image
        setImageError(false);
      }, 1000);
    } else {
      setImageError(true);
    }
  };

  // Get a backup image based on the category
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

  // Always prioritize the original image URL first, then fallback if there's an error
  const imageUrl = imageError ? getBackupImage() : (article?.image_url || getBackupImage());

  if (loading) {
    return (
      <NewsLayout>
        <div className="h-screen w-full flex items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-2">Loading article...</h2>
          </div>
        </div>
      </NewsLayout>
    );
  }

  if (error || !article) {
    return (
      <NewsLayout>
        <div className="h-screen w-full flex items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-2">Error loading article</h2>
            <p className="text-gray-500">{error}</p>
            <Button className="mt-4" onClick={handleGoBack}>
              Go Back
            </Button>
          </div>
        </div>
      </NewsLayout>
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

  // Use different heights for mobile and desktop
  const imageHeight = isMobile ? "h-80" : "h-96";
  
  return (
    <NewsLayout>
      <div className="min-h-screen relative pb-20">
        {/* Article Header */}
        <div className={`w-full relative ${imageHeight}`}>
          <AspectRatio ratio={isMobile ? 4/3 : 16/9} className="h-full w-full">
            <img
              src={imageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
              onError={handleImageError}
              key={`${imageUrl}-${retryCount}`} // Force re-render on retry
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
          </AspectRatio>
          
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
              />
              <span className="text-white/90 text-sm font-medium">{article.source || 'Unknown Source'}</span>
              <span className="text-white/70 text-xs ml-auto">{formatDate(article.news_date)}</span>
            </div>
            <h1 className="text-white text-2xl md:text-3xl font-bold">{article.title}</h1>
          </div>
        </div>

        {/* Article Content */}
        <div className="px-4 py-6">
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
                This is a placeholder for the full article content. In a real application, 
                this would display the complete article text with proper formatting.
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
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
      </div>
    </NewsLayout>
  );
};

export default ArticleDetail;
