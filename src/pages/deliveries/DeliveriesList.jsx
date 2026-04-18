import React, { useEffect, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import {
  FaFileInvoiceDollar,
  FaUserTie,
  FaCalendarAlt,
  FaBoxes,
  FaMoneyBillWave,
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
  FaEye
} from "react-icons/fa";
import { Link} from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AgentBillsList = () => {
  const { language, isRTL } = useLanguage();
  const navigate = useNavigate();

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      setLoading(true);
      const data = await window.electronAPI.getAgentBills();
      setBills(data);
    } catch (error) {
      toast.error("Failed to load bills");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBills = bills.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(bills.length / itemsPerPage);

  // Translations
  const t = {
    en: {
      title: "Agent Bills",
      add_dev: "Add Delivery",

      add_item: "Add Items",
      billNumber: "Bill #",
      agent: "Agent",
      date: "Date",
      deliveries: "Deliveries",
      commission: "Commission",
      actions: "Actions",
      view: "View",
      noBills: "No bills found",
      createNew: "Create Bill",
      showing: "Showing",
      to: "to",
      of: "of",
      page: "Page",
    },
    ps: {
      title: "د نمایندګانو ",
      add_item: " جنس زیات کړي",
      add_dev: " ډیلیوري اضافه کول",
      billNumber: "بل نمبر",
      agent: "نمایند",
      date: "نیټه",
      deliveries: "لیږدونه",
      commission: "کمیسیون",
      actions: "کړنې",
      view: "لیدل",
      noBills: "هیڅ بیل ونه موندل شو",
      createNew: "نوی بل جوړ کړئ",
      showing: "ښکاره کول",
      to: "تر",
      of: "د",
      page: "پاڼه",
    },
    fa: {
      title: "صورتحساب نمایندگان",
      add_item: " افزودن جنس‌ها",
      add_dev: "افزودن دلیوری",
      billNumber: "شماره صورتحساب",
      agent: "نماینده",
      date: "تاریخ",
      deliveries: "تعداد محموله",
      commission: "کمیسیون",
      actions: "عملیات",
      view: "مشاهده",
      noBills: "هیچ صورتحسابی یافت نشد",
      createNew: "ایجاد صورتحساب جدید",
      showing: "نمایش",
      to: "تا",
      of: "از",
      page: "صفحه",
    },
  };

  const trans = (key) => t[language]?.[key] || t.en[key];

  // Helper for RTL-aware alignment
  const alignClass = isRTL ? 'text-right' : 'text-left';

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir={isRTL ? "rtl" : "ltr"}>
      <ToastContainer
        position={isRTL ? "top-left" : "top-right"}
        rtl={isRTL}
        autoClose={3000}
      />

      {/* Header Section with Gradient */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaFileInvoiceDollar className="text-blue-500" />
            {trans("title")}
          </h2>
        </div>
        <div className="flex gap-2">
          <Link
            to="/deliveries/add"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center text-sm shadow-sm hover:shadow"
          >
            <FaPlus className={`${isRTL ? "ml-2" : "mr-2"} text-sm`} />
            {trans("add_item")}
          </Link>
          <Link
            to="/deliveries/assign"
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center text-sm shadow-sm hover:shadow"
          >
            <FaPlus className={`${isRTL ? "ml-2" : "mr-2"} text-sm`} />
            {trans("add_dev")}
          </Link>
        </div>
      </div>

      {/* Bills Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-lg">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : bills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="bg-blue-50 p-5 rounded-full mb-4">
              <FaFileInvoiceDollar className="text-blue-400 text-4xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {trans("noBills")}
            </h3>
            <p className="text-sm text-gray-500 mb-6 text-center">
              {language === "en"
                ? "Create your first bill to get started"
                : language === "ps"
                  ? "پیل کولو لپاره خپل لومړنی بل جوړ کړئ"
                  : "برای شروع اولین صورتحساب خود را ایجاد کنید"}
            </p>
            <button
              onClick={() => navigate("/deliveries/bills/create")}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow transition-colors"
            >
              <FaPlus className="inline mr-2 text-xs" />
              {trans("createNew")}
            </button>
          </div>
        ) : (
          <>
            {/* Responsive Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th
                      className={`px-5 py-4 ${alignClass} text-xs font-semibold text-gray-600 uppercase tracking-wider`}
                    >
                      {trans("billNumber")}
                    </th>
                    <th
                      className={`px-5 py-4 ${alignClass} text-xs font-semibold text-gray-600 uppercase tracking-wider`}
                    >
                      {trans("agent")}
                    </th>
                    <th
                      className={`px-5 py-4 ${alignClass} text-xs font-semibold text-gray-600 uppercase tracking-wider`}
                    >
                      {trans("date")}
                    </th>
                    <th
                      className={`px-5 py-4 ${alignClass} text-xs font-semibold text-gray-600 uppercase tracking-wider`}
                    >
                      {trans("deliveries")}
                    </th>

                    <th
                      className={`px-5 py-4 ${isRTL ? "text-left" : "text-right"} text-xs font-semibold text-gray-600 uppercase tracking-wider`}
                    >
                      {trans("actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentBills.map((bill) => (
                    <tr
                      key={bill.bill_id}
                      onClick={() =>
                        navigate(`/deliveries/bills/${bill.bill_id}`)
                      }
                      className="group cursor-pointer hover:bg-blue-50/50 transition-colors duration-150"
                    >
                      <td className={`px-5 py-4 ${alignClass}`}>
                        <span className="font-mono text-sm font-medium text-gray-900 group-hover:text-blue-600">
                          #{bill.bill_id}
                        </span>
                      </td>
                      <td className={`px-5 py-4 ${alignClass}`}>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <FaUserTie className="text-blue-600 text-xs" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {bill.agent_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {bill.agent_phone || "—"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={`px-5 py-4 ${alignClass}`}>
                        <div className="flex items-center gap-1.5">
                          <FaCalendarAlt className="text-gray-400 text-xs" />
                          <span className="text-sm text-gray-700">
                            {new Date(bill.bill_date).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className={`px-5 py-4 ${alignClass}`}>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          <FaBoxes className="mr-1.5 text-[10px]" />
                          {bill.total_deliveries}
                        </span>
                      </td>

                      <td
                        className={`px-5 py-4 ${isRTL ? "text-left" : "text-right"}`}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/deliveries/bills/${bill.bill_id}`);
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
                        >
                          <FaEye className="text-xs" />
                          {trans("view")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination - RTL Aware */}
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-gray-600 order-2 sm:order-1">
                  {trans("showing")} {indexOfFirstItem + 1} {trans("to")}{" "}
                  {Math.min(indexOfLastItem, bills.length)} {trans("of")}{" "}
                  {bills.length} {trans("deliveries")?.toLowerCase() || "bills"}
                </div>
                <div className="flex items-center gap-2 order-1 sm:order-2">
                  <span className="text-xs text-gray-600">
                    {trans("page")} {currentPage} {trans("of")} {totalPages}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isRTL ? (
                        <FaChevronRight className="text-xs" />
                      ) : (
                        <FaChevronLeft className="text-xs" />
                      )}
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isRTL ? (
                        <FaChevronLeft className="text-xs" />
                      ) : (
                        <FaChevronRight className="text-xs" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AgentBillsList;