import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import {
  FaArrowLeft,
  FaMoneyBillWave,
  FaWallet,
  FaBalanceScale,
  FaPlus,
  FaTrash,
  FaTimes,
  FaCheck,
  FaUserTie,
  FaChartPie,
  FaCalculator,
  FaPercent,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProvinceDetail = () => {
  const { provinceId } = useParams();
  const navigate = useNavigate();
  const { t, language, isRTL } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [province, setProvince] = useState(null);
  const [financial, setFinancial] = useState(null);
  const [payments, setPayments] = useState([]);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showAddAgentModal, setShowAddAgentModal] = useState(false);

  // Form for new payment
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    payment_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  // Form for new agent
  const [agentForm, setAgentForm] = useState({
    agent_name: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    loadProvinceData();
  }, [provinceId]);

  const loadProvinceData = async () => {
    try {
      setLoading(true);

      // Fetch financial summary (may include agent: null)
      const financialData =
        await window.electronAPI.getProvinceFinancialSummary(provinceId);
      if (!financialData) {
        toast.error("Province not found");
        navigate("/provinces");
        return;
      }
      setFinancial(financialData);
      setProvince({ province_name: financialData.province_name });

      // If an agent exists, fetch payment history
      if (financialData.agent && financialData.agent.agent_id) {
        const paymentsData =
          await window.electronAPI.getAgentPaymentsByProvince(provinceId);
        setPayments(paymentsData);
      } else {
        setPayments([]);
      }
    } catch (error) {
      toast.error(error.message || "Failed to load province details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async () => {
    if (!paymentForm.amount || !paymentForm.payment_date) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const result = await window.electronAPI.addAgentPayment({
        province_id: parseInt(provinceId),
        amount: parseFloat(paymentForm.amount),
        payment_date: paymentForm.payment_date,
        notes: paymentForm.notes,
      });
      toast.success(result.message);
      setShowAddPaymentModal(false);
      setPaymentForm({
        amount: "",
        payment_date: new Date().toISOString().split("T")[0],
        notes: "",
      });
      loadProvinceData();
    } catch (error) {
      toast.error(error.message || "Failed to add payment");
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm("Are you sure you want to delete this payment?"))
      return;
    try {
      const result = await window.electronAPI.deleteAgentPayment(paymentId);
      toast.success(result.message);
      loadProvinceData();
    } catch (error) {
      toast.error(error.message || "Failed to delete payment");
    }
  };

  const handleAddAgent = async () => {
    if (!agentForm.agent_name.trim()) {
      toast.error("Agent name is required");
      return;
    }

    try {
      const result = await window.electronAPI.addAgent({
        province_id: parseInt(provinceId),
        agent_name: agentForm.agent_name.trim(),
        phone: agentForm.phone.trim(),
        email: agentForm.email.trim(),
      });
      toast.success(result.message || "Agent added successfully");
      setShowAddAgentModal(false);
      setAgentForm({ agent_name: "", phone: "", email: "" });
      loadProvinceData(); // reload to show the new agent
    } catch (error) {
      toast.error(error.message || "Failed to add agent");
    }
  };

  const translations = {
    back: {
      en: "Back to Provinces",
      ps: "ولایتونو ته بیرته",
      fa: "بازگشت به ولایات",
    },
    summary: {
      en: "Financial Summary",
      ps: "مالی لنډیز",
      fa: "خلاصه مالی",
    },
    agent: {
      en: "Province Agent",
      ps: "د ولایت استازی",
      fa: "نماینده ولایت",
    },
    totalCommission: {
      en: "agent money",
      ps: "دنماینده پیسي",
      fa: "دنماینده پیسي",
    },
    totalPayments: {
      en: "Total Payments Received",
      ps: "ټول ترلاسه شوي پیسې",
      fa: "کل پرداخت‌های دریافت شده",
    },
    balanceDue: {
      en: "Balance Due",
      ps: "پاتې بیلانس",
      fa: "مانده قابل پرداخت",
    },
    recentPayments: {
      en: "Recent Payments",
      ps: "وروستي پیسې",
      fa: "پرداخت‌های اخیر",
    },
    addPayment: {
      en: "Add Payment",
      ps: "نوي پیسې اضافه کړئ",
      fa: "افزودن پرداخت",
    },
    amount: {
      en: "Amount ($)",
      ps: "مقدار ($)",
      fa: "مبلغ ($)",
    },
    date: {
      en: "Date",
      ps: "نیټه",
      fa: "تاریخ",
    },
    notes: {
      en: "Notes",
      ps: "یادښتونه",
      fa: "یادداشت",
    },
    actions: {
      en: "Actions",
      ps: "کړنې",
      fa: "اقدامات",
    },
    noPayments: {
      en: "No payments recorded yet",
      ps: "تر اوسه کومې پیسې نه دي ثبت شوي",
      fa: "هنوز پرداختی ثبت نشده است",
    },
    noAgent: {
      en: "No agent assigned to this province",
      ps: "دې ولایت ته کوم استازی نه دی ټاکل شوی",
      fa: "هیچ نماینده‌ای به این ولایت اختصاص داده نشده است",
    },
    customerAmount: {
      en: "Customer Amount",
      ps: "د پیرودونکي مقدار",
      fa: "مبلغ مشتری",
    },
    baseAmount: {
      en: "Base Amount",
      ps: "بنسټیز مقدار",
      fa: "مبلغ پایه",
    },
    freeAmount: {
      en: "Delivery Fees",
      ps: "تحویلي فیس",
      fa: "هزینه تحویل",
    },
    financialBreakdown: {
      en: "Financial Breakdown",
      ps: "مالي ماتول",
      fa: "تفکیک مالی",
    },
    calculationVerified: {
      en: "✓ Calculation Verified",
      ps: "✓ محاسبه تایید شوه",
      fa: "✓ محاسبه تایید شد",
    },
    paymentProgress: {
      en: "Payment Progress",
      ps: "د تادیې پرمختګ",
      fa: "پیشرفت پرداخت",
    },
    addAgent: {
      en: "Add Agent",
      ps: "استازی اضافه کړئ",
      fa: "افزودن نماینده",
    },
    agentName: {
      en: "Agent Name",
      ps: "د استازی نوم",
      fa: "نام نماینده",
    },
    phone: {
      en: "Phone Number",
      ps: "د تلیفون شمېره",
      fa: "شماره تلفن",
    },
    email: {
      en: "Email (optional)",
      ps: "برېښنالیک (اختیاري)",
      fa: "ایمیل (اختیاری)",
    },
  };

  const trans = (key) =>
    translations[key]?.[language] || translations[key]?.en || key;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!financial) return null;

  const textAlign = isRTL ? "text-right" : "text-left";
  const flexDirection = isRTL ? "flex-row-reverse" : "flex-row";

  // Check if agent exists
  const hasAgent = financial.agent && financial.agent.agent_id;

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir={isRTL ? "rtl" : "ltr"}>
      <ToastContainer
        position={isRTL ? "top-left" : "top-right"}
        autoClose={2000}
        rtl={isRTL}
      />

      {/* Header with Back Button */}
      <div className={`flex items-center ${flexDirection} mb-6`}>
        <button
          onClick={() => navigate("/provinces")}
          className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
        >
          <FaArrowLeft className={isRTL ? "ml-2" : "mr-2"} />
          <span>{trans("back")}</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {financial.province_name}
        </h1>
      </div>

      {!hasAgent ? (
        // ----- NO AGENT ASSIGNED -----
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-4 rounded-full">
              <FaUserTie className="text-red-600 text-4xl" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {trans("noAgent")}
          </h2>
          <p className="text-gray-600 mb-6">
            Please add an agent to manage payments and view financial summaries
            for this province.
          </p>
          
        </div>
      ) : (
        // ----- AGENT EXISTS: SHOW FULL UI -----
        <>
          {/* Agent Info Card */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className={`flex items-center ${flexDirection}`}>
              <div className="bg-purple-100 p-3 rounded-full mr-3">
                <FaUserTie className="text-purple-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{trans("agent")}</p>
                <p className="text-lg font-semibold">
                  {financial.agent.agent_name}
                </p>
                {financial.agent.agent_phone && (
                  <p className="text-sm text-gray-600">
                    📞 {financial.agent.agent_phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FaMoneyBillWave className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {trans("totalCommission")}
                </p>
                <p className="text-2xl font-bold">
                  ${financial.total_commission}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <FaWallet className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {trans("totalPayments")}
                </p>
                <p className="text-2xl font-bold">
                  ${financial.total_payments}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full mr-4">
                <FaBalanceScale className="text-yellow-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{trans("balanceDue")}</p>
                <p
                  className={`text-2xl font-bold ${financial.balance_due > 0 ? "text-red-600" : "text-green-600"}`}
                >
                  ${financial.balance_due}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Financial Breakdown */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className={`flex items-center ${flexDirection} mb-3`}>
              <FaChartPie className="text-gray-600 mr-2" />
              <h3 className="font-bold text-gray-800">
                {trans("financialBreakdown")}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border rounded p-3 bg-blue-50">
                <p className="text-sm text-gray-600">
                  {trans("customerAmount")}
                </p>
                <p className="text-xl font-bold text-blue-600">
                  ${financial.total_customer_amount}
                </p>
              </div>

              <div className="border rounded p-3 bg-green-50">
                <p className="text-sm text-gray-600">{trans("baseAmount")}</p>
                <p className="text-xl font-bold text-green-600">
                  ${financial.total_base_amount}
                </p>
              </div>

              <div className="border rounded p-3 bg-purple-50">
                <p className="text-sm text-gray-600">
                  {trans("totalCommission")}
                </p>
                <p className="text-xl font-bold text-purple-600">
                  ${financial.total_commission}
                </p>
              </div>

              <div className="border rounded p-3 bg-orange-50">
                <p className="text-sm text-gray-600">{trans("freeAmount")}</p>
                <p className="text-xl font-bold text-orange-600">
                  ${financial.total_free_amount}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Payments */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-bold text-gray-800">
                {trans("recentPayments")}
              </h2>
              <button
                onClick={() => {
                  setPaymentForm({
                    amount: "",
                    payment_date: new Date().toISOString().split("T")[0],
                    notes: "",
                  });
                  setShowAddPaymentModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-sm rounded flex items-center"
              >
                <FaPlus className="mr-1" /> {trans("addPayment")}
              </button>
            </div>

            {payments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {trans("noPayments")}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className={`px-4 py-2 ${textAlign}`}>
                        {trans("amount")}
                      </th>
                      <th className={`px-4 py-2 ${textAlign}`}>
                        {trans("date")}
                      </th>
                      <th className={`px-4 py-2 ${textAlign}`}>
                        {trans("notes")}
                      </th>
                      <th className={`px-4 py-2 ${textAlign}`}>
                        {trans("actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr
                        key={payment.payment_id}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className={`px-4 py-2 ${textAlign} font-medium`}>
                          ${payment.amount}
                        </td>
                        <td className={`px-4 py-2 ${textAlign}`}>
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </td>
                        <td className={`px-4 py-2 ${textAlign}`}>
                          {payment.notes || "-"}
                        </td>
                        <td className={`px-4 py-2 ${textAlign}`}>
                          <button
                            onClick={() =>
                              handleDeletePayment(payment.payment_id)
                            }
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Payment Modal (only shown when agent exists, but modal is rendered outside conditional) */}
      {showAddPaymentModal && hasAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">{trans("addPayment")}</h3>
              <button
                onClick={() => setShowAddPaymentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label
                  className={`block text-sm font-medium text-gray-700 mb-1 ${textAlign}`}
                >
                  {trans("agent")}
                </label>
                <input
                  type="text"
                  value={financial.agent?.agent_name || ""}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50"
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium text-gray-700 mb-1 ${textAlign}`}
                >
                  {trans("amount")} *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={paymentForm.amount}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, amount: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  placeholder="0.00"
                  autoFocus
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium text-gray-700 mb-1 ${textAlign}`}
                >
                  {trans("date")} *
                </label>
                <input
                  type="date"
                  value={paymentForm.payment_date}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      payment_date: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium text-gray-700 mb-1 ${textAlign}`}
                >
                  {trans("notes")}
                </label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  rows="2"
                  placeholder="Optional notes..."
                />
              </div>
            </div>
            <div className="p-4 border-t flex justify-end space-x-2">
              <button
                onClick={() => setShowAddPaymentModal(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPayment}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
              >
                <FaCheck className="mr-1" /> Save
              </button>
            </div>
          </div>
        </div>
      )}

     
    </div>
  );
};

export default ProvinceDetail;
