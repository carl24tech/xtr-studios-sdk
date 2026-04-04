import { HttpClient } from "../lib/http";
import { ENDPOINTS } from "../lib/constants";
import {
  Series,
  Season,
  Episode,
  PaginatedResponse,
  SearchQuery,
  SearchFilters,
} from "../lib/types";
import { interpolatePath } from "../lib/utils";

export interface SeriesListOptions {
  page?: number;
  limit?: number;
  genre?: string;
  year?: number;
  sort_by?: SearchFilters["sort_by"];
  order?: SearchFilters["order"];
  language?: string;
}

export interface EpisodeListOptions {
  page?: number;
  limit?: number;
}

export class SeriesClient {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async list(
    options: SeriesListOptions = {}
  ): Promise<PaginatedResponse<Series>> {
    const url =
      this.http.buildUrl(ENDPOINTS.series.list) +
      this.http.buildQueryString(options as Record<string, unknown>);
    const response = await this.http.get<PaginatedResponse<Series>>(url);
    return response.data;
  }

  async getById(id: string | number): Promise<Series> {
    const path = interpolatePath(ENDPOINTS.series.detail, { id });
    const url = this.http.buildUrl(path);
    const response = await this.http.get<Series>(url);
    return response.data;
  }

  async getSeasons(id: string | number): Promise<Season[]> {
    const path = interpolatePath(ENDPOINTS.series.seasons, { id });
    const url = this.http.buildUrl(path);
    const response = await this.http.get<Season[]>(url);
    return response.data;
  }

  async getEpisodes(
    id: string | number,
    season: number,
    options: EpisodeListOptions = {}
  ): Promise<PaginatedResponse<Episode>> {
    const path = interpolatePath(ENDPOINTS.series.episodes, {
      id,
      season,
    });
    const url =
      this.http.buildUrl(path) +
      this.http.buildQueryString(options as Record<string, unknown>);
    const response = await this.http.get<PaginatedResponse<Episode>>(url);
    return response.data;
  }

  async getPopular(
    options: SeriesListOptions = {}
  ): Promise<PaginatedResponse<Series>> {
    const url =
      this.http.buildUrl(ENDPOINTS.series.popular) +
      this.http.buildQueryString(options as Record<string, unknown>);
    const response = await this.http.get<PaginatedResponse<Series>>(url);
    return response.data;
  }

  async getTrending(
    options: SeriesListOptions = {}
  ): Promise<PaginatedResponse<Series>> {
    const url =
      this.http.buildUrl(ENDPOINTS.series.trending) +
      this.http.buildQueryString(options as Record<string, unknown>);
    const response = await this.http.get<PaginatedResponse<Series>>(url);
    return response.data;
  }

  async search(query: SearchQuery): Promise<PaginatedResponse<Series>> {
    const url =
      this.http.buildUrl(ENDPOINTS.series.search) +
      this.http.buildQueryString({
        q: query.q,
        page: query.page,
        limit: query.limit,
        ...query.filters,
      });
    const response = await this.http.get<PaginatedResponse<Series>>(url);
    return response.data;
  }

  async getGenres(): Promise<string[]> {
    const url = this.http.buildUrl(ENDPOINTS.series.genres);
    const response = await this.http.get<string[]>(url);
    return response.data;
  }

  async getSeason(
    seriesId: string | number,
    seasonNumber: number
  ): Promise<Season> {
    const seasons = await this.getSeasons(seriesId);
    const season = seasons.find((s) => s.season_number === seasonNumber);
    if (!season) {
      throw new Error(`Season ${seasonNumber} not found for series ${seriesId}`);
    }
    return season;
  }

  async getEpisode(
    seriesId: string | number,
    seasonNumber: number,
    episodeNumber: number
  ): Promise<Episode> {
    const response = await this.getEpisodes(seriesId, seasonNumber);
    const episode = response.results.find(
      (e) => e.episode_number === episodeNumber
    );
    if (!episode) {
      throw new Error(
        `Episode ${episodeNumber} not found in season ${seasonNumber} of series ${seriesId}`
      );
    }
    return episode;
  }

  async getNextEpisode(
    seriesId: string | number,
    currentSeasonNumber: number,
    currentEpisodeNumber: number
  ): Promise<Episode | null> {
    const response = await this.getEpisodes(seriesId, currentSeasonNumber);
    const nextInSeason = response.results.find(
      (e) => e.episode_number === currentEpisodeNumber + 1
    );
    if (nextInSeason) return nextInSeason;

    const seasons = await this.getSeasons(seriesId);
    const nextSeason = seasons.find((s) => s.season_number === currentSeasonNumber + 1);
    if (!nextSeason) return null;

    const nextSeasonResponse = await this.getEpisodes(
      seriesId,
      nextSeason.season_number
    );
    return nextSeasonResponse.results[0] ?? null;
  }

  async getByImdbId(imdbId: string): Promise<Series> {
    const url =
      this.http.buildUrl(ENDPOINTS.series.list) +
      this.http.buildQueryString({ imdb_id: imdbId });
    const response = await this.http.get<PaginatedResponse<Series>>(url);
    if (response.data.results.length === 0) {
      throw new Error(`Series with IMDB ID ${imdbId} not found`);
    }
    return response.data.results[0];
  }
}

export function createSeriesClient(http: HttpClient): SeriesClient {
  return new SeriesClient(http);
}
