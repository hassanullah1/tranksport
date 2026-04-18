import React, { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSync,
  FaFilter,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaChartPie,
  FaTimes,
  FaCheck,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Expenses = () => {
  const { t, language, isRTL } = useLanguage();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [stats, setStats] = useState(null);

  // Date filter states
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split("T")[0];
  });

  // Form states
  const [newExpense, setNewExpense] = useState({
    expense_description: "",
    amount: "",
    expense_date: new Date().toISOString().split("T")[0],
  });

  const [editExpense, setEditExpense] = useState({
    expense_id: "",
    expense_description: "",
    amount: "",
    expense_date: "",
  });

  // Load expenses on component mount and when date filters change
  useEffect(() => {
    loadExpenses();
  }, [startDate, endDate]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await window.electronAPI.getExpensesByDateRange(
        startDate,
        endDate,
      );
      setExpenses(data);
    } catch (error) {
      toast.error(error.message || "Failed to load expenses");
      console.error("Error loading expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await window.electronAPI.getExpenseStats(startDate, endDate);
      setStats(data);
      setShowStatsModal(true);
    } catch (error) {
      toast.error("Failed to load statistics");
      console.error("Error loading stats:", error);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      if (searchTerm.trim() === "") {
        loadExpenses();
      } else {
        const data = await window.electronAPI.searchExpenses(searchTerm);
        setExpenses(data);
      }
    } catch (error) {
      toast.error("Search failed");
      console.error("Error searching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.expense_description.trim()) {
      toast.error("Please enter expense description");
      return;
    }
    if (!newExpense.amount || parseFloat(newExpense.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const result = await window.electronAPI.addExpense(newExpense);
      toast.success(result.message || "Expense added successfully!");
      setShowAddModal(false);
      setNewExpense({
        expense_description: "",
        amount: "",
        expense_date: new Date().toISOString().split("T")[0],
      });
      loadExpenses();
    } catch (error) {
      toast.error(error.message || "Failed to add expense");
    }
  };

  const handleEditExpense = async () => {
    if (!editExpense.expense_description.trim()) {
      toast.error("Please enter expense description");
      return;
    }
    if (!editExpense.amount || parseFloat(editExpense.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const result = await window.electronAPI.updateExpense(editExpense);
      toast.success(result.message || "Expense updated successfully!");
      setShowEditModal(false);
      loadExpenses();
    } catch (error) {
      toast.error(error.message || "Failed to update expense");
    }
  };

  const handleDeleteExpense = async () => {
    if (!selectedExpense) return;

    try {
      const result = await window.electronAPI.deleteExpense(
        selectedExpense.expense_id,
      );
      toast.success(result.message || "Expense deleted successfully!");
      setShowDeleteModal(false);
      setSelectedExpense(null);
      loadExpenses();
    } catch (error) {
      toast.error(error.message || "Failed to delete expense");
    }
  };

  const openEditModal = (expense) => {
    setEditExpense({
      expense_id: expense.expense_id,
      expense_description: expense.expense_description,
      amount: expense.amount,
      expense_date: expense.expense_date
        ? expense.expense_date.split("T")[0]
        : new Date().toISOString().split("T")[0],
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (expense) => {
    setSelectedExpense(expense);
    setShowDeleteModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(
      language === "en" ? "en-US" : language === "fa" ? "fa-IR" : "ps-AF",
      {
        style: "currency",
        currency: "AFN",
        minimumFractionDigits: 0,
      },
    ).format(amount);
  };

  const translations = {
    header: {
      en: { title: "Expenses Management" },
      ps: { title: "د لګښتونو مدیریت" },
      fa: { title: "مدیریت هزینه‌ها" },
    },
    buttons: {
      en: {
        add: "Add Expense",
        search: "Search",
        refresh: "Refresh",
        clear: "Clear",
        cancel: "Cancel",
        update: "Update",
        delete: "Delete",
        stats: "Statistics",
      },
      ps: {
        add: "نوی لګښت",
        search: "پلټل",
        refresh: "بیا ډیرول",
        clear: "پاکول",
        cancel: "لغوه کول",
        update: "تازه کول",
        delete: "ړنګول",
        stats: "احصایې",
      },
      fa: {
        add: "افزودن هزینه",
        search: "جستجو",
        refresh: "بارگذاری مجدد",
        clear: "پاک کردن",
        cancel: "لغو",
        update: "به روز رسانی",
        delete: "حذف",
        stats: "آمار",
      },
    },
    table: {
      en: {
        description: "Description",
        amount: "Amount",
        date: "Date",
        actions: "Actions",
      },
      ps: {
        description: "تفصیل",
        amount: "لګښت",
        date: "نیټه",
        actions: "کړنې",
      },
      fa: {
        description: "شرح",
        amount: "مبلغ",
        date: "تاریخ",
        actions: "اقدامات",
      },
    },
    filters: {
      en: { from: "From Date", to: "To Date", apply: "Apply Filter" },
      ps: { from: "د پیل نیټه", to: "د پای نیټه", apply: "فلټر تطبیق کړئ" },
      fa: { from: "از تاریخ", to: "تا تاریخ", apply: "اعمال فیلتر" },
    },
  };

  const trans = (category, key) => {
    return (
      translations[category]?.[language]?.[key] ||
      translations[category]?.en?.[key] ||
      key
    );
  };

  return (
    <div className="p-1 md:p-1" dir={isRTL ? "rtl" : "ltr"}>
      <ToastContainer
        position={isRTL ? "top-left" : "top-right"}
        autoClose={3000}
        rtl={isRTL}
      />

      {/* Header */}
      <div className="mb-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {trans("header", "title")}
            </h2>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            <button
              onClick={loadStats}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center"
            >
              <FaChartPie className={`${isRTL ? "ml-2" : "mr-2"}`} />
              {trans("buttons", "stats")}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 flex items-center"
            >
              <FaPlus className={`${isRTL ? "ml-2" : "mr-2"}`} />
              {trans("buttons", "add")}
            </button>
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {trans("filters", "from")}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {trans("filters", "to")}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={loadExpenses}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center"
            >
              <FaFilter className={`${isRTL ? "ml-2" : "mr-2"}`} />
              {trans("filters", "apply")}
            </button>
            <button
              onClick={() => {
                const date = new Date();
                date.setDate(1);
                setStartDate(date.toISOString().split("T")[0]);
                setEndDate(new Date().toISOString().split("T")[0]);
              }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              <FaSync />
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow p-2 mb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search expenses..."
                className={`w-full ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"} py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none`}
              />
              <FaSearch
                className={`absolute ${isRTL ? "right-3" : "left-3"} top-3.5 text-gray-400`}
              />
            </div>
          </div>
          <div className="flex space-x-3 rtl:space-x-reverse">
            <button
              onClick={handleSearch}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-6 rounded-lg flex items-center"
            >
              <FaSearch className={`${isRTL ? "ml-2" : "mr-2"}`} />
              {trans("buttons", "search")}
            </button>
            <button
              onClick={loadExpenses}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2.5 px-6 rounded-lg flex items-center"
            >
              <FaSync className={`${isRTL ? "ml-2" : "mr-2"}`} />
              {trans("buttons", "refresh")}
            </button>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading expenses...</p>
            </div>
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <FaMoneyBillWave className="text-gray-300 text-6xl mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">
              No Expenses Found
            </h3>
            <p className="text-gray-500 mt-2">
              Add your first expense to get started
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-6 rounded-lg"
            >
              {trans("buttons", "add")}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className={`px-6 py-3 text-${isRTL ? "right" : "left"} text-xs font-medium text-gray-500 uppercase tracking-wider`}
                  >
                    {trans("table", "description")}
                  </th>
                  <th
                    className={`px-6 py-3 text-${isRTL ? "right" : "left"} text-xs font-medium text-gray-500 uppercase tracking-wider`}
                  >
                    {trans("table", "amount")}
                  </th>
                  <th
                    className={`px-6 py-3 text-${isRTL ? "right" : "left"} text-xs font-medium text-gray-500 uppercase tracking-wider`}
                  >
                    {trans("table", "date")}
                  </th>
                  <th
                    className={`px-6 py-3 text-${isRTL ? "right" : "left"} text-xs font-medium text-gray-500 uppercase tracking-wider`}
                  >
                    {trans("table", "actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <tr
                    key={expense.expense_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div
                          className={`w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center ${isRTL ? "ml-3" : "mr-3"}`}
                        >
                          <FaMoneyBillWave className="text-red-600" />
                        </div>
                        <div className="font-medium text-gray-900">
                          {expense.expense_description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(expense.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(expense.expense_date).toLocaleDateString(
                        language === "en"
                          ? "en-US"
                          : language === "fa"
                            ? "fa-IR"
                            : "ps-AF",
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        <button
                          onClick={() => openEditModal(expense)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => openDeleteModal(expense)}
                          className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Add New Expense
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <input
                    type="text"
                    value={newExpense.expense_description}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        expense_description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="Enter expense description"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount *
                  </label>
                  <input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) =>
                      setNewExpense({ ...newExpense, amount: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="Enter amount"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newExpense.expense_date}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        expense_date: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div
                className={`flex justify-${isRTL ? "start" : "end"} space-x-3 rtl:space-x-reverse mt-8`}
              >
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddExpense}
                  className="px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 flex items-center"
                >
                  <FaPlus className={`${isRTL ? "ml-2" : "mr-2"}`} />
                  Add Expense
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Edit Expense
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <input
                    type="text"
                    value={editExpense.expense_description}
                    onChange={(e) =>
                      setEditExpense({
                        ...editExpense,
                        expense_description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount *
                  </label>
                  <input
                    type="number"
                    value={editExpense.amount}
                    onChange={(e) =>
                      setEditExpense({ ...editExpense, amount: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={editExpense.expense_date}
                    onChange={(e) =>
                      setEditExpense({
                        ...editExpense,
                        expense_date: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div
                className={`flex justify-${isRTL ? "start" : "end"} space-x-3 rtl:space-x-reverse mt-8`}
              >
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditExpense}
                  className="px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 flex items-center"
                >
                  <FaCheck className={`${isRTL ? "ml-2" : "mr-2"}`} />
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Delete Expense
                </h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaTrash className="text-red-600 text-2xl" />
                </div>

                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  Delete {selectedExpense.expense_description}?
                </h4>

                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this expense? This action
                  cannot be undone.
                </p>
              </div>

              <div
                className={`flex justify-${isRTL ? "start" : "end"} space-x-3 rtl:space-x-reverse mt-8`}
              >
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteExpense}
                  className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 flex items-center"
                >
                  <FaTrash className={`${isRTL ? "ml-2" : "mr-2"}`} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Modal */}
      {showStatsModal && stats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Expense Statistics
                </h3>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                  <p className="text-sm text-blue-600 font-medium mb-2">
                    Total Expenses
                  </p>
                  <p className="text-3xl font-bold text-blue-800">
                    {stats.summary.total_expenses}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                  <p className="text-sm text-green-600 font-medium mb-2">
                    Total Amount
                  </p>
                  <p className="text-3xl font-bold text-green-800">
                    {formatCurrency(stats.summary.total_amount)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                  <p className="text-sm text-purple-600 font-medium mb-2">
                    Average Amount
                  </p>
                  <p className="text-3xl font-bold text-purple-800">
                    {formatCurrency(stats.summary.average_amount)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl">
                  <p className="text-sm text-yellow-600 font-medium mb-2">
                    Date Range
                  </p>
                  <p className="text-lg font-semibold text-yellow-800">
                    {new Date(startDate).toLocaleDateString()} -{" "}
                    {new Date(endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="px-6 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
