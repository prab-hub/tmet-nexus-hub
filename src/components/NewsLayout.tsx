
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import NewsSidebar from "./NewsSidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "../services/authService";
import { useNavigate } from "react-router-dom";
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

interface NewsLayoutProps {
  children: React.ReactNode;
}

const NewsLayout = ({ children }: NewsLayoutProps) => {
  const { user, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
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
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <NewsSidebar />
        <main className="flex-1 overflow-hidden relative">
          {/* Company Logo - Add to top left */}
          <div className="absolute top-4 left-4 z-10 flex items-center">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">TMET Hub</span>
            </div>
          </div>
          
          {/* Login/Profile Button - Already positioned at top right */}
          <div className="absolute top-4 right-4 z-10">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="rounded-full bg-black/30 backdrop-blur-sm border border-white/10 text-white"
                  >
                    <Avatar className="h-8 w-8">
                      {userProfile?.avatar_url ? (
                        <AvatarImage src={userProfile.avatar_url} />
                      ) : (
                        <AvatarFallback className="bg-transparent text-white text-sm">
                          {getInitials(user?.email, userProfile?.username)}
                        </AvatarFallback>
                      )}
                    </Avatar>
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
                variant="ghost" 
                size="icon"
                onClick={handleLogin}
                className="rounded-full bg-black/30 backdrop-blur-sm border border-white/10 text-white"
              >
                <LogIn className="h-5 w-5" />
              </Button>
            )}
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default NewsLayout;
