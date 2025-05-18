
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";

export type News = Database['public']['Tables']['news']['Row'];
export type NewsCategory = Database['public']['Enums']['news_category'];

export async function fetchNews(category?: NewsCategory | 'all') {
  let query = supabase
    .from('news')
    .select('*')
    .order('news_date', { ascending: false });
  
  if (category && category !== 'all') {
    query = query.contains('categories', [category]);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching news:", error);
    throw error;
  }
  
  return data || [];
}

export async function fetchNewsById(id: string): Promise<News | null> {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error("Error fetching news by ID:", error);
    throw error;
  }
  
  return data;
}

export function useNews(category?: NewsCategory | 'all') {
  return useQuery({
    queryKey: ['news', category],
    queryFn: () => fetchNews(category),
    staleTime: 60 * 1000, // 1 minute
  });
}

export async function likeNews(newsId: string, userId: string) {
  try {
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .match({ news_id: newsId, user_id: userId })
      .single();

    if (existingLike) {
      // User already liked this news, so remove the like
      const { error } = await supabase
        .from('likes')
        .delete()
        .match({ news_id: newsId, user_id: userId });
      
      if (error) throw error;
      return false; // Indicates like was removed
    } else {
      // User hasn't liked this news, so add a like
      const { error } = await supabase
        .from('likes')
        .insert({ news_id: newsId, user_id: userId });
      
      if (error) throw error;
      return true; // Indicates like was added
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error;
  }
}

export async function bookmarkNews(newsId: string, userId: string) {
  try {
    const { data: existingBookmark } = await supabase
      .from('bookmarks')
      .select('id')
      .match({ news_id: newsId, user_id: userId })
      .single();

    if (existingBookmark) {
      // User already bookmarked this news, so remove the bookmark
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .match({ news_id: newsId, user_id: userId });
      
      if (error) throw error;
      return false; // Indicates bookmark was removed
    } else {
      // User hasn't bookmarked this news, so add a bookmark
      const { error } = await supabase
        .from('bookmarks')
        .insert({ news_id: newsId, user_id: userId });
      
      if (error) throw error;
      return true; // Indicates bookmark was added
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    throw error;
  }
}

export async function shareNews(newsId: string, userId?: string, platform?: string) {
  try {
    const { error } = await supabase
      .from('shares')
      .insert({ 
        news_id: newsId, 
        user_id: userId || null,
        platform
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error sharing news:", error);
    throw error;
  }
}
