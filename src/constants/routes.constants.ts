export const ROUTES = {
  HOME: "/",
  SIGN_IN: "/signin",
  SIGN_UP: "/signup",
  PROFILE: "/profile",
  // Modules
  ROLES: {
    LIST: "/roles",
    CREATE: "/roles/create",
    EDIT: (id: number | string) => `/roles/${id}/edit`,
  },
  PERMISSIONS: {
    LIST: "/permissions",
  },
  MENU_ITEMS: {
    LIST: "/menu-items",
  },
  USERS: {
    LIST: "/users",
    CREATE: "/users/create",
    EDIT: (id: number | string) => `/users/${id}/edit`,
  },
  // Posgrado
  POSGRADO: {
    CURSOS: "/posgrado/cursos",
  },
} as const;
