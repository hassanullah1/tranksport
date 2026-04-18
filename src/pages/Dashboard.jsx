import React, { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import StatsCards from "../components/dashboard/StatsCards";

const Dashboard = () => {
  const { t } = useLanguage();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("week");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const options = { period };
      if (period === "custom" && customStart && customEnd) {
        options.startDate = customStart;
        options.endDate = customEnd;
      }
      const result = await window.electronAPI.getDashboardSummary(options);
      if (result.success) {
        setDashboardData(result.data);
      } else {
        console.error("Failed to load dashboard data:", result.error);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-load only when period changes (for non-custom periods)
  useEffect(() => {
    if (period !== "custom") {
      loadDashboardData();
    } else {
      // Clear data when switching to custom (until Apply is clicked)
      setDashboardData(null);
    }
  }, [period]);

  const handleApplyCustom = () => {
    if (customStart && customEnd) {
      loadDashboardData();
    } else {
      alert("Please select both start and end dates");
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("app.loading")}</p>
        </div>
      </div>
    );
  }

  // Prepare stats based on backend data
  const stats = dashboardData
    ? [
      
        {
          title: "Total Cost",
          value: formatCurrency(dashboardData.total_cost_sum),
          icon: "💰",
          color: "bg-red-500",
        },
        {
          title: "Commission",
          value: formatCurrency(dashboardData.commission_sum),
          icon: "💸",
          color: "bg-indigo-500",
        },
        {
          title: "Fees Earned",
          value: formatCurrency(dashboardData.fess_sum),
          icon: "💵",
          color: "bg-pink-500",
        },
        {
          title: "Return Fees",
          value: formatCurrency(dashboardData.total_return_fees),
          icon: "↩️",
          color: "bg-orange-500",
        },
        // Item status cards
        {
          title: "Pending Items",
          value: dashboardData.pending_items,
          icon: "⏳",
          color: "bg-yellow-400",
        },
        {
          title: "Delivered Items",
          value: dashboardData.delivered_items,
          icon: "✅",
          color: "bg-green-400",
        },
        {
          title: "Cancelled Items",
          value: dashboardData.cancelled_items,
          icon: "❌",
          color: "bg-red-400",
        },
        {
          title: "Rejected Items",
          value: dashboardData.rejected_items,
          icon: "🚫",
          color: "bg-orange-400",
        },
      ]
    : [];

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-500 to-purple-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, Admin! 👋</h1>
            <p className="mt-2 opacity-90">
              {period === "today"
                ? "Today's"
                : period === "week"
                  ? "This week's"
                  : period === "month"
                    ? "This month's"
                    : period === "year"
                      ? "This year's"
                      : "Selected period's"}{" "}
              summary
            </p>
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
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="custom">Custom</option>
        </select>
        {period === "custom" && (
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
        {period === "custom" && (
          <button
            onClick={handleApplyCustom}
            className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition"
          >
            Apply
          </button>
        )}
      </div>

      {/* Stats Grid */}
      {dashboardData ? (
        <StatsCards stats={stats} />
      ) : (
        <div className="text-center py-10 text-gray-500">
          {period === "custom"
            ? "Select dates and click Apply"
            : "No data available"}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
