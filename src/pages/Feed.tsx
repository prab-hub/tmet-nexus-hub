
import React, { useState, useEffect } from "react";
import NewsFeed from "../components/NewsFeed";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const Feed = () => {
  const location = useLocation();
  const navigate = useNavigate();
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
      
      // Clear the state to prevent showing the toast again on refresh
      window.history.replaceState({}, document.title);
    }
    
    // Clear any openComments parameter from the URL when returning to feed
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.has("openComments")) {
      searchParams.delete("openComments");
      navigate({
        pathname: location.pathname,
        search: searchParams.toString()
      }, { replace: true });
    }
  }, [location, toast, showToast, navigate]);

  // Force component remounting when returning from article detail
  useEffect(() => {
    return () => {
      // Clean up function runs when component unmounts
      setShowToast(false);
    };
  }, []);

  return (
    <div className="w-full h-full">
      <NewsFeed />
    </div>
  );
};

export default Feed;
