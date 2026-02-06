import React, { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import StatsCards from "../components/dashboard/StatsCards";
// import DeliveriesTable from "../components/dashboard/DeliveriesTable";
// import FinancialSummary from "../components/dashboard/FinancialSummary";
// import QuickStats from "../components/dashboard/QuickStats";
// import TopAgents from "../components/dashboard/TopAgents";
// import ActiveProvinces from "../components/dashboard/ActiveProvinces";
// import QuickDelivery from "../components/dashboard/QuickDelivery";

const Dashboard = () => {
  const { t } = useLanguage();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load data from Electron API
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [
        deliveriesData,
        // Add other API calls here
      ] = await Promise.all([
        window.electronAPI.getDeliveries(),
        // Add other API calls
      ]);
      
      setDeliveries(deliveriesData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('app.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-500 to-purple-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, Admin! 👋</h1>
            <p className="mt-2 opacity-90">Here's what's happening with your delivery service today.</p>
          </div>
          <button className="mt-4 md:mt-0 bg-white text-primary-600 hover:bg-gray-100 font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
            View Detailed Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <StatsCards />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deliveries Table */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Recent Deliveries</h2>
                <p className="text-gray-500">Track and manage your delivery orders</p>
              </div>
              <div className="flex space-x-3 mt-4 sm:mt-0">
                <button className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 flex items-center">
                  <span className="mr-2">+</span> Add New
                </button>
                <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2 rounded-lg transition-all duration-300">
                  Export
                </button>
              </div>
            </div>
            {/* <DeliveriesTable deliveries={deliveries} /> */}
          </div>

          {/* Financial Summary */}
          {/* <FinancialSummary /> */}
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* <QuickStats />
          <TopAgents />
          <ActiveProvinces />
          <QuickDelivery /> */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;