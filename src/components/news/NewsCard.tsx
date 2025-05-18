
import React, { useState } from "react";
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useAuth } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import type { News } from "../../services/newsService";
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

interface NewsCardProps {
  news: News;
  isActive: boolean;
  isMobile: boolean;
}

const NewsCard = ({ news, isActive, isMobile }: NewsCardProps) => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likes, setLikes] = useState(news.likes_count || 0);
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authAction, setAuthAction] = useState<'like' | 'comment' | 'bookmark' | 'share'>('like');
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const handleClick = () => {
    // Navigate to the article detail page when clicked
    navigate(`/article/${news.id}`);
  };

  const requireAuth = (action: 'like' | 'comment' | 'bookmark' | 'share', callback: () => void) => {
    if (isAuthenticated) {
      callback();
    } else {
      setAuthAction(action);
      setAuthDialogOpen(true);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    
    requireAuth('like', () => {
      // Optimistic UI update
      if (liked) {
        setLikes(prev => prev - 1);
      } else {
        setLikes(prev => prev + 1);
      }
      setLiked(!liked);

      // Update in the database
      import("../../services/newsService").then(({ likeNews }) => {
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
    });
  };
  
  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    
    requireAuth('bookmark', () => {
      // Optimistic UI update
      setBookmarked(!bookmarked);
      
      toast({
        title: bookmarked ? "Removed from bookmarks" : "Added to bookmarks",
        description: news.title,
        duration: 1500,
      });

      // Update in the database
      import("../../services/newsService").then(({ bookmarkNews }) => {
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
    });
  };
  
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    
    requireAuth('share', () => {
      // Open share dialog or use Web Share API if available
      if (navigator.share) {
        navigator.share({
          title: news.title,
          text: news.summary,
          url: window.location.origin + `/article/${news.id}`,
        })
        .then(() => {
          // Track share in the database
          import("../../services/newsService").then(({ shareNews }) => {
            shareNews(news.id, user?.id).catch(error => {
              console.error("Failed to track share:", error);
            });
          });
        })
        .catch(error => {
          if (error.name !== 'AbortError') {
            toast({
              title: "Share",
              description: "Sharing functionality would be implemented here",
              duration: 1500,
            });
          }
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        toast({
          title: "Share",
          description: "Sharing functionality would be implemented here",
          duration: 1500,
        });
        
        // Track share in the database
        import("../../services/newsService").then(({ shareNews }) => {
          shareNews(news.id, user?.id).catch(error => {
            console.error("Failed to track share:", error);
          });
        });
      }
    });
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    
    requireAuth('comment', () => {
      // Navigate to article detail with comment section open
      navigate(`/article/${news.id}?openComments=true`);
    });
  };

  const navigateToAuth = () => {
    // Save current location to return after auth
    navigate('/auth', { state: { from: location.pathname + location.search } });
  };

  // Maximum retries for image loading with multiple attempts
  const MAX_RETRIES = 8;

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

  // Always prioritize the original image URL first, then fallback if there's an error
  const imageUrl = imageError ? getBackupImage() : (news.image_url || getBackupImage());
  
  // For mobile, we'll use a slightly different layout with two items per screen
  if (isMobile) {
    return (
      <>
        <Card 
          className="h-full w-full overflow-hidden relative rounded-none border-0 cursor-pointer"
          onClick={() => navigate(`/article/${news.id}`)}
        >
          {/* Image container with full height */}
          <div className="absolute inset-0">
            <img 
              src={imageUrl} 
              alt={news.title}
              className="w-full h-full object-cover"
              onError={handleImageError}
              key={`${imageUrl}-${retryCount}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
          </div>
          
          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-4">
            <div className="mb-2">
              <div className="flex items-center mb-2">
                <img 
                  src={news.source_image_url || 'https://placehold.co/50?text=News'} 
                  alt={news.source || ''} 
                  className="w-6 h-6 rounded-full mr-2 object-cover border border-white/20"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/50?text=News";
                  }}
                />
                <span className="text-white/90 text-xs font-medium">{news.source || 'Unknown Source'}</span>
                <span className="text-white/70 text-xs ml-auto">{formatDate(news.news_date)}</span>
              </div>
              <h2 className="text-white font-bold text-base mb-1 line-clamp-2">{news.title}</h2>
              <p className="text-white/80 text-xs line-clamp-2">{news.summary || ''}</p>
              
              <div className="mt-2 flex flex-wrap gap-1">
                {news.categories && news.categories.slice(0, 1).map((category) => (
                  <Badge key={category} className="bg-primary/20 text-white text-xs py-0">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center p-2 bg-gradient-to-t from-black to-transparent">
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`p-1 ${liked ? 'text-red-500' : 'text-white'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike(e);
                }}
              >
                <Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} />
                <span className="ml-1 text-xs">{likes}</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleComment(e);
                }}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`p-1 ${bookmarked ? 'text-yellow-500' : 'text-white'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleBookmark(e);
                }}
              >
                <Bookmark className="h-4 w-4" fill={bookmarked ? "currentColor" : "none"} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(e);
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
        
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
      </>
    );
  }
  
  // Desktop version remains similar to before
  return (
    <>
      <Card 
        className={`h-full w-full overflow-hidden relative rounded-none border-0 transition-opacity duration-300 cursor-pointer ${isActive ? 'opacity-100' : 'opacity-0'}`}
        onClick={() => navigate(`/article/${news.id}`)}
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
                src={news.source_image_url || 'https://placehold.co/50?text=News'} 
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

        {/* Desktop action buttons */}
        <div className="absolute right-4 bottom-20 flex flex-col items-center space-y-6 transition-transform duration-500">
          <div className="flex flex-col items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`rounded-full bg-black/30 backdrop-blur-sm border border-white/10 ${liked ? 'text-red-500' : 'text-white'} transition-transform hover:scale-110`}
              onClick={(e) => {
                e.stopPropagation();
                handleLike(e);
              }}
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
              onClick={(e) => {
                e.stopPropagation();
                handleComment(e);
              }}
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
            <span className="text-white text-xs mt-1">{news.comments_count || 0}</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`rounded-full bg-black/30 backdrop-blur-sm border border-white/10 ${bookmarked ? 'text-yellow-500' : 'text-white'} transition-transform hover:scale-110`}
            onClick={(e) => {
              e.stopPropagation();
              handleBookmark(e);
            }}
          >
            <Bookmark className="h-5 w-5" fill={bookmarked ? "currentColor" : "none"} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-black/30 backdrop-blur-sm border border-white/10 text-white transition-transform hover:scale-110"
            onClick={(e) => {
              e.stopPropagation();
              handleShare(e);
            }}
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </Card>

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
    </>
  );
};

export default NewsCard;
