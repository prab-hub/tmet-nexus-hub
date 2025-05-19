
import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../services/authService";
import { useNavigate, useLocation } from "react-router-dom";
import { LogIn, LogOut, User, Shield } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import type { NewsCategory } from "../services/newsService";

interface NewsLayoutProps {
  children: React.ReactNode;
}

const categories: { label: string; value: NewsCategory | "all" }[] = [
  { label: "All News", value: "all" },
  { label: "Telecom", value: "telecom" },
  { label: "Media", value: "media" },
  { label: "Entertainment", value: "entertainment" },
  { label: "Technology", value: "technology" },
  { label: "Trending", value: "trending" },
];

const NewsLayout = ({ children }: NewsLayoutProps) => {
  const { user, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentCategory = searchParams.get("category") || "all";
  
  const [userProfile, setUserProfile] = React.useState<{username?: string, avatar_url?: string} | null>(null);
  
  React.useEffect(() => {
    if (user) {
      fetchUserProfile(user.id);
    }
  }, [user]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }
      
      if (data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    }
  };
  
  const handleLogin = () => {
    navigate("/auth", { state: { from: location.pathname + location.search } });
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
      setUserProfile(null);
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };
  
  const goToProfile = () => {
    navigate("/profile");
  };
  
  const getInitials = (email?: string, username?: string) => {
    if (username) {
      return username.substring(0, 2).toUpperCase();
    }
    if (!email) return "U";
    return email.substring(0, 2).toUpperCase();
  };

  const handleCategoryChange = (category: string) => {
    navigate(`/?category=${category}`);
  };
  
  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Fixed header with all elements integrated */}
      <header className="fixed top-0 left-0 right-0 h-16 z-[9999] bg-black border-b border-gray-800 shadow-lg">
        <div className="container mx-auto h-full flex items-center justify-between px-4">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate("/")}
          >
            <Shield className="h-8 w-8 text-white" />
            <span className="font-bold text-xl text-white hidden sm:inline">TMET Hub</span>
          </div>

          {/* Categories - center aligned */}
          <div className="flex-1 max-w-3xl mx-4 overflow-x-auto no-scrollbar">
            <div className="flex space-x-1 px-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  className={`px-3 py-2 text-sm whitespace-nowrap transition-colors hover:bg-white/10 rounded-md
                    ${currentCategory === category.value ? "bg-white/20 font-medium text-white" : "text-white/70"}`}
                  onClick={() => handleCategoryChange(category.value)}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Auth Controls */}
          <div>
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-white/20 border-white/40 text-white hover:bg-white/30 hover:border-white/60"
                  >
                    <Avatar className="h-6 w-6 mr-2 ring-2 ring-white">
                      {userProfile?.avatar_url ? (
                        <AvatarImage src={userProfile.avatar_url} />
                      ) : (
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {getInitials(user?.email, userProfile?.username)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="hidden sm:inline">Profile</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{userProfile?.username || user?.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={goToProfile}>
                    <User className="h-4 w-4 mr-2" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogin}
                className="bg-white/20 border-white/40 text-white hover:bg-white/30 hover:border-white/60 font-semibold"
              >
                <LogIn className="h-4 w-4 mr-2" /> <span className="hidden sm:inline">Sign In</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area - with proper padding for fixed header */}
      <main className="flex-1 pt-16">
        {children}
      </main>
    </div>
  );
};

export default NewsLayout;
