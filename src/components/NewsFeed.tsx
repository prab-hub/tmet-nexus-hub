
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useNews, type NewsCategory } from "../services/newsService";
import { useIsMobile } from "../hooks/use-mobile";
import NewsCard from "./news/NewsCard";
import NewsScrollIndicator from "./news/NewsScrollIndicator";
import { NewsEmptyState, NewsLoadingState, NewsErrorState } from "./news/NewsState";

const NewsFeed = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const categoryFilter = (searchParams.get("category") || "all") as NewsCategory | 'all';
  const isMobile = useIsMobile();
  
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
  
  // Set isLoaded to true after data is fetched
  useEffect(() => {
    if (news && news.length > 0) {
      setIsLoaded(true);
    }
  }, [news]);

  // Debug logging to check what's happening
  useEffect(() => {
    console.log("News data:", news);
    console.log("Is loading:", isLoading);
    console.log("Is mobile:", isMobile);
    console.log("Active index:", activeIndex);
  }, [news, isLoading, isMobile, activeIndex]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (!news || news.length === 0) return;
    
    const container = event.currentTarget;
    const scrollPosition = container.scrollTop;
    const itemHeight = container.clientHeight;
    
    // Calculate which news item should be active based on scroll position
    const itemsPerScreen = isMobile ? 1 : 1; // Set to 1 for consistent behavior
    const screenHeight = itemHeight / itemsPerScreen;
    
    const newIndex = Math.floor(scrollPosition / screenHeight);
    
    if (newIndex !== activeIndex && news && newIndex >= 0 && newIndex < news.length) {
      setPreviousIndex(activeIndex);
      setActiveIndex(newIndex);
    }
  };

  // Handle scroll indicator click
  const handleIndicatorClick = (index: number) => {
    const element = document.getElementById(`news-item-${index}`);
    element?.scrollIntoView({ behavior: 'smooth' });
    setActiveIndex(index);
  };

  // Loading state
  if (isLoading) {
    return <NewsLoadingState />;
  }

  // Error state
  if (error) {
    return <NewsErrorState error={error} />;
  }

  // Empty state
  if (!news || news.length === 0) {
    return <NewsEmptyState navigate={navigate} />;
  }

  // All news items should be visible regardless of device type
  // Each item takes full height on desktop, full height on mobile too
  const itemHeight = 'h-screen';
  
  return (
    <div className="h-screen w-full relative overflow-hidden">
      <div 
        className="h-full w-full overflow-y-auto scroll-smooth scrollbar-hide snap-y snap-mandatory" 
        onScroll={handleScroll}
        ref={scrollContainerRef}
        data-loaded={isLoaded}
      >
        {news && news.length > 0 ? (
          <div className="flex flex-col">
            {news.map((newsItem, index) => (
              <div 
                key={newsItem.id} 
                className={`${itemHeight} w-full flex-shrink-0 snap-start`}
                id={`news-item-${index}`}
              >
                <NewsCard 
                  news={newsItem} 
                  isActive={true} // Always set to true to ensure visibility on mobile
                  isMobile={isMobile}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-lg text-gray-500">No news available</p>
          </div>
        )}
      </div>
      
      {/* Scroll indicator - only show on desktop */}
      {!isMobile && news && news.length > 0 && (
        <NewsScrollIndicator 
          total={news.length} 
          activeIndex={activeIndex}
          onIndicatorClick={handleIndicatorClick}
        />
      )}
    </div>
  );
};

export default NewsFeed;
