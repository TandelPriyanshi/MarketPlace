export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class Paginator {
  static paginate<T>(
    data: T[],
    total: number,
    options: PaginationOptions
  ): PaginationResult<T> {
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

  static getOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  static normalizePage(page: number | string | undefined, defaultPage: number = 1): number {
    if (!page) return defaultPage;
    const parsed = typeof page === 'string' ? parseInt(page, 10) : page;
    return isNaN(parsed) || parsed < 1 ? defaultPage : parsed;
  }

  static normalizeLimit(limit: number | string | undefined, defaultLimit: number = 10, maxLimit: number = 100): number {
    if (!limit) return defaultLimit;
    const parsed = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    if (isNaN(parsed) || parsed < 1) return defaultLimit;
    return parsed > maxLimit ? maxLimit : parsed;
  }
}

