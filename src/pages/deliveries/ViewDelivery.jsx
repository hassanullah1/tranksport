// ViewDelivery.js - Reorganized layout: top info, table, summary card (RTL fixed)
import React, { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  FaTimes,
  FaBox,
  FaUser,
  FaTruck,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaEdit,
  FaArrowLeft,
  FaPhone,
  FaEnvelope,
  FaHome,
  FaUndo
} from "react-icons/fa";
import { toast } from 'react-toastify';

const ViewDelivery = () => {
  const { t, language, isRTL } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();

  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);

  // Translation keys for return status and any missing terms
  const translations = {
    en: {
      returnStatus: "Return Status",
      returnFee: "Return Fee",
      returnDate: "Return Date",
      returnStatusNone: "No Return",
      returnStatusFullReturn: "Full Return",
      returnStatusPartialReturn: "Partial Return",
    },
    ps: {
      returnStatus: "د بیرته ستنیدو حالت",
      returnFee: "د بیرته ستنیدو فیس",
      returnDate: "د بیرته ستنیدو نیټه",
      returnStatusNone: "بیرته نه دی ستنیدلی",
      returnStatusFullReturn: "بشپړ بیرته ستنیدل",
      returnStatusPartialReturn: "یو څه بیرته ستنیدل",
    },
    fa: {
      returnStatus: "وضعیت مرجوعی",
      returnFee: "هزینه مرجوعی",
      returnDate: "تاریخ مرجوعی",
      returnStatusNone: "بدون مرجوعی",
      returnStatusFullReturn: "مرجوع کامل",
      returnStatusPartialReturn: "مرجوع جزئی",
    }
  };

  const trans = (key) => {
    return translations[language]?.[key] || t(key) || translations.en[key] || key;
  };

  useEffect(() => {
    loadDelivery();
  }, [id]);

  const loadDelivery = async () => {
    try {
      setLoading(true);
      const deliveryData = await window.electronAPI.getDelivery(id);

      if (deliveryData) {
        const formatted = {
          ...deliveryData,
          delivery_date: formatDate(deliveryData.delivery_date),
          created_at: formatDateTime(deliveryData.created_at),
          return_date: deliveryData.return_date ? formatDate(deliveryData.return_date) : null,
          items: deliveryData.items || []
        };
        setDelivery(formatted);
      }
    } catch (error) {
      toast.error("Failed to load delivery details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString(
      language === 'en' ? 'en-US' : language === 'fa' ? 'fa-IR' : 'ps-AF',
      { year: 'numeric', month: 'long', day: 'numeric' }
    );
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleString(
      language === 'en' ? 'en-US' : language === 'fa' ? 'fa-IR' : 'ps-AF',
      { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800 border border-yellow-200",
        icon: "⏳",
        text: { en: "Pending", ps: "پاتې", fa: "در انتظار" }
      },
      in_transit: {
        color: "bg-blue-100 text-blue-800 border border-blue-200",
        icon: "🚚",
        text: { en: "In Transit", ps: "په لیږد کې", fa: "در حال حمل" }
      },
      delivered: {
        color: "bg-green-100 text-green-800 border border-green-200",
        icon: "✅",
        text: { en: "Delivered", ps: "لیږل شوی", fa: "تحویل داده شده" }
      },
      cancelled: {
        color: "bg-red-100 text-red-800 border border-red-200",
        icon: "❌",
        text: { en: "Cancelled", ps: "لغوه شوی", fa: "لغو شده" }
      }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <div className={`inline-flex items-center px-3 py-1.5 rounded-full ${config.color}`}>
        <span className="mr-2 rtl:mr-0 rtl:ml-2">{config.icon}</span>
        <span className="font-medium">{config.text[language] || config.text.en}</span>
      </div>
    );
  };

  const getReturnStatusBadge = (returnStatus) => {
    if (!returnStatus || returnStatus === 'none') return null;
    const config = {
      full_return: { color: "bg-purple-100 text-purple-800", icon: "↩️", label: trans('returnStatusFullReturn') },
      partial_return: { color: "bg-orange-100 text-orange-800", icon: "↩️", label: trans('returnStatusPartialReturn') }
    };
    const c = config[returnStatus] || { color: "bg-gray-100 text-gray-800", icon: "↩️", label: returnStatus };
    return (
      <div className={`inline-flex items-center px-3 py-1.5 rounded-full ${c.color} text-sm`}>
        <span className="mr-2 rtl:mr-0 rtl:ml-2">{c.icon}</span>
        <span>{c.label}</span>
      </div>
    );
  };

  const calculateTotals = () => {
    if (!delivery || !delivery.items) return { subtotal: 0, total: 0, profit: 0, totalCost: 0, commission: 0 };
    const subtotal = delivery.items.reduce(
      (sum, item) => sum + (parseFloat(item.selling_price) || 0) * (parseInt(item.quantity) || 1), 0
    );
    const totalCost = delivery.items.reduce(
      (sum, item) => sum + (parseFloat(item.total_cost) || 0), 0
    );
    const commission = parseFloat(delivery.commission_amount) || 0;
    const profit = subtotal - totalCost - commission;
    return {
      subtotal: subtotal.toFixed(2),
      commission: commission.toFixed(2),
      profit: profit.toFixed(2),
      totalCost: totalCost.toFixed(2)
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-5xl mb-4">📦</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{t('deliveryNotFound')}</h2>
          <p className="text-gray-600 mb-6">{t('deliveryNotFoundDesc')}</p>
          <Link
            to="/deliveries"
            className="inline-flex items-center px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
          >
            <FaArrowLeft className="mr-2 rtl:mr-0 rtl:ml-2" />
            {t('backToDeliveries')}
          </Link>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-5" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <FaTruck className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{t('deliveryDetails')}</h1>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span>#{delivery.delivery_id}</span>
                  <span>• {delivery.tracking_number}</span>
                  <span>• {delivery.created_at}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to={`/deliveries/edit/${delivery.delivery_id}`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
              >
                <FaEdit className="mr-2 rtl:mr-0 rtl:ml-2" />
                {t('edit')}
              </Link>
              <Link
                to="/deliveries"
                className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg"
              >
                <FaTimes className="mr-2 rtl:mr-0 rtl:ml-2" />
                {t('close')}
              </Link>
            </div>
          </div>
        </div>

        {/* TOP INFO CARD: Customer + Province + Agent + Date + Status */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Customer */}
            <div className="flex items-center gap-2 min-w-[180px]">
              <FaUser className="text-purple-600" />
              <div>
                <div className="text-xs text-gray-500">{t('customer')}</div>
                <div className="font-medium text-gray-900">{delivery.customer_name}</div>
                {delivery.customer_phone && (
                  <div className="text-xs text-gray-600 flex items-center gap-1">
                    <FaPhone className="text-xs" /> {delivery.customer_phone}
                  </div>
                )}
              </div>
            </div>

            {/* Province */}
            <div className="flex items-center gap-2 min-w-[140px]">
              <FaMapMarkerAlt className="text-blue-600" />
              <div>
                <div className="text-xs text-gray-500">{t('province')}</div>
                <div className="font-medium text-gray-900">{delivery.province_name || '—'}</div>
              </div>
            </div>

            {/* Agent (if exists) */}
            {delivery.agent_name && (
              <div className="flex items-center gap-2 min-w-[140px]">
                <FaTruck className="text-green-600" />
                <div>
                  <div className="text-xs text-gray-500">{t('agent')}</div>
                  <div className="font-medium text-gray-900">{delivery.agent_name}</div>
                  {delivery.agent_phone && (
                    <div className="text-xs text-gray-600 flex items-center gap-1">
                      <FaPhone className="text-xs" /> {delivery.agent_phone}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Delivery Date */}
            <div className="flex items-center gap-2 min-w-[130px]">
              <FaCalendarAlt className="text-orange-600" />
              <div>
                <div className="text-xs text-gray-500">{t('deliveryDate')}</div>
                <div className="font-medium text-gray-900">{delivery.delivery_date}</div>
              </div>
            </div>

            {/* Status Badge (right aligned) */}
            <div className="ml-auto rtl:ml-0 rtl:mr-auto">
              {getStatusBadge(delivery.status)}
            </div>
          </div>
        </div>

        {/* ITEMS TABLE - RTL fixed */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaBox className="text-blue-600" />
              <h2 className="font-bold text-gray-800">{t('items')}</h2>
            </div>
            <span className="text-sm text-gray-600">
              {delivery.items?.length || 0} {t('items')}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className={`px-4 py-3 ${isRTL ? 'text-right' : 'text-left'} font-medium text-gray-600`}>
                    {t('item')}
                  </th>
                  <th className={`px-4 py-3 ${isRTL ? 'text-right' : 'text-left'} font-medium text-gray-600`}>
                    {t('quantity')}
                  </th>
                  <th className={`px-4 py-3 ${isRTL ? 'text-right' : 'text-left'} font-medium text-gray-600`}>
                    {t('unitCost')}
                  </th>
                  <th className={`px-4 py-3 ${isRTL ? 'text-right' : 'text-left'} font-medium text-gray-600`}>
                    {t('sellingPrice')}
                  </th>
                  <th className={`px-4 py-3 ${isRTL ? 'text-right' : 'text-left'} font-medium text-gray-600`}>
                    {t('total')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {delivery.items?.map((item) => (
                  <tr key={item.item_id} className="hover:bg-gray-50">
                    <td className={`px-4 py-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <div className="font-medium text-gray-900">{item.item_name}</div>
                      {item.item_description && (
                        <div className="text-xs text-gray-500">{item.item_description}</div>
                      )}
                    </td>
                    <td className={`px-4 py-3 ${isRTL ? 'text-right' : 'text-left'}`}>{item.quantity}</td>
                    <td className={`px-4 py-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                      ${parseFloat(item.unit_cost || 0).toFixed(2)}
                    </td>
                    <td className={`px-4 py-3 ${isRTL ? 'text-right' : 'text-left'} text-green-600`}>
                      ${parseFloat(item.selling_price || 0).toFixed(2)}
                    </td>
                    <td className={`px-4 py-3 ${isRTL ? 'text-right' : 'text-left'} font-medium`}>
                      ${(parseFloat(item.selling_price || 0) * parseInt(item.quantity || 1)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SUMMARY CARD (full width) */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <FaMoneyBillWave className="text-green-600" />
            <h2 className="font-bold text-gray-800">{t('financialSummary')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side: financial figures */}
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">{t('totalCost')}</span>
                <span className="font-medium">${totals.totalCost}</span>
              </div>
            
             
            
            </div>

            {/* Right side: return info (if any) + quick actions */}
            <div>
              {delivery.return_status && delivery.return_status !== 'none' && (
                <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2 text-purple-700">
                    <FaUndo />
                    <span className="font-semibold">{trans('returnStatus')}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">{trans('returnStatus')}</span>
                      {getReturnStatusBadge(delivery.return_status)}
                    </div>
                    {parseFloat(delivery.return_fee_charged) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">{trans('returnFee')}</span>
                        <span className="font-medium text-purple-700">
                          ${parseFloat(delivery.return_fee_charged).toFixed(2)}
                        </span>
                      </div>
                    )}
                    {delivery.return_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">{trans('returnDate')}</span>
                        <span className="font-medium">{delivery.return_date}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

            
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDelivery;