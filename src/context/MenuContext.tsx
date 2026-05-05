import { createContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { getMenuItems } from "../services/menu-items.service";
import type { MenuItem } from "../types/menu-items/menu-item.types";
import { useAuth } from "../hooks/auth/useAuth";

interface MenuContextValue {
  menuItems: MenuItem[];
  isLoading: boolean;
  refreshMenu: () => Promise<void>;
}

export const MenuContext = createContext<MenuContextValue | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshMenu = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const data = await getMenuItems();
      setMenuItems(data);
    } catch {
      // Error de red — sidebar queda vacío sin romper la app
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Carga cuando el usuario se autentica, limpia cuando cierra sesión
  useEffect(() => {
    if (isAuthenticated) {
      refreshMenu();
    } else {
      setMenuItems([]);
    }
  }, [isAuthenticated, refreshMenu]);

  return (
    <MenuContext.Provider value={{ menuItems, isLoading, refreshMenu }}>
      {children}
    </MenuContext.Provider>
  );
}
