
import React from "react";
import NewsFeed from "../components/NewsFeed";

const Feed = () => {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <div className="flex-1">
        <NewsFeed />
      </div>
    </div>
  );
};

export default Feed;
