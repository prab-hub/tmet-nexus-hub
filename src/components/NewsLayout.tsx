
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
          {/* Fixed Header with Logo and Auth Buttons */}
          <div className="fixed top-0 left-0 right-0 h-16 z-50 bg-black/30 backdrop-blur-md flex justify-between items-center px-4 md:px-6 shadow-md">
            {/* Company Logo */}
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg text-white">TMET Hub</span>
            </div>
            
            {/* Login/Profile Button */}
            <div>
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white"
                    >
                      <Avatar className="h-8 w-8">
                        {userProfile?.avatar_url ? (
                          <AvatarImage src={userProfile.avatar_url} />
                        ) : (
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
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
                  variant="outline" 
                  size="sm"
                  onClick={handleLogin}
                  className="bg-black/50 border-white/10 text-white hover:bg-white/10 hover:text-white"
                >
                  <LogIn className="h-4 w-4 mr-2" /> Sign In
                </Button>
              )}
            </div>
          </div>
          
          {/* Add padding to account for the fixed header */}
          <div className="pt-16">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default NewsLayout;
