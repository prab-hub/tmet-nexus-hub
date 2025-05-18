
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import NewsSidebar from "./NewsSidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { UserCircle, LogIn, LogOut } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface NewsLayoutProps {
  children: React.ReactNode;
}

const NewsLayout = ({ children }: NewsLayoutProps) => {
  const { user, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const handleLogin = () => {
    navigate("/auth");
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
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <NewsSidebar />
        <main className="flex-1 overflow-hidden relative">
          <div className="absolute top-4 right-4 z-10">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="text-white text-right mr-2">
                  <div className="font-medium">{user?.email}</div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleLogout}
                  className="rounded-full bg-black/30 backdrop-blur-sm border border-white/10 text-white"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
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
