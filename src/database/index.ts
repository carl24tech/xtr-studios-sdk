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
  featured: boolean;
  new_release: boolean;
}

export interface FeaturedContent {
  hero: CatalogEntry;
  trending: CatalogEntry[];
  new_releases: CatalogEntry[];
  editors_picks: CatalogEntry[];
  genres: GenreSection[];
}

export interface GenreSection {
  genre: string;
  items: CatalogEntry[];
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
}

export interface MoviesClient {
  list(options?: { page?: number; limit?: number; genre?: string }): Promise<PaginatedResponse<Movie>>;
  getById(id: string | number): Promise<Movie>;
  getPopular(options?: { page?: number; limit?: number }): Promise<PaginatedResponse<Movie>>;
  getTrending(options?: { page?: number; limit?: number }): Promise<PaginatedResponse<Movie>>;
  search(query: SearchQuery): Promise<PaginatedResponse<Movie>>;
  getGenres(): Promise<string[]>;
  getByImdbId(imdbId: string): Promise<Movie>;
}

export class XtrStudiosClient {
  private readonly http: HttpClient;
  readonly movies: MoviesClient;

  constructor(http: HttpClient) {
    this.http = http;
    this.movies = this.createMoviesClient();
  }

  private createMoviesClient(): MoviesClient {
    const http = this.http;
    const MOVIE_ENDPOINTS = ENDPOINTS.movies;

    return {
      async list(options = {}) {
        const url =
          http.buildUrl(MOVIE_ENDPOINTS.list) +
          http.buildQueryString(options as Record<string, unknown>);
        const response = await http.get<PaginatedResponse<Movie>>(url);
        return response.data;
      },

      async getById(id) {
        const url = http.buildUrl(MOVIE_ENDPOINTS.list) +
          http.buildQueryString({ id });
        const response = await http.get<PaginatedResponse<Movie>>(url);
        if (response.data.results.length === 0) {
          throw new Error(`Movie with ID ${id} not found`);
        }
        return response.data.results[0];
      },

      async getPopular(options = {}) {
        const url =
          http.buildUrl(MOVIE_ENDPOINTS.popular) +
          http.buildQueryString(options as Record<string, unknown>);
        const response = await http.get<PaginatedResponse<Movie>>(url);
        return response.data;
      },

      async getTrending(options = {}) {
        const url =
          http.buildUrl(MOVIE_ENDPOINTS.trending) +
          http.buildQueryString(options as Record<string, unknown>);
        const response = await http.get<PaginatedResponse<Movie>>(url);
        return response.data;
      },

      async search(query) {
        const url =
          http.buildUrl(MOVIE_ENDPOINTS.search) +
          http.buildQueryString({
            q: query.q,
            page: query.page,
            limit: query.limit,
            ...query.filters,
          });
        const response = await http.get<PaginatedResponse<Movie>>(url);
        return response.data;
      },

      async getGenres() {
        const url = http.buildUrl(MOVIE_ENDPOINTS.genres);
        const response = await http.get<string[]>(url);
        return response.data;
      },

      async getByImdbId(imdbId) {
        const url =
          http.buildUrl(MOVIE_ENDPOINTS.list) +
          http.buildQueryString({ imdb_id: imdbId });
        const response = await http.get<PaginatedResponse<Movie>>(url);
        if (response.data.results.length === 0) {
          throw new Error(`Movie with IMDB ID ${imdbId} not found`);
        }
        return response.data.results[0];
      },
    };
  }

  async getInfo(): Promise<XtrStudiosInfo> {
    const url = this.http.buildUrl(ENDPOINTS.xtrstudios.info);
    const response = await this.http.get<XtrStudiosInfo>(url);
    return response.data;
  }

  async getCatalog(
    page = 1,
    limit = 20,
    type?: "movie" | "series"
  ): Promise<PaginatedResponse<CatalogEntry>> {
    const url =
      this.http.buildUrl(ENDPOINTS.xtrstudios.catalog) +
      this.http.buildQueryString({ page, limit, type });
    const response = await this.http.get<PaginatedResponse<CatalogEntry>>(url);
    return response.data;
  }

  async getFeatured(): Promise<FeaturedContent> {
    const url = this.http.buildUrl(ENDPOINTS.xtrstudios.featured);
    const response = await this.http.get<FeaturedContent>(url);
    return response.data;
  }

  async getAnnouncements(includeExpired = false): Promise<Announcement[]> {
    const url =
      this.http.buildUrl(ENDPOINTS.xtrstudios.announcements) +
      (includeExpired ? this.http.buildQueryString({ include_expired: true }) : "");
    const response = await this.http.get<Announcement[]>(url);
    return response.data;
  }

  async search(query: SearchQuery): Promise<{
    movies: PaginatedResponse<Movie>;
    series: PaginatedResponse<Series>;
  }> {
    const url =
      this.http.buildUrl("/api/search") +
      this.http.buildQueryString({
        q: query.q,
        page: query.page,
        limit: query.limit,
        ...query.filters,
      });
    const response = await this.http.get<{
      movies: PaginatedResponse<Movie>;
      series: PaginatedResponse<Series>;
    }>(url);
    return response.data;
  }

  getBaseUrl(): string {
    return BASE_URL;
  }

  async ping(): Promise<{ pong: boolean; latency: number }> {
    const start = Date.now();
    const url = this.http.buildUrl("/api/ping");
    await this.http.get(url);
    return { pong: true, latency: Date.now() - start };
  }
}

export function createXtrStudiosClient(http: HttpClient): XtrStudiosClient {
  return new XtrStudiosClient(http);
}
