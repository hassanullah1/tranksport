import React, { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { 
  FaBars, 
  FaBell, 
  FaCog, 
  FaSearch, 
  FaUserCircle,
  FaGlobe,
  FaSun,
  FaMoon
} from "react-icons/fa";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";

const AppBar = ({ setSidebarOpen, setLoading }) => {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const [darkMode, setDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ps', name: 'پښتو', flag: '🇦🇫' },
    { code: 'fa', name: 'دری', flag: '🇦🇫' }
  ];

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    setShowLangMenu(false);
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Section */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <FaBars className="w-5 h-5" />
            </button>

            {/* Search Bar */}
            <div className="hidden md:flex items-center ml-4 lg:ml-0">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="pl-10 pr-4 py-2 w-64 lg:w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Search deliveries, agents..."
                />
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title={darkMode ? "Light Mode" : "Dark Mode"}
            >
              {darkMode ? (
                <FaSun className="w-5 h-5 text-yellow-500" />
              ) : (
                <FaMoon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FaGlobe className="text-gray-600" />
                <span className="font-medium">
                  {languages.find(l => l.code === language)?.name}
                </span>
                <MdOutlineKeyboardArrowDown className="text-gray-400" />
              </button>
              
              {showLangMenu && (
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-50 ${
                        language === lang.code ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
                      }`}
                    >
                      <span className="text-xl mr-3 rtl:mr-0 rtl:ml-3">{lang.flag}</span>
                      <span className="flex-1 text-right rtl:text-left">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                <FaBell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 rtl:right-auto rtl:left-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>

            {/* Settings */}
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <FaCog className="w-5 h-5 text-gray-600" />
            </button>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 rtl:space-x-reverse p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center">
                  <FaUserCircle className="text-white" />
                </div>
                <div className="hidden md:block text-left rtl:text-right">
                  <p className="text-sm font-semibold text-gray-800">Admin User</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <MdOutlineKeyboardArrowDown className="text-gray-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">Admin User</p>
                    <p className="text-xs text-gray-500">admin@delivery.com</p>
                  </div>
                  <button className="w-full text-right rtl:text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Profile Settings
                  </button>
                  <button className="w-full text-right rtl:text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Account Settings
                  </button>
                  <div className="border-t border-gray-100">
                    <button className="w-full text-right rtl:text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      {t('menu.logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppBar;