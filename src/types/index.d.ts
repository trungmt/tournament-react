interface PaginationResult<T = any> {
  results: T[];
  count: number;
  current: number | null;
  lastPage: number;
  limit: number;
  previous: number | null;
  next: number | null;
}
