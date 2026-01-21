import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { roleMenus, menus } from "../constants/menus";
import * as FaIcons from "react-icons/fa";

interface MenuItem {
  name: string;
  title: string;
  path: string;
  icon?: string;
}

type Role = keyof typeof roleMenus;

interface MenusProps {
  role: Role;
  isOpen: boolean;
  currentPath: string;
}

const Menus: React.FC<MenusProps> = ({ role, isOpen }) => {
  const allowedMenuNames: string[] = roleMenus[role] || [];
  const navigate = useNavigate();
  const location = useLocation();

  const filteredMenus: MenuItem[] = menus.filter((menu: MenuItem) =>
    allowedMenuNames.includes(menu.name)
  );

  return (
    <ul className="mt-4 space-y-1 px-2">
      {filteredMenus.map((menu, index) => {
        const Icon = menu.icon ? FaIcons[menu.icon as keyof typeof FaIcons] : null;

        const isActive =
          location.pathname === menu.path ||
          location.pathname.startsWith(`${menu.path}/`);

        return (
          <li
            key={index}
            onClick={() => navigate(menu.path)}
            className={`group relative flex items-center gap-3 p-3 cursor-pointer transition-all duration-300
              ${
                isActive
                  ? "bg-emerald-100 text-emerald-800 border-l-4 border-emerald-500 shadow-inner"
                  : "text-gray-300 hover:text-white hover:bg-gray-800"
              }
            `}
          >
            {Icon && (
              <Icon
                className={`text-lg min-w-[24px] transition-transform duration-300 ${
                  isActive ? "text-emerald-700 scale-110" : ""
                }`}
              />
            )}

            {/* Label saat sidebar terbuka */}
            {isOpen && (
              <span
                className={`text-sm font-medium tracking-wide transition-colors duration-200 ${
                  isActive ? "text-emerald-800" : ""
                }`}
              >
                {menu.title}
              </span>
            )}

            {/* Tooltip saat sidebar tertutup */}
            {!isOpen && (
              <span
                className="absolute left-20 z-10 bg-gray-800 text-white text-sm py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 shadow-lg transition-opacity duration-200"
              >
                {menu.title}
              </span>
            )}

            {/* Indicator hijau lembut di kiri menu aktif */}
            {isActive && (
              <span className="absolute left-0 top-0 h-full w-1 bg-emerald-500 rounded-r-lg shadow-md"></span>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default Menus;
