
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import type { Database } from "@/integrations/supabase/types";

type NewsTables = Database["public"]["Tables"]["news"];
type NewsInsert = NewsTables["Insert"];

export async function insertSampleNews() {
  try {
    const sampleNews: NewsInsert[] = [
      // Tech News
      {
        title: 'Apple Unveils New M3 MacBook Pro With Enhanced Performance',
        metadata: {
          author: "John Doe",
          editor: "Jane Smith"
        },
        summary: 'Apple has announced its new M3 chip MacBook Pro with significant performance improvements over previous models.',
        content: 'Today, Apple unveiled its latest MacBook Pro featuring the new M3 chip. The device promises up to 40% faster performance compared to the previous M2 models and improved battery life. According to Apple CEO Tim Cook, "This is the most powerful MacBook we have ever created."',
        categories: ['technology'],
        tags: ['product launch', 'new tech'],
        news_date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
        source: 'TechCrunch',
        source_image_url: 'https://placehold.co/100/808080/FFF?text=TC',
        image_url: 'https://placehold.co/1200x800/ddd/FFF?text=MacBook+Pro+M3'
      },
      // Telecom News
      {
        title: 'Verizon Expands 5G Network to Rural Communities',
        metadata: {
          author: "Sarah Johnson",
          location: "Multiple US States"
        },
        summary: 'Verizon has announced a major expansion of its 5G network to previously underserved rural communities across the United States.',
        content: 'Verizon Communications announced today that it will expand its 5G Ultra Wideband network to cover an additional 5 million people in rural communities by the end of the year. This expansion is part of a $8.5 billion investment to bridge the digital divide. "Connectivity should be available to everyone, regardless of where they live," said Verizon CEO.',
        categories: ['telecom'],
        tags: ['new tech'],
        news_date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
        source: 'Wall Street Journal',
        source_image_url: 'https://placehold.co/100/000/FFF?text=WSJ',
        image_url: 'https://placehold.co/1200x800/99ccff/000?text=5G+Network'
      },
      // Media News
      {
        title: 'Netflix Acquires Indie Film Studio for $500 Million',
        metadata: {
          author: "Robert Anderson",
          deal_size: "$500 million"
        },
        summary: 'Netflix has acquired independent film studio Dreamlight Pictures in a move to boost its original content production capabilities.',
        content: 'In one of the biggest deals of the year for the entertainment industry, Netflix has acquired independent studio Dreamlight Pictures for $500 million. The acquisition will add several award-winning directors and a library of upcoming scripts to Netflix\'s production pipeline. Industry analysts see this as a strategic move to compete with Disney+ and other streaming services.',
        categories: ['media', 'entertainment'],
        tags: ['M&A'],
        news_date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
        source: 'Variety',
        source_image_url: 'https://placehold.co/100/9900cc/FFF?text=V',
        image_url: 'https://placehold.co/1200x800/673ab7/FFF?text=Netflix+Acquisition'
      },
      // Entertainment News
      {
        title: 'HBO\'s New Fantasy Series Breaks Viewership Records',
        metadata: {
          author: "Lisa Chen",
          viewers_premiere: "15.2 million"
        },
        summary: 'HBO\'s latest fantasy series "Chronicles of Eldoria" has broken all premiere viewership records for the network.',
        content: 'HBO\'s new fantasy epic "Chronicles of Eldoria" has smashed viewership records with over 15 million viewers tuning in for the series premiere. The show, based on bestselling novels, has been in development for five years with a reported budget of $20 million per episode. Critics are calling it "the next Game of Thrones" with its complex characters and stunning visual effects.',
        categories: ['entertainment'],
        tags: ['product launch'],
        news_date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
        source: 'Entertainment Weekly',
        source_image_url: 'https://placehold.co/100/ff3333/FFF?text=EW',
        image_url: 'https://placehold.co/1200x800/e91e63/FFF?text=HBO+Fantasy+Series'
      },
      // Trending Tech
      {
        title: 'Electric Vehicle Startup Raises $2 Billion in Funding Round',
        metadata: {
          author: "Michael Lee",
          lead_investor: "Sequoia Capital"
        },
        summary: 'Revolutionary electric vehicle startup GreenDrive has secured $2 billion in Series C funding to accelerate production.',
        content: 'GreenDrive, the electric vehicle startup known for its innovative battery technology, has raised $2 billion in a Series C funding round led by Sequoia Capital with participation from several other venture firms. The company plans to use the funds to complete development of its manufacturing facility and begin mass production of its flagship SUV model. GreenDrive\'s proprietary battery technology claims to offer 50% more range than current market leaders.',
        categories: ['technology', 'trending'],
        tags: ['funding'],
        news_date: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(),
        source: 'Bloomberg',
        source_image_url: 'https://placehold.co/100/003366/FFF?text=BB',
        image_url: 'https://placehold.co/1200x800/4caf50/FFF?text=EV+Funding'
      },
      // Telecom Regulation
      {
        title: 'FCC Announces New Regulations for Telecom Providers',
        metadata: {
          author: "David Wilson",
          policy_number: "FCC-2023-42"
        },
        summary: 'The Federal Communications Commission has announced new regulatory framework for telecommunications companies regarding data privacy and network neutrality.',
        content: 'The FCC revealed a comprehensive new regulatory framework today that will require telecom providers to implement stronger data protection measures and adhere to stricter network neutrality guidelines. The regulations, which will take effect in six months, come after a year-long investigation into industry practices. Consumer advocacy groups have praised the move, while industry representatives express concerns about implementation costs.',
        categories: ['telecom'],
        tags: ['regulation'],
        news_date: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
        source: 'Reuters',
        source_image_url: 'https://placehold.co/100/0099cc/FFF?text=RT',
        image_url: 'https://placehold.co/1200x800/2196f3/FFF?text=FCC+Regulations'
      },
      // Executive Interview
      {
        title: 'Interview: Google CEO Discusses AI Strategy and Future Vision',
        metadata: {
          author: "Jennifer Adams",
          interview_location: "Mountain View, CA"
        },
        summary: 'In an exclusive interview, Google CEO shares insights on the company\'s artificial intelligence roadmap and vision for the next decade.',
        content: 'In a rare extended interview, Google\'s CEO discussed the company\'s ambitious plans for artificial intelligence integration across all its products. "AI is not just a feature, it\'s the future foundation of everything we build," the CEO explained. The conversation covered ethical considerations, competition with other tech giants, and how Google plans to maintain its leadership in the rapidly evolving AI landscape while addressing privacy concerns.',
        categories: ['technology', 'media'],
        tags: ['interview'],
        news_date: new Date(new Date().setDate(new Date().getDate() - 6)).toISOString(),
        source: 'Tech Insider',
        source_image_url: 'https://placehold.co/100/ff9900/FFF?text=TI',
        image_url: 'https://placehold.co/1200x800/607d8b/FFF?text=Google+CEO+Interview'
      },
      // Opinion Piece
      {
        title: 'Opinion: The Future of Media Is Interactive and Personalized',
        metadata: {
          author: "Thomas Grant",
          author_title: "Media Analyst"
        },
        summary: 'Industry expert shares perspective on how interactive and personalized content will reshape media consumption in the coming years.',
        content: 'The traditional one-size-fits-all approach to media content is rapidly becoming obsolete. As we move into an era of advanced AI and improved data analytics, we\'re seeing the emergence of truly personalized media experiences tailored to individual preferences and behaviors. This shift will fundamentally transform how content is created, distributed, and monetized across all platforms from news websites to streaming services.',
        categories: ['media'],
        tags: ['opinion'],
        news_date: new Date(new Date().setDate(new Date().getDate() - 8)).toISOString(),
        source: 'Columbia Journalism Review',
        source_image_url: 'https://placehold.co/100/000066/FFF?text=CJR',
        image_url: 'https://placehold.co/1200x800/9c27b0/FFF?text=Future+of+Media'
      }
    ];

    const { error } = await supabase
      .from('news')
      .insert(sampleNews);

    if (error) {
      console.error("Error inserting sample news:", error);
      toast({
        title: "Error",
        description: "Failed to insert sample news data: " + error.message,
        variant: "destructive"
      });
      return false;
    }

    toast({
      title: "Success",
      description: "Sample news data has been inserted",
    });
    return true;
  } catch (error) {
    console.error("Unexpected error inserting sample news:", error);
    toast({
      title: "Error",
      description: "An unexpected error occurred",
      variant: "destructive"
    });
    return false;
  }
}
