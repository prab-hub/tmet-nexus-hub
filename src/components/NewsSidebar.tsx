
import React from "react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Smartphone, Radio, Film, Laptop, TrendingUp, Sparkles } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import type { NewsCategory } from "../services/newsService";

const categories: { title: string; icon: React.ElementType; id: NewsCategory | 'all' }[] = [
  {
    title: "All News",
    icon: Sparkles,
    id: "all"
  },
  {
    title: "Telecom",
    icon: Smartphone,
    id: "telecom"
  },
  {
    title: "Media",
    icon: Radio,
    id: "media"
  },
  {
    title: "Entertainment",
    icon: Film,
    id: "entertainment"
  },
  {
    title: "Technology",
    icon: Laptop,
    id: "technology"
  },
  {
    title: "Trending",
    icon: TrendingUp,
    id: "trending"
  },
];

const NewsSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeCategory = searchParams.get("category") || "all";

  const handleCategoryClick = (categoryId: string) => {
    // Navigate to same route but with category query param
    navigate(`/?category=${categoryId}`);
  };

  return (
    <Sidebar>
      <div className="pt-4 px-4">
        <SidebarTrigger className="mb-4" />
        <h1 className="text-xl font-bold mb-2">TMET News</h1>
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Categories</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {categories.map((category) => (
                <SidebarMenuItem key={category.id}>
                  <SidebarMenuButton 
                    isActive={activeCategory === category.id}
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <category.icon />
                    <span>{category.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default NewsSidebar;
