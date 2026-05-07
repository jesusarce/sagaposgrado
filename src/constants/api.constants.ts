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
    ALUMNOS: {
      BASE: "/saga/alumnos",
      BY_ID: (id: number) => `/saga/alumnos/${id}`,
    },
    CURSOS: {
      BASE: "/saga/cursos",
      BY_ID: (id: number) => `/saga/cursos/${id}`,
    },
    ESPECIALIDADES: {
      BASE: "/saga/especialidades",
      BY_ID: (id: number) => `/saga/especialidades/${id}`,
    },
    PERIODOS_ACADEMICOS: {
      BASE: "/saga/periodos-academicos",
      BY_ID: (id: number) => `/saga/periodos-academicos/${id}`,
    },
    NIVEL_ACADEMICO: {
      BASE: "/saga/nivel-academico",
      BY_ID: (id: number) => `/saga/nivel-academico/${id}`,
    },
    PERIODO_GESTION: {
      BASE: "/saga/periodos-gestion",
      BY_ID: (id: number) => `/saga/periodos-gestion/${id}`,
    },
    UNIDAD_ACADEMICA: {
      BASE: "/saga/unidades-academicas",
      BY_ID: (id: number) => `/saga/unidades-academicas/${id}`,
    },
    TIPO: {
      BASE: "/saga/tipos",
    },
    DOCENTE: {
      BASE: "/saga/docentes",
    },
    MATERIA: {
      BASE: "/saga/materias",
    },
  },
} as const;
