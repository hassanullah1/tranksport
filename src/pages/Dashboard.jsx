// Dashboard.jsx (updated)

import React, { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import StatsCards from "../components/dashboard/StatsCards";

const Dashboard = () => {
  const { t } = useLanguage();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week'); // 'week', 'month', 'year', 'custom'
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const options = { period };
      if (period === 'custom' && customStart && customEnd) {
        options.startDate = customStart;
        options.endDate = customEnd;
      }
      const result = await window.electronAPI.getDashboardSummary(options);
      if (result.success) {
        setDashboardData(result.data);
      } else {
        console.error('Failed to load dashboard data:', result.error);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [period, customStart, customEnd]); // reload when period or custom dates change

  // Helper to format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
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

  // Prepare stats for StatsCards component (you'll need to adapt StatsCards to accept these props)
  const stats = dashboardData ? [
    { title: 'Total Provinces', value: dashboardData.total_provinces, icon: '🏛️', color: 'bg-blue-500' },
    { title: 'Total Agents', value: dashboardData.total_agents, icon: '👤', color: 'bg-green-500' },
    { title: 'Deliveries', value: dashboardData.total_deliveries, icon: '🚚', color: 'bg-yellow-500' },
    { title: 'Items Sold', value: dashboardData.total_items_sold, icon: '📦', color: 'bg-purple-500' },
    { title: 'Total Cost', value: formatCurrency(dashboardData.total_cost_sum), icon: '💰', color: 'bg-red-500' },
    { title: 'Commission', value: formatCurrency(dashboardData.commission_sum), icon: '💸', color: 'bg-indigo-500' },
    { title: 'Fees Earned', value: formatCurrency(dashboardData.fess_sum), icon: '💵', color: 'bg-pink-500' },
    { title: 'Return Fees', value: formatCurrency(dashboardData.total_return_fees), icon: '↩️', color: 'bg-orange-500' },
  ] : [];

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

      {/* Date Range Selector */}
      <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-wrap gap-4 items-center">
        <label className="font-semibold text-gray-700">Date Range:</label>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="custom">Custom</option>
        </select>
        {period === 'custom' && (
          <>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <span>to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </>
        )}
      </div>

      {/* Stats Grid */}
      <StatsCards stats={stats} />
    </div>
  );
};

export default Dashboard;