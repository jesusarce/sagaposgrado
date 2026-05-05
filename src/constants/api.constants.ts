export const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/auth/token",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
  },
  // Roles
  ROLES: {
    BASE: "/roles",
    BY_ID: (id: number) => `/roles/${id}`,
  },
  // Permissions
  PERMISSIONS: {
    BASE: "/permissions",
    BY_ID: (id: number) => `/permissions/${id}`,
  },
  // Menu Items
  MENU_ITEMS: {
    BASE: "/menu-items",
    BY_ID: (id: number) => `/menu-items/${id}`,
  },
  // Users
  USERS: {
    BASE: "/users",
    BY_ID: (id: number) => `/users/${id}`,
  },
  // SAGA
  SAGA: {
    CURSOS: {
      BASE: "/saga/cursos",
      BY_ID: (id: string) => `/saga/cursos/${id}`,
    },
    PERIODOS_ACADEMICOS: {
      BASE: "/saga/periodos-academicos",
    },
    NIVEL_ACADEMICO: {
      BASE: "/saga/nivel-academico",
    },
  },
} as const;
