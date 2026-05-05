import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation } from "react-router";

import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  GroupIcon,
  HorizontaLDots,
  ListIcon,
  LockIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserIcon,
  PieChartIcon as ChartIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";
import type { MenuItem } from "../types/menu-items/menu-item.types";
import { useMenu } from "../hooks/useMenu";
import { useAuth } from "../hooks/auth/useAuth";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

// Map icon strings from the API to React components
function resolveIcon(iconName: string | null): React.ReactNode {
  switch (iconName?.toLowerCase()) {
    case "home":
    case "dashboard":
      return <GridIcon />;
    case "users":
    case "user":
      return <UserIcon />;
    case "group":
    case "groups":
    case "roles":
      return <GroupIcon />;
    case "chart":
    case "charts":
    case "analytics":
    case "reports":
      return <ChartIcon />;
    case "list":
    case "menu":
      return <ListIcon />;
    case "table":
    case "tables":
      return <TableIcon />;
    case "calendar":
      return <CalenderIcon />;
    case "lock":
    case "security":
    case "permissions":
      return <LockIcon />;
    case "settings":
    case "page":
      return <PageIcon />;
    default:
      return <GridIcon />;
  }
}

// Flatten all active children into flat subItems (max 2 levels in sidebar)
function flattenChildren(
  children: MenuItem[]
): { name: string; path: string }[] {
  const result: { name: string; path: string }[] = [];
  for (const child of children) {
    if (!child.active) continue;
    if (child.url) {
      result.push({ name: child.label, path: child.url });
    }
    if (child.children?.length) {
      result.push(...flattenChildren(child.children));
    }
  }
  return result;
}

// Transform API MenuItem[] → sidebar NavItem[]
function transformToNavItems(items: MenuItem[]): NavItem[] {
  return items
    .filter((item) => item.active)
    .sort((a, b) => a.order - b.order)
    .map((item) => {
      const navItem: NavItem = {
        name: item.label,
        icon: resolveIcon(item.icon),
      };

      if (item.children?.length) {
        const subItems = flattenChildren(item.children);
        if (subItems.length > 0) {
          navItem.subItems = subItems;
        } else if (item.url) {
          navItem.path = item.url;
        }
      } else if (item.url) {
        navItem.path = item.url;
      }

      return navItem;
    });
}

// Posgrado section
const posgradoItems: NavItem[] = [
  {
    icon: <TableIcon />,
    name: "Cursos",
    subItems: [{ name: "Cursos", path: "/posgrado/cursos" }],
  },
];

// Static admin section items (permission key → path)
const ALL_ADMIN_ITEMS: (NavItem & { permission: string })[] = [
  { icon: <GroupIcon />, name: "Roles", path: "/roles", permission: "roles.index" },
  { icon: <LockIcon />, name: "Permisos", path: "/permissions", permission: "permissions.index" },
  { icon: <ListIcon />, name: "Menú", path: "/menu-items", permission: "menu_items.index" },
  { icon: <UserIcon />, name: "Usuarios", path: "/users", permission: "users.index" },
];

const othersItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Charts",
    subItems: [
      { name: "Line Chart", path: "/line-chart", pro: false },
      { name: "Bar Chart", path: "/bar-chart", pro: false },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "UI Elements",
    subItems: [
      { name: "Alerts", path: "/alerts", pro: false },
      { name: "Avatar", path: "/avatars", pro: false },
      { name: "Badge", path: "/badge", pro: false },
      { name: "Buttons", path: "/buttons", pro: false },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Authentication",
    subItems: [
      { name: "Sign In", path: "/signin", pro: false },
      { name: "Sign Up", path: "/signup", pro: false },
    ],
  },
];

type MenuType = "dynamic" | "posgrado" | "admin" | "others";

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const { menuItems } = useMenu();
  const { user } = useAuth();

  // If user has no permissions loaded yet (initial / super-admin) show all items
  const adminItems: NavItem[] = ALL_ADMIN_ITEMS.filter(
    (item) => !user?.permissions?.length || user.permissions.includes(item.permission)
  );

  const dynamicNavItems = useMemo(() => transformToNavItems(menuItems), [menuItems]);

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: MenuType;
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    const sections: { type: MenuType; items: NavItem[] }[] = [
      { type: "dynamic", items: dynamicNavItems },
      { type: "admin", items: adminItems },
      { type: "others", items: othersItems },
    ];

    sections.forEach(({ type, items }) => {
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({ type, index });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive, dynamicNavItems]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: MenuType) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: MenuType) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="py-8 flex justify-center">
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <img
              src="/images/logo_emi/logo_sidebar.png"
              alt="Logo EMI"
              width={150}
              height={40}
            />
          ) : (
            <img
              src="/images/logo_emi/emi_icono.png"
              alt="Logo EMI"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">

            {/* Dynamic menu from API */}
            {dynamicNavItems.length > 0 && (
              <div>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "Menú"
                  ) : (
                    <HorizontaLDots className="size-6" />
                  )}
                </h2>
                {renderMenuItems(dynamicNavItems, "dynamic")}
              </div>
            )}

            {/* Posgrado section */}
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Posgrado"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(posgradoItems, "posgrado")}
            </div>

            {/* Static admin section */}
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Administración"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(adminItems, "admin")}
            </div>

            {/* Others section */}
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Otros"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>

          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
