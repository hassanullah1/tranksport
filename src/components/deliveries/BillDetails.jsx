import React, { useEffect, useState, useRef } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaFileInvoiceDollar,
  FaUserTie,
  FaCalendar,
  FaTruck,
  FaMoneyBillWave,
  FaPrint,
  FaEye,
  FaEdit,
  FaTrash,
  FaUndo,
  FaExchangeAlt,
  FaEllipsisH,
  FaCheckCircle,
  FaClock,
  FaShippingFast,
  FaBan,
  FaBoxes,
  FaDollarSign,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt
} from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BillPrintView from "./BillPrintView";

const BillDetails = () => {
  const { language, isRTL } = useLanguage();
  const { billId } = useParams();
  const navigate = useNavigate();

  // ---------- State ----------
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [expandedActions, setExpandedActions] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [statusChangeDelivery, setStatusChangeDelivery] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [returnForm, setReturnForm] = useState({
    return_reason: "refused",
    return_fee: 0,
    handling_fee: 0,
    notes: ""
  });

  // ---------- Print ref ----------
  const printRef = useRef();

  // ---------- Load Bill Data ----------
  useEffect(() => {
    loadBill();
  }, [billId]);

  const loadBill = async () => {
    try {
      setLoading(true);

      const data = await window.electronAPI.getBillDetails(billId);

      // 🔥 Add delivery + customer info to each item
      const updatedDeliveries = data.deliveries.map((delivery) => ({
        ...delivery,
        items: delivery.items.map((item) => ({
          ...item,

          // attach delivery info
          delivery_date: delivery.delivery_date,
          delivery_status: delivery.delivery_status,

          // attach customer info
          customer_name: delivery.customer_name,
          customer_phone: delivery.customer_phone,
          province_name: delivery.province_name,

          // attach assignment info
          assignment_id: delivery.assignment_id,
          assignment_status: delivery.assignment_status,
          assigned_date: delivery.assigned_date,
        })),
      }));

      const updatedBill = {
        ...data,
        deliveries: updatedDeliveries,
      };

      setBill(updatedBill);
    } catch (error) {
      toast.error("Failed to load bill details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  // ---------- Delivery Actions ----------
  const handlePrintInvoice = async (deliveryId) => {
    try {
      await window.electronAPI.generateInvoice(deliveryId);
      toast.success("Invoice generated successfully");
    } catch (error) {
      toast.error("Failed to generate invoice");
    }
  };

  const handleStatusChange = async (deliveryId, newStatus) => {
    try {
      const result = await window.electronAPI.updateDeliveryStatus(deliveryId, newStatus);
      toast.success(result.message || `Status changed to ${newStatus}`);
      loadBill();
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleDeleteDelivery = async () => {
    if (!selectedDelivery) return;
    try {
      const result = await window.electronAPI.deleteDelivery(selectedDelivery.delivery_id);
      toast.success(result.message);
      setShowDeleteModal(false);
      setSelectedDelivery(null);
      loadBill();
    } catch (error) {
      toast.error(error.message || "Failed to delete delivery");
    }
  };

  const handleDeliveryReturn = async () => {
    if (!selectedDelivery) return;
    try {
      const returnData = {
        delivery_id: selectedDelivery.delivery_id,
        ...returnForm
      };
      const result = await window.electronAPI.recordDeliveryReturn(returnData);
      toast.success(result.message || "Return recorded successfully");

      setShowReturnModal(false);
      setSelectedDelivery(null);
      setReturnForm({
        return_reason: "refused",
        return_fee: 0,
        handling_fee: 0,
        notes: ""
      });
      loadBill();
    } catch (error) {
      toast.error(error.message || "Failed to record return");
    }
  };

  // ---------- Toggle actions dropdown ----------
  const toggleActions = (deliveryId, event) => {
    event.stopPropagation();
    setExpandedActions(expandedActions === deliveryId ? null : deliveryId);
  };

  // ---------- Close dropdowns on outside click ----------
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.actions-dropdown')) {
        setExpandedActions(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // ---------- Status Badge (clickable) ----------
  const getStatusBadge = (delivery) => {
    const status = delivery.delivery_status;
    const statusMap = {
      pending: {
        color: "bg-yellow-50 text-yellow-700 border border-yellow-200",
        text: language === 'en' ? "Pending" : language === 'ps' ? "په تمه" : "در انتظار",
        icon: <FaClock className="mr-1 rtl:ml-1 rtl:mr-0 text-xs" />
      },
      in_transit: {
        color: "bg-blue-50 text-blue-700 border border-blue-200",
        text: language === 'en' ? "In Transit" : language === 'ps' ? "په لاره کې" : "در حال انتقال",
        icon: <FaShippingFast className="mr-1 rtl:ml-1 rtl:mr-0 text-xs" />
      },
      delivered: {
        color: "bg-green-50 text-green-700 border border-green-200",
        text: language === 'en' ? "Delivered" : language === 'ps' ? "تحویل شوی" : "تحویل شده",
        icon: <FaCheckCircle className="mr-1 rtl:ml-1 rtl:mr-0 text-xs" />
      },
      cancelled: {
        color: "bg-red-50 text-red-700 border border-red-200",
        text: language === 'en' ? "Cancelled" : language === 'ps' ? "لغوه شوی" : "لغو شده",
        icon: <FaBan className="mr-1 rtl:ml-1 rtl:mr-0 text-xs" />
      }
    };
    const statusInfo = statusMap[status] || statusMap.pending;
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          setStatusChangeDelivery(delivery);
          setNewStatus(delivery.delivery_status);
          setShowStatusChangeModal(true);
        }}
        className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color} flex items-center whitespace-nowrap hover:opacity-90 transition-opacity cursor-pointer`}
        title={language === 'en' ? "Click to change status" : 
               language === 'ps' ? "حالت بدلولو لپاره کلیک وکړئ" : 
               "برای تغییر وضعیت کلیک کنید"}
      >
        {statusInfo.icon}
        {statusInfo.text}
      </button>
    );
  };

  // ---------- Helper: status label for dropdown ----------
  const getStatusLabel = (status) => {
    const statusMap = {
      pending: language === 'en' ? "Pending" : language === 'ps' ? "په تمه" : "در انتظار",
      in_transit: language === 'en' ? "In Transit" : language === 'ps' ? "په لاره کې" : "در حال انتقال",
      delivered: language === 'en' ? "Delivered" : language === 'ps' ? "تحویل شوی" : "تحویل شده",
      cancelled: language === 'en' ? "Cancelled" : language === 'ps' ? "لغوه شوی" : "لغو شده"
    };
    return statusMap[status] || status;
  };

  // ---------- RTL alignment helper ----------
  const alignClass = isRTL ? 'text-right' : 'text-left';

  // ---------- Translations ----------
  const t = {
    en: {
      back: "Back to Bills",
      billNumber: "Bill #",
      agent: "Agent",
      date: "Date",
      created: "Created",
      deliveries: "Deliveries in this Bill",
      totalCommission: "Total Commission",
      totalValue: "Total Value",
      totalCost: "Total Cost",
      totalProfit: "Total Profit",
      totalItems: "Total Items",
      tracking: "code",
     
      Name: "Name",
      total: "Price",
      arrive: "Arrive",
      approve: "Approve",
      customer: "Customer",
      province: "Province",
      assignedDate: "Assigned",
      commission: "Commission",
      status: "Status",
      actions: "Actions",
      noDeliveries: "No deliveries in this bill",
      items: "Items",
      quantity: "Qty",
      itemName: "Item",
      price: "Price",
      view: "View",
      print: "Print",
      edit: "Edit",
      delete: "Delete",
      return: "Return",
      changeStatus: "Change Status",
      cancel: "Cancel",
      save: "Save",
      confirmDelete: "Delete Delivery?",
      deleteWarning: "This cannot be undone.",
      currentStatus: "Current Status",
      newStatus: "New Status",
      recordReturn: "Record Return",
      returnReason: "Return Reason",
      returnFee: "Return Fee",
      notes: "Notes",
      refused: "Customer Refused",
      damaged: "Item Damaged",
      wrongItem: "Wrong Item",
      delayed: "Delayed Delivery",
      other: "Other",
      confirmReturn: "Confirm Return",
      billSummary: "Bill Summary",
      deliveryDetails: "Delivery Details",
      printBill: "Print Bill",
      email: "Email",
      phone: "Phone",
    },
    ps: {
      back: "بیلونو ته ستون",
      billNumber: "بل نمبر",
      agent: "اجنټ",
      date: "نیټه",
      created: "جوړ شوی",
      deliveries: "په دې بل کې لیږدونه",
      totalCommission: "ټول کمیسیون",
      totalValue: "ټول ارزښت",
      totalCost: "ټول لګښت",
      totalProfit: "ټول ګټه",
      totalItems: "ټول توکي",
      tracking: "کوډ",
      Name: "نوم",
      total: "قیمت",
      arrive: "رسیدلي",
      approve: "قبول",
      customer: "پیرودونکی",
      province: "ولایت",

      commission: "کمیسیون",
      status: "حالت",
      actions: "کړنې",
      noDeliveries: "په دې بل کې هیڅ لیږدونه نشته",
      items: "توکي",
      quantity: "تعداد",
      itemName: "توکی",
      price: "بیه",
      view: "لیدل",
      print: "چاپ",
      edit: "سمول",
      delete: "ړنګول",
      return: "بیرته ستنیدل",
      changeStatus: "حالت بدلول",
      cancel: "لغوه",
      save: "خوندي کول",
      confirmDelete: "لیږد ړنګول؟",
      deleteWarning: "دا نشي بیرته راګرځیدلی.",
      currentStatus: "اوسنی حالت",
      newStatus: "نوی حالت",
      recordReturn: "بیرته ستنیدل ثبت کړئ",
      returnReason: "د بیرته ستنیدلو دلیل",
      returnFee: "د بیرته ستنیدلو فیس",
      notes: "یادښتونه",
      refused: "پیرودونکی انکار کړ",
      damaged: "توکی خراب شوی",
      wrongItem: "غلط توکی",
      delayed: "نوړی لیږد",
      other: "نور",
      confirmReturn: "بیرته ستنیدل تایید کړئ",
      billSummary: "د بل لنډیز",
      deliveryDetails: "د لیږد جزیات",
      printBill: "بل چاپ کړئ",
      email: "بریښنالیک",
      phone: "ټیلیفون",
    },
    fa: {
      back: "بازگشت به صورتحساب‌ها",
      billNumber: "شماره صورتحساب",
      agent: "نماینده",
      date: "تاریخ",
      created: "ایجاد شده",
      deliveries: "محموله‌های این صورتحساب",
      totalCommission: "کل کمیسیون",
      totalValue: "کل ارزش",
      totalCost: "کل هزینه",
      totalProfit: "کل سود",
      totalItems: "کل اقلام",
      tracking: "کوډ",
      Name: "نوم",
      total: "قیمت",
      arrive: "رسیدلي",
      approve: "قبول",
      customer: "مشتری",
      province: "ولایت",
      assignedDate: "تاریخ محول",
      commission: "کمیسیون",
      status: "وضعیت",
      actions: "عملیات",
      noDeliveries: "هیچ محموله‌ای در این صورتحساب نیست",
      items: "اقلام",
      quantity: "تعداد",
      itemName: "کالا",
      price: "قیمت",
      view: "مشاهده",
      print: "چاپ",
      edit: "ویرایش",
      delete: "حذف",
      return: "مرجوع",
      changeStatus: "تغییر وضعیت",
      cancel: "لغو",
      save: "ذخیره",
      confirmDelete: "حذف محموله؟",
      deleteWarning: "این عمل قابل بازگشت نیست.",
      currentStatus: "وضعیت فعلی",
      newStatus: "وضعیت جدید",
      recordReturn: "ثبت مرجوعی",
      returnReason: "دلیل مرجوعی",
      returnFee: "هزینه مرجوعی",
      notes: "یادداشت",
      refused: "مشتری رد کرد",
      damaged: "آیتم آسیب دیده",
      wrongItem: "آیتم نادرست",
      delayed: "تأخیر در تحویل",
      other: "سایر",
      confirmReturn: "تأیید مرجوعی",
      billSummary: "خلاصه صورتحساب",
      deliveryDetails: "جزئیات محموله",
      printBill: "چاپ صورتحساب",
      email: "ایمیل",
      phone: "تلفن",
    },
  };

  const trans = (key) => t[language]?.[key] || t.en[key] || key;

  // ---------- Print Bill Handler (Preview with print button) ----------
 const handlePrintBill = () => {
  const printContent = printRef.current;
  if (!printContent) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    toast.error("Please allow pop-ups to preview");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="${isRTL ? 'rtl' : 'ltr'}">
      <head>
        <title>Bill #${bill.bill_id} - Rasa Transfer</title>
        <meta charset="utf-8">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://cdn.jsdelivr.net/gh/rastikerdar/vazir-font@v30.1.0/dist/font-face.css');

          @page { size: A4; margin: 1.5cm; }
          body {
            font-family: 'Vazir', 'Noto Nastaliq Urdu', 'Tahoma', 'Arial', sans-serif;
            background: white;
            color: #1e293b;
            line-height: 1.6;
            padding: 0;
            margin: 0;
          }
          .print-header {
            background: linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%);
            border-radius: 20px;
            padding: 24px 28px;
            margin-bottom: 28px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 8px 20px -6px rgba(0,0,0,0.1);
          }
          .logo-container {
            width: 80px; height: 80px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #2563eb;
            box-shadow: 0 4px 10px rgba(37,99,235,0.15);
          }
          .company-name-pashto {
            font-size: 28px; font-weight: 800; color: #0f172a; line-height: 1.2;
            font-family: 'Vazir', 'Noto Nastaliq Urdu', sans-serif;
          }
          .company-name-english {
            font-size: 16px; font-weight: 400; color: #475569;
            letter-spacing: 0.3px; margin-top: 4px;
          }
          .mobile-number {
            font-size: 18px; font-weight: 600; color: #2563eb;
            background: #dbeafe; display: inline-block; padding: 4px 16px;
            border-radius: 40px; margin-bottom: 8px; border: 1px solid #bfdbfe;
          }
          .address-line {
            border-top: 1px dashed #cbd5e1; padding-top: 14px; margin-top: 16px; color: #64748b;
          }
          .separator {
            border: none; border-top: 2px dashed #cbd5e1; margin: 6px 0;
          }
          .bill-info {
            display: flex; justify-content: space-between;
            background: #f8fafc; padding: 5px 20px; border-radius: 12px;
            margin-bottom: 24px; font-weight: 600; font-size: 15px;
            border: 1px solid #e2e8f0;
          }
          .agent-info {
            background: #f1f5f9; padding: 16px 20px; border-radius: 12px;
            margin-bottom: 24px; border: 1px solid #e2e8f0;
          }
          table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px; }
          th {
            background: #f1f5f9; font-weight: 600; padding: 12px 8px;
            border: 1px solid #cbd5e1; color: #334155;
          }
          td { padding: 10px 8px; border: 1px solid #cbd5e1; color: #1e293b; }
          .summary {
            margin-top: 28px; display: flex; justify-content: flex-end; gap: 32px;
            font-size: 16px; font-weight: 600; border-top: 2px dashed #94a3b8;
            padding-top: 20px;
          }
          .signature {
            margin-top: 40px; display: flex; justify-content: flex-end;
            font-size: 15px; border-top: 1px dashed #94a3b8; padding-top: 24px;
            color: #475569;
          }
          .address {
            margin-top: 40px; font-size: 13px; color: #64748b; text-align: center;
            border-top: 1px solid #e2e8f0; padding-top: 20px;
          }
          .no-print { display: none; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align: center; margin-bottom: 20px; padding: 15px; background: #f0f0f0; border-radius: 6px;">
          <button onclick="window.print();" style="padding: 10px 24px; font-size: 16px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            🖨️ ${trans('printBill')}
          </button>
          <p style="margin-top: 8px; font-size: 14px; color: #555;">${isRTL ? 'یا از Ctrl+P استفاده کنید' : 'Or use Ctrl+P (Cmd+P)'}</p>
        </div>
        ${printContent.innerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
};

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="p-4 text-center">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <FaFileInvoiceDollar className="text-gray-300 text-5xl mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Bill Not Found</h2>
          <p className="text-gray-600 mb-4">The bill you're looking for doesn't exist or has been deleted.</p>
          <button
            onClick={() => navigate('/deliveries/bills')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            <FaArrowLeft className="inline mr-2 text-sm" />
            {trans('back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <ToastContainer
        position={isRTL ? "top-left" : "top-right"}
        autoClose={3000}
        rtl={isRTL}
      />

      {/* Header with Print Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/deliveries')}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <FaArrowLeft className={`text-sm ${isRTL ? 'rotate-180' : ''}`} />
          </button>
          <div>
            <h1 className="text-xl md:text-xl font-bold text-gray-900 flex items-center ">
             
              {trans('billNumber')} :  ({bill.bill_id})
            </h1>
            
          </div>
        </div>
        <button
          onClick={handlePrintBill}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors shadow-md hover:shadow-lg"
        >
          <FaPrint />
          {trans('printBill')}
        </button>
      </div>

   <div className="w-full bg-white rounded-xl shadow-md border border-gray-200 p-2 hover:shadow-lg transition-shadow mb-3">
  <div className="flex items-center gap-4">
    {/* Avatar */}
    <div className="w-8 h-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center">
      <FaUserTie className="text-blue-600 text-2xl" />
    </div>

    {/* Agent Info */}
    <div className="flex flex-row items-center gap-4 w-full">
      <p className="text-gray-900 font-semibold text-lg truncate">{bill.agent_name}</p>
      <div className="flex items-center gap-2 text-gray-600 text-sm">
        <FaPhone className="text-blue-400 text-xs" />
        <span>{bill.agent_phone || '—'}</span>
      </div>
    </div>
  <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
 
  
    {trans('date')}: {new Date(bill.bill_date).toLocaleDateString()}
  
</div>

  </div>
</div>


      {/* Deliveries Table with RTL‑fixed alignment */}
      <div className=" rounded-xl border border-gray-200  ">
       

        {bill.deliveries?.length === 0 ? (
          <div className="flex flex-col items-center py-16 px-4">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <FaTruck className="text-gray-400 text-4xl" />
            </div>
            <p className="text-gray-600 font-medium text-lg">{trans('noDeliveries')}</p>
          </div>
        ) : (
      
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className={`px-5 py-4 ${alignClass} text-xs font-semibold text-gray-600 uppercase tracking-wider`}>
                    {trans('tracking')}
                  </th>
                  <th className={`px-5 py-4 ${alignClass} text-xs font-semibold text-gray-600 uppercase tracking-wider`}>
                    {trans('customer')}
                  </th>
                  <th className={`px-5 py-4 ${alignClass} text-xs font-semibold text-gray-600 uppercase tracking-wider`}>
                    {trans('province')}
                  </th>
                  <th className={`px-5 py-4 ${alignClass} text-xs font-semibold text-gray-600 uppercase tracking-wider`}>
                    {trans('assignedDate')}
                  </th>
                
                  <th className={`px-5 py-4 ${alignClass} text-xs font-semibold text-gray-600 uppercase tracking-wider`}>
                    {trans('status')}
                  </th>
                  <th className="px-5 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {trans('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bill.deliveries.map((delivery) => (
                  <tr
                    key={delivery.assignment_id}
                    className="group cursor-pointer hover:bg-blue-50/50 transition-colors duration-150"
                    onClick={() => navigate(`/deliveries/view/${delivery.delivery_id}`)}
                  >
                    <td className={`px-5 py-4 ${alignClass}`}>
                      <span className="font-mono text-sm font-medium text-gray-900 group-hover:text-blue-600">
                       # {delivery.delivery_id}
                      </span>
                    </td>
                    <td className={`px-5 py-4 ${alignClass}`}>
                      <div className="text-sm font-medium text-gray-900">
                        {delivery.customer_name || 'N/A'}
                      </div>
                      {delivery.customer_phone && (
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <FaPhone className="text-[10px]" />
                          {delivery.customer_phone}
                        </div>
                      )}
                    </td>
                    <td className={`px-5 py-4 ${alignClass}`}>
                      <span className="text-sm text-gray-700 flex items-center gap-1">
                        <FaMapMarkerAlt className="text-gray-400 text-xs" />
                        {delivery.province_name || 'N/A'}
                      </span>
                    </td>
                    <td className={`px-5 py-4 ${alignClass}`}>
                      <span className="text-sm text-gray-700">
                        {new Date(delivery.assigned_date).toLocaleDateString()}
                      </span>
                    </td>
                 
                    <td className={`px-5 py-4 ${alignClass}`}>
                      {getStatusBadge(delivery)}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="relative actions-dropdown inline-block">
                        <button
                          onClick={(e) => toggleActions(delivery.delivery_id, e)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <FaEllipsisH className="text-sm" />
                        </button>

                        {expandedActions === delivery.delivery_id && (
                          <div
                            className={`absolute ${
                              isRTL ? 'left-0' : 'right-0'
                            } mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50 py-1`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Link
                              to={`/deliveries/view/${delivery.delivery_id}`}
                              className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <FaEye className="ml-3 rtl:mr-3 rtl:ml-0 text-gray-500 text-xs" />
                              {trans('view')}
                            </Link>
                            
                            <button
                              onClick={() => {
                                setStatusChangeDelivery(delivery);
                                setNewStatus(delivery.delivery_status);
                                setShowStatusChangeModal(true);
                                setExpandedActions(null);
                              }}
                              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <FaExchangeAlt className="ml-3 rtl:mr-3 rtl:ml-0 text-gray-500 text-xs" />
                              {trans('changeStatus')}
                            </button>
                            <Link
                              to={`/deliveries/edit/${delivery.delivery_id}`}
                              className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <FaEdit className="ml-3 rtl:mr-3 rtl:ml-0 text-gray-500 text-xs" />
                              {trans('edit')}
                            </Link>
                            {delivery.delivery_status !== 'cancelled' && delivery.delivery_status !== 'delivered' && (
                              <button
                                onClick={() => {
                                  setSelectedDelivery(delivery);
                                  setShowReturnModal(true);
                                  setExpandedActions(null);
                                }}
                                className="flex items-center w-full px-4 py-2.5 text-sm text-yellow-600 hover:bg-yellow-50 transition-colors"
                              >
                                <FaUndo className="ml-3 rtl:mr-3 rtl:ml-0 text-yellow-500 text-xs" />
                                {trans('return')}
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedDelivery(delivery);
                                setShowDeleteModal(true);
                                setExpandedActions(null);
                              }}
                              className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <FaTrash className="ml-3 rtl:mr-3 rtl:ml-0 text-red-500 text-xs" />
                              {trans('delete')}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
         
        )}

        {/* Items Summary - now scrolls properly */}
        {bill.deliveries?.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50/80 px-5 py-4">
            <details className="group">
              <summary className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900 list-none">
                <span className="text-xs bg-gray-200 rounded-full px-3 py-1.5 group-open:bg-blue-100 group-open:text-blue-700 transition-colors">
                  {bill.deliveries.reduce((sum, d) => sum + (d.items_count || 0), 0)} {trans('totalItems')}
                </span>
                <span className="text-gray-600 group-open:text-blue-600">
                  {language === 'en' ? 'Show item details' : 
                   language === 'ps' ? 'د توکو جزیات وښایئ' : 
                   'نمایش جزئیات اقلام'}
                </span>
              </summary>
              <div className="mt-4 space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {bill.deliveries.map((delivery) => (
                  delivery.items && delivery.items.length > 0 && (
                    <div key={`items-${delivery.delivery_id}`} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
                          {delivery.tracking_number} - {delivery.customer_name}
                        </span>
                        <span className="text-xs text-gray-600">
                          {delivery.items_count} {trans('items')}
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className={`px-3 py-2 ${alignClass} text-gray-600 font-medium`}>
                                {trans('itemName')}
                              </th>
                              <th className={`px-3 py-2 ${isRTL ? 'text-left' : 'text-right'} text-gray-600 font-medium`}>
                                {trans('quantity')}
                              </th>
                              <th className={`px-3 py-2 ${isRTL ? 'text-left' : 'text-right'} text-gray-600 font-medium`}>
                                Unit Cost
                              </th>
                              <th className={`px-3 py-2 ${isRTL ? 'text-left' : 'text-right'} text-gray-600 font-medium`}>
                                Selling Price
                              </th>
                              <th className={`px-3 py-2 ${isRTL ? 'text-left' : 'text-right'} text-gray-600 font-medium`}>
                                {trans('total')}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {delivery.items.map((item) => (
                              <tr key={item.item_id} className="border-t border-gray-100">
                                <td className={`px-3 py-2 ${alignClass} font-medium text-gray-900`}>
                                  {item.item_name}
                                </td>
                                <td className={`px-3 py-2 ${isRTL ? 'text-left' : 'text-right'} text-gray-700`}>
                                  {item.quantity}
                                </td>
                                <td className={`px-3 py-2 ${isRTL ? 'text-left' : 'text-right'} text-gray-700`}>
                                  ${Number(item.unit_cost).toFixed(2)}
                                </td>
                                
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </details>
          </div>
        )}
      </div>

      {/* Hidden Printable Invoice - Now includes agent info */}
      <div ref={printRef} style={{ display: 'none' }}>
  <BillPrintView bill={bill} language={language} isRTL={isRTL} t={t} />
</div>

      {/* ---------- Delete Modal ---------- */}
      {showDeleteModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          {/* ... (modal content unchanged) ... */}
          <div className="bg-white rounded-lg w-full max-w-sm overflow-hidden">
            <div className="p-5">
              <div className="text-center">
                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaTrash className="text-red-600 text-xl" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {trans('confirmDelete')}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Delete #{selectedDelivery.tracking_number}? {trans('deleteWarning')}
                </p>
                <div className="bg-gray-50 rounded-lg p-3 mb-4 text-left">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer:</span>
                      <span className="font-medium">{selectedDelivery.customer_name || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Commission:</span>
                      <span className="font-medium text-blue-600">
                        ${Number(selectedDelivery.commission_amount || 0).toFixed(2)}
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
                  {trans('cancel')}
                </button>
                <button
                  onClick={handleDeleteDelivery}
                  className="flex-1 bg-red-600 text-white font-semibold py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center text-sm"
                >
                  <FaTrash className={`${isRTL ? 'ml-2' : 'mr-2'} text-xs`} />
                  {trans('delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Status Change Modal ---------- */}
      {showStatusChangeModal && statusChangeDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          {/* ... (modal content unchanged) ... */}
          <div className="bg-white rounded-lg w-full max-w-sm overflow-hidden">
            <div className="p-5">
              <div className="text-center">
                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaExchangeAlt className="text-blue-600 text-xl" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {trans('changeStatus')}
                </h3>
                <div className="bg-gray-50 rounded-lg p-3 mb-4 text-left">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{trans('currentStatus')}:</span>
                      <span className="font-medium">
                        {getStatusLabel(statusChangeDelivery.delivery_status)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tracking:</span>
                      <span className="font-mono font-medium">{statusChangeDelivery.tracking_number}</span>
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {trans('newStatus')}
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="pending">{getStatusLabel('pending')}</option>
                    <option value="in_transit">{getStatusLabel('in_transit')}</option>
                    <option value="delivered">{getStatusLabel('delivered')}</option>
                    <option value="cancelled">{getStatusLabel('cancelled')}</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowStatusChangeModal(false);
                    setStatusChangeDelivery(null);
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  {trans('cancel')}
                </button>
                <button
                  onClick={() => {
                    handleStatusChange(statusChangeDelivery.delivery_id, newStatus);
                    setShowStatusChangeModal(false);
                    setStatusChangeDelivery(null);
                  }}
                  className="flex-1 bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm"
                >
                  <FaExchangeAlt className={`${isRTL ? 'ml-2' : 'mr-2'} text-xs`} />
                  {trans('save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Return Modal ---------- */}
      {showReturnModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          {/* ... (modal content unchanged) ... */}
          <div className="bg-white rounded-lg w-full max-w-md overflow-hidden">
            <div className="p-5">
              <div className="text-center">
                <div className="w-14 h-14 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FaUndo className="text-yellow-600 text-xl" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {trans('recordReturn')}
                </h3>
                <div className="bg-gray-50 rounded-lg p-3 mb-4 text-left">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tracking:</span>
                      <span className="font-mono font-medium">{selectedDelivery.tracking_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer:</span>
                      <span className="font-medium">{selectedDelivery.customer_name || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Commission:</span>
                      <span className="font-medium text-blue-600">
                        ${Number(selectedDelivery.commission_amount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {trans('returnReason')}
                    </label>
                    <select
                      value={returnForm.return_reason}
                      onChange={(e) => setReturnForm({...returnForm, return_reason: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="refused">{trans('refused')}</option>
                      <option value="damaged">{trans('damaged')}</option>
                      <option value="wrong_item">{trans('wrongItem')}</option>
                      <option value="delayed">{trans('delayed')}</option>
                      <option value="other">{trans('other')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {trans('returnFee')}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={returnForm.return_fee}
                        onChange={(e) => setReturnForm({...returnForm, return_fee: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {trans('notes')}
                    </label>
                    <textarea
                      value={returnForm.notes}
                      onChange={(e) => setReturnForm({...returnForm, notes: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      rows="2"
                      placeholder="Optional notes about the return"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowReturnModal(false);
                    setSelectedDelivery(null);
                    setReturnForm({
                      return_reason: "refused",
                      return_fee: 0,
                      handling_fee: 0,
                      notes: ""
                    });
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  {trans('cancel')}
                </button>
                <button
                  onClick={handleDeliveryReturn}
                  className="flex-1 bg-yellow-600 text-white font-semibold py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center text-sm"
                >
                  <FaUndo className={`${isRTL ? 'ml-2' : 'mr-2'} text-xs`} />
                  {trans('confirmReturn')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillDetails;