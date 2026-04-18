import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Deliveries from "../pages/Deliveries";
import Agents from "../pages/Agents";
import Provinces from "../pages/Provinces";
import DeliveriesList from '../pages/deliveries/DeliveriesList';
import AddDelivery from '../pages/deliveries/AddDelivery';
import EditDelivery from '../pages/deliveries/EditDelivery';
import ViewDelivery from '../pages/deliveries/ViewDelivery';
import AgentDeliveries from "../pages/agents/AgentDeliveries";
import BulkAssign from "../pages/deliveries/BulkAssign";
import AgentAssignmentList from "../components/deliveries/AgentAssignmentList";
import AgentDeliveriesList from "../components/deliveries/AgentDeliveriesList";

import BillDetails from "../components/deliveries/BillDetails";
import FinancialReport from "../pages/FinancialReport";
import Settings from "../pages/Setting";
import Expenses from "../pages/Expenses";
import ProvinceDetail from "../pages/ProvinceDetail";

// import Financial from "../pages/Financial";
// import Reports from "../pages/Reports";
// import Settings from "../pages/Settings";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/provinces" element={<Provinces />} />
      <Route path="/expenses" element={<Expenses />} />
      <Route path="/agents" element={<Agents />} />
      <Route path="/deliveries" element={<DeliveriesList />} />

      <Route path="/deliveries/add" element={<AddDelivery />} />
      <Route path="/deliveries/assign" element={<BulkAssign />} />
      <Route path="/deliveries/edit/:id" element={<EditDelivery />} />
      <Route path="/deliveries/view/:id" element={<ViewDelivery />} />
      <Route path="/agents/:agentId/deliveries" element={<AgentDeliveries />} />
      <Route path="/deliveries/agents" element={<AgentAssignmentList />} />
      <Route
        path="/deliveries/agent/:agentId"
        element={<AgentDeliveriesList />}
      />
      <Route path="/province/:provinceId" element={<ProvinceDetail />} />
      <Route path="/deliveries/bills/:billId" element={<BillDetails />} />

      <Route path="/financial" element={<FinancialReport />} />
      <Route path="/settings" element={<Settings />} />
      {/* 

      <Route path="/financial" element={<Financial />} />
      <Route path="/reports" element={<Reports />} />
    
      <Route path="*" element={<Navigate to="/" replace />} /> */}
    </Routes>
  );
};

export default AppRoutes;