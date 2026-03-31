import { HttpClient } from "../lib/http";
import { Series, Season, Episode, PaginatedResponse, SearchQuery, SearchFilters } from "../lib/types";

export interface SeriesListOptions {
    page?: number;
    limit?: number;
    genre?: string;
    year?: number;
    sort_by?: string;
    order?: string;
    language?: string;
}

export interface EpisodeListOptions {
    page?: number;
    limit?: number;
}

export declare class SeriesClient {
    private readonly http;
    constructor(http: HttpClient);
    list(options?: SeriesListOptions): Promise<PaginatedResponse<Series>>;
    getById(id: string | number): Promise<Series>;
    getSeasons(id: string | number): Promise<Season[]>;
    getEpisodes(id: string | number, season: number, options?: EpisodeListOptions): Promise<PaginatedResponse<Episode>>;
    getPopular(options?: SeriesListOptions): Promise<PaginatedResponse<Series>>;
    getTrending(options?: SeriesListOptions): Promise<PaginatedResponse<Series>>;
    search(query: SearchQuery): Promise<PaginatedResponse<Series>>;
    getGenres(): Promise<string[]>;
    getSeason(seriesId: string | number, seasonNumber: number): Promise<Season>;
    getEpisode(seriesId: string | number, seasonNumber: number, episodeNumber: number): Promise<Episode>;
    getNextEpisode(seriesId: string | number, currentSeasonNumber: number, currentEpisodeNumber: number): Promise<Episode | null>;
    getByImdbId(imdbId: string): Promise<Series>;
}

export declare function createSeriesClient(http: HttpClient): SeriesClient;

export type { Series, Season, Episode, PaginatedResponse, SearchQuery, SearchFilters };
