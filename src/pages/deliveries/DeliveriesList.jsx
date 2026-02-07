import React, { useEffect, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaSync, 
  FaFilter,
  FaTruck,
  FaBox,
  FaMoneyBillWave,
  FaUser,
  FaPrint,
  FaEye,
  FaList,
  FaTimes,
  FaEllipsisV,
  FaChevronLeft,
  FaChevronRight,
  FaMapMarkerAlt,
  FaTag,
  FaCalendar,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaFileExport,
  FaUserTie,
  FaPhone,
  FaHashtag,
  FaCheckCircle,
  FaClock,
  FaShippingFast,
  FaBan,
  FaEllipsisH,
  FaCaretDown
} from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DeliveriesList = () => {
  const { t, language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [stats, setStats] = useState(null);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expandedActions, setExpandedActions] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20); // Increased default
  const [sortConfig, setSortConfig] = useState({ key: 'delivery_date', direction: 'desc' });
  const [statusFilter, setStatusFilter] = useState("all");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [deliveriesData, statsData] = await Promise.all([
        window.electronAPI.getDeliveries(),
        window.electronAPI.getDeliveryStats()
      ]);
      
      const sortedData = deliveriesData.sort((a, b) => 
        new Date(b.delivery_date) - new Date(a.delivery_date)
      );
      
      setDeliveries(sortedData);
      setStats(statsData);
    } catch (error) {
      toast.error("Failed to load data");
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      if (searchTerm.trim() === "") {
        const data = await window.electronAPI.getDeliveries();
        setDeliveries(data);
      } else {
        const data = await window.electronAPI.searchDeliveries(searchTerm, searchType);
        setDeliveries(data);
      }
      setCurrentPage(1);
    } catch (error) {
      toast.error("Search failed");
      console.error("Error searching deliveries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDelivery = async () => {
    if (!selectedDelivery) return;

    try {
      const result = await window.electronAPI.deleteDelivery(selectedDelivery.delivery_id);
      toast.success(result.message);
      setShowDeleteModal(false);
      setSelectedDelivery(null);
      loadAllData();
    } catch (error) {
      toast.error(error.message || "Failed to delete delivery");
    }
  };

  const handlePrintInvoice = async (deliveryId) => {
    try {
      await window.electronAPI.generateInvoice(deliveryId);
      toast.success("Invoice generated successfully");
    } catch (error) {
      toast.error("Failed to generate invoice");
    }
  };

  const toggleActions = (deliveryId, event) => {
    event.stopPropagation();
    if (expandedActions === deliveryId) {
      setExpandedActions(null);
    } else {
      setExpandedActions(deliveryId);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { 
        color: "bg-yellow-50 text-yellow-700 border border-yellow-200", 
        text: "Pending",
        icon: <FaClock className="mr-1 text-xs" />
      },
      in_transit: { 
        color: "bg-blue-50 text-blue-700 border border-blue-200", 
        text: "In Transit",
        icon: <FaShippingFast className="mr-1 text-xs" />
      },
      delivered: { 
        color: "bg-green-50 text-green-700 border border-green-200", 
        text: "Delivered",
        icon: <FaCheckCircle className="mr-1 text-xs" />
      },
      cancelled: { 
        color: "bg-red-50 text-red-700 border border-red-200", 
        text: "Cancelled",
        icon: <FaBan className="mr-1 text-xs" />
      }
    };
    
    const statusInfo = statusMap[status] || statusMap.pending;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color} flex items-center justify-center whitespace-nowrap`}>
        {statusInfo.icon}
        {statusInfo.text}
      </span>
    );
  };

  // Sort function
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sorted deliveries
  const getSortedDeliveries = () => {
    const sorted = [...deliveries];
    sorted.sort((a, b) => {
      if (sortConfig.key === 'delivery_date') {
        const dateA = new Date(a.delivery_date);
        const dateB = new Date(b.delivery_date);
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      if (sortConfig.key === 'customer_name') {
        return sortConfig.direction === 'asc' 
          ? (a.customer_name || '').localeCompare(b.customer_name || '')
          : (b.customer_name || '').localeCompare(a.customer_name || '');
      }
      if (sortConfig.key === 'tracking_number') {
        return sortConfig.direction === 'asc'
          ? (a.tracking_number || '').localeCompare(b.tracking_number || '')
          : (b.tracking_number || '').localeCompare(a.tracking_number || '');
      }
      if (sortConfig.key === 'agent_name') {
        return sortConfig.direction === 'asc'
          ? (a.agent_name || '').localeCompare(b.agent_name || '')
          : (b.agent_name || '').localeCompare(a.agent_name || '');
      }
      return 0;
    });
    return sorted;
  };

  // Filter deliveries by status
  const getFilteredDeliveries = () => {
    const sorted = getSortedDeliveries();
    if (statusFilter === "all") return sorted;
    return sorted.filter(delivery => delivery.status === statusFilter);
  };

  // Pagination calculations
  const filteredDeliveries = getFilteredDeliveries();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDeliveries = filteredDeliveries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const translations = {
    header: {
      en: { title: "Deliveries", subtitle: "Manage all delivery shipments" },
      ps: { title: "لیږدونه", subtitle: "ټول لیږدونه اداره کړئ" },
      fa: { title: "تحویل‌ها", subtitle: "مدیریت تمام محموله‌های تحویلی" }
    },
    buttons: {
      en: {
        add_delivery: "Add Delivery",
        search: "Search",
        refresh: "Refresh",
        clear: "Clear",
        view: "View",
        print: "Print",
        edit: "Edit",
        delete: "Delete",
        export: "Export",
        all: "All Status",
        pending: "Pending",
        in_transit: "In Transit",
        delivered: "Delivered",
        cancelled: "Cancelled"
      },
      ps: {
        add_delivery: "لیږد اضافه کړئ",
        search: "پلټل",
        refresh: "تازه کول",
        clear: "پاکول",
        view: "لیدل",
        print: "چاپ",
        edit: "سمول",
        delete: "ړنګول",
        export: "صادرول",
        all: "ټول حالتی",
        pending: "په تمه کې",
        in_transit: "په لاره کې",
        delivered: "تحویل شوی",
        cancelled: "لغوه شوی"
      },
      fa: {
        add_delivery: "افزودن تحویل",
        search: "جستجو",
        refresh: "تازه‌سازی",
        clear: "پاک کردن",
        view: "مشاهده",
        print: "چاپ",
        edit: "ویرایش",
        delete: "حذف",
        export: "خروجی",
        all: "همه وضعیت‌ها",
        pending: "در انتظار",
        in_transit: "در حال انتقال",
        delivered: "تحویل شده",
        cancelled: "لغو شده"
      }
    },
    table: {
      en: {
        tracking: "Tracking",
        customer: "Customer",
        province: "Province",
        agent: "Agent",
        condition: "Status",
        date: "Date",
        actions: "Actions"
      },
      ps: {
        tracking: "تعقیب",
        customer: "پیرودونکی",
        province: "ولایت",
        agent: "اجنټ",
        condition: "حالت",
        date: "نیټه",
        actions: "کړنې"
      },
      fa: {
        tracking: "پیگیری",
        customer: "مشتری",
        province: "ولایت",
        agent: "نماینده",
        condition: "وضعیت",
        date: "تاریخ",
        actions: "عملیات"
      }
    },
    search: {
      en: {
        all: "All Fields",
        customer: "Customer Name",
        agent: "Agent Name",
        tracking: "Tracking Number"
      },
      ps: {
        all: "ټول ساحې",
        customer: "د پیرودونکی نوم",
        agent: "د اجنټ نوم",
        tracking: "د تعقیب نمبر"
      },
      fa: {
        all: "همه فیلدها",
        customer: "نام مشتری",
        agent: "نام نماینده",
        tracking: "شماره پیگیری"
      }
    },
    pagination: {
      en: {
        showing: "Showing",
        to: "to",
        of: "of",
        entries: "entries",
        per_page: "per page",
        results: "results"
      },
      ps: {
        showing: "ښکاره کول",
        to: "تر",
        of: "د",
        entries: "داخلونه",
        per_page: "په هر پاڼه کې",
        results: "پايلې"
      },
      fa: {
        showing: "نمایش",
        to: "تا",
        of: "از",
        entries: "رکورد",
        per_page: "در هر صفحه",
        results: "نتیجه"
      }
    }
  };

  const trans = (category, key) => {
    return translations[category]?.[language]?.[key] || 
           translations[category]?.en?.[key] || 
           key;
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.actions-dropdown')) {
        setExpandedActions(null);
      }
      if (!event.target.closest('.status-dropdown')) {
        setShowStatusDropdown(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const getStatusLabel = (status) => {
    const statusMap = {
      all: trans('buttons', 'all'),
      pending: trans('buttons', 'pending'),
      in_transit: trans('buttons', 'in_transit'),
      delivered: trans('buttons', 'delivered'),
      cancelled: trans('buttons', 'cancelled')
    };
    return statusMap[status] || status;
  };

  return (
    <div className="p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <ToastContainer 
        position={isRTL ? "top-left" : "top-right"} 
        autoClose={3000} 
        rtl={isRTL}
      />

      {/* Compact Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {trans('header', 'title')}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {trans('header', 'subtitle')}
            </p>
          </div>
          <div>
            <Link
              to="/deliveries/add"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center text-sm shadow-sm hover:shadow"
            >
              <FaPlus className={`${isRTL ? 'ml-2' : 'mr-2'} text-sm`} /> 
              {trans('buttons', 'add_delivery')}
            </Link>
          </div>
        </div>

        {/* Compact Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-medium">{trans('buttons', 'all')}</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{stats?.total_deliveries || 0}</p>
              </div>
              <FaTruck className="text-blue-500 text-sm" />
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-yellow-600 font-medium">{trans('buttons', 'pending')}</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{stats?.pending_deliveries || 0}</p>
              </div>
              <FaClock className="text-yellow-500 text-sm" />
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-medium">{trans('buttons', 'in_transit')}</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{stats?.in_transit_deliveries || 0}</p>
              </div>
              <FaShippingFast className="text-blue-500 text-sm" />
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-100 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 font-medium">{trans('buttons', 'delivered')}</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{stats?.delivered_deliveries || 0}</p>
              </div>
              <FaCheckCircle className="text-green-500 text-sm" />
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-100 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-600 font-medium">{trans('buttons', 'cancelled')}</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{stats?.cancelled_deliveries || 0}</p>
              </div>
              <FaBan className="text-red-500 text-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Compact Search and Filter Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1">
            <div className="flex gap-2">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search deliveries..."
                    className={`w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-sm`}
                  />
                  <FaSearch className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-2.5 text-gray-400 text-sm`} />
                </div>
              </div>
              
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm min-w-[120px]"
              >
                <option value="all">{trans('search', 'all')}</option>
                <option value="customer">{trans('search', 'customer')}</option>
                <option value="agent">{trans('search', 'agent')}</option>
                <option value="tracking">{trans('search', 'tracking')}</option>
              </select>
              
              <button
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors flex items-center text-sm shadow-sm hover:shadow"
              >
                <FaSearch className={`${isRTL ? 'ml-2' : 'mr-2'} text-xs`} /> 
                {trans('buttons', 'search')}
              </button>
            </div>
          </div>
          
          <div className="flex gap-2">
            {/* Status Filter Dropdown */}
            <div className="relative status-dropdown">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white hover:bg-gray-50 text-sm min-w-[140px]"
              >
                <FaFilter className={`${isRTL ? 'ml-2' : 'mr-2'} text-gray-400 text-xs`} />
                <span className="flex-1 text-left">{getStatusLabel(statusFilter)}</span>
                <FaCaretDown className="text-gray-400 text-xs" />
              </button>
              
              {showStatusDropdown && (
                <div className={`absolute ${isRTL ? 'right-0' : 'left-0'} mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-50`}>
                  <div className="py-1">
                    {["all", "pending", "in_transit", "delivered", "cancelled"].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setStatusFilter(status);
                          setCurrentPage(1);
                          setShowStatusDropdown(false);
                        }}
                        className={`flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 ${
                          statusFilter === status ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                        }`}
                      >
                        <span className="flex-1 text-left">{getStatusLabel(status)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
          
           
          </div>
        </div>
      </div>

      {/* Compact Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-3 text-sm text-gray-600 font-medium">Loading...</p>
            </div>
          </div>
        ) : filteredDeliveries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <FaTruck className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Deliveries Found</h3>
            <p className="text-sm text-gray-500 mb-4">Try adjusting your search or filters</p>
            <Link
              to="/deliveries/add"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
            >
              <FaPlus className={`inline ${isRTL ? 'ml-1' : 'mr-1'}`} />
              {trans('buttons', 'add_delivery')}
            </Link>
          </div>
        ) : (
          <>
            {/* Compact Table Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-600">
                  {filteredDeliveries.length} {trans('pagination', 'results')}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">{trans('pagination', 'per_page')}:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded px-2 py-1 text-xs bg-white focus:ring-1 focus:ring-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <FaUser className="text-gray-400 text-xs" />
                        <span>{trans('table', 'customer')}</span>
                        <button onClick={() => handleSort('customer_name')} className="text-gray-400 hover:text-gray-600">
                          {sortConfig.key === 'customer_name' ? (
                            sortConfig.direction === 'asc' ? <FaSortUp className="text-xs" /> : <FaSortDown className="text-xs" />
                          ) : <FaSort className="text-xs" />}
                        </button>
                      </div>
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <FaMapMarkerAlt className="text-gray-400 text-xs" />
                        <span>{trans('table', 'province')}</span>
                      </div>
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <FaUserTie className="text-gray-400 text-xs" />
                        <span>{trans('table', 'agent')}</span>
                        <button onClick={() => handleSort('agent_name')} className="text-gray-400 hover:text-gray-600">
                          {sortConfig.key === 'agent_name' ? (
                            sortConfig.direction === 'asc' ? <FaSortUp className="text-xs" /> : <FaSortDown className="text-xs" />
                          ) : <FaSort className="text-xs" />}
                        </button>
                      </div>
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <FaTag className="text-gray-400 text-xs" />
                        <span>{trans('table', 'condition')}</span>
                      </div>
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <FaCalendar className="text-gray-400 text-xs" />
                        <span>{trans('table', 'date')}</span>
                        <button onClick={() => handleSort('delivery_date')} className="text-gray-400 hover:text-gray-600">
                          {sortConfig.key === 'delivery_date' ? (
                            sortConfig.direction === 'asc' ? <FaSortUp className="text-xs" /> : <FaSortDown className="text-xs" />
                          ) : <FaSort className="text-xs" />}
                        </button>
                      </div>
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {trans('table', 'actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentDeliveries.map((delivery) => (
                    <tr 
                      key={delivery.delivery_id} 
                      className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                    
                    >
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {delivery.customer_name || "N/A"}
                        </div>
                        
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-700">
                          {delivery.province_name || "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-700">
                          {delivery.agent_name || "No agent"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-start">
                          {getStatusBadge(delivery.status)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-700">
                          {delivery.delivery_date_formatted || delivery.delivery_date}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="relative actions-dropdown flex justify-center">
                          <button
                            onClick={(e) => toggleActions(delivery.delivery_id, e)}
                            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded transition-colors"
                          >
                            <FaEllipsisH className="text-sm" />
                          </button>
                          
                          {expandedActions === delivery.delivery_id && (
                            <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-1 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-50`}>
                              <div className="py-1">
                                <Link
                                  to={`/deliveries/view/${delivery.delivery_id}`}
                                  className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <FaEye className={`${isRTL ? 'ml-2' : 'mr-2'} text-gray-400 text-xs`} />
                                  {trans('buttons', 'view')}
                                </Link>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePrintInvoice(delivery.delivery_id);
                                    setExpandedActions(null);
                                  }}
                                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <FaPrint className={`${isRTL ? 'ml-2' : 'mr-2'} text-gray-400 text-xs`} />
                                  {trans('buttons', 'print')}
                                </button>
                                <Link
                                  to={`/deliveries/edit/${delivery.delivery_id}`}
                                  className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <FaEdit className={`${isRTL ? 'ml-2' : 'mr-2'} text-gray-400 text-xs`} />
                                  {trans('buttons', 'edit')}
                                </Link>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedDelivery(delivery);
                                    setShowDeleteModal(true);
                                    setExpandedActions(null);
                                  }}
                                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <FaTrash className={`${isRTL ? 'ml-2' : 'mr-2'} text-red-400 text-xs`} />
                                  {trans('buttons', 'delete')}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Compact Pagination */}
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-gray-600">
                  {trans('pagination', 'showing')}{' '}
                  <span className="font-medium">{indexOfFirstItem + 1}</span>{' '}
                  {trans('pagination', 'to')}{' '}
                  <span className="font-medium">{Math.min(indexOfLastItem, filteredDeliveries.length)}</span>{' '}
                  {trans('pagination', 'of')}{' '}
                  <span className="font-medium">{filteredDeliveries.length}</span>{' '}
                  {trans('pagination', 'entries')}
                </div>
                
                <div className="flex items-center gap-1">
                  <nav className="flex items-center gap-1">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaChevronLeft className="text-xs" />
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => paginate(pageNumber)}
                          className={`w-8 h-8 flex items-center justify-center rounded text-xs font-medium ${
                            currentPage === pageNumber
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                    
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <span className="px-1 text-gray-500">...</span>
                    )}
                    
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <button
                        onClick={() => paginate(totalPages)}
                        className={`w-8 h-8 flex items-center justify-center rounded text-xs font-medium ${
                          currentPage === totalPages
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {totalPages}
                      </button>
                    )}
                    
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaChevronRight className="text-xs" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Compact Delete Modal */}
      {showDeleteModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-sm overflow-hidden">
            <div className="p-5">
              <div className="text-center">
                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaTrash className="text-red-600 text-xl" />
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Delete Delivery?
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  Delete #{selectedDelivery.tracking_number}? This cannot be undone.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-3 mb-4 text-left">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer:</span>
                      <span className="font-medium">{selectedDelivery.customer_name || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium text-blue-600">
                        ${parseFloat(selectedDelivery.total_selling_price || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteDelivery}
                  className="flex-1 bg-red-600 text-white font-semibold py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center text-sm"
                >
                  <FaTrash className={`${isRTL ? 'ml-2' : 'mr-2'} text-xs`} /> 
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveriesList;