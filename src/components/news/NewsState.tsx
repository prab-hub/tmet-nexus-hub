
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface NewsEmptyStateProps {
  navigate: ReturnType<typeof useNavigate>;
}

export const NewsEmptyState = ({ navigate }: NewsEmptyStateProps) => {
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
};

export const NewsLoadingState = () => {
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-2">Loading news...</h2>
      </div>
    </div>
  );
};

export const NewsErrorState = ({ error }: { error: Error }) => {
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-2">Error loading news</h2>
        <p className="text-gray-500">{error.message}</p>
      </div>
    </div>
  );
};
