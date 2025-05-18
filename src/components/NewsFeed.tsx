
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
  
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (!news || news.length === 0) return;
    
    const container = event.currentTarget;
    const scrollPosition = container.scrollTop;
    const itemHeight = container.clientHeight;
    const itemsPerScreen = isMobile ? 2 : 1; // Show 2 items per screen on mobile
    const screenHeight = itemHeight / itemsPerScreen;
    
    // Calculate which news item should be active based on scroll position
    const newIndex = Math.floor(scrollPosition / screenHeight);
    
    if (newIndex !== activeIndex && news && newIndex >= 0 && newIndex < news.length) {
      setPreviousIndex(activeIndex);
      setActiveIndex(newIndex);
    }
  };

  // Remove the category announcement toast when active news item changes
  // We've completely removed the useEffect that was announcing category changes

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

  // Adjust top padding based on whether we're on mobile (for the selector)
  const topPaddingClass = isMobile ? "pt-20" : "pt-16";
  
  // Calculate height for mobile items (50% of screen)
  const mobileItemHeight = isMobile ? "h-[50vh]" : "h-screen";

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
              className={`${mobileItemHeight} w-full flex-shrink-0 snap-start`}
              id={`news-item-${index}`}
            >
              <NewsCard 
                news={newsItem} 
                isActive={isMobile ? true : index === activeIndex}
                isMobile={isMobile}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Scroll indicator - only show on desktop */}
      {!isMobile && (
        <NewsScrollIndicator 
          total={news?.length || 0} 
          activeIndex={activeIndex}
          onIndicatorClick={handleIndicatorClick}
        />
      )}
    </div>
  );
};

export default NewsFeed;
