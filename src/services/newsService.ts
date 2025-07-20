
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";

export type News = Database['public']['Tables']['news']['Row'];
export type NewsCategory = Database['public']['Enums']['news_category'];

export async function fetchNews(category?: NewsCategory | 'all') {
  let query = supabase
    .from('news')
    .select('*');
  
  if (category && category !== 'all') {
    if (category === 'trending') {
      // For trending, filter by today's date
      const today = new Date().toISOString().split('T')[0];
      query = query.gte('created_at', today + 'T00:00:00.000Z')
                   .lt('created_at', today + 'T23:59:59.999Z');
    } else {
      query = query.contains('categories', [category as NewsCategory]);
    }
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching news:", error);
    throw error;
  }
  
  // Sort by news_date (fallback to created_at) then by created_at
  const sortedData = (data || []).sort((a, b) => {
    const aDate = a.news_date || a.created_at;
    const bDate = b.news_date || b.created_at;
    
    // Primary sort by news_date (or created_at if news_date is null)
    const primarySort = new Date(bDate).getTime() - new Date(aDate).getTime();
    
    if (primarySort !== 0) {
      return primarySort;
    }
    
    // Secondary sort by created_at
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  
  return sortedData;
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

export async function checkUserInteractions(newsId: string, userId: string) {
  try {
    // Check likes
    const { data: likeData, error: likeError } = await supabase
      .from('likes')
      .select('id')
      .eq('news_id', newsId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (likeError) {
      console.error("Error checking likes:", likeError);
    }
    
    // Check bookmarks
    const { data: bookmarkData, error: bookmarkError } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('news_id', newsId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (bookmarkError) {
      console.error("Error checking bookmarks:", bookmarkError);
    }
    
    return {
      liked: !!likeData, 
      bookmarked: !!bookmarkData
    };
  } catch (error) {
    console.error("Error checking user interactions:", error);
    return { liked: false, bookmarked: false };
  }
}

export async function likeNews(newsId: string, userId: string) {
  try {
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .match({ news_id: newsId, user_id: userId })
      .maybeSingle();

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
      .maybeSingle();

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
    // Fix: Set the proper payload structure
    const payload = {
      news_id: newsId,
      user_id: userId || null,
      platform: platform || null
    };

    const { error } = await supabase
      .from('shares')
      .insert(payload);
    
    if (error) {
      console.error("Error sharing news:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error sharing news:", error);
    throw error;
  }
}

// New function to fetch the user's liked news articles
export async function fetchUserLikedNews(userId: string) {
  try {
    const { data, error } = await supabase
      .from('likes')
      .select('news_id')
      .eq('user_id', userId);

    if (error) {
      console.error("Error fetching user likes:", error);
      throw error;
    }

    return data?.map(like => like.news_id) || [];
  } catch (error) {
    console.error("Error in fetchUserLikedNews:", error);
    return [];
  }
}
