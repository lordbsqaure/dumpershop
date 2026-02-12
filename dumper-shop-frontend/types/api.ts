export interface PaginatedResponse<T> {
  // Pagination metadata
  offset?: number;
  limit?: number;
  page?: number; // 1-based page number when provided
  page_count?: number;

  // Totals
  count?: number; // number of items returned in this response
  total?: number; // total number of items available

  // Common item containers (some APIs use different keys)
  items?: T[];
  results?: T[];
  data?: { products?: T[] } | { items?: T[] } | T[];

  // Allow extra properties returned by different endpoints
  [key: string]: any;
}
