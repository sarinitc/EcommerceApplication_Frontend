export type ApiResponse<T> = {
  success: boolean;
  message: string;
  status: number;
  payload: T;
  timestamp: string;
};