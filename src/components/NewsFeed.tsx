
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";
import { newsData } from "../data/mockNewsData";
import { toast } from "@/components/ui/use-toast";

const NewsFeed = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(0);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    const scrollPosition = container.scrollTop;
    const itemHeight = container.clientHeight;
    const newIndex = Math.round(scrollPosition / itemHeight);
    
    if (newIndex !== activeIndex) {
      setPreviousIndex(activeIndex);
      setActiveIndex(newIndex);
    }
  };

  // Announce category change when active news item changes
  useEffect(() => {
    if (activeIndex !== previousIndex && newsData[activeIndex]) {
      const category = newsData[activeIndex].category;
      toast({
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} News`,
        description: "Showing the latest updates from this category",
        duration: 1500,
      });
    }
  }, [activeIndex, previousIndex]);

  return (
    <div className="h-screen w-full relative">
      <ScrollArea className="h-full w-full snap-y snap-mandatory" onScroll={handleScroll}>
        <div className="flex flex-col">
          {newsData.map((newsItem, index) => (
            <div 
              key={newsItem.id} 
              className="h-screen w-full snap-start snap-always"
            >
              <NewsCard 
                news={newsItem} 
                isActive={index === activeIndex} 
              />
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {/* Scroll indicator */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
        {newsData.map((_, index) => (
          <div 
            key={index} 
            className={`w-1.5 h-1.5 rounded-full ${
              index === activeIndex 
                ? 'bg-white' 
                : 'bg-white/30'
            } transition-all duration-300`}
          />
        ))}
      </div>
    </div>
  );
};

interface NewsCardProps {
  news: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    source: string;
    sourceImageUrl: string;
    category: string;
    date: string;
    likes: number;
    comments: number;
  };
  isActive: boolean;
}

const NewsCard = ({ news, isActive }: NewsCardProps) => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likes, setLikes] = useState(news.likes);
  
  const handleLike = () => {
    if (liked) {
      setLikes(prev => prev - 1);
    } else {
      setLikes(prev => prev + 1);
    }
    setLiked(!liked);
  };
  
  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    toast({
      title: bookmarked ? "Removed from bookmarks" : "Added to bookmarks",
      description: news.title,
      duration: 1500,
    });
  };
  
  const handleShare = () => {
    toast({
      title: "Share",
      description: "Sharing functionality would be implemented here",
      duration: 1500,
    });
  };

  return (
    <Card className={`h-full w-full overflow-hidden relative rounded-none border-0 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
      <div 
        className="absolute inset-0 bg-center bg-cover transition-transform duration-700"
        style={{ 
          backgroundImage: `url(${news.imageUrl})`,
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
              src={news.sourceImageUrl} 
              alt={news.source} 
              className="w-8 h-8 rounded-full mr-2 object-cover border border-white/20"
            />
            <span className="text-white/90 text-sm font-medium">{news.source}</span>
            <span className="text-white/70 text-xs ml-auto">{news.date}</span>
          </div>
          <h2 className="text-white text-2xl font-bold mb-2">{news.title}</h2>
          <p className="text-white/80 line-clamp-3">{news.description}</p>
          <div className="mt-4">
            <span className="bg-primary/20 text-white text-xs py-1 px-2 rounded-full">{news.category}</span>
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
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          <span className="text-white text-xs mt-1">{news.comments}</span>
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
