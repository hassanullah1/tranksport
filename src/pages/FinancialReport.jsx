// DeliveriesList.jsx
import React, { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { Link, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaFileExport,
  FaTimes,
  FaEdit,
  FaEye,
  FaTruck,
} from "react-icons/fa";
import { toast } from "react-toastify";

const DeliveriesList = () => {
  const { t, language, isRTL } = useLanguage();
  const navigate = useNavigate();

  // Data states
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);


  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0"); // month is 0-based
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };
  // Filter states
  const [filters, setFilters] = useState({
    status: "",
    return_status: "",
    province_id: "",
    agent_id: "",
    date_from: getTodayDate(), // default today
    date_to: getTodayDate(), // default today
  });

  // Load initial data
  useEffect(() => {
    loadProvinces();
    loadAgents();
    loadStats();
    loadDeliveries();
  }, []);

  // Reload deliveries when filters change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadDeliveries();
    }, 500);
    return () => clearTimeout(timer);
  }, [filters]);

  const loadProvinces = async () => {
    try {
      const data = await window.electronAPI.getProvinces();
      setProvinces(data || []);
    } catch (error) {
      console.error("Failed to load provinces", error);
    }
  };

  const loadAgents = async () => {
    try {
      const data = await window.electronAPI.getAgents();
      console.log(data);
      setAgents(data || []);
    } catch (error) {
      console.error("Failed to load agents", error);
    }
  };

  const loadStats = async () => {
    try {
      const data = await window.electronAPI.getDeliveryStats();
      console.log(data);
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats", error);
    }
  };

  const loadDeliveries = async () => {
    setLoading(true);
    try {
      const filterParams = {
        status: filters.status || undefined,
        return_status: filters.return_status || undefined,
        province_id: filters.province_id || undefined,
        agent_id: filters.agent_id || undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
        search: filters.search || undefined,
      };

      // Use the correct IPC method
      const data =
        await window.electronAPI.getDeliveriesWithFilters(filterParams);
      setDeliveries(data || []);
      console.log(data);
      setFilteredDeliveries(data || []);
    } catch (error) {
      toast.error("Failed to load deliveries");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      return_status: "",
      province_id: "",
      agent_id: "",
        date_from: getTodayDate(),
    date_to: getTodayDate(),
      search: "",
    });
  };

  const exportToCSV = () => {
    if (filteredDeliveries.length === 0) {
      toast.warning("No data to export");
      return;
    }

    const headers = [
      "ID",
      "Tracking",
      "Customer",
      "Province",
      "Agent",
      "Delivery Date",
      "Status",
      "Return Status",
      "Total Items",
      "Total Amount",
    ];

    const rows = filteredDeliveries.map((d) => [
      d.delivery_id,

      d.customer_name || "",
      d.province_name || "",
      d.agent_name || "",
      formatDateForExport(d.delivery_date), // ensure string
      d.status || "",
      d.return_status || "",
      d.items?.length || 0,
      d.total_amount || "0.00",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute(
      "download",
      `deliveries_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Safe date formatter for display
  const formatDate = (dateInput) => {
    if (!dateInput) return "-";
    if (typeof dateInput === "string") return dateInput.split("T")[0]; // show only date part
    if (dateInput instanceof Date) {
      return dateInput.toLocaleDateString();
    }
    return String(dateInput);
  };

  // For CSV, ensure it's a plain string
  const formatDateForExport = (dateInput) => {
    if (!dateInput) return "";
    if (typeof dateInput === "string") return dateInput.split("T")[0];
    if (dateInput instanceof Date) return dateInput.toISOString().split("T")[0];
    return String(dateInput);
  };

  const getStatusBadge = (status) => {
    const config = {
      in_transit: "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config[status] || "bg-gray-100"}`}
      >
        {status}
      </span>
    );
  };

  const getReturnStatusBadge = (returnStatus, fee) => {
    if (!(!returnStatus || returnStatus === "none")) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          {fee}
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Noon
        </span>
      );
    }
  };

  const textAlign = isRTL ? "text-right" : "text-left";
  const totals = filteredDeliveries.reduce(
    (acc, d) => {
      const amount = Number(d.total_amount) || 0;
      const fees = Number(d.total_fess) || 0;
      const commission = Number(d.total_commission) || 0;
      const return_fee = Number(d.return_fee_charged) || 0;

      // ✅ ALWAYS calculate return (for all statuses)
      acc.totalReturn += return_fee;

      // ✅ ONLY delivered for other totals
      if (d.status === "delivered") {
        acc.totalAmount += amount;
        acc.totalFees += fees;
        acc.totalCommission += commission;
        acc.totalCustomer += amount - (fees + commission);
      }

      return acc;
    },
    {
      totalReturn: 0,
      totalAmount: 0,
      totalFees: 0,
      totalCommission: 0,
      totalCustomer: 0,
    },
  );
  return (
    <div className="min-h-screen bg-gray-50 p-4" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <FaTruck className="text-blue-600 text-2xl" />
            <h1 className="text-xl font-bold text-gray-800">Deliveries</h1>
          </div>
          <Link
            to="/deliveries/add"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            + New Delivery
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex flex-wrap items-end gap-3">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-gray-600 mb-1">Search</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="ID, customer, tracking..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            {/* Status filter */}
            <div className="w-40">
              <label className="block text-xs text-gray-600 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All</option>

                <option value="pending">Pending</option>
                <option value=" in_transit">Transit</option>
                <option value="rejected">Rejected</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Return Status filter */}
            <div className="w-40">
              <label className="block text-xs text-gray-600 mb-1">
                Return Status
              </label>
              <select
                value={filters.return_status}
                onChange={(e) =>
                  handleFilterChange("return_status", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All</option>

                <option value="full_return">Return</option>
              </select>
            </div>

            {/* Province filter */}
            <div className="w-40">
              <label className="block text-xs text-gray-600 mb-1">
                Province
              </label>
              <select
                value={filters.province_id}
                onChange={(e) =>
                  handleFilterChange("province_id", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All</option>
                {provinces.map((p) => (
                  <option key={p.province_id} value={p.province_id}>
                    {p.province_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Agent filter */}
            <div className="w-40">
              <label className="block text-xs text-gray-600 mb-1">Agent</label>
              <select
                value={filters.agent_id}
                onChange={(e) => handleFilterChange("agent_id", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All</option>
                {agents.map((a) => (
                  <option key={a.agent_id} value={a.agent_id}>
                    {a.agent_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date range */}
            <div className="w-36">
              <label className="block text-xs text-gray-600 mb-1">From</label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) =>
                  handleFilterChange("date_from", e.target.value)
                }
                className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div className="w-36">
              <label className="block text-xs text-gray-600 mb-1">To</label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange("date_to", e.target.value)}
                className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            {/* Clear Filters button */}
            <button
              onClick={clearFilters}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex items-center gap-1 hover:bg-gray-50"
            >
              <FaTimes /> Clear
            </button>

            {/* Export button */}
            <button
              onClick={exportToCSV}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center gap-1"
            >
              <FaFileExport /> Export
            </button>
          </div>
        </div>

        {/* Deliveries Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          ) : filteredDeliveries.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FaTruck className="text-4xl mx-auto mb-2 text-gray-300" />
              <p>No deliveries found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className={`px-4 py-3 ${textAlign} font-medium text-gray-600`}
                    >
                      ID
                    </th>

                    <th
                      className={`px-4 py-3 ${textAlign} font-medium text-gray-600`}
                    >
                      Customer
                    </th>
                    <th
                      className={`px-4 py-3 ${textAlign} font-medium text-gray-600`}
                    >
                      Province
                    </th>

                    <th
                      className={`px-4 py-3 ${textAlign} font-medium text-gray-600`}
                    >
                      Date
                    </th>

                    <th
                      className={`px-4 py-3 ${textAlign} font-medium text-gray-600`}
                    >
                      agent
                    </th>
                    <th
                      className={`px-4 py-3 ${textAlign} font-medium text-gray-600`}
                    >
                      customer
                    </th>
                    <th
                      className={`px-4 py-3 ${textAlign} font-medium text-gray-600`}
                    >
                      fee
                    </th>
                    <th
                      className={`px-4 py-3 ${textAlign} font-medium text-gray-600`}
                    >
                      Total
                    </th>
                    <th
                      className={`px-4 py-3 ${textAlign} font-medium text-gray-600`}
                    >
                      Status
                    </th>
                    <th
                      className={`px-4 py-3 ${textAlign} font-medium text-gray-600`}
                    >
                      Return
                    </th>
                    <th
                      className={`px-4 py-3 ${textAlign} font-medium text-gray-600`}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDeliveries.map((delivery) => (
                    <tr key={delivery.delivery_id} className="hover:bg-gray-50">
                      <td className={`px-4 py-3 ${textAlign}`}>
                        #{delivery.delivery_id}
                      </td>

                      <td className={`px-4 py-3 ${textAlign}`}>
                        <div className="font-medium">
                          {delivery.customer_name}
                        </div>
                        {delivery.customer_phone && (
                          <div className="text-xs text-gray-500">
                            {delivery.customer_phone}
                          </div>
                        )}
                      </td>
                      <td className={`px-4 py-3 ${textAlign}`}>
                        {delivery.province_name || "-"}
                      </td>

                      <td className={`px-4 py-3 ${textAlign}`}>
                        {formatDate(delivery.delivery_date)}
                      </td>
                      <td className={`px-4 py-3 ${textAlign}`}>
                        {Number(delivery.total_commission || 0)}
                      </td>
                      <td className={`px-4 py-3 ${textAlign}`}>
                        {Number(delivery.total_amount || 0) -
                          (Number(delivery.total_fess || 0) +
                            Number(delivery.total_commission || 0))}
                      </td>
                      <td className={`px-4 py-3 ${textAlign}`}>
                        {Number(delivery.total_fess || 0)}
                      </td>

                      <td className={`px-4 py-3 ${textAlign}`}>
                        {Number(delivery.total_amount || 0)}
                      </td>

                      <td className={`px-4 py-3 ${textAlign}`}>
                        {getStatusBadge(delivery.status)}
                      </td>
                      <td className={`px-4 py-3 ${textAlign}`}>
                        {getReturnStatusBadge(
                          delivery.return_status,
                          delivery.return_fee_charged,
                        )}
                      </td>
                      <td className={`px-4 py-3 ${textAlign}`}>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/deliveries/view/${delivery.delivery_id}`}
                            className="text-blue-600 hover:text-blue-800"
                            title="View"
                          >
                            <FaEye />
                          </Link>
                          <Link
                            to={`/deliveries/edit/${delivery.delivery_id}`}
                            className="text-green-600 hover:text-green-800"
                            title="Edit"
                          >
                            <FaEdit />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-bold">
                    <td colSpan="4" className={`px-4 py-3 ${textAlign}`}>
                      Total
                    </td>

                    {/* Commission */}
                    <td className={`px-4 py-3 ${textAlign}`}>
                      {totals.totalCommission}
                    </td>

                    {/* Customer amount */}
                    <td className={`px-4 py-3 ${textAlign}`}>
                      {totals.totalCustomer}
                    </td>

                    {/* Fees */}
                    <td className={`px-4 py-3 ${textAlign}`}>
                      {totals.totalFees}
                    </td>

                    {/* Total amount */}
                    <td className={`px-4 py-3 ${textAlign}`}>
                      {totals.totalAmount}
                    </td>
                    {/* Total amount */}
                    <td className={`px-4 py-3 ${textAlign}`}></td>
                    {/* Total amount */}
                    <td className={`px-4 py-3 ${textAlign}`}>
                      {totals.totalReturn}
                    </td>

                    <td colSpan="3"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveriesList;
