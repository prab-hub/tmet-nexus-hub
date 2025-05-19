
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
    <div className="min-h-screen flex flex-col w-full">
      {/* Fixed Header - Ensuring it's always visible */}
      <header className="fixed top-0 left-0 right-0 h-16 z-[9999] bg-black shadow-lg">
        <div className="container mx-auto h-full flex justify-between items-center px-4">
          {/* Logo - Left side */}
          <div className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-white" />
            <span className="font-bold text-xl text-white">TMET Hub</span>
          </div>
          
          {/* Auth Controls - Right side */}
          <div>
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50"
                  >
                    <Avatar className="h-6 w-6 mr-2 ring-1 ring-white">
                      {userProfile?.avatar_url ? (
                        <AvatarImage src={userProfile.avatar_url} />
                      ) : (
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {getInitials(user?.email, userProfile?.username)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span>Profile</span>
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
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <LogIn className="h-4 w-4 mr-2" /> Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area with Sidebar */}
      <div className="flex w-full pt-16">
        <SidebarProvider defaultOpen={true}>
          <div className="flex flex-1">
            <NewsSidebar />
            <main className="flex-1 overflow-hidden">
              {children}
            </main>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
};

export default NewsLayout;
