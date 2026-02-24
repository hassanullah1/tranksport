import React, { useEffect, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaTruck,
  FaUser,
  FaMapMarkerAlt,
  FaCalendar,
  FaTag,
  FaEye,
  FaPrint,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AgentDeliveriesList = () => {
  const { language, isRTL } = useLanguage();
  const { agentId } = useParams();
  const navigate = useNavigate();

  const [deliveries, setDeliveries] = useState([]);
  const [agentName, setAgentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadDeliveries();
  }, [agentId]);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const data = await window.electronAPI.getDeliveriesByAgent(agentId);
      setDeliveries(data);
      if (data.length > 0) {
        setAgentName(data[0].agent_name || 'Agent');
      } else {
        // Fallback: try to get agent name from performance report
        const perf = await window.electronAPI.getAgentPerformance();
        const agent = perf.find(a => a.agent_id === parseInt(agentId));
        setAgentName(agent?.agent_name || 'Agent');
      }
    } catch (error) {
      toast.error("Failed to load deliveries");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintInvoice = async (deliveryId) => {
    try {
      await window.electronAPI.generateInvoice(deliveryId);
      toast.success("Invoice generated");
    } catch (error) {
      toast.error("Failed to generate invoice");
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDeliveries = deliveries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(deliveries.length / itemsPerPage);

  // Translations
  const t = {
    en: {
      title: "Deliveries for",
      back: "Back to Agents",
      tracking: "Tracking",
      customer: "Customer",
      province: "Province",
      status: "Status",
      date: "Date",
      actions: "Actions",
      view: "View",
      print: "Print",
      noDeliveries: "No deliveries found for this agent"
    },
    ps: {
      title: "د اجنټ لپاره لیږدونه",
      back: "اجنټانو ته ستون",
      tracking: "تعقیب",
      customer: "پیرودونکی",
      province: "ولایت",
      status: "حالت",
      date: "نیټه",
      actions: "کړنې",
      view: "لیدل",
      print: "چاپ",
      noDeliveries: "د دې اجنټ لپاره هیڅ لیږدونه ونه موندل شول"
    },
    fa: {
      title: "محموله‌های نماینده",
      back: "بازگشت به نمایندگان",
      tracking: "پیگیری",
      customer: "مشتری",
      province: "ولایت",
      status: "وضعیت",
      date: "تاریخ",
      actions: "عملیات",
      view: "مشاهده",
      print: "چاپ",
      noDeliveries: "هیچ محموله‌ای برای این نماینده یافت نشد"
    }
  };

  const trans = (key) => t[language]?.[key] || t.en[key] || key;

  const getStatusBadge = (status) => {
    const map = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
      in_transit: { bg: "bg-blue-100", text: "text-blue-800", label: "In Transit" },
      delivered: { bg: "bg-green-100", text: "text-green-800", label: "Delivered" },
      cancelled: { bg: "bg-red-100", text: "text-red-800", label: "Cancelled" }
    };
    const s = map[status] || map.pending;
    return <span className={`px-2 py-1 text-xs rounded-full ${s.bg} ${s.text}`}>{s.label}</span>;
  };

  return (
    <div className="p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <ToastContainer position={isRTL ? "top-left" : "top-right"} rtl={isRTL} />

      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/deliveries/agents')}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <FaArrowLeft className={`text-sm ${isRTL ? 'rotate-180' : ''}`} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {trans('title')} {agentName}
            </h1>
            <p className="text-sm text-gray-600 mt-1">{deliveries.length} deliveries</p>
          </div>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : deliveries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FaTruck className="text-gray-300 text-4xl mb-2" />
            <p className="text-gray-500">{trans('noDeliveries')}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{trans('tracking')}</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{trans('customer')}</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{trans('province')}</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{trans('status')}</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{trans('date')}</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">{trans('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentDeliveries.map((delivery) => (
                    <tr
                      key={delivery.delivery_id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/deliveries/view/${delivery.delivery_id}`)}
                    >
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">{delivery.tracking_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{delivery.customer_name || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{delivery.province_name || 'N/A'}</td>
                      <td className="px-4 py-3">{getStatusBadge(delivery.status)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {delivery.delivery_date_formatted || new Date(delivery.delivery_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/deliveries/view/${delivery.delivery_id}`); }}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title={trans('view')}
                          >
                            <FaEye className="text-sm" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handlePrintInvoice(delivery.delivery_id); }}
                            className="text-gray-600 hover:text-gray-800 p-1"
                            title={trans('print')}
                          >
                            <FaPrint className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                <div className="text-xs text-gray-600">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, deliveries.length)} of {deliveries.length}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p-1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <FaChevronLeft className="text-xs" />
                  </button>
                  <span className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <FaChevronRight className="text-xs" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AgentDeliveriesList;