
import React from "react";
import NewsLayout from "../components/NewsLayout";
import NewsFeed from "../components/NewsFeed";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { useLocation, useNavigate } from "react-router-dom";
import { useIsMobile } from "../hooks/use-mobile";
import type { NewsCategory } from "../services/newsService";
import { cn } from "@/lib/utils";

const categories: { label: string; value: NewsCategory | "all" }[] = [
  { label: "All News", value: "all" },
  { label: "Telecom", value: "telecom" },
  { label: "Media", value: "media" },
  { label: "Entertainment", value: "entertainment" },
  { label: "Technology", value: "technology" },
  { label: "Trending", value: "trending" },
];

const Feed = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const currentCategory = searchParams.get("category") || "all";
  const isMobile = useIsMobile();
  
  const handleCategoryChange = (category: string) => {
    navigate(`/?category=${category}`);
  };

  return (
    <NewsLayout>
      {/* Mobile category selector */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-20 px-4 pt-4 pb-2 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
          <Select 
            value={currentCategory} 
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-full bg-black/50 border-white/20 text-white">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {/* Desktop category selector */}
      {!isMobile && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-20 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
          <NavigationMenu>
            <NavigationMenuList>
              {categories.map((category) => (
                <NavigationMenuItem key={category.value}>
                  <NavigationMenuLink
                    className={cn(
                      "px-4 py-2 rounded-full text-sm transition-colors hover:bg-white/10",
                      currentCategory === category.value ? "bg-white/20 font-medium" : "text-white/70"
                    )}
                    onClick={() => handleCategoryChange(category.value)}
                  >
                    {category.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      )}
      
      <NewsFeed />
    </NewsLayout>
  );
};

export default Feed;
