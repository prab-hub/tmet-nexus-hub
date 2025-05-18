
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "@/components/ui/use-toast";

type NewsInsert = Database['public']['Tables']['news']['Insert'];

export async function insertSampleNews() {
  try {
    // First check if data already exists
    const { count, error: countError } = await supabase
      .from('news')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      throw countError;
    }
    
    if (count && count > 0) {
      toast({
        title: "Data Already Exists",
        description: "Sample news data has already been inserted. View it in the news feed.",
      });
      return true;
    }
    
    const sampleNews: NewsInsert[] = [
      // Technology News
      {
        title: "Apple Unveils Next-Gen AI Features for iPhone",
        summary: "Apple has introduced a suite of advanced AI features for its iPhone lineup, setting a new standard for mobile intelligence.",
        content: "<p>Apple has unveiled its next-generation AI features for iPhone at its annual developer conference. The new suite of tools, called Apple Intelligence, will transform how users interact with their devices.</p><p>The AI capabilities include advanced photo editing, smart composition for emails and messages, and contextual awareness for Siri. Apple emphasized its focus on privacy, noting that most processing happens on-device rather than in the cloud.</p><p>Analysts say this move puts Apple in direct competition with Google and Microsoft in the AI space, though Apple's approach differs by emphasizing on-device processing and privacy.</p><p>The features will be available with iOS 19, expected to launch this fall.</p>",
        source: "TechCrunch",
        source_image_url: "https://placehold.co/50?text=TC",
        image_url: "https://placehold.co/1200x800?text=Apple+AI",
        categories: ["technology"],
        tags: ["product launch", "new tech"],
        news_date: new Date().toISOString(),
        likes_count: 245,
        comments_count: 58,
        shares_count: 120
      },
      // Telecom News
      {
        title: "Verizon Expands 5G Coverage to Rural Communities",
        summary: "Verizon has announced plans to expand its 5G network to cover previously underserved rural areas across the United States.",
        content: "<p>Verizon has unveiled an ambitious new initiative to expand its 5G network into rural communities across the United States. The program, dubbed \"5G for All,\" aims to bridge the digital divide by bringing high-speed connectivity to areas traditionally underserved by major telecommunications providers.</p><p>The company plans to install over 10,000 new 5G towers in rural locations over the next three years, with the first phase focusing on agricultural communities where improved connectivity can enhance farming operations through smart agriculture technology.</p><p>\"This expansion represents our commitment to ensuring all Americans have access to cutting-edge connectivity, regardless of where they live,\" said Verizon CEO in a statement. The initiative has been praised by rural advocacy groups, though some analysts question the economic viability of such extensive rural coverage.</p><p>The expansion will begin next month, with the first installations planned for rural communities in Iowa, Nebraska, and Montana.</p>",
        source: "Wall Street Journal",
        source_image_url: "https://placehold.co/50?text=WSJ",
        image_url: "https://placehold.co/1200x800?text=5G+Rural",
        categories: ["telecom"],
        tags: ["new tech"],
        news_date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        likes_count: 129,
        comments_count: 34,
        shares_count: 67
      },
      // Media News
      {
        title: "Netflix Secures Exclusive Streaming Rights for Major Film Festival Winners",
        summary: "Netflix has outbid competitors to secure exclusive streaming rights for award-winning films from major international film festivals.",
        content: "<p>In a move that further solidifies its position in the film industry, Netflix has secured exclusive streaming rights for a slate of award-winning films from major international film festivals, including Cannes, Venice, and Sundance.</p><p>The multi-year deal, reportedly worth over $300 million, gives Netflix first access to stream films that receive top honors at these prestigious festivals, often considered indicators of future Oscar contenders.</p><p>\"This partnership allows us to bring critically acclaimed cinema directly to our subscribers while supporting the art of filmmaking,\" said Netflix's Chief Content Officer. The agreement has been met with mixed reactions from traditional cinema chains, who worry about further erosion of theatrical exclusivity windows.</p><p>Industry analysts note that this represents another significant shift in how premium content reaches audiences, with streaming platforms increasingly becoming primary destinations for high-quality films rather than secondary distribution channels.</p><p>The first films under this new agreement will begin streaming on Netflix in October.</p>",
        source: "Variety",
        source_image_url: "https://placehold.co/50?text=Var",
        image_url: "https://placehold.co/1200x800?text=Netflix+Films",
        categories: ["media"],
        tags: ["M&A"],
        news_date: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
        likes_count: 315,
        comments_count: 89,
        shares_count: 145
      },
      // Entertainment News
      {
        title: "Disney Announces New Star Wars Trilogy Set in Old Republic Era",
        summary: "Disney and Lucasfilm have revealed plans for a new Star Wars trilogy that will explore the Old Republic era, thousands of years before the Skywalker saga.",
        content: "<p>Disney and Lucasfilm have officially announced a new Star Wars trilogy that will take fans thousands of years into the past to explore the Old Republic era, a time period previously featured in popular video games and books but never on the big screen.</p><p>The trilogy will be helmed by a team of directors rather than a single creative vision, with each director responsible for one film in the series. While the full creative team has not been announced, sources confirm that several high-profile directors with experience in both blockbusters and critically acclaimed smaller films are attached to the project.</p><p>\"The Old Republic represents one of the richest and most beloved periods in Star Wars lore,\" said Lucasfilm president in the announcement. \"We're excited to bring these stories to life for a new generation while honoring the elements that fans have loved for decades.\"</p><p>The first film in the trilogy is scheduled for release in December 2025, with subsequent films following in 2027 and 2029. Production is expected to begin early next year.</p>",
        source: "Hollywood Reporter",
        source_image_url: "https://placehold.co/50?text=HR",
        image_url: "https://placehold.co/1200x800?text=Star+Wars",
        categories: ["entertainment"],
        tags: ["product launch"],
        news_date: new Date(Date.now() - 3 * 86400000).toISOString(), // 3 days ago
        likes_count: 512,
        comments_count: 203,
        shares_count: 287
      },
      // Trending News
      {
        title: "Tech Giants Form AI Ethics Coalition Amid Regulatory Scrutiny",
        summary: "Leading technology companies have formed a coalition to establish common ethical standards for artificial intelligence development and deployment.",
        content: "<p>Seven of the world's largest technology companies have announced the formation of the Global AI Ethics Coalition (GAIEC), a joint initiative aimed at establishing common ethical standards and best practices for the development and deployment of artificial intelligence systems.</p><p>The coalition, which includes Apple, Microsoft, Google, Amazon, Meta, IBM, and NVIDIA, comes amid increasing regulatory scrutiny of AI technologies around the world. The group has committed to a set of shared principles including transparency in AI systems, accountability for algorithmic decisions, and ongoing monitoring for unintended consequences or biases.</p><p>\"As leaders in AI development, we recognize our responsibility to ensure these powerful technologies benefit humanity and avoid potential harms,\" read the joint statement released by the coalition. The group plans to work with policymakers, academics, and civil society organizations to develop industry-wide standards that could inform future regulation.</p><p>The formation of this coalition follows several high-profile incidents involving AI systems that have raised public concerns, including facial recognition misidentifications and algorithmic discrimination cases.</p><p>Critics have expressed skepticism about the industry's ability to self-regulate, while others see this as a positive step toward responsible AI development. The coalition plans to release its first set of detailed guidelines by the end of the year.</p>",
        source: "Reuters",
        source_image_url: "https://placehold.co/50?text=R",
        image_url: "https://placehold.co/1200x800?text=AI+Ethics",
        categories: ["technology", "trending"],
        tags: ["regulation"],
        news_date: new Date(Date.now() - 1 * 86400000).toISOString(), // 1 day ago
        likes_count: 487,
        comments_count: 143,
        shares_count: 256
      }
    ];

    // Insert the news data in batches to avoid potential size limitations
    for (let i = 0; i < sampleNews.length; i += 2) {
      const batch = sampleNews.slice(i, i + 2);
      const { error: insertError } = await supabase
        .from('news')
        .insert(batch);
      
      if (insertError) {
        console.error(`Error inserting batch ${i/2 + 1}:`, insertError);
        throw insertError;
      }
    }
    
    // Create test profile users (this will help with testing user interactions)
    const testProfiles = [
      {
        id: '11111111-1111-1111-1111-111111111111', 
        username: 'techfan', 
        full_name: 'Alex Johnson', 
        avatar_url: 'https://placehold.co/150/87CEEB/FFF?text=AJ'
      },
      {
        id: '22222222-2222-2222-2222-222222222222', 
        username: 'mediaexpert', 
        full_name: 'Jamie Smith', 
        avatar_url: 'https://placehold.co/150/FFB6C1/FFF?text=JS'
      },
      {
        id: '33333333-3333-3333-3333-333333333333', 
        username: 'newsjunkie', 
        full_name: 'Sam Wilson', 
        avatar_url: 'https://placehold.co/150/98FB98/FFF?text=SW'
      }
    ];
    
    const { error: profilesError } = await supabase
      .from('profiles')
      .upsert(testProfiles, { onConflict: 'id' });
    
    if (profilesError) {
      console.error("Error inserting sample profiles:", profilesError);
      // Continue with other inserts - profiles aren't critical
    }

    toast({
      title: "Success",
      description: "Sample news data has been inserted successfully!",
      duration: 5000,
    });
    
    return true;
  } catch (error: any) {
    console.error("Error in insertSampleNews:", error);
    toast({
      title: "Error",
      description: `Failed to insert sample data: ${error.message || error}`,
      variant: "destructive",
      duration: 5000,
    });
    return false;
  }
}
