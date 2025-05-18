
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import NewsSidebar from "./NewsSidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { LogIn, LogOut, User } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NewsLayoutProps {
  children: React.ReactNode;
}

const NewsLayout = ({ children }: NewsLayoutProps) => {
  const { user, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const handleLogin = () => {
    navigate("/auth", { state: { from: location.pathname + location.search } });
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
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
  
  const getInitials = (email?: string) => {
    if (!email) return "U";
    return email.substring(0, 2).toUpperCase();
  };
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <NewsSidebar />
        <main className="flex-1 overflow-hidden relative">
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
                      <AvatarFallback className="bg-transparent text-white text-sm">
                        {getInitials(user?.email)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
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
