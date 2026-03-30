import { HttpClient } from "../lib/http";
import { DatabaseRecord } from "../lib/types";

export type FilterOperator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "nin" | "like" | "ilike" | "is_null" | "not_null";

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

export type BatchInsertPayload = InsertPayload;
export type BatchUpdatePayload = UpdatePayload;
export type BatchDeletePayload = DeletePayload;
export type BatchQueryPayload = QueryOptions;

export interface BatchOperation {
    operation: "insert" | "update" | "delete" | "query";
    payload: BatchInsertPayload | BatchUpdatePayload | BatchDeletePayload | BatchQueryPayload;
}

export interface BatchError {
    index: number;
    message: string;
}

export interface BatchResult {
    results: unknown[];
    errors: BatchError[];
    success_count: number;
    error_count: number;
}

export interface QueryResult<T extends DatabaseRecord = DatabaseRecord> {
    rows: T[];
    count: number;
    has_more: boolean;
}

export interface DatabaseError {
    code: string;
    message: string;
    details?: unknown;
}

export declare class DatabaseClient {
    private readonly http;
    constructor(http: HttpClient);
    query<T extends DatabaseRecord = DatabaseRecord>(options: QueryOptions): Promise<QueryResult<T>>;
    findOne<T extends DatabaseRecord = DatabaseRecord>(table: string, where: FilterClause[]): Promise<T | null>;
    findById<T extends DatabaseRecord = DatabaseRecord>(table: string, id: string | number): Promise<T | null>;
    insert<T extends DatabaseRecord = DatabaseRecord>(payload: InsertPayload): Promise<T[]>;
    insertOne<T extends DatabaseRecord = DatabaseRecord>(table: string, data: Omit<T, "id" | "created_at" | "updated_at">): Promise<T>;
    update<T extends DatabaseRecord = DatabaseRecord>(payload: UpdatePayload): Promise<T[]>;
    updateById<T extends DatabaseRecord = DatabaseRecord>(table: string, id: string | number, data: Partial<Omit<T, "id" | "created_at" | "updated_at">>): Promise<T | null>;
    delete(payload: DeletePayload): Promise<number>;
    deleteById(table: string, id: string | number): Promise<boolean>;
    batch(operations: BatchOperation[]): Promise<BatchResult>;
    count(table: string, where?: FilterClause[]): Promise<number>;
    exists(table: string, where: FilterClause[]): Promise<boolean>;
    filter(field: string, operator: FilterOperator, value?: unknown): FilterClause;
    sort(field: string, direction?: "asc" | "desc"): SortClause;
}

export declare function createDatabaseClient(http: HttpClient): DatabaseClient;
