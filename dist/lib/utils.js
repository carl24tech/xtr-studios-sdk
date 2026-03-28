"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interpolatePath = interpolatePath;
exports.buildQueryString = buildQueryString;
exports.isEmptyObject = isEmptyObject;
exports.paginate = paginate;
exports.sleep = sleep;
exports.chunk = chunk;
exports.omit = omit;
exports.pick = pick;
exports.debounce = debounce;
exports.retry = retry;
exports.formatBytes = formatBytes;
exports.generateRequestId = generateRequestId;
function interpolatePath(path, params) {
    return Object.entries(params).reduce((acc, [key, value]) => acc.replace(`:${key}`, String(value)), path);
}
function buildQueryString(params) {
    const filtered = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "");
    if (filtered.length === 0)
        return "";
    const qs = filtered
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join("&");
    return `?${qs}`;
}
function isEmptyObject(obj) {
    return (obj !== null &&
        typeof obj === "object" &&
        Object.keys(obj).length === 0);
}
function paginate(results, page, limit, total) {
    return {
        results,
        page,
        total_pages: Math.ceil(total / limit),
        total_results: total,
    };
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}
function omit(obj, keys) {
    const result = { ...obj };
    keys.forEach((key) => delete result[key]);
    return result;
}
function pick(obj, keys) {
    return keys.reduce((acc, key) => {
        if (key in obj)
            acc[key] = obj[key];
        return acc;
    }, {});
}
function debounce(fn, ms) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}
function retry(fn, retries, delay) {
    return fn().catch((err) => {
        if (retries <= 0)
            throw err;
        return sleep(delay).then(() => retry(fn, retries - 1, delay * 2));
    });
}
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0)
        return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}
function generateRequestId() {
    return `xtr-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
//# sourceMappingURL=utils.js.map