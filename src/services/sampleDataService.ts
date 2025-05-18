
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
        title: "Netflix Acquires Indie Film Studio for $500 Million",
        summary: "Netflix has acquired independent film studio Dreamlight Pictures in a move to boost its original content production capabilities.",
        content: "<p>In a strategic move to strengthen its position in the competitive streaming market, Netflix has acquired independent film studio Dreamlight Pictures for $500 million. The acquisition will give Netflix exclusive access to Dreamlight's award-winning team of directors and producers, as well as their upcoming slate of projects.</p><p>Dreamlight Pictures, founded in 2010, has gained critical acclaim for producing thought-provoking independent films that have performed well at major film festivals. Their catalog includes three Academy Award-nominated features and numerous indie hits.</p><p>\"This acquisition represents our ongoing commitment to bringing diverse and innovative storytelling to our global audience,\" said Netflix's Chief Content Officer in a statement. \"The team at Dreamlight has consistently created compelling content that resonates with viewers and critics alike.\"</p><p>Industry analysts see this as part of Netflix's broader strategy to secure a steady pipeline of high-quality original content as competition in the streaming space intensifies. The Dreamlight team will remain intact and operate as a semi-autonomous unit within Netflix's broader content creation division.</p>",
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
      },
      // Additional new sample articles
      {
        title: "Gaming Industry Revenue Surpasses Film and Music Combined",
        summary: "New data shows the global gaming industry has generated more revenue than the film and music industries combined for the first time.",
        content: "<p>The gaming industry has reached a historic milestone, generating more revenue than the film and music industries combined for the first time in history. According to a new report by market research firm SuperData, gaming generated over $180 billion globally last year, compared to $100 billion for films and $20 billion for recorded music.</p><p>The explosive growth has been fueled by the pandemic's stay-at-home orders, the rise of mobile gaming, and the increasing mainstream acceptance of gaming as a primary entertainment medium. Industry analysts note that gaming's interactive nature gives it a unique advantage over passive forms of entertainment.</p><p>\"What we're seeing is a fundamental shift in how people choose to spend their entertainment time and dollars,\" said the report's lead analyst. \"Gaming offers something that traditional media cannot: active participation in the story and social connections with other players.\"</p><p>The report also highlights the diversification of the gaming audience, with nearly equal gender distribution and growth across all age demographics. This broader appeal has attracted significant investment, with venture capital funding for gaming startups reaching record levels.</p>",
        source: "Bloomberg",
        source_image_url: "https://placehold.co/50?text=BB",
        image_url: "https://placehold.co/1200x800?text=Gaming+Revenue",
        categories: ["entertainment"],
        tags: ["industry", "gaming"],
        news_date: new Date(Date.now() - 4 * 86400000).toISOString(), // 4 days ago
        likes_count: 378,
        comments_count: 92,
        shares_count: 156
      },
      {
        title: "Major Telecom Companies Agree on New 6G Development Standards",
        summary: "Leading telecom providers have reached an agreement on preliminary standards for 6G technology development, setting the stage for the next generation of wireless connectivity.",
        content: "<p>In a landmark agreement, the world's largest telecommunications companies have established preliminary standards for the development of 6G technology, even as 5G deployment continues worldwide. The agreement, facilitated by the International Telecommunication Union, outlines technical specifications and development timelines for what will become the next generation of wireless connectivity.</p><p>While commercial deployment of 6G remains at least 7-8 years away, the early standardization represents an unprecedented level of industry cooperation. Technical goals include theoretical peak speeds of up to 1 terabit per second, latency measured in microseconds rather than milliseconds, and significantly improved energy efficiency.</p><p>\"By agreeing on these foundations now, we can ensure more coordinated research efforts and ultimately a smoother transition when the technology is ready for deployment,\" said the ITU Secretary-General in a statement.</p><p>The standards emphasize integration with artificial intelligence, support for holographic communications, and advanced sensing capabilities that could allow networks to function as distributed radar systems.</p><p>Analysts note that this early coordination could help avoid the fragmented approaches that initially complicated 5G rollouts in some regions.</p>",
        source: "IEEE Spectrum",
        source_image_url: "https://placehold.co/50?text=IEEE",
        image_url: "https://placehold.co/1200x800?text=6G+Standards",
        categories: ["telecom", "technology"],
        tags: ["new tech", "industry"],
        news_date: new Date(Date.now() - 5 * 86400000).toISOString(), // 5 days ago
        likes_count: 253,
        comments_count: 87,
        shares_count: 119
      },
      {
        title: "Streaming Platforms Facing Increased Regulation in European Markets",
        summary: "European regulators have introduced new content quotas and tax structures for streaming platforms operating within the EU.",
        content: "<p>Streaming giants like Netflix, Amazon Prime, and Disney+ are facing stricter regulations across European markets as the EU implements new directives aimed at supporting local content production and ensuring fair taxation.</p><p>The updated Audiovisual Media Services Directive now requires streaming platforms operating in EU countries to ensure at least 30% of their catalogs consist of European-produced content, up from the previous 20% requirement. Additionally, platforms must contribute a percentage of their in-country revenue to national film funds that support local productions.</p><p>\"These measures are not about protectionism, but about cultural diversity and ensuring that European stories continue to be told in the digital age,\" said the EU Commissioner for Culture. The directive also introduces more stringent age verification requirements and hate speech monitoring obligations.</p><p>Several major streaming services have already announced increased investment in European production facilities. Netflix recently expanded its production hub in Spain, while Amazon has committed to new original content initiatives in France, Germany, and Italy.</p><p>Industry analysts suggest these regulations could lead to further regionalization of streaming content strategies, with platforms potentially developing more localized approaches to different markets rather than pursuing purely global content strategies.</p>",
        source: "Financial Times",
        source_image_url: "https://placehold.co/50?text=FT",
        image_url: "https://placehold.co/1200x800?text=EU+Streaming",
        categories: ["media", "trending"],
        tags: ["regulation", "streaming"],
        news_date: new Date(Date.now() - 6 * 86400000).toISOString(), // 6 days ago
        likes_count: 198,
        comments_count: 76,
        shares_count: 94
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
