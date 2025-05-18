
import React from "react";
import { useIsMobile } from "../../hooks/use-mobile";

interface NewsScrollIndicatorProps {
  total: number;
  activeIndex: number;
  onIndicatorClick: (index: number) => void;
}

const NewsScrollIndicator = ({ 
  total, 
  activeIndex, 
  onIndicatorClick 
}: NewsScrollIndicatorProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`absolute ${isMobile ? 'right-1 top-1/2' : 'right-2 top-1/2'} -translate-y-1/2 flex flex-col gap-1.5 z-10`}>
      {Array.from({ length: total }).map((_, index) => (
        <div 
          key={index} 
          className={`${
            index === activeIndex 
              ? 'bg-white w-2 h-2' 
              : 'bg-white/30 w-1.5 h-1.5'
          } rounded-full cursor-pointer transition-all duration-300`}
          onClick={() => onIndicatorClick(index)}
        />
      ))}
    </div>
  );
};

export default NewsScrollIndicator;
