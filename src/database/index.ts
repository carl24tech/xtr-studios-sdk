import { HttpClient } from "../lib/http";
import { ENDPOINTS } from "../lib/constants";
import { DatabaseRecord } from "../lib/types";

export type FilterOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "in"
  | "nin"
  | "like"
  | "ilike"
  | "is_null"
  | "not_null";

export interface FilterClause {
  field: string;
  operator: FilterOperator;
  value?: unknown;
}

export interface SortClause {
  field: string;
  direction: "asc" | "desc";
}

export interface QueryOptions {
  table: string;
  select?: string[];
  where?: FilterClause[];
  order_by?: SortClause[];
  limit?: number;
  offset?: number;
}

export interface InsertPayload<T = Record<string, unknown>> {
  table: string;
  data: T | T[];
  returning?: string[];
}

export interface UpdatePayload<T = Record<string, unknown>> {
  table: string;
  data: Partial<T>;
  where: FilterClause[];
  returning?: string[];
}

export interface DeletePayload {
  table: string;
  where: FilterClause[];
  returning?: string[];
}

export interface BatchOperation {
  operation: "insert" | "update" | "delete" | "query";
  payload: InsertPayload | UpdatePayload | DeletePayload | QueryOptions;
}

export interface BatchResult {
  results: unknown[];
  errors: Array<{ index: number; message: string }>;
  success_count: number;
  error_count: number;
}

export interface QueryResult<T extends DatabaseRecord = DatabaseRecord> {
  rows: T[];
  count: number;
  has_more: boolean;
}

export class DatabaseClient {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async query<T extends DatabaseRecord = DatabaseRecord>(
    options: QueryOptions
  ): Promise<QueryResult<T>> {
    try {
      const response = await this.http.post<QueryResult<T>>(
        this.http.buildUrl(ENDPOINTS.database.query),
        options
      );
      return response.data;
    } catch (error) {
      throw new Error(`Database query failed: ${error.message}`);
    }
  }

  async findOne<T extends DatabaseRecord = DatabaseRecord>(
    table: string,
    where: FilterClause[]
  ): Promise<T | null> {
    if (!table || !where) {
      return null;
    }
    const result = await this.query<T>({ table, where, limit: 1 });
    return result?.rows?.[0] ?? null;
  }

  async findById<T extends DatabaseRecord = DatabaseRecord>(
    table: string,
    id: string | number
  ): Promise<T | null> {
    if (!table || id === undefined || id === null) {
      return null;
    }
    return this.findOne<T>(table, [{ field: "id", operator: "eq", value: id }]);
  }

  async insert<T extends DatabaseRecord = DatabaseRecord>(
    payload: InsertPayload
  ): Promise<T[]> {
    try {
      const response = await this.http.post<T[]>(
        this.http.buildUrl(ENDPOINTS.database.insert),
        payload
      );
      return response.data || [];
    } catch (error) {
      throw new Error(`Database insert failed: ${error.message}`);
    }
  }

  async insertOne<T extends DatabaseRecord = DatabaseRecord>(
    table: string,
    data: Omit<T, "id" | "created_at" | "updated_at">
  ): Promise<T> {
    if (!table || !data) {
      throw new Error("Table and data are required for insertOne");
    }
    const results = await this.insert<T>({
      table,
      data: data as Record<string, unknown>,
      returning: ["*"],
    });
    if (!results || results.length === 0) {
      throw new Error("Insert returned no data");
    }
    return results[0];
  }

  async update<T extends DatabaseRecord = DatabaseRecord>(
    payload: UpdatePayload
  ): Promise<T[]> {
    try {
      const response = await this.http.post<T[]>(
        this.http.buildUrl(ENDPOINTS.database.update),
        payload
      );
      return response.data || [];
    } catch (error) {
      throw new Error(`Database update failed: ${error.message}`);
    }
  }

  async updateById<T extends DatabaseRecord = DatabaseRecord>(
    table: string,
    id: string | number,
    data: Partial<Omit<T, "id" | "created_at" | "updated_at">>
  ): Promise<T | null> {
    if (!table || id === undefined || id === null || !data) {
      return null;
    }
    const results = await this.update<T>({
      table,
      data: data as Record<string, unknown>,
      where: [{ field: "id", operator: "eq", value: id }],
      returning: ["*"],
    });
    return results?.[0] ?? null;
  }

  async delete(payload: DeletePayload): Promise<number> {
    try {
      const response = await this.http.post<{ deleted: number }>(
        this.http.buildUrl(ENDPOINTS.database.delete),
        payload
      );
      return response.data?.deleted ?? 0;
    } catch (error) {
      throw new Error(`Database delete failed: ${error.message}`);
    }
  }

  async deleteById(table: string, id: string | number): Promise<boolean> {
    if (!table || id === undefined || id === null) {
      return false;
    }
    try {
      const deleted = await this.delete({
        table,
        where: [{ field: "id", operator: "eq", value: id }],
      });
      return deleted > 0;
    } catch (error) {
      return false;
    }
  }

  async batch(operations: BatchOperation[]): Promise<BatchResult> {
    if (!operations || operations.length === 0) {
      return {
        results: [],
        errors: [],
        success_count: 0,
        error_count: 0
      };
    }
    try {
      const response = await this.http.post<BatchResult>(
        this.http.buildUrl(ENDPOINTS.database.batch),
        { operations }
      );
      return response.data || {
        results: [],
        errors: [],
        success_count: 0,
        error_count: 0
      };
    } catch (error) {
      throw new Error(`Database batch operation failed: ${error.message}`);
    }
  }

  async count(table: string, where?: FilterClause[]): Promise<number> {
    if (!table) {
      return 0;
    }
    try {
      const result = await this.query({
        table,
        select: ["COUNT(*) as count"],
        where,
        limit: 1,
      });
      const row = result?.rows?.[0] as Record<string, unknown>;
      const count = row?.count !== undefined ? Number(row.count) : 0;
      return isNaN(count) ? 0 : count;
    } catch (error) {
      return 0;
    }
  }

  async exists(table: string, where: FilterClause[]): Promise<boolean> {
    if (!table || !where) {
      return false;
    }
    const count = await this.count(table, where);
    return count > 0;
  }

  filter(field: string, operator: FilterOperator, value?: unknown): FilterClause {
    if (!field || !operator) {
      throw new Error("Field and operator are required for filter");
    }
    return { field, operator, value };
  }

  sort(field: string, direction: "asc" | "desc" = "asc"): SortClause {
    if (!field) {
      throw new Error("Field is required for sort");
    }
    return { field, direction };
  }
}

export function createDatabaseClient(http: HttpClient): DatabaseClient {
  if (!http) {
    throw new Error("HttpClient is required to create DatabaseClient");
  }
  return new DatabaseClient(http);
}
