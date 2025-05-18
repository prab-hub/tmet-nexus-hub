import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { useNews, type News, type NewsCategory } from "../services/newsService";
import { useAuth } from "../services/authService";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "../hooks/use-mobile";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const NewsFeed = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const categoryFilter = (searchParams.get("category") || "all") as NewsCategory | 'all';
  const isMobile = useIsMobile();
  
  // Initialize the queryClient to make sure it's available
  const queryClient = useQueryClient();
  
  const { data: news, isLoading, error } = useNews(categoryFilter);
  
  // Reset active index when category changes
  useEffect(() => {
    setActiveIndex(0);
    setPreviousIndex(0);
    
    // Scroll to top when category changes
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [categoryFilter]);
  
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (!news || news.length === 0) return;
    
    const container = event.currentTarget;
    const scrollPosition = container.scrollTop;
    const itemHeight = container.clientHeight;
    const tolerance = 50; // Add tolerance for better snap detection
    
    // Calculate which news item should be active based on scroll position
    const newIndex = Math.round(scrollPosition / itemHeight);
    
    if (newIndex !== activeIndex && news && newIndex >= 0 && newIndex < news.length) {
      setPreviousIndex(activeIndex);
      setActiveIndex(newIndex);
    }
  };

  // Announce category change when active news item changes
  useEffect(() => {
    if (activeIndex !== previousIndex && news && news[activeIndex]) {
      const categories = news[activeIndex].categories;
      if (categories && categories.length > 0) {
        const category = categories[0];
        toast({
          title: `${category.charAt(0).toUpperCase() + category.slice(1)} News`,
          description: "Showing the latest updates from this category",
          duration: 1500,
        });
      }
    }
  }, [activeIndex, previousIndex, news]);

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-2">Loading news...</h2>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-2">Error loading news</h2>
          <p className="text-gray-500">{error.message}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!news || news.length === 0) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-2">No news in this category</h2>
          <p className="text-gray-500">Try selecting a different category or insert sample data</p>
          <Button 
            className="mt-4"
            onClick={() => navigate('/home')}
          >
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  const handleViewArticle = (newsId: string) => {
    navigate(`/article/${newsId}`);
  };

  // Adjust top padding based on whether we're on mobile (for the selector)
  const topPaddingClass = isMobile ? "pt-20" : "pt-16";

  return (
    <div className={`h-screen w-full relative overflow-hidden ${topPaddingClass}`}>
      <div 
        className="h-full w-full overflow-y-auto scroll-smooth scrollbar-hide snap-y snap-mandatory" 
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        <div className="flex flex-col">
          {news?.map((newsItem, index) => (
            <div 
              key={newsItem.id} 
              className="h-screen w-full flex-shrink-0 snap-center"
              id={`news-item-${index}`}
            >
              <NewsCard 
                news={newsItem} 
                isActive={index === activeIndex}
                onViewArticle={handleViewArticle}
                isMobile={isMobile}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-10">
        {news?.map((_, index) => (
          <div 
            key={index} 
            className={`w-1.5 h-1.5 rounded-full cursor-pointer ${
              index === activeIndex 
                ? 'bg-white w-2 h-2' 
                : 'bg-white/30'
            } transition-all duration-300`}
            onClick={() => {
              const element = document.getElementById(`news-item-${index}`);
              element?.scrollIntoView({ behavior: 'smooth' });
              setActiveIndex(index);
            }}
          />
        ))}
      </div>
    </div>
  );
};

interface NewsCardProps {
  news: News;
  isActive: boolean;
  onViewArticle: (id: string) => void;
  isMobile: boolean;
}

const NewsCard = ({ news, isActive, onViewArticle, isMobile }: NewsCardProps) => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likes, setLikes] = useState(news.likes_count || 0);
  const [imageError, setImageError] = useState(false);
  const { user, isAuthenticated } = useAuth();
  
  const handleClick = () => {
    // Navigate to the article detail page when clicked
    onViewArticle(news.id);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling

    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like articles",
        duration: 3000,
      });
      return;
    }

    // Optimistic UI update
    if (liked) {
      setLikes(prev => prev - 1);
    } else {
      setLikes(prev => prev + 1);
    }
    setLiked(!liked);

    // Update in the database
    import("../services/newsService").then(({ likeNews }) => {
      if (user) {
        likeNews(news.id, user.id).catch(error => {
          // Revert optimistic update on error
          toast({
            title: "Error",
            description: "Failed to update like status",
            duration: 3000,
          });
          setLiked(liked);
          setLikes(liked ? likes + 1 : likes - 1);
        });
      }
    });
  };
  
  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling

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
      description: news.title,
      duration: 1500,
    });

    // Update in the database
    import("../services/newsService").then(({ bookmarkNews }) => {
      if (user) {
        bookmarkNews(news.id, user.id).catch(error => {
          // Revert optimistic update on error
          toast({
            title: "Error",
            description: "Failed to update bookmark status",
            duration: 3000,
          });
          setBookmarked(bookmarked);
        });
      }
    });
  };
  
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    
    // Track share in the database
    import("../services/newsService").then(({ shareNews }) => {
      shareNews(news.id, user?.id).catch(error => {
        console.error("Failed to track share:", error);
      });
    });

    toast({
      title: "Share",
      description: "Sharing functionality would be implemented here",
      duration: 1500,
    });
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    toast({
      title: "Comments",
      description: "Comments section would open here",
      duration: 1500,
    });
  };

  // Maximum retries for image loading with multiple attempts
  const MAX_RETRIES = 8; // Increased max retries
  const [retryCount, setRetryCount] = useState(0);

  const handleImageError = () => {
    if (retryCount < MAX_RETRIES) {
      // Try again with a small delay that increases with each retry
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        // Force re-render the image
        setImageError(false);
      }, 1000 + (retryCount * 500)); // Increasing delay with each retry
    } else {
      setImageError(true);
      console.error(`Failed to load image after ${MAX_RETRIES} attempts:`, news.image_url);
    }
  };

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

  // Get a backup image based on the category with better quality images
  const getBackupImage = () => {
    const category = news.categories && news.categories[0] ? news.categories[0] : 'default';
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
  const imageUrl = imageError ? getBackupImage() : (news.image_url || getBackupImage());
  
  // Instagram-style layout for mobile, keeping the existing desktop layout
  if (isMobile) {
    return (
      <Card 
        className={`h-full w-full overflow-hidden relative rounded-none border-0 transition-opacity duration-300 cursor-pointer flex flex-col ${isActive ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClick}
      >
        {/* Instagram-style image section - fixed height */}
        <div className="w-full h-[60vh] relative">
          <img 
            src={imageUrl} 
            alt={news.title}
            className="w-full h-full object-cover"
            onError={handleImageError}
            key={`${imageUrl}-${retryCount}`}
          />
        </div>
        
        {/* Content section - scrollable if needed */}
        <div className="flex-1 flex flex-col bg-background p-4">
          <div className="flex items-center mb-3">
            <img 
              src={news.source_image_url || 'https://placehold.co/50?text=News'} 
              alt={news.source || ''} 
              className="w-8 h-8 rounded-full mr-2 object-cover border border-gray-200"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://placehold.co/50?text=News";
              }}
            />
            <span className="text-foreground font-medium">{news.source || 'Unknown Source'}</span>
            <span className="text-muted-foreground text-xs ml-auto">{formatDate(news.news_date)}</span>
          </div>
          
          <h2 className="text-xl font-bold mb-2">{news.title}</h2>
          <p className="text-muted-foreground mb-3 line-clamp-2">{news.summary || ''}</p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {news.categories && news.categories.map((category) => (
              <Badge key={category} variant="outline" className="bg-primary/10 text-primary">
                {category}
              </Badge>
            ))}
            {news.tags && news.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="bg-secondary/10 text-secondary">
                {tag}
              </Badge>
            ))}
          </div>
          
          {/* Action buttons in a row for mobile */}
          <div className="flex justify-between items-center mt-auto pt-3 border-t border-border">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`p-2 ${liked ? 'text-red-500' : 'text-muted-foreground'}`}
                onClick={handleLike}
              >
                <Heart className="h-5 w-5 mr-1" fill={liked ? "currentColor" : "none"} />
                <span>{likes}</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 text-muted-foreground"
                onClick={handleComment}
              >
                <MessageCircle className="h-5 w-5 mr-1" />
                <span>{news.comments_count || 0}</span>
              </Button>
            </div>
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`p-2 ${bookmarked ? 'text-yellow-500' : 'text-muted-foreground'}`}
                onClick={handleBookmark}
              >
                <Bookmark className="h-5 w-5" fill={bookmarked ? "currentColor" : "none"} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 text-muted-foreground"
                onClick={handleShare}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }
  
  // Desktop version - keep the existing layout
  return (
    <Card 
      className={`h-full w-full overflow-hidden relative rounded-none border-0 transition-opacity duration-300 cursor-pointer ${isActive ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClick}
    >
      <div className="absolute inset-0">
        <AspectRatio ratio={16/9} className="h-full w-full">
          <div className="relative w-full h-full">
            <img 
              src={imageUrl} 
              alt={news.title}
              className="w-full h-full object-cover"
              onError={handleImageError}
              key={`${imageUrl}-${retryCount}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          </div>
        </AspectRatio>
      </div>
      
      {/* Content overlay */}
      <div className={`absolute inset-0 flex flex-col justify-end p-6 transition-transform duration-500 ${isActive ? 'translate-y-0' : 'translate-y-10'}`}>
        <div className="mb-16">
          <div className="flex items-center mb-4">
            <img 
              src={news.source_image_url || getBackupImage()} 
              alt={news.source || ''} 
              className="w-8 h-8 rounded-full mr-2 object-cover border border-white/20"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://placehold.co/50?text=News";
              }}
            />
            <span className="text-white/90 text-sm font-medium">{news.source || 'Unknown Source'}</span>
            <span className="text-white/70 text-xs ml-auto">{formatDate(news.news_date)}</span>
          </div>
          <h2 className="text-white font-bold mb-2 text-2xl">{news.title}</h2>
          <p className="text-white/80 line-clamp-3">{news.summary || ''}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {news.categories && news.categories.map((category) => (
              <Badge key={category} className="bg-primary/20 text-white">
                {category}
              </Badge>
            ))}
            {news.tags && news.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-secondary/20 text-white">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="absolute right-4 bottom-20 flex flex-col items-center space-y-6 transition-transform duration-500 ${isActive ? 'translate-x-0' : 'translate-x-16'}">
        <div className="flex flex-col items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`rounded-full bg-black/30 backdrop-blur-sm border border-white/10 ${liked ? 'text-red-500' : 'text-white'} transition-transform hover:scale-110`}
            onClick={handleLike}
          >
            <Heart className="h-5 w-5" fill={liked ? "currentColor" : "none"} />
          </Button>
          <span className="text-white text-xs mt-1">{likes}</span>
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
          <span className="text-white text-xs mt-1">{news.comments_count || 0}</span>
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
    </Card>
  );
};

export default NewsFeed;
