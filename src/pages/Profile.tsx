
import { useEffect, useState } from "react";
import { useAuth } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Save, User, Heart, Bookmark, MessageSquare, ArrowLeft } from "lucide-react";
import type { News } from "../services/newsService";
import type { CommentType } from "../services/commentService";

type UserProfile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  full_name: string | null;
};

const ProfilePage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [likedArticles, setLikedArticles] = useState<News[]>([]);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<News[]>([]);
  const [userComments, setUserComments] = useState<(CommentType & { news: News })[]>([]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate('/auth', { state: { from: '/profile' } });
    }
  }, [isAuthenticated, loading]);

  useEffect(() => {
    async function loadUserProfile() {
      if (!user) return;
      
      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) throw profileError;
        
        if (profileData) {
          setProfile(profileData);
          setUsername(profileData.username || "");
          setFullName(profileData.full_name || "");
        }

        // Fetch liked articles
        const { data: likes, error: likesError } = await supabase
          .from('likes')
          .select('news_id')
          .eq('user_id', user.id);
        
        if (likesError) throw likesError;
        
        if (likes && likes.length > 0) {
          const newsIds = likes.map(like => like.news_id);
          
          const { data: likedNews, error: likedNewsError } = await supabase
            .from('news')
            .select('*')
            .in('id', newsIds);
          
          if (likedNewsError) throw likedNewsError;
          setLikedArticles(likedNews || []);
        }
        
        // Fetch bookmarked articles
        const { data: bookmarks, error: bookmarksError } = await supabase
          .from('bookmarks')
          .select('news_id')
          .eq('user_id', user.id);
        
        if (bookmarksError) throw bookmarksError;
        
        if (bookmarks && bookmarks.length > 0) {
          const newsIds = bookmarks.map(bookmark => bookmark.news_id);
          
          const { data: bookmarkedNews, error: bookmarkedNewsError } = await supabase
            .from('news')
            .select('*')
            .in('id', newsIds);
          
          if (bookmarkedNewsError) throw bookmarkedNewsError;
          setBookmarkedArticles(bookmarkedNews || []);
        }
        
        // Fetch user comments with associated news articles
        const { data: comments, error: commentsError } = await supabase
          .from('comments')
          .select(`
            *,
            news:news_id(*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (commentsError) throw commentsError;
        
        // Add the profile property to match the CommentType
        const commentsWithProfile = comments ? comments.map(comment => ({
          ...comment,
          profile: null // Add the profile property that's required by CommentType
        })) : [];
        
        setUserComments(commentsWithProfile as (CommentType & { news: News })[]);
        
      } catch (error) {
        console.error("Error loading profile data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadUserProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const updates = {
        username,
        full_name: fullName,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      setEditMode(false);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.substring(0, 2).toUpperCase();
  };
  
  const handleArticleClick = (articleId: string) => {
    navigate(`/article/${articleId}`);
  };

  if (loading && !profile) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)} 
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>
      
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">User Profile</CardTitle>
            {!editMode ? (
              <Button 
                variant="ghost" 
                onClick={() => setEditMode(true)} 
                className="text-gray-500"
              >
                <Pencil className="h-4 w-4 mr-2" /> Edit
              </Button>
            ) : (
              <Button 
                onClick={handleSaveProfile} 
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" /> Save
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="flex flex-col items-center">
              <Avatar className="h-32 w-32 mb-4">
                {profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} />
                ) : (
                  <AvatarFallback className="text-3xl">
                    {profile?.username 
                      ? getInitials(profile.username) 
                      : user?.email 
                        ? getInitials(user.email) 
                        : <User className="h-12 w-12" />}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="text-sm text-gray-500">{user?.email}</div>
            </div>
            
            <div className="flex-1 w-full">
              {editMode ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium mb-1">
                      Username
                    </label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Your username"
                    />
                  </div>
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                      Full Name
                    </label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Username</h3>
                    <p className="text-lg">{profile?.username || "Not set"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                    <p className="text-lg">{profile?.full_name || "Not set"}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="likes" className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="likes" className="flex items-center">
            <Heart className="h-4 w-4 mr-2" /> Likes ({likedArticles.length})
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="flex items-center">
            <Bookmark className="h-4 w-4 mr-2" /> Bookmarks ({bookmarkedArticles.length})
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" /> Comments ({userComments.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="likes">
          {likedArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {likedArticles.map(article => (
                <Card 
                  key={article.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleArticleClick(article.id)}
                >
                  <div className="flex">
                    <div className="w-24 h-24 bg-gray-200 shrink-0">
                      <img 
                        src={article.image_url || 'https://placehold.co/100?text=News'} 
                        alt={article.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/100?text=News";
                        }}
                      />
                    </div>
                    <div className="p-4 flex-1">
                      <h3 className="font-medium text-sm line-clamp-2">{article.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {article.source || 'Unknown Source'}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              You haven't liked any articles yet.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="bookmarks">
          {bookmarkedArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookmarkedArticles.map(article => (
                <Card 
                  key={article.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleArticleClick(article.id)}
                >
                  <div className="flex">
                    <div className="w-24 h-24 bg-gray-200 shrink-0">
                      <img 
                        src={article.image_url || 'https://placehold.co/100?text=News'} 
                        alt={article.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/100?text=News";
                        }}
                      />
                    </div>
                    <div className="p-4 flex-1">
                      <h3 className="font-medium text-sm line-clamp-2">{article.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {article.source || 'Unknown Source'}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              You haven't bookmarked any articles yet.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="comments">
          {userComments.length > 0 ? (
            <div className="space-y-4">
              {userComments.map(commentItem => (
                <Card 
                  key={commentItem.id} 
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="p-4 pb-2">
                    <div 
                      className="font-medium text-sm hover:text-primary cursor-pointer"
                      onClick={() => handleArticleClick(commentItem.news_id)}
                    >
                      {commentItem.news.title}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <p className="text-sm">{commentItem.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(commentItem.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              You haven't commented on any articles yet.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
