
import React, { useState, useEffect } from "react";
import NewsFeed from "../components/NewsFeed";
import { useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const Feed = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [showToast, setShowToast] = useState(false);
  
  useEffect(() => {
    // Check for state passed from article detail after comment/share/like
    if (location.state?.message && !showToast) {
      toast({
        title: location.state.message.title,
        description: location.state.message.description,
        duration: 3000,
      });
      setShowToast(true);
    }
  }, [location, toast, showToast]);

  return (
    <div className="w-full h-full">
      <NewsFeed />
    </div>
  );
};

export default Feed;
