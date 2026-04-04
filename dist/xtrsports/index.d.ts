

declare module '@xtrstudios/sports' {
  export interface SportsEvent {
    id: string;
    title: string;
    category: string;
    startTime: Date;
    endTime: Date;
    status: 'upcoming' | 'live' | 'completed';
    participants: string[];
    score?: string;
  }

  export interface SportsHighlight {
    id: string;
    eventId: string;
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    duration: number;
    timestamp: Date;
  }

  export interface SportsNews {
    id: string;
    title: string;
    content: string;
    author: string;
    publishedAt: Date;
    category: string;
    imageUrl: string;
    tags: string[];
  }

  export interface SportsTeam {
    id: string;
    name: string;
    logo: string;
    league: string;
    stats: {
      wins: number;
      losses: number;
      draws: number;
      points: number;
    };
  }

  export interface SportsConfig {
    apiKey?: string;
    baseURL?: string;
    timeout?: number;
    cacheEnabled?: boolean;
  }

  export class SportsClient {
    constructor(config?: SportsConfig);
    getEvents(category?: string): Promise<SportsEvent[]>;
    getEventById(id: string): Promise<SportsEvent>;
    getLiveEvents(): Promise<SportsEvent[]>;
    getUpcomingEvents(): Promise<SportsEvent[]>;
    

    getHighlights(eventId?: string): Promise<SportsHighlight[]>;
    getHighlightById(id: string): Promise<SportsHighlight>;
    
    // News methods
    getSportsNews(limit?: number): Promise<SportsNews[]>;
    getNewsByCategory(category: string): Promise<SportsNews[]>;
    
    // Team methods
    getTeams(league?: string): Promise<SportsTeam[]>;
    getTeamById(id: string): Promise<SportsTeam>;
    
    // Search
    searchSports(query: string): Promise<Array<SportsEvent | SportsNews>>;
  }

  export const VERSION: string;
  export const DEFAULT_CONFIG: SportsConfig;
}

// Global export for browser usage
export as namespace XtrSportsSDK;
