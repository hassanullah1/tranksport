// App.js
import React, { useState, useEffect } from "react";
import { HashRouter as Router } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import AppLayout from "./components/AppLayout";
import AppRoutes from "./routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SplashScreen from "./components/SplashScreen";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // If you want to guarantee 4 seconds even if component mounts later, use a ref or timer.
  // But our SplashScreen handles its own timing.

  return (
    <>
      {showSplash ? (
        <SplashScreen onFinish={handleSplashFinish} />
      ) : (
        <LanguageProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
              <ToastContainer />
              <AppLayout>
                <AppRoutes />
              </AppLayout>
            </div>
          </Router>
        </LanguageProvider>
      )}
    </>
  );
}

export default App;
