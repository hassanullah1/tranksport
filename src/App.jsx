import React, { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import AppLayout from "./components/AppLayout";
import AppRoutes from "./routes/AppRoutes";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
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
  );
}

export default App;