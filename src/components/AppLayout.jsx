import React, { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import Sidebar from "./Sidebar";
import AppBar from "./AppBar";
import LoadingScreen from "./LoadingScreen";

const AppLayout = ({ children }) => {
  const { isRTL } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className={`flex h-screen ${isRTL ? 'font-arabic' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* AppBar */}
        <AppBar setSidebarOpen={setSidebarOpen} setLoading={setLoading} />

        {/* Loading Screen */}
        {loading && <LoadingScreen />}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;