"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseClient = void 0;
exports.createDatabaseClient = createDatabaseClient;
const constants_1 = require("../lib/constants");
class DatabaseClient {
    constructor(http) {
        this.http = http;
    }
    async query(options) {
        const response = await this.http.post(this.http.buildUrl(constants_1.ENDPOINTS.database.query), options);
        return response.data;
    }
    async findOne(table, where) {
        const result = await this.query({ table, where, limit: 1 });
        return result?.rows?.[0] ?? null;
    }
    async findById(table, id) {
        return this.findOne(table, [{ field: "id", operator: "eq", value: id }]);
    }
    async insert(payload) {
        const response = await this.http.post(this.http.buildUrl(constants_1.ENDPOINTS.database.insert), payload);
        return response.data;
    }
    async insertOne(table, data) {
        if (!table || !data) {
            throw new Error("Table and data are required for insertOne");
        }
        const results = await this.insert({
            table,
            data: data,
            returning: ["*"],
        });
        if (!results || results.length === 0) {
            throw new Error("Insert returned no data");
        }
        return results[0];
    }
    async update(payload) {
        const response = await this.http.post(this.http.buildUrl(constants_1.ENDPOINTS.database.update), payload);
        return response.data;
    }
    async updateById(table, id, data) {
        const results = await this.update({
            table,
            data: data,
            where: [{ field: "id", operator: "eq", value: id }],
            returning: ["*"],
        });
        return results?.[0] ?? null;
    }
    async delete(payload) {
        const response = await this.http.post(this.http.buildUrl(constants_1.ENDPOINTS.database.delete), payload);
        return response.data.deleted;
    }
    async deleteById(table, id) {
        if (!table || id === undefined || id === null) {
            return false;
        }
        const deleted = await this.delete({
            table,
            where: [{ field: "id", operator: "eq", value: id }],
        });
        return deleted > 0;
    }
    async batch(operations) {
        if (!operations || operations.length === 0) {
            return { results: [], errors: [], success_count: 0, error_count: 0 };
        }
        const CHUNK_SIZE = 100;
        if (operations.length > CHUNK_SIZE) {
            const allResults = { results: [], errors: [], success_count: 0, error_count: 0 };
            for (let i = 0; i < operations.length; i += CHUNK_SIZE) {
                const chunk = operations.slice(i, i + CHUNK_SIZE);
                const response = await this.http.post(this.http.buildUrl(constants_1.ENDPOINTS.database.batch), { operations: chunk });
                const chunkResult = response.data || { results: [], errors: [], success_count: 0, error_count: 0 };
                allResults.results.push(...chunkResult.results);
                allResults.errors.push(...chunkResult.errors);
                allResults.success_count += chunkResult.success_count;
                allResults.error_count += chunkResult.error_count;
            }
            return allResults;
        }
        const response = await this.http.post(this.http.buildUrl(constants_1.ENDPOINTS.database.batch), { operations });
        return response.data || { results: [], errors: [], success_count: 0, error_count: 0 };
    }
    async count(table, where) {
        const result = await this.query({
            table,
            select: ["COUNT(*) as count"],
            where,
            limit: 1,
        });
        const row = result?.rows?.[0];
        const count = row?.count !== undefined ? Number(row.count) : row?.COUNT !== undefined ? Number(row.COUNT) : 0;
        return isNaN(count) ? 0 : count;
    }
    async exists(table, where) {
        const count = await this.count(table, where);
        return count > 0;
    }
    filter(field, operator, value) {
        return { field, operator, value };
    }
    sort(field, direction = "asc") {
        return { field, direction };
    }
}
exports.DatabaseClient = DatabaseClient;
function createDatabaseClient(http) {
    return new DatabaseClient(http);
}
