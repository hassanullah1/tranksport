import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import {
  FaTachometerAlt,
  FaTruck,
  FaUserTie,
  FaMapMarkerAlt,
  FaChartBar,
  FaMoneyBillWave,
  FaCog,
  FaSignOutAlt,
  FaTimes
} from "react-icons/fa";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { t } = useLanguage();
  const location = useLocation();

  const menuItems = [
    { path: "/", icon: FaTachometerAlt, label: t('menu.dashboard') },
    { path: "/deliveries", icon: FaTruck, label: t('menu.deliveries') },
    { path: "/agents", icon: FaUserTie, label: t('menu.agents') },
    { path: "/provinces", icon: FaMapMarkerAlt, label: t('menu.provinces') },
    { path: "/financial", icon: FaMoneyBillWave, label: t('menu.financial') },
    { path: "/reports", icon: FaChartBar, label: t('menu.reports') },
    { path: "/settings", icon: FaCog, label: t('menu.settings') },
  ];

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <FaTruck className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">{t('app.title')}</h1>
              <p className="text-xs text-gray-500">{t('app.subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              <item.icon className="text-lg" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button className="flex items-center space-x-3 rtl:space-x-reverse w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
            <FaSignOutAlt />
            <span className="font-medium">{t('menu.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-30 w-64 bg-white transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <FaTruck className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">{t('app.title')}</h1>
              <p className="text-xs text-gray-500">{t('app.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <FaTimes className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Mobile Menu Items */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              <item.icon className="text-lg" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Mobile Logout */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <button className="flex items-center space-x-3 rtl:space-x-reverse w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
            <FaSignOutAlt />
            <span className="font-medium">{t('menu.logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;