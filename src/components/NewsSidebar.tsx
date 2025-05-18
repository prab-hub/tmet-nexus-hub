
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
import { Smartphone, Radio, Film, Laptop, TrendingUp } from "lucide-react";

const categories = [
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
                  <SidebarMenuButton>
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
