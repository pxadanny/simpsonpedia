export interface ApiResponse<T> {
  count: number;
  next: string | null;
  prev: string | null;
  pages: number;
  results: T[];
}
