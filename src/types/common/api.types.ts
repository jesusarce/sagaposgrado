export interface ApiResponse<T> {
  data: T;
  message: string;
  status: boolean;
}

export interface Pagination<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/**
 * Formato real que devuelve Laravel cuando se usa Resource::collection() con paginador.
 * Los metadatos de paginación vienen bajo `meta`.
 */
export interface LaravelResourcePagination<T> {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

/**
 * Parámetros de consulta compatibles con ApiTrait de Laravel.
 *
 * included  → ?included=relation1,relation2          (scopeIncluded)
 * filter    → ?filter[campo]=valor                   (scopeFilter)
 * sort      → ?sort=campo,-otro_campo                (scopeSort, - = desc)
 * perPage   → ?perPage=15                            (scopeGetOrPaginate)
 * page      → ?page=2
 */
export interface ApiQueryParams {
  included?: string[];
  filter?: Record<string, string | number | (string | number)[]>;
  sort?: string[];
  perPage?: number;
  page?: number;
}
