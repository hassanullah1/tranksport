import React, { useEffect, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import {
  FaUserTie,
  FaPhone,
  FaCalendarAlt,
  FaBoxes,
  FaCheckCircle,
  FaClock,
  FaTruck,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaUndo
} from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AgentAssignmentList = () => {
  const { language, isRTL } = useLanguage();
  const navigate = useNavigate();

  // ---------- State ----------
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'total_deliveries', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ---------- Load Data ----------
  useEffect(() => {
    loadAgentPerformance();
  }, []);

  const loadAgentPerformance = async () => {
    try {
      setLoading(true);
      const data = await window.electronAPI.getAgentPerformance();
      setAgents(data);
      setFilteredAgents(data);
    } catch (error) {
      toast.error("Failed to load agent performance");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Search ----------
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredAgents(agents);
    } else {
      const lowerTerm = searchTerm.toLowerCase();
      const filtered = agents.filter(
        agent =>
          agent.agent_name?.toLowerCase().includes(lowerTerm) ||
          agent.phone?.includes(lowerTerm)
      );
      setFilteredAgents(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, agents]);

  // ---------- Sorting ----------
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredAgents].sort((a, b) => {
      let aVal = a[key] ?? 0;
      let bVal = b[key] ?? 0;
      if (key === 'agent_name') {
        aVal = a[key] || '';
        bVal = b[key] || '';
        return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (key === 'latest_assigned_date') {
        aVal = a[key] ? new Date(a[key]) : new Date(0);
        bVal = b[key] ? new Date(b[key]) : new Date(0);
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      // numeric
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
    setFilteredAgents(sorted);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="text-xs text-gray-400" />;
    return sortConfig.direction === 'asc' 
      ? <FaSortUp className="text-xs text-blue-600" />
      : <FaSortDown className="text-xs text-blue-600" />;
  };

  // ---------- Pagination ----------
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAgents = filteredAgents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);

  // ---------- Translations ----------
  const translations = {
    header: {
      en: { title: "Agent Assignments", subtitle: "Overview of delivery agents and their assigned deliveries" },
      ps: { title: "د اجنټانو دندې", subtitle: "د لیږد اجنټانو او د هغوی دندو کتنه" },
      fa: { title: "تکالیف نمایندگان", subtitle: "نمای کلی نمایندگان و محموله‌های محول شده" }
    },
    table: {
      en: {
        agent: "Agent",
        phone: "Phone",
        total: "Total Deliveries",
        pending: "Pending",
        delivered: "Delivered",
        commission: "Commission",
        lastAssigned: "Last Assigned",
        actions: "Actions"
      },
      ps: {
        agent: "اجنټ",
        phone: "ټیلیفون",
        total: "ټول لیږدونه",
        pending: "په تمه",
        delivered: "تحویل شوی",
        commission: "کمیسیون",
        lastAssigned: "وروستۍ دنده",
        actions: "کړنې"
      },
      fa: {
        agent: "نماینده",
        phone: "تلفن",
        total: "کل محموله‌ها",
        pending: "در انتظار",
        delivered: "تحویل شده",
        commission: "کمیسیون",
        lastAssigned: "آخرین محول",
        actions: "عملیات"
      }
    },
    search: {
      en: { placeholder: "Search by agent name or phone..." },
      ps: { placeholder: "د اجنټ په نوم یا ټیلیفون پلټل..." },
      fa: { placeholder: "جستجو با نام نماینده یا تلفن..." }
    },
    pagination: {
      en: { showing: "Showing", to: "to", of: "of", entries: "entries", per_page: "per page" },
      ps: { showing: "ښکاره کول", to: "تر", of: "د", entries: "داخلونه", per_page: "په هر پاڼه کې" },
      fa: { showing: "نمایش", to: "تا", of: "از", entries: "رکورد", per_page: "در هر صفحه" }
    }
  };

  const trans = (cat, key) => {
    return translations[cat]?.[language]?.[key] || translations[cat]?.en?.[key] || key;
  };

  // ---------- Render ----------
  return (
    <div className="p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <ToastContainer position={isRTL ? "top-left" : "top-right"} rtl={isRTL} />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">{trans('header', 'title')}</h1>
        <p className="text-sm text-gray-600 mt-1">{trans('header', 'subtitle')}</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4 shadow-sm">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={trans('search', 'placeholder')}
            className={`w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm`}
          />
          <FaSearch className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-2.5 text-gray-400 text-sm`} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <FaUserTie className="text-gray-300 text-4xl mb-2" />
            <p className="text-gray-500">No agents found</p>
          </div>
        ) : (
          <>
            {/* Per page */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <span className="text-xs text-gray-600">
                {filteredAgents.length} {trans('pagination', 'entries')}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">{trans('pagination', 'per_page')}:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="border border-gray-300 rounded px-2 py-1 text-xs bg-white"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      <div className="flex items-center gap-1">
                        <FaUserTie className="text-gray-400 text-xs" />
                        <span>{trans('table', 'agent')}</span>
                        <button onClick={() => handleSort('agent_name')} className="ml-1">
                          {getSortIcon('agent_name')}
                        </button>
                      </div>
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      <div className="flex items-center gap-1">
                        <FaPhone className="text-gray-400 text-xs" />
                        <span>{trans('table', 'phone')}</span>
                      </div>
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      <div className="flex items-center gap-1">
                        <FaBoxes className="text-gray-400 text-xs" />
                        <span>{trans('table', 'total')}</span>
                        <button onClick={() => handleSort('total_deliveries')} className="ml-1">
                          {getSortIcon('total_deliveries')}
                        </button>
                      </div>
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      <div className="flex items-center gap-1">
                        <FaClock className="text-yellow-400 text-xs" />
                        <span>{trans('table', 'pending')}</span>
                      </div>
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      <div className="flex items-center gap-1">
                        <FaCheckCircle className="text-green-400 text-xs" />
                        <span>{trans('table', 'delivered')}</span>
                      </div>
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      <div className="flex items-center gap-1">
                        <span>{trans('table', 'commission')}</span>
                        <button onClick={() => handleSort('total_commission_earned')} className="ml-1">
                          {getSortIcon('total_commission_earned')}
                        </button>
                      </div>
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      <div className="flex items-center gap-1">
                        <FaCalendarAlt className="text-gray-400 text-xs" />
                        <span>{trans('table', 'lastAssigned')}</span>
                        <button onClick={() => handleSort('latest_assigned_date')} className="ml-1">
                          {getSortIcon('latest_assigned_date')}
                        </button>
                      </div>
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                      {trans('table', 'actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentAgents.map((agent) => (
                    <tr
                      key={agent.agent_id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/deliveries/agent/${agent.agent_id}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{agent.agent_name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-700">{agent.phone || '—'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-blue-600">{agent.total_deliveries}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          {agent.pending_count}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          {agent.delivered_count}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-700">${Number(agent.total_commission_earned).toFixed(2)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-700">
                          {agent.latest_assigned_date
                            ? new Date(agent.latest_assigned_date).toLocaleDateString()
                            : '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/deliveries/agent/${agent.agent_id}`);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="text-xs text-gray-600">
                {trans('pagination', 'showing')} {indexOfFirstItem + 1} {trans('pagination', 'to')}{' '}
                {Math.min(indexOfLastItem, filteredAgents.length)} {trans('pagination', 'of')}{' '}
                {filteredAgents.length} {trans('pagination', 'entries')}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <FaChevronLeft className="text-xs" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page = 1;
                  if (totalPages <= 5) page = i + 1;
                  else if (currentPage <= 3) page = i + 1;
                  else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                  else page = currentPage - 2 + i;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded text-xs font-medium ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <FaChevronRight className="text-xs" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AgentAssignmentList;