// ViewDelivery.js - Modern delivery details view with print
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
  FaPrint,
  FaEdit,
  FaArrowLeft,
  FaPhone,
  FaEnvelope,
  FaHome,
  FaClipboardCheck
} from "react-icons/fa";
import { toast } from 'react-toastify';

const ViewDelivery = () => {
  const { t, language, isRTL } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Print translations
  const printTranslations = {
    en: {
      invoice: "Delivery Invoice",
      deliveryId: "Delivery ID",
      tracking: "Tracking No",
      date: "Date",
      status: "Status",
      customer: "Customer",
      agent: "Agent",
      province: "Province",
      phone: "Phone",
      email: "Email",
      address: "Address",
      items: "Items",
      item: "Item",
      description: "Description",
      quantity: "Qty",
      unitPrice: "Unit Price",
      total: "Total",
      summary: "Summary",
      subTotal: "Subtotal",
      commission: "Commission",
      totalAmount: "Total Amount",
      profit: "Profit",
      notes: "Notes",
      thankYou: "Thank you for your business!"
    },
    ps: {
      invoice: "د لیږد رسید",
      deliveryId: "د لیږد شمیره",
      tracking: "د تعقیب شمیره",
      date: "نیټه",
      status: "حالت",
      customer: "پیرودونکی",
      agent: "اجنټ",
      province: "ولایت",
      phone: "تلیفون",
      email: "ایمیل",
      address: "آدرس",
      items: "توکي",
      item: "توکی",
      description: "تفصیل",
      quantity: "مقدار",
      unitPrice: "د واحد قیمت",
      total: "مجموعه",
      summary: "خلاصه",
      subTotal: "فرعی مجموعه",
      commission: "کمیسیون",
      totalAmount: "ټوله مجموعه",
      profit: "ګټه",
      notes: "یادښتونه",
      thankYou: "ستاسو د سوداګرۍ مننه!"
    },
    fa: {
      invoice: "رسید تحویل",
      deliveryId: "شناسه تحویل",
      tracking: "شماره پیگیری",
      date: "تاریخ",
      status: "وضعیت",
      customer: "مشتری",
      agent: "نماینده",
      province: "ولایت",
      phone: "تلفن",
      email: "ایمیل",
      address: "آدرس",
      items: "آیتم‌ها",
      item: "آیتم",
      description: "توضیحات",
      quantity: "تعداد",
      unitPrice: "قیمت واحد",
      total: "جمع",
      summary: "خلاصه",
      subTotal: "جمع جزء",
      commission: "کمیسیون",
      totalAmount: "جمع کل",
      profit: "سود",
      notes: "یادداشت‌ها",
      thankYou: "از کسب و کار شما متشکریم!"
    }
  };

  const transPrint = (key) => {
    return printTranslations[language]?.[key] || printTranslations.en[key] || key;
  };

  useEffect(() => {
    loadDelivery();
  }, [id]);

  const loadDelivery = async () => {
    try {
      setLoading(true);
      const deliveryData = await window.electronAPI.getDelivery(id);
      
      if (deliveryData) {
        // Format the delivery data
        const formattedDelivery = {
          ...deliveryData,
          delivery_date: formatDate(deliveryData.delivery_date),
          created_at: formatDateTime(deliveryData.created_at),
          items: deliveryData.items || []
        };
        
        setDelivery(formattedDelivery);
      }
    } catch (error) {
      toast.error("Failed to load delivery details");
      console.error("Error loading delivery:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'en' ? 'en-US' : language === 'fa' ? 'fa-IR' : 'ps-AF', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleString(language === 'en' ? 'en-US' : language === 'fa' ? 'fa-IR' : 'ps-AF', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const calculateTotals = () => {
    if (!delivery || !delivery.items) return { subtotal: 0, total: 0, profit: 0 };
    
    const subtotal = delivery.items.reduce((sum, item) => 
      sum + (parseFloat(item.selling_price) || 0) * (parseInt(item.quantity) || 1), 0
    );
    
    const totalCost = delivery.items.reduce((sum, item) => 
      sum + (parseFloat(item.total_cost) || 0), 0
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

  // Simple print function
  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html dir="${isRTL ? 'rtl' : 'ltr'}">
      <head>
        <title>${transPrint('invoice')} - ${delivery.tracking_number}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .invoice-header { text-align: center; margin-bottom: 30px; }
          .invoice-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .company-info { font-size: 14px; color: #666; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 18px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total-row { font-weight: bold; }
          .summary { border-top: 2px solid #000; padding-top: 10px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <div class="invoice-title">${transPrint('invoice')}</div>
          <div class="company-info">Transport Delivery System</div>
          <div class="company-info">Delivery Management Solution</div>
        </div>
        
        <div class="section">
          <div class="section-title">${transPrint('deliveryId')}</div>
          <div><strong>ID:</strong> #${delivery.delivery_id}</div>
          <div><strong>${transPrint('tracking')}:</strong> ${delivery.tracking_number}</div>
          <div><strong>${transPrint('date')}:</strong> ${delivery.delivery_date}</div>
          <div><strong>${transPrint('status')}:</strong> ${delivery.status}</div>
        </div>
        
        <div class="section">
          <div class="section-title">${transPrint('customer')}</div>
          <div><strong>${transPrint('customer')}:</strong> ${delivery.customer_name}</div>
          ${delivery.customer_phone ? `<div><strong>${transPrint('phone')}:</strong> ${delivery.customer_phone}</div>` : ''}
          ${delivery.customer_email ? `<div><strong>${transPrint('email')}:</strong> ${delivery.customer_email}</div>` : ''}
          ${delivery.customer_address ? `<div><strong>${transPrint('address')}:</strong> ${delivery.customer_address}</div>` : ''}
        </div>
        
        <div class="section">
          <div class="section-title">${transPrint('agent')}</div>
          <div><strong>${transPrint('agent')}:</strong> ${delivery.agent_name || 'N/A'}</div>
          ${delivery.agent_phone ? `<div><strong>${transPrint('phone')}:</strong> ${delivery.agent_phone}</div>` : ''}
        </div>
        
        <div class="section">
          <div class="section-title">${transPrint('province')}</div>
          <div><strong>${transPrint('province')}:</strong> ${delivery.province_name || 'N/A'}</div>
        </div>
        
        <div class="section">
          <div class="section-title">${transPrint('items')}</div>
          <table>
            <thead>
              <tr>
                <th>${transPrint('item')}</th>
                <th>${transPrint('description')}</th>
                <th>${transPrint('quantity')}</th>
                <th>${transPrint('unitPrice')}</th>
                <th>${transPrint('total')}</th>
              </tr>
            </thead>
            <tbody>
              ${delivery.items?.map(item => `
                <tr>
                  <td>${item.item_name}</td>
                  <td>${item.item_description || '-'}</td>
                  <td class="text-center">${item.quantity}</td>
                  <td>$${parseFloat(item.unit_cost || 0).toFixed(2)}</td>
                  <td>$${(parseFloat(item.selling_price || 0) * parseInt(item.quantity || 1)).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="section summary">
          <div class="section-title">${transPrint('summary')}</div>
          <table>
            <tr>
              <td>${transPrint('subTotal')}</td>
              <td class="text-right">$${calculateTotals().subtotal}</td>
            </tr>
            <tr>
              <td>${transPrint('commission')}</td>
              <td class="text-right">$${calculateTotals().commission}</td>
            </tr>
            <tr class="total-row">
              <td>${transPrint('profit')}</td>
              <td class="text-right">$${calculateTotals().profit}</td>
            </tr>
          </table>
        </div>
        
        <div class="footer">
          <div>${transPrint('thankYou')}</div>
          <div>${new Date().toLocaleDateString()}</div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading delivery details...</p>
        </div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-red-500 text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Delivery not found</h2>
          <p className="text-gray-600 mb-6">The delivery you're looking for doesn't exist or has been deleted.</p>
          <Link 
            to="/deliveries" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <FaArrowLeft className="mr-2 rtl:mr-0 rtl:ml-2" />
            Return to deliveries
          </Link>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                  <FaTruck className="text-white text-2xl" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                    Delivery Details
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="text-gray-600">
                      <span className="font-medium">Tracking:</span> {delivery.tracking_number}
                    </span>
                    <span className="text-gray-600">
                      <span className="font-medium">ID:</span> #{delivery.delivery_id}
                    </span>
                    <span className="text-gray-600">
                      <span className="font-medium">Created:</span> {delivery.created_at}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                <FaPrint className="mr-2 rtl:mr-0 rtl:ml-2" />
                Print Invoice
              </button>
              
              <Link
                to={`/deliveries/edit/${delivery.delivery_id}`}
                className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <FaEdit className="mr-2 rtl:mr-0 rtl:ml-2" />
                Edit Delivery
              </Link>
              
              <Link
                to="/deliveries"
                className="inline-flex items-center px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
              >
                <FaTimes className="mr-2 rtl:mr-0 rtl:ml-2" />
                Close
              </Link>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="mt-6">
            {getStatusBadge(delivery.status)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Delivery & Customer Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FaBox className="text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Delivery Items</h2>
                      <p className="text-gray-600 text-sm">
                        {delivery.items?.length || 0} items • {delivery.items?.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0) || 0} total quantity
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Unit Cost
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Selling Price
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {delivery.items?.map((item, index) => (
                      <tr key={item.item_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{item.item_name}</div>
                            {item.item_description && (
                              <div className="text-sm text-gray-500 mt-1">{item.item_description}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-800">
                            {item.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium">
                          ${parseFloat(item.unit_cost || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 font-medium text-green-600">
                          ${parseFloat(item.selling_price || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">
                          ${(parseFloat(item.selling_price || 0) * parseInt(item.quantity || 1)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Customer & Agent Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <FaUser className="text-purple-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Customer Information</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Customer Name</div>
                    <div className="font-medium text-gray-900 text-lg">{delivery.customer_name}</div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {delivery.customer_phone && (
                      <div>
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          <FaPhone className="mr-2 rtl:mr-0 rtl:ml-2 text-xs" />
                          Phone
                        </div>
                        <div className="font-medium text-gray-900">{delivery.customer_phone}</div>
                      </div>
                    )}
                    
                    {delivery.customer_email && (
                      <div>
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          <FaEnvelope className="mr-2 rtl:mr-0 rtl:ml-2 text-xs" />
                          Email
                        </div>
                        <div className="font-medium text-gray-900">{delivery.customer_email}</div>
                      </div>
                    )}
                  </div>
                  
                  {delivery.customer_address && (
                    <div>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <FaHome className="mr-2 rtl:mr-0 rtl:ml-2 text-xs" />
                        Address
                      </div>
                      <div className="font-medium text-gray-900">{delivery.customer_address}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Agent & Province Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <FaTruck className="text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Delivery Information</h2>
                </div>
                
                <div className="space-y-4">
                  {delivery.agent_name && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Assigned Agent</div>
                      <div className="font-medium text-gray-900 text-lg">{delivery.agent_name}</div>
                      {delivery.agent_phone && (
                        <div className="text-sm text-gray-600 mt-1">
                          <FaPhone className="inline mr-1 rtl:mr-0 rtl:ml-1" /> {delivery.agent_phone}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <FaMapMarkerAlt className="mr-2 rtl:mr-0 rtl:ml-2 text-xs" />
                      Province
                    </div>
                    <div className="font-medium text-gray-900">{delivery.province_name || "Not specified"}</div>
                  </div>
                  
                  <div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <FaCalendarAlt className="mr-2 rtl:mr-0 rtl:ml-2 text-xs" />
                      Delivery Date
                    </div>
                    <div className="font-medium text-gray-900">{delivery.delivery_date}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Financial Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-50 rounded-lg">
                  <FaMoneyBillWave className="text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Financial Summary</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Total Items Cost</span>
                  <span className="font-medium text-lg">${totals.totalCost}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Total Selling Price</span>
                  <span className="font-medium text-lg text-green-600">${totals.subtotal}</span>
                </div>
                
                {parseFloat(delivery.commission_amount || 0) > 0 && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600">Agent Commission</span>
                    <span className="font-medium text-lg text-orange-600">${totals.commission}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center py-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg px-4 mt-6">
                  <span className="font-bold text-gray-800">Net Profit</span>
                  <span className={`font-bold text-2xl ${parseFloat(totals.profit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${totals.profit}
                  </span>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <FaClipboardCheck className="text-blue-500" />
                    <h3 className="font-medium text-gray-800">Quick Actions</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <Link
                      to={`/deliveries/edit/${delivery.delivery_id}`}
                      className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
                    >
                      <FaEdit className="inline mr-2 rtl:mr-0 rtl:ml-2" />
                      Edit This Delivery
                    </Link>
                    
                    {delivery.customer_id && (
                      <button
                        onClick={() => navigate(`/customers/${delivery.customer_id}`)}
                        className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg transition-colors"
                      >
                        <FaUser className="inline mr-2 rtl:mr-0 rtl:ml-2" />
                        View Customer Profile
                      </button>
                    )}
                    
                    <Link
                      to="/deliveries"
                      className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition-colors"
                    >
                      <FaArrowLeft className="inline mr-2 rtl:mr-0 rtl:ml-2" />
                      Back to Deliveries
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDelivery;