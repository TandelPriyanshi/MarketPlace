"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Paginator = void 0;
class Paginator {
    static paginate(data, total, options) {
        const { page, limit } = options;
        const totalPages = Math.ceil(total / limit);
        return {
            data,
            pagination: {
                total,
                page,
                totalPages,
                limit,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
    }
    static getOffset(page, limit) {
        return (page - 1) * limit;
    }
    static normalizePage(page, defaultPage = 1) {
        if (!page)
            return defaultPage;
        const parsed = typeof page === 'string' ? parseInt(page, 10) : page;
        return isNaN(parsed) || parsed < 1 ? defaultPage : parsed;
    }
    static normalizeLimit(limit, defaultLimit = 10, maxLimit = 100) {
        if (!limit)
            return defaultLimit;
        const parsed = typeof limit === 'string' ? parseInt(limit, 10) : limit;
        if (isNaN(parsed) || parsed < 1)
            return defaultLimit;
        return parsed > maxLimit ? maxLimit : parsed;
    }
}
exports.Paginator = Paginator;
