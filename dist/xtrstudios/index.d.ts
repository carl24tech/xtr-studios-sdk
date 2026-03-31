import { HttpClient } from "../lib/http";
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
    list(options?: {
        page?: number;
        limit?: number;
        genre?: string;
    }): Promise<PaginatedResponse<Movie>>;
    getById(id: string | number): Promise<Movie>;
    getPopular(options?: {
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<Movie>>;
    getTrending(options?: {
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<Movie>>;
    search(query: SearchQuery): Promise<PaginatedResponse<Movie>>;
    getGenres(): Promise<string[]>;
    getByImdbId(imdbId: string): Promise<Movie>;
}

export interface SeriesClient {
    list(options?: {
        page?: number;
        limit?: number;
        genre?: string;
    }): Promise<PaginatedResponse<Series>>;
    getById(id: string | number): Promise<Series>;
    getPopular(options?: {
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<Series>>;
    getTrending(options?: {
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<Series>>;
    search(query: SearchQuery): Promise<PaginatedResponse<Series>>;
    getGenres(): Promise<string[]>;
    getByImdbId(imdbId: string): Promise<Series>;
}

export declare class XtrStudiosClient {
    private readonly http;
    readonly movies: MoviesClient;
    readonly series: SeriesClient;
    constructor(http: HttpClient);
    private createMoviesClient;
    private createSeriesClient;
    getInfo(): Promise<XtrStudiosInfo>;
    getCatalog(page?: number, limit?: number, type?: "movie" | "series"): Promise<PaginatedResponse<CatalogEntry>>;
    getFeatured(): Promise<FeaturedContent>;
    getAnnouncements(includeExpired?: boolean): Promise<Announcement[]>;
    search(query: SearchQuery): Promise<{
        movies: PaginatedResponse<Movie>;
        series: PaginatedResponse<Series>;
    }>;
    getBaseUrl(): string;
    ping(): Promise<{
        pong: boolean;
        latency: number;
    }>;
}

export declare function createXtrStudiosClient(http: HttpClient): XtrStudiosClient;

export type { Movie, Series, PaginatedResponse, SearchQuery };
