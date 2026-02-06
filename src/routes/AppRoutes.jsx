import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Deliveries from "../pages/Deliveries";
import Agents from "../pages/Agents";
import Provinces from "../pages/Provinces";
// import Financial from "../pages/Financial";
// import Reports from "../pages/Reports";
// import Settings from "../pages/Settings";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
       <Route path="/provinces" element={<Provinces />} />
           <Route path="/agents" element={<Agents />} />
           <Route path="/deliveries" element={<Deliveries />} />
      {/* 
  
     
      <Route path="/financial" element={<Financial />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/" replace />} /> */}
    </Routes>
  );
};

export default AppRoutes;