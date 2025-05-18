
import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { useNews, type News, type NewsCategory } from "../services/newsService";
import { useAuth } from "../services/authService";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";

const NewsFeed = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const categoryFilter = (searchParams.get("category") || "all") as NewsCategory | 'all';
  
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

  return (
    <div className="h-screen w-full relative overflow-hidden">
      <div 
        className="h-full w-full overflow-y-auto scroll-smooth scrollbar-hide" 
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        <div className="flex flex-col">
          {news.map((newsItem, index) => (
            <div 
              key={newsItem.id} 
              className="h-screen w-full flex-shrink-0 snap-center"
              id={`news-item-${index}`}
            >
              <NewsCard 
                news={newsItem} 
                isActive={index === activeIndex}
                onViewArticle={handleViewArticle}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-10">
        {news.map((_, index) => (
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
}

const NewsCard = ({ news, isActive, onViewArticle }: NewsCardProps) => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likes, setLikes] = useState(news.likes_count || 0);
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

  return (
    <Card 
      className={`h-full w-full overflow-hidden relative rounded-none border-0 transition-opacity duration-300 cursor-pointer ${isActive ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClick}
    >
      <div 
        className="absolute inset-0 bg-center bg-cover transition-transform duration-700"
        style={{ 
          backgroundImage: `url(${news.image_url || 'https://placehold.co/600x400?text=No+Image'})`,
          transform: isActive ? 'scale(1)' : 'scale(1.05)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>
      
      {/* Content overlay */}
      <div className={`absolute inset-0 flex flex-col justify-end p-6 transition-transform duration-500 ${isActive ? 'translate-y-0' : 'translate-y-10'}`}>
        <div className="mb-16">
          <div className="flex items-center mb-4">
            <img 
              src={news.source_image_url || 'https://placehold.co/50?text=News'} 
              alt={news.source || ''} 
              className="w-8 h-8 rounded-full mr-2 object-cover border border-white/20"
            />
            <span className="text-white/90 text-sm font-medium">{news.source || 'Unknown Source'}</span>
            <span className="text-white/70 text-xs ml-auto">{formatDate(news.news_date)}</span>
          </div>
          <h2 className="text-white text-2xl font-bold mb-2">{news.title}</h2>
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
      <div className={`absolute right-4 bottom-20 flex flex-col items-center space-y-6 transition-transform duration-500 ${isActive ? 'translate-x-0' : 'translate-x-16'}`}>
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
