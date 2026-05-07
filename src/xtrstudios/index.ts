import { HttpClient } from "../lib/http";
import { ENDPOINTS, BASE_URL } from "../lib/constants";
import { Movie, Series, PaginatedResponse, SearchQuery } from "../lib/types";

export interface XtrStudiosInfo {
  name: string;
  version: string;
  description: string;
  contact_email: string;
  website: string;
  social: Record<string, string>;
  supported_regions: string[];
  content_languages: string[];
}

export interface CatalogEntry {
  id: string | number;
  title: string;
  type: "movie" | "series";
  genres: string[];
  year: number;
  rating: number;
  poster: string;
  backdrop?: string;
  featured: boolean;
  new_release: boolean;
  synopsis?: string;
  duration?: number;
}

export interface FeaturedContent {
  hero: CatalogEntry;
  trending: CatalogEntry[];
  new_releases: CatalogEntry[];
  editors_picks: CatalogEntry[];
  genres: GenreSection[];
  recently_added?: CatalogEntry[];
}

export interface GenreSection {
  genre: string;
  items: CatalogEntry[];
  display_name?: string;
  icon?: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  type: "info" | "warning" | "success" | "maintenance";
  published_at: string;
  expires_at?: string;
  url?: string;
  dismissible: boolean;
  is_expired?: boolean;
}

export interface MoviesClient {
  list(options?: { page?: number; limit?: number; genre?: string; sort?: string }): Promise<PaginatedResponse<Movie>>;
  getById(id: string | number): Promise<Movie>;
  getPopular(options?: { page?: number; limit?: number }): Promise<PaginatedResponse<Movie>>;
  getTrending(options?: { page?: number; limit?: number; time_window?: "day" | "week" }): Promise<PaginatedResponse<Movie>>;
  search(query: SearchQuery): Promise<PaginatedResponse<Movie>>;
  getGenres(): Promise<string[]>;
  getByImdbId(imdbId: string): Promise<Movie>;
  getUpcoming(options?: { page?: number; limit?: number }): Promise<PaginatedResponse<Movie>>;
  getRecommendations(id: string | number): Promise<Movie[]>;
}

export interface SearchResult {
  movies: PaginatedResponse<Movie>;
  series: PaginatedResponse<Series>;
  total_results: number;
  query_time_ms: number;
}

export class XtrStudiosClient {
  private readonly http: HttpClient;
  readonly movies: MoviesClient;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTTL: number = 5 * 60 * 1000; // 5 minutes default

  constructor(http: HttpClient) {
    if (!http) {
      throw new Error("HttpClient is required to initialize XtrStudiosClient");
    }
    this.http = http;
    this.movies = this.createMoviesClient();
  }

  private createMoviesClient(): MoviesClient {
    const http = this.http;
    const MOVIE_ENDPOINTS = ENDPOINTS.movies;

    return {
      async list(options = {}) {
        try {
          const cacheKey = `movies_list_${JSON.stringify(options)}`;
          const cached = this.getCached<PaginatedResponse<Movie>>(cacheKey);
          if (cached) return cached;

          const url = http.buildUrl(MOVIE_ENDPOINTS.list, options);
          const response = await http.get<PaginatedResponse<Movie>>(url);
          
          if (!response.data || !Array.isArray(response.data.results)) {
            throw new Error("Invalid response format: expected paginated results");
          }
          
          this.setCached(cacheKey, response.data);
          return response.data;
        } catch (error) {
          console.error("Failed to fetch movie list:", error);
          throw this.wrapError(error, "Unable to retrieve movie list");
        }
      }.bind(this),

      async getById(id) {
        try {
          if (!id) throw new Error("Movie ID is required");
          
          const cacheKey = `movie_${id}`;
          const cached = this.getCached<Movie>(cacheKey);
          if (cached) return cached;

          const path = MOVIE_ENDPOINTS.detail.replace(":id", String(id));
          const url = http.buildUrl(path);
          const response = await http.get<Movie>(url);
          
          if (!response.data) {
            throw new Error(`Movie with ID ${id} not found`);
          }
          
          this.setCached(cacheKey, response.data);
          return response.data;
        } catch (error) {
          console.error(`Failed to fetch movie ${id}:`, error);
          throw this.wrapError(error, `Unable to retrieve movie with ID ${id}`);
        }
      }.bind(this),

      async getPopular(options = {}) {
        try {
          const cacheKey = `movies_popular_${JSON.stringify(options)}`;
          const cached = this.getCached<PaginatedResponse<Movie>>(cacheKey);
          if (cached) return cached;

          const url = http.buildUrl(MOVIE_ENDPOINTS.popular, options);
          const response = await http.get<PaginatedResponse<Movie>>(url);
          
          this.setCached(cacheKey, response.data);
          return response.data;
        } catch (error) {
          console.error("Failed to fetch popular movies:", error);
          throw this.wrapError(error, "Unable to retrieve popular movies");
        }
      }.bind(this),

      async getTrending(options = {}) {
        try {
          const cacheKey = `movies_trending_${JSON.stringify(options)}`;
          const cached = this.getCached<PaginatedResponse<Movie>>(cacheKey);
          if (cached) return cached;

          const url = http.buildUrl(MOVIE_ENDPOINTS.trending, options);
          const response = await http.get<PaginatedResponse<Movie>>(url);
          
          this.setCached(cacheKey, response.data);
          return response.data;
        } catch (error) {
          console.error("Failed to fetch trending movies:", error);
          throw this.wrapError(error, "Unable to retrieve trending movies");
        }
      }.bind(this),

      async search(query) {
        try {
          if (!query.q || query.q.trim() === "") {
            throw new Error("Search query is required");
          }

          const url = http.buildUrl(MOVIE_ENDPOINTS.search, {
            q: query.q,
            page: query.page || 1,
            limit: query.limit || 20,
            ...query.filters,
          });
          
          const response = await http.get<PaginatedResponse<Movie>>(url);
          return response.data;
        } catch (error) {
          console.error(`Failed to search movies with query "${query.q}":`, error);
          throw this.wrapError(error, "Unable to perform movie search");
        }
      }.bind(this),

      async getGenres() {
        try {
          const cacheKey = "movie_genres";
          const cached = this.getCached<string[]>(cacheKey);
          if (cached) return cached;

          const url = http.buildUrl(MOVIE_ENDPOINTS.genres);
          const response = await http.get<string[]>(url);
          
          if (!response.data || !Array.isArray(response.data)) {
            throw new Error("Invalid response format: expected array of genres");
          }
          
          this.setCached(cacheKey, response.data);
          return response.data;
        } catch (error) {
          console.error("Failed to fetch movie genres:", error);
          throw this.wrapError(error, "Unable to retrieve movie genres");
        }
      }.bind(this),

      async getByImdbId(imdbId) {
        try {
          if (!imdbId || imdbId.trim() === "") {
            throw new Error("IMDB ID is required");
          }

          const url = http.buildUrl(MOVIE_ENDPOINTS.list, { imdb_id: imdbId });
          const response = await http.get<PaginatedResponse<Movie>>(url);
          
          if (!response.data.results || response.data.results.length === 0) {
            throw new Error(`Movie with IMDB ID ${imdbId} not found`);
          }
          
          return response.data.results[0];
        } catch (error) {
          console.error(`Failed to fetch movie by IMDB ID ${imdbId}:`, error);
          throw this.wrapError(error, `Unable to retrieve movie with IMDB ID ${imdbId}`);
        }
      }.bind(this),

      async getUpcoming(options = {}) {
        try {
          const cacheKey = `movies_upcoming_${JSON.stringify(options)}`;
          const cached = this.getCached<PaginatedResponse<Movie>>(cacheKey);
          if (cached) return cached;

          const url = http.buildUrl(MOVIE_ENDPOINTS.upcoming, options);
          const response = await http.get<PaginatedResponse<Movie>>(url);
          
          this.setCached(cacheKey, response.data);
          return response.data;
        } catch (error) {
          console.error("Failed to fetch upcoming movies:", error);
          throw this.wrapError(error, "Unable to retrieve upcoming movies");
        }
      }.bind(this),

      async getRecommendations(id) {
        try {
          if (!id) throw new Error("Movie ID is required for recommendations");
          
          const cacheKey = `movie_${id}_recommendations`;
          const cached = this.getCached<Movie[]>(cacheKey);
          if (cached) return cached;

          const url = http.buildUrl(MOVIE_ENDPOINTS.recommendations.replace(":id", String(id)));
          const response = await http.get<Movie[]>(url);
          
          this.setCached(cacheKey, response.data);
          return response.data;
        } catch (error) {
          console.error(`Failed to fetch recommendations for movie ${id}:`, error);
          return []; // Return empty array instead of throwing
        }
      }.bind(this),
    };
  }

  async getInfo(useCache = true): Promise<XtrStudiosInfo> {
    try {
      if (useCache) {
        const cached = this.getCached<XtrStudiosInfo>("studio_info");
        if (cached) return cached;
      }

      const url = this.http.buildUrl(ENDPOINTS.xtrstudios.info);
      const response = await this.http.get<XtrStudiosInfo>(url);
      
      if (!response.data) {
        throw new Error("Invalid response: studio info not found");
      }
      
      this.setCached("studio_info", response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch studio info:", error);
      throw this.wrapError(error, "Unable to retrieve XTR Studios information");
    }
  }

  async getCatalog(
    page = 1,
    limit = 20,
    type?: "movie" | "series",
    options?: { sort?: string; genre?: string }
  ): Promise<PaginatedResponse<CatalogEntry>> {
    try {
      const validPage = Math.max(1, page);
      const validLimit = Math.min(100, Math.max(1, limit));
      
      const queryParams: Record<string, any> = { page: validPage, limit: validLimit };
      if (type) queryParams.type = type;
      if (options?.sort) queryParams.sort = options.sort;
      if (options?.genre) queryParams.genre = options.genre;
      
      const url = this.http.buildUrl(ENDPOINTS.xtrstudios.catalog, queryParams);
      const response = await this.http.get<PaginatedResponse<CatalogEntry>>(url);
      
      if (!response.data || !Array.isArray(response.data.results)) {
        throw new Error("Invalid catalog response format");
      }
      
      return response.data;
    } catch (error) {
      console.error("Failed to fetch catalog:", error);
      throw this.wrapError(error, "Unable to retrieve content catalog");
    }
  }

  async getFeatured(useCache = true): Promise<FeaturedContent> {
    try {
      if (useCache) {
        const cached = this.getCached<FeaturedContent>("featured_content");
        if (cached) return cached;
      }

      const url = this.http.buildUrl(ENDPOINTS.xtrstudios.featured);
      const response = await this.http.get<FeaturedContent>(url);
      
      if (!response.data) {
        throw new Error("Invalid featured content response");
      }
      
      this.setCached("featured_content", response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch featured content:", error);
      // Return default empty structure instead of throwing
      return {
        hero: {} as CatalogEntry,
        trending: [],
        new_releases: [],
        editors_picks: [],
        genres: [],
      };
    }
  }

  async getAnnouncements(includeExpired = false): Promise<Announcement[]> {
    try {
      const url = this.http.buildUrl(ENDPOINTS.xtrstudios.announcements, 
        includeExpired ? { include_expired: true } : undefined
      );
      const response = await this.http.get<Announcement[]>(url);
      
      if (!response.data || !Array.isArray(response.data)) {
        return [];
      }
      
      // Add expired flag to announcements
      const now = new Date();
      return response.data.map(announcement => ({
        ...announcement,
        is_expired: announcement.expires_at ? new Date(announcement.expires_at) < now : false
      }));
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
      return []; // Return empty array on error
    }
  }

  async search(query: SearchQuery): Promise<SearchResult> {
    try {
      if (!query.q || query.q.trim() === "") {
        throw new Error("Search query is required");
      }

      const startTime = Date.now();
      
      const url = this.http.buildUrl(ENDPOINTS.search, {
        q: query.q,
        page: query.page || 1,
        limit: query.limit || 20,
        ...query.filters,
      });
      
      const response = await this.http.get<{
        movies: PaginatedResponse<Movie>;
        series: PaginatedResponse<Series>;
      }>(url);
      
      const totalResults = (response.data.movies?.total || 0) + (response.data.series?.total || 0);
      
      return {
        ...response.data,
        total_results: totalResults,
        query_time_ms: Date.now() - startTime,
      };
    } catch (error) {
      console.error(`Failed to search for "${query.q}":`, error);
      throw this.wrapError(error, "Unable to perform search");
    }
  }

  getBaseUrl(): string {
    return BASE_URL;
  }

  async ping(): Promise<{ pong: boolean; latency: number; status: number }> {
    try {
      const start = Date.now();
      const url = this.http.buildUrl(ENDPOINTS.xtrstudios.health);
      const response = await this.http.get(url);
      return { 
        pong: true, 
        latency: Date.now() - start,
        status: response.status || 200
      };
    } catch (error) {
      console.error("Health check failed:", error);
      return { 
        pong: false, 
        latency: -1,
        status: error instanceof Error ? 500 : 0
      };
    }
  }

  // Cache management methods
  setCacheTTL(ttlMs: number): void {
    if (ttlMs < 0) throw new Error("TTL cannot be negative");
    this.cacheTTL = ttlMs;
  }

  clearCache(): void {
    this.cache.clear();
  }

  invalidateCache(keyPattern?: string): void {
    if (!keyPattern) {
      this.clearCache();
      return;
    }
    
    for (const key of this.cache.keys()) {
      if (key.includes(keyPattern)) {
        this.cache.delete(key);
      }
    }
  }

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }

  private setCached(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private wrapError(error: unknown, fallbackMessage: string): Error {
    if (error instanceof Error) {
      error.message = `${fallbackMessage}: ${error.message}`;
      return error;
    }
    return new Error(fallbackMessage);
  }
}

export function createXtrStudiosClient(http: HttpClient): XtrStudiosClient {
  if (!http) {
    throw new Error("HttpClient is required to create XtrStudiosClient");
  }
  return new XtrStudiosClient(http);
}
