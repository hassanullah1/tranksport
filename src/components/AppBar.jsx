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
                <p className="text-sm md:text-base font-semibold text-blue-700 tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]">  په افغانستان کې د باوري او غوره ترانسپورتي خدماتو مخکښ شرکت
                </p>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            {/* Theme Toggle */}

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FaGlobe className="text-gray-600" />
                <span className="font-medium">
                  {languages.find((l) => l.code === language)?.name}
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
                        language === lang.code
                          ? "bg-primary-50 text-primary-600"
                          : "text-gray-700"
                      }`}
                    >
                      <span className="text-xl mr-3 rtl:mr-0 rtl:ml-3">
                        {lang.flag}
                      </span>
                      <span className="flex-1 text-right rtl:text-left">
                        {lang.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}

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
                  <p className="text-sm font-semibold text-gray-800">
                    Admin User
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppBar;