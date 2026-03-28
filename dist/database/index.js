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
        return result.rows[0] ?? null;
    }
    async findById(table, id) {
        return this.findOne(table, [{ field: "id", operator: "eq", value: id }]);
    }
    async insert(payload) {
        const response = await this.http.post(this.http.buildUrl(constants_1.ENDPOINTS.database.insert), payload);
        return response.data;
    }
    async insertOne(table, data) {
        const results = await this.insert({
            table,
            data: data,
            returning: ["*"],
        });
        if (results.length === 0)
            throw new Error("Insert returned no data");
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
        return results[0] ?? null;
    }
    async delete(payload) {
        const response = await this.http.post(this.http.buildUrl(constants_1.ENDPOINTS.database.delete), payload);
        return response.data.deleted;
    }
    async deleteById(table, id) {
        const deleted = await this.delete({
            table,
            where: [{ field: "id", operator: "eq", value: id }],
        });
        return deleted > 0;
    }
    async batch(operations) {
        const response = await this.http.post(this.http.buildUrl(constants_1.ENDPOINTS.database.batch), { operations });
        return response.data;
    }
    async count(table, where) {
        const result = await this.query({
            table,
            select: ["COUNT(*) as count"],
            where,
            limit: 1,
        });
        const row = result.rows[0];
        return Number(row?.count ?? 0);
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
//# sourceMappingURL=index.js.map