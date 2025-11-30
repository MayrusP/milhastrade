export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  code?: string;
  errors?: any[];
}

export interface ApiError {
  success: false;
  message: string;
  code: string;
  errors?: any[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}