export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: import('./models').User;
  token: string;
}

export interface ModuloPermisos {
  modulo: string;
  label: string;
  permisos: string[];
}
