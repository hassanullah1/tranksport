import React, { useEffect, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FaArrowLeft,
  FaSearch, 
  FaSync, 
  FaFilter,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaBox,
  FaUser,
  FaCalendar,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaShoppingCart,
  FaTag,
  FaPhone,
  FaHashtag,
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaShippingFast,
  FaBan,
  FaReceipt
} from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AgentDeliveries = () => {
  const { t, language, isRTL } = useLanguage();
  const { agentId } = useParams();
  const navigate = useNavigate();
  
  const [agentData, setAgentData] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (agentId) {
      loadAgentDeliveries();
    }
  }, [agentId]);

  const loadAgentDeliveries = async () => {
    try {
      setLoading(true);
      const data = await window.electronAPI.getAgentDeliveries(agentId);

     console.log(data)
      setDeliveries(data);
      // setAgentData({
      //   agent_name: data.summary.agent_name?data.summary.agent_name:"none",
      //   phone: data.summary.phone?data.summary.phone:"noen",
      //   agent_id: data.summary.agent_id?data.summary.agent_id:0
      // });
    } catch (error) {
      toast.error("Failed to load agent deliveries");
      console.error("Error loading agent deliveries:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { 
        color: "bg-yellow-50 text-yellow-700 border border-yellow-200", 
        text: "Pending",
        icon: <FaClock className="mr-1" />
      },
      in_transit: { 
        color: "bg-blue-50 text-blue-700 border border-blue-200", 
        text: "In Transit",
        icon: <FaShippingFast className="mr-1" />
      },
      delivered: { 
        color: "bg-green-50 text-green-700 border border-green-200", 
        text: "Delivered",
        icon: <FaCheckCircle className="mr-1" />
      },
      cancelled: { 
        color: "bg-red-50 text-red-700 border border-red-200", 
        text: "Cancelled",
        icon: <FaBan className="mr-1" />
      }
    };
    
    const statusInfo = statusMap[status] || statusMap.pending;
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusInfo.color} flex items-center justify-center`}>
        {statusInfo.icon}
        {statusInfo.text}
      </span>
    );
  };

  const getFilteredDeliveries = () => {
    let filtered = [...deliveries];
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(delivery => delivery.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(delivery => 
        delivery.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.province_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.delivery_date) - new Date(a.delivery_date));
  };

  const filteredDeliveries = getFilteredDeliveries();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDeliveries = filteredDeliveries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleViewDetails = (delivery) => {
    setSelectedDelivery(delivery);
    setShowDetailsModal(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const translations = {
    header: {
      en: { title: "Agent Deliveries", subtitle: "All deliveries for" },
      ps: { title: "د اجنټ لیږدونه", subtitle: "ټول لیږدونه د" },
      fa: { title: "تحویل‌های نماینده", subtitle: "تمام تحویل‌های" }
    },
    buttons: {
      en: {
        back: "Back",
        search: "Search",
        refresh: "Refresh",
        clear: "Clear",
        all: "All",
        pending: "Pending",
        in_transit: "In Transit",
        delivered: "Delivered",
        cancelled: "Cancelled",
        view: "Details",
        close: "Close"
      },
      ps: {
        back: "بیرته",
        search: "پلټل",
        refresh: "تازه کول",
        clear: "پاکول",
        all: "ټول",
        pending: "په تمه کې",
        in_transit: "په لاره کې",
        delivered: "تحویل شوی",
        cancelled: "لغوه شوی",
        view: "تفصیلات",
        close: "بندول"
      },
      fa: {
        back: "بازگشت",
        search: "جستجو",
        refresh: "تازه‌سازی",
        clear: "پاک کردن",
        all: "همه",
        pending: "در انتظار",
        in_transit: "در حال انتقال",
        delivered: "تحویل شده",
        cancelled: "لغو شده",
        view: "جزئیات",
        close: "بستن"
      }
    },
    table: {
      en: {
        tracking: "Tracking",
        customer: "Customer",
        date: "Date",
        status: "Status",
        amount: "Amount",
        commission: "Commission",
        actions: "Actions"
      },
      ps: {
        tracking: "تعقیب",
        customer: "پیرودونکی",
        date: "نیټه",
        status: "حالت",
        amount: "مقدار",
        commission: "کمیشن",
        actions: "کړنې"
      },
      fa: {
        tracking: "پیگیری",
        customer: "مشتری",
        date: "تاریخ",
        status: "وضعیت",
        amount: "مبلغ",
        commission: "کمیسیون",
        actions: "عملیات"
      }
    },
    details: {
      en: {
        delivery_details: "Delivery Details",
        tracking: "Tracking Number",
        customer: "Customer",
        phone: "Phone",
        address: "Address",
        province: "Province",
        delivery_date: "Delivery Date",
        status: "Status",
        items: "Items",
        item_name: "Item Name",
        quantity: "Quantity",
        unit_cost: "Unit Cost",
        total_cost: "Total Cost",
        selling_price: "Selling Price",
        total_amount: "Total Amount",
        commission: "Commission",
        profit: "Profit",
        summary: "Summary"
      },
      ps: {
        delivery_details: "د لیږد تفصیلات",
        tracking: "د تعقیب نمبر",
        customer: "پیرودونکی",
        phone: "تلیفون",
        address: "ادرس",
        province: "ولایت",
        delivery_date: "د لیږد نیټه",
        status: "حالت",
        items: "توکي",
        item_name: "د توکي نوم",
        quantity: "مقدار",
        unit_cost: "واحد قیمت",
        total_cost: "ټول قیمت",
        selling_price: "پلورل شوی قیمت",
        total_amount: "ټول مقدار",
        commission: "کمیشن",
        profit: "ګټه",
        summary: "لنډیز"
      },
      fa: {
        delivery_details: "جزئیات تحویل",
        tracking: "شماره پیگیری",
        customer: "مشتری",
        phone: "تلفن",
        address: "آدرس",
        province: "ولایت",
        delivery_date: "تاریخ تحویل",
        status: "وضعیت",
        items: "موارد",
        item_name: "نام مورد",
        quantity: "تعداد",
        unit_cost: "قیمت واحد",
        total_cost: "قیمت کل",
        selling_price: "قیمت فروش",
        total_amount: "مبلغ کل",
        commission: "کمیسیون",
        profit: "سود",
        summary: "خلاصه"
      }
    }
  };

  const trans = (category, key) => {
    return translations[category]?.[language]?.[key] || 
           translations[category]?.en?.[key] || 
           key;
  };

  if (loading && !agentData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6" dir={isRTL ? "rtl" : "ltr"}>
      <ToastContainer
        position={isRTL ? "top-left" : "top-right"}
        autoClose={3000}
        rtl={isRTL}
      />

      {/* Simple Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search deliveries..."
                className={`w-full ${isRTL ? "pr-10 pl-3" : "pl-10 pr-3"} py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
              />
              <FaSearch
                className={`absolute ${isRTL ? "right-3" : "left-3"} top-3 text-gray-400`}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none max-h-10"
            >
              <option value="all">{trans("buttons", "all")}</option>
              <option value="pending">{trans("buttons", "pending")}</option>
              <option value="in_transit">
                {trans("buttons", "in_transit")}
              </option>
              <option value="delivered">{trans("buttons", "delivered")}</option>
              <option value="cancelled">{trans("buttons", "cancelled")}</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={loadAgentDeliveries}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <FaSync className="mr-2 rtl:mr-0 rtl:ml-2" />
                {trans("buttons", "refresh")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading deliveries...</p>
            </div>
          </div>
        ) : filteredDeliveries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <FaTruck className="text-gray-300 text-6xl mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No Deliveries Found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FaUser className="mr-2 text-gray-400" />
                        {trans("table", "customer")}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FaCalendar className="mr-2 text-gray-400" />
                        {trans("table", "date")}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <FaTag className="mr-2 text-gray-400" />
                        {trans("table", "status")}
                      </div>
                    </th>
               
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {trans("table", "actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentDeliveries.map((delivery) => (
                    <tr
                      key={delivery.delivery_id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-gray-900">
                          {delivery.customer_name || "N/A"}
                        </div>
                        {delivery.customer_phone && (
                          <div className="text-sm text-gray-500">
                            {delivery.customer_phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-700">
                          {delivery.delivery_date_formatted ||
                            delivery.delivery_date}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(delivery.status)}
                      </td>
                 
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewDetails(delivery)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors flex items-center"
                        >
                          <FaEye className="mr-2 rtl:mr-0 rtl:ml-2" />
                          {trans("buttons", "view")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {indexOfFirstItem + 1} to{" "}
                    {Math.min(indexOfLastItem, filteredDeliveries.length)} of{" "}
                    {filteredDeliveries.length} entries
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaChevronLeft />
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
                          className={`w-10 h-10 flex items-center justify-center rounded text-sm font-medium ${
                            currentPage === pageNumber
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <button
                        onClick={() => paginate(totalPages)}
                        className={`w-10 h-10 flex items-center justify-center rounded text-sm font-medium ${
                          currentPage === totalPages
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {totalPages}
                      </button>
                    )}

                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delivery Details Modal */}
      {showDetailsModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center">
                <FaReceipt className="text-blue-600 text-2xl mr-3 rtl:mr-0 rtl:ml-3" />
            
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Delivery Info */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-3">
                      Delivery Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {trans("details", "customer")}:
                        </span>
                        <span className="font-medium">
                          {selectedDelivery.customer_name || "N/A"}
                        </span>
                      </div>
                      {selectedDelivery.customer_phone && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {trans("details", "phone")}:
                          </span>
                          <span className="font-medium">
                            {selectedDelivery.customer_phone}
                          </span>
                        </div>
                      )}
                      {selectedDelivery.customer_address && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {trans("details", "address")}:
                          </span>
                          <span className="font-medium text-right">
                            {selectedDelivery.customer_address}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {trans("details", "province")}:
                        </span>
                        <span className="font-medium">
                          {selectedDelivery.province_name || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {trans("details", "delivery_date")}:
                        </span>
                        <span className="font-medium">
                          {selectedDelivery.delivery_date_formatted ||
                            selectedDelivery.delivery_date}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {trans("details", "status")}:
                        </span>
                        <div>{getStatusBadge(selectedDelivery.status)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Items List */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-700 flex items-center">
                      <FaShoppingCart className="mr-2 rtl:mr-0 rtl:ml-2" />
                      {trans("details", "items")} (
                      {selectedDelivery.items_count || 0})
                    </h4>
                  </div>

                  <div className="space-y-3">
                    {/* This would show individual items if we had them */}
                    {/* For now, show summary */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="text-center">
                        <FaBox className="text-gray-400 text-3xl mx-auto mb-2" />
                        <p className="text-gray-600">
                          Items total: {selectedDelivery.total_quantity || 0}{" "}
                          units
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          View detailed items in the main delivery page
                        </p>
                      </div>
                    </div>

                    {/* Item summary */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {trans("details", "total_cost")}:
                          </span>
                          <span className="font-medium">
                            $
                            {(
                              parseFloat(selectedDelivery.total_cost) || 0
                            ).toFixed(2)}
                          </span>
                        </div>
                       

                        <div className="flex justify-between">
                          <span className="text-gray-600">بیلونه</span>
                          <span className="font-medium">
                            {selectedDelivery.items_count || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                {trans("buttons", "close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDeliveries;