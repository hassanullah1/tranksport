import React, { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { Link, useNavigate } from "react-router-dom";
import {
  FaSave,
  FaTimes,
  FaPlus,
  FaTrash,
  FaEdit,
  FaBox,
  FaUser,
  FaTruck,
  FaMoneyBillWave,
  FaCheck,
  FaPrint,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BillPrintView from "./BillPrintView"; // adjust path as needed

const AddDelivery = () => {
  const { t, language, isRTL } = useLanguage();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [provinces, setProvinces] = useState([]);

  const [loading, setLoading] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  console.log(provinces);
  // Print preview state
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printBillData, setPrintBillData] = useState(null);

  const [newCustomer, setNewCustomer] = useState({
    customer_name: "",
    phone: "",
    address: "",
    province_id: "",
  });

  const [itemForm, setItemForm] = useState({
    id: null,
    item_name: "",
    description: "",
    agent_cost: 0,
    fess: 0,
    unit_cost: "",
    quantity: 1,
    total_cost: 0,
  });

  const [formData, setFormData] = useState({
    items: [],
    customer_id: "",
    agent_id: "",
    province_id: "",
    delivery_date: new Date().toISOString().split("T")[0],
    status: "pending",
  });

  // Load customers & provinces
  useEffect(() => {
    loadDeliveryInfo();
  }, []);

  const loadDeliveryInfo = async () => {
    try {
      setLoading(true);
      const [customersData, provincesData] = await Promise.all([
        window.electronAPI.getCustomers(),
        window.electronAPI.getProvinces(),
      ]);

      setCustomers(customersData);
      setProvinces(provincesData);
    } catch (error) {
      toast.error("Failed to load delivery options");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewCustomerChange = (field, value) => {
    setNewCustomer({ ...newCustomer, [field]: value });
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.customer_name.trim()) {
      toast.error("Customer name is required");
      return;
    }

    try {
      setLoading(true);
      const result = await window.electronAPI.addCustomer(newCustomer);

      if (result.success) {
        toast.success("Customer added successfully!");

        const updatedCustomers = await window.electronAPI.getCustomers();
        setCustomers(updatedCustomers);

        setFormData({ ...formData, customer_id: result.customer_id });

        setNewCustomer({ customer_name: "", phone: "", province_id: "" });
        setShowCustomerModal(false);
      } else {
        toast.error(result.message || "Failed to add customer");
      }
    } catch (error) {
      toast.error(error.message || "Failed to add customer");
    } finally {
      setLoading(false);
    }
  };

  const handleItemFormChange = (field, value) => {
    const updatedForm = { ...itemForm, [field]: value };

    if (field === "unit_cost" || field === "quantity") {
      const unitCost = parseFloat(updatedForm.unit_cost) || 0;
      const quantity = parseInt(updatedForm.quantity) || 1;
      updatedForm.total_cost = unitCost * quantity;
    }

    setItemForm(updatedForm);
  };

  const handleAddOrUpdateItem = () => {
    if (!itemForm.item_name.trim()) {
      toast.error("Please enter item name");
      return;
    }

    if (parseFloat(itemForm.unit_cost) <= 0 || !itemForm.unit_cost) {
      toast.error("Please enter valid unit cost");
      return;
    }

    const itemToSave = {
      id: editingItemId || Date.now(),
      item_name: itemForm.item_name,
      description: itemForm.description || "",
      agent_cost: parseFloat(itemForm.agent_cost) || 0,
      unit_cost: parseFloat(itemForm.unit_cost),
      quantity: parseInt(itemForm.quantity) || 1,
      fess: parseFloat(itemForm.fess) || 0,
      total_cost:
        (parseFloat(itemForm.unit_cost) || 0) *
        (parseInt(itemForm.quantity) || 1),
    };

    if (editingItemId) {
      const updatedItems = formData.items.map((item) =>
        item.id === editingItemId ? itemToSave : item,
      );
      setFormData({ ...formData, items: updatedItems });
      toast.success("Item updated");
    } else {
      setFormData({
        ...formData,
        items: [...formData.items, itemToSave],
      });
      toast.success("Item added");
    }

    resetItemForm();
  };

  const handleEditItem = (item) => {
    setItemForm({
      id: item.id,
      item_name: item.item_name,
      description: item.description || "",
      agent_cost: item.agent_cost || 0,
      unit_cost: item.unit_cost,
      quantity: item.quantity,
      total_cost: item.total_cost,
      fess: item.fess,
    });
    setEditingItemId(item.id);
  };

  const removeItem = (id) => {
    if (formData.items.length <= 1) {
      toast.error("At least one item is required");
      return;
    }

    const updatedItems = formData.items.filter((item) => item.id !== id);
    setFormData({ ...formData, items: updatedItems });

    if (editingItemId === id) {
      resetItemForm();
    }
  };

  const resetItemForm = () => {
    setItemForm({
      id: null,
      item_name: "",
      description: "",
      agent_cost: 0,
      unit_cost: "",
      fess: 0,
      quantity: 1,
      total_cost: 0,
    });
    setEditingItemId(null);
  };

  const calculateTotals = () => {
    return formData.items.reduce(
      (acc, item) => {
        const quantity = parseInt(item.quantity) || 1;
        const unitCost = parseFloat(item.unit_cost) || 0;
        acc.totalQuantity += quantity;
        acc.totalCost += unitCost * quantity;
        return acc;
      },
      { totalQuantity: 0, totalCost: 0 },
    );
  };

  const calculateCommission = () => {
    return formData.items.reduce(
      (sum, item) => sum + (parseFloat(item.agent_cost) || 0),
      0,
    );
  };

  // Save & Print handler
  const handleSaveAndPrint = async (e) => {
    e.preventDefault();

    if (formData.items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    if (!formData.customer_id || !formData.province_id) {
      toast.error("Please fill all delivery information");
      return;
    }

    try {
      setLoading(true);

      const commission = calculateCommission();

      const deliveryData = {
        ...formData,
        items: formData.items.map((item) => ({
          item_name: item.item_name,
          description: item.description || "",
          agent_cost: parseFloat(item.agent_cost) || 0,
          unit_cost: parseFloat(item.unit_cost) || 0,
          quantity: parseInt(item.quantity) || 1,
          fess: parseFloat(item.fess),
          total_cost: parseFloat(item.unit_cost) * parseInt(item.quantity || 1),
        })),
        commission_amount: commission,
      };

      const result = await window.electronAPI.addDelivery(deliveryData);

      // Build bill data for print preview
      const customer =
        customers.find((c) => c.customer_id == formData.customer_id) || {};
      const province =
        provinces.find((p) => p.province_id == formData.province_id) || {};

      const billData = {
        bill_id: result.delivery_id,
        bill_date: formData.delivery_date,
        agent_name: "N/A", // no agent in form yet
        phone: province.phone || "Unknown",
        province_name: province.province_name || "Unknown",

        deliveries: [
          {
            delivery_id: result.delivery_id,
            customer_name: customer.customer_name || "Unknown",
            customer_phone: customer.phone || "",

            items: formData.items.map((item) => ({
              item_id: item.id,
              item_name: item.item_name,
              description: item.description,
              unit_cost: item.unit_cost,
              quantity: item.quantity,
              total_cost: item.total_cost,
              fess: item.fess,
              commission: item.agent_cost,
            })),
          },
        ],
      };

      setPrintBillData(billData);
      setShowPrintModal(true);

      toast.success(result.message);
      // Stay on page – user can print or close modal
    } catch (error) {
      toast.error(error.message || "Failed to add delivery");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    if (!formData.customer_id || !formData.province_id) {
      toast.error("Please fill all delivery information");
      return;
    }

    try {
      setLoading(true);

      const commission = calculateCommission();

      const deliveryData = {
        ...formData,
        items: formData.items.map((item) => ({
          item_name: item.item_name,
          description: item.description || "",
          agent_cost: parseFloat(item.agent_cost) || 0,
          unit_cost: parseFloat(item.unit_cost) || 0,
          quantity: parseInt(item.quantity) || 1,
          fess: parseFloat(item.fess),
          total_cost: parseFloat(item.unit_cost) * parseInt(item.quantity || 1),
        })),
        commission_amount: commission,
      };

      const result = await window.electronAPI.addDelivery(deliveryData);
      toast.success(result.message);
      navigate("/deliveries");
    } catch (error) {
      toast.error(error.message || "Failed to add delivery");
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();
  const commission = calculateCommission();
  const netProfit = totals.totalCost * 0.3 - commission;

  const translations = {
    header: {
      en: { title: "Add New Items" },
      ps: { title: "نوی جنس اضافه کړئ" },
      fa: { title: "افزودن جنس جدید" },
    },
    buttons: {
      en: {
        save: "Save Delivery",
        save_print: "Save & Print",
        cancel: "Cancel",
        add_item: "Add Item",
        update_item: "Update Item",
        edit: "Edit",
        delete: "Delete",
        cancel_edit: "Cancel Edit",
        add_customer: "Add Customer",
        save_customer: "Save Customer",
        print: "Print",
        close: "Close",
      },
      ps: {
        save: "خوندي کړئ",
        save_print: "خوندي کړئ او چاپ کړئ",
        cancel: "لغوه",
        add_item: "توکی اضافه کړئ",
        update_item: "توکی تازه کړئ",
        edit: "سمون",
        delete: "ړنګول",
        cancel_edit: "د سمون لغوه کول",
        add_customer: "نوی پیرودونکی اضافه کړئ",
        save_customer: "پیرودونکی خوندي کړئ",
        print: "چاپ",
        close: "بندول",
      },
      fa: {
        save: "ذخیره",
        save_print: "ذخیره و چاپ",
        cancel: "لغو",
        add_item: "افزودن آیتم",
        update_item: "بروزرسانی آیتم",
        edit: "ویرایش",
        delete: "حذف",
        cancel_edit: "لغو ویرایش",
        add_customer: "افزودن مشتری جدید",
        save_customer: "ذخیره مشتری",
        print: "چاپ",
        close: "بستن",
      },
    },
    form: {
      en: {
        delivery_info: "Delivery Information",
        add_items: "Items Info",
        items_list: "Items List",
        summary: "Summary",
        customer: "Customer *",
        province: "Province *",
        date: "Date",
        item_name: "Item Name *",
        description: "Description",
        agent_cost: "Agent",
        unit_cost: "Unit Cost ($)",
        quantity: "Qty",
        total_cost: "Total ($)",
        total_items: "Items",
        total_quantity: "Qty",
        total_cost_label: "Cost",
        commission: "Commission",
        profit: "Profit",
        select_customer: "Select Customer",
        select_province: "Select Province",
        no_items: "No items added yet",
        add_first_item: "Use the form above to add your first item",
      },
      ps: {
        delivery_info: "د لیږد معلومات",
        add_items: "دجنس معلومات",
        items_list: "د جنسونو لیست",
        summary: "مجموعه",
        customer: "پیرودونکی *",
        province: "ولایت *",
        date: "نیټه",
        item_name: "د توکی نوم *",
        description: "توضحات",
        agent_cost: "نماینده",
        unit_cost: "نرخ ($)",
        quantity: "مقدار",
        total_cost: "مجموعه ($)",
        total_items: "توکي",
        total_quantity: "مقدار",
        total_cost_label: "لګښت",
        commission: "کمیسیون",
        profit: "ګټه",
        select_customer: "پیرودونکی غوره کړئ",
        select_province: "ولایت غوره کړئ",
        no_items: "تر اوسه هیڅ توکی نه دی اضافه شوی",
        add_first_item: "د پورته فورم په کارولو سره خپل لومړی توکی اضافه کړئ",
      },
      fa: {
        delivery_info: "اطلاعات تحویل",
        add_items: "معلومات جنس",
        items_list: "لیست آیتم‌ها",
        summary: "خلاصه",
        customer: "مشتری *",
        province: "ولایت *",
        date: "تاریخ",
        item_name: "نام آیتم *",
        description: "توضیحات",
        agent_cost: "نماینده",
        unit_cost: "قیمت ($)",
        quantity: "تعداد",
        total_cost: "جمع ($)",
        total_items: "آیتم",
        total_quantity: "تعداد",
        total_cost_label: "هزینه",
        commission: "کمیسیون",
        profit: "سود",
        select_customer: "انتخاب مشتری",
        select_province: "انتخاب ولایت",
        no_items: "هنوز آیتمی اضافه نشده است",
        add_first_item: "از فرم بالا برای افزودن اولین آیتم استفاده کنید",
      },
    },
    customerModal: {
      en: {
        title: "Add New Customer",
        customer_name: "Customer Name *",
        phone: "Phone",
        province: "Province",
        close: "Close",
      },
      ps: {
        title: "نوی پیرودونکی اضافه کړئ",
        customer_name: "د پیرودونکی نوم *",
        phone: "تلیفون",
        province: "ولایت",
        close: "بندول",
      },
      fa: {
        title: "افزودن مشتری جدید",
        customer_name: "نام مشتری *",
        phone: "تلفن",
        province: "ولایت",
        close: "بستن",
      },
    },
  };

  const trans = (category, key) => {
    return (
      translations[category]?.[language]?.[key] ||
      translations[category]?.en?.[key] ||
      key
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const textAlign = isRTL ? "text-right" : "text-left";
  const flexDirection = isRTL ? "flex-row-reverse" : "flex-row";
  const marginDirection = isRTL ? "ml" : "mr";

  return (
    <div
      className="min-h-screen bg-gray-50 p-3 md:p-4"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <ToastContainer
        position={isRTL ? "top-left" : "top-right"}
        autoClose={2000}
        rtl={isRTL}
      />

      {/* Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b">
              <div
                className={`flex items-center justify-between ${flexDirection}`}
              >
                <div className={`flex items-center ${flexDirection}`}>
                  <FaUser className={`text-blue-600 ${marginDirection}-2`} />
                  <h3 className="font-bold text-lg">
                    {trans("customerModal", "title")}
                  </h3>
                </div>
                <button
                  onClick={() => setShowCustomerModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label
                  className={`block text-sm font-medium text-gray-700 mb-1 ${textAlign}`}
                >
                  {trans("customerModal", "customer_name")}
                </label>
                <input
                  type="text"
                  value={newCustomer.customer_name}
                  onChange={(e) =>
                    handleNewCustomerChange("customer_name", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  placeholder={
                    isRTL ? "د پیرودونکی نوم" : "Enter customer name"
                  }
                  dir={isRTL ? "rtl" : "ltr"}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium text-gray-700 mb-1 ${textAlign}`}
                >
                  {trans("customerModal", "phone")}
                </label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) =>
                    handleNewCustomerChange("phone", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  placeholder={isRTL ? "د تلیفون شمیره" : "Phone number"}
                  dir={isRTL ? "rtl" : "ltr"}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium text-gray-700 mb-1 ${textAlign}`}
                >
                  {trans("customerModal", "province")}
                </label>
                <select
                  value={newCustomer.province_id}
                  onChange={(e) =>
                    handleNewCustomerChange("province_id", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  <option value="">{trans("form", "select_province")}</option>
                  {provinces.map((province) => (
                    <option
                      key={province.province_id}
                      value={province.province_id}
                    >
                      {province.province_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 border-t flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowCustomerModal(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                {trans("customerModal", "close")}
              </button>
              <button
                type="button"
                onClick={handleAddCustomer}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {trans("buttons", "save_customer")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Preview Modal */}
      {showPrintModal && printBillData && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 "
          
        >
          <div className="bg-white rounded-lg shadow-xl w-350 max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">Print Preview</h3>
              <button
                onClick={() => setShowPrintModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6 print-content" style={{ maxWidth: "120mm" }}>
              <BillPrintView
                bill={printBillData}
                language={language}
                isRTL={true}
                t={translations}
              />
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowPrintModal(false);
                  navigate("/deliveries");
                }}
                className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                {trans("buttons", "close")}
              </button>
              <button
                onClick={() => {
                  window.electronAPI.printPage();
                }}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
              >
                <FaPrint /> {trans("buttons", "print")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-4">
        <div
          className={`flex items-center justify-between mb-3 ${flexDirection}`}
        >
          <div className={`flex items-center ${flexDirection} space-x-2`}>
            <FaTruck className="text-blue-600 text-xl" />
            <h1 className="text-lg md:text-xl font-bold text-gray-800">
              {trans("header", "title")}
            </h1>
          </div>
          <Link to="/deliveries" className="text-gray-500 hover:text-gray-700">
            <FaTimes className="text-lg" />
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Delivery Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div className={`flex items-center mb-3 ${flexDirection}`}>
                <FaTruck
                  className={`text-blue-600 ${marginDirection}-2 text-sm`}
                />
                <h2 className="font-bold text-gray-800 text-sm">
                  {trans("form", "delivery_info")}
                </h2>
              </div>

              <div className="space-y-3">
                <div>
                  <div
                    className={`flex items-center justify-between mb-1 ${flexDirection}`}
                  >
                    <label
                      className={`block text-xs font-medium text-gray-700 ${textAlign}`}
                    >
                      {trans("form", "customer")}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCustomerModal(true)}
                      className={`text-xs text-blue-600 hover:text-blue-800 flex items-center ${flexDirection}`}
                    >
                      <FaPlus className={`${marginDirection}-1 text-xs`} />
                      {trans("buttons", "add_customer")}
                    </button>
                  </div>
                  <select
                    value={formData.customer_id}
                    onChange={(e) =>
                      setFormData({ ...formData, customer_id: e.target.value })
                    }
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    required
                    dir={isRTL ? "rtl" : "ltr"}
                  >
                    <option value="">{trans("form", "select_customer")}</option>
                    {customers.map((customer) => (
                      <option
                        key={customer.customer_id}
                        value={customer.customer_id}
                      >
                        {customer.customer_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-xs font-medium text-gray-700 mb-1 ${textAlign}`}
                  >
                    {trans("form", "province")}
                  </label>
                  <select
                    value={formData.province_id}
                    onChange={(e) =>
                      setFormData({ ...formData, province_id: e.target.value })
                    }
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    required
                    dir={isRTL ? "rtl" : "ltr"}
                  >
                    <option value="">{trans("form", "select_province")}</option>
                    {provinces.map((province) => (
                      <option
                        key={province.province_id}
                        value={province.province_id}
                      >
                        {province.province_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-xs font-medium text-gray-700 mb-1 ${textAlign}`}
                  >
                    {trans("form", "date")}
                  </label>
                  <input
                    type="date"
                    value={formData.delivery_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        delivery_date: e.target.value,
                      })
                    }
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                    dir={isRTL ? "rtl" : "ltr"}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Items */}
          <div className="lg:col-span-2">
            {/* Item Form */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div
                className={`flex items-center justify-between mb-3 ${flexDirection}`}
              >
                <div className={`flex items-center ${flexDirection}`}>
                  <FaBox
                    className={`text-blue-600 ${marginDirection}-2 text-sm`}
                  />
                  <h2 className="font-bold text-gray-800 text-sm">
                    {trans("form", "add_items")}
                  </h2>
                </div>
                <div className={`flex ${flexDirection} space-x-2`}>
                  {editingItemId && (
                    <button
                      type="button"
                      onClick={resetItemForm}
                      className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1"
                    >
                      {trans("buttons", "cancel_edit")}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleAddOrUpdateItem}
                    className={`bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-sm rounded flex items-center ${flexDirection}`}
                  >
                    {editingItemId ? (
                      <>
                        <FaCheck className={`${marginDirection}-1 text-xs`} />
                        {trans("buttons", "update_item")}
                      </>
                    ) : (
                      <>
                        <FaPlus className={`${marginDirection}-1 text-xs`} />
                        {trans("buttons", "add_item")}
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <div>
                  <label
                    className={`block text-xs font-medium text-gray-700 mb-1 ${textAlign}`}
                  >
                    {trans("form", "item_name")}
                  </label>
                  <input
                    type="text"
                    value={itemForm.item_name}
                    onChange={(e) =>
                      handleItemFormChange("item_name", e.target.value)
                    }
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                    placeholder={
                      isRTL ? "د توکی نوم دننه کړئ" : "Enter item name"
                    }
                    dir={isRTL ? "rtl" : "ltr"}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-medium text-gray-700 mb-1 ${textAlign}`}
                  >
                    {trans("form", "description")}
                  </label>
                  <input
                    type="text"
                    value={itemForm.description}
                    onChange={(e) =>
                      handleItemFormChange("description", e.target.value)
                    }
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                    placeholder={isRTL ? "توضیحات" : "Description"}
                    dir={isRTL ? "rtl" : "ltr"}
                  />
                </div>

                <div>
                  <label
                    className={`block text-xs font-medium text-gray-700 mb-1 ${textAlign}`}
                  >
                    {trans("form", "unit_cost")}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={itemForm.unit_cost}
                    onChange={(e) =>
                      handleItemFormChange("unit_cost", e.target.value)
                    }
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                    placeholder="0.00"
                    dir={isRTL ? "rtl" : "ltr"}
                  />
                </div>

                <div>
                  <label
                    className={`block text-xs font-medium text-gray-700 mb-1 ${textAlign}`}
                  >
                    {trans("form", "quantity")}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={itemForm.quantity}
                    onChange={(e) =>
                      handleItemFormChange("quantity", e.target.value)
                    }
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                    dir={isRTL ? "rtl" : "ltr"}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-medium text-gray-700 mb-1 ${textAlign}`}
                  >
                    {trans("form", "agent_cost")}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={itemForm.agent_cost}
                    onChange={(e) =>
                      handleItemFormChange("agent_cost", e.target.value)
                    }
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                    dir={isRTL ? "rtl" : "ltr"}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-medium text-gray-700 mb-1 ${textAlign}`}
                  >
                    {trans("form", "fess")}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={itemForm.fess}
                    onChange={(e) =>
                      handleItemFormChange("fess", e.target.value)
                    }
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                    dir={isRTL ? "rtl" : "ltr"}
                  />
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-3 border-b">
                <div
                  className={`flex items-center justify-between ${flexDirection}`}
                >
                  <div className={`flex items-center ${flexDirection}`}>
                    <FaBox
                      className={`text-gray-600 ${marginDirection}-2 text-sm`}
                    />
                    <span className="font-medium text-sm">
                      {trans("form", "items_list")} ({formData.items.length})
                    </span>
                  </div>
                  {formData.items.length > 0 && (
                    <div className="text-xs text-gray-500">
                      {isRTL ? "مجموعه:" : "Total:"} $
                      {totals.totalCost.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              {formData.items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" dir={isRTL ? "rtl" : "ltr"}>
                    <thead className="bg-gray-50 text-xs">
                      <tr>
                        <th className={`px-3 py-2 ${textAlign}`}>#</th>
                        <th className={`px-3 py-2 ${textAlign}`}>
                          {trans("form", "item_name")}
                        </th>
                        <th className={`px-3 py-2 ${textAlign}`}>
                          {trans("form", "unit_cost")}
                        </th>
                        <th className={`px-3 py-2 ${textAlign}`}>
                          {trans("form", "quantity")}
                        </th>
                        <th className={`px-3 py-2 ${textAlign}`}>
                          {trans("form", "total_cost")}
                        </th>
                        <th className={`px-3 py-2 ${textAlign}`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => (
                        <tr key={item.id} className="border-t hover:bg-gray-50">
                          <td className={`px-3 py-2 ${textAlign}`}>
                            {index + 1}
                          </td>
                          <td className={`px-3 py-2 ${textAlign}`}>
                            {item.item_name}
                          </td>
                          <td className={`px-3 py-2 ${textAlign}`}>
                            ${parseFloat(item.unit_cost).toFixed(2)}
                          </td>
                          <td className={`px-3 py-2 ${textAlign}`}>
                            {item.quantity}
                          </td>
                          <td className={`px-3 py-2 ${textAlign} font-medium`}>
                            ${parseFloat(item.total_cost).toFixed(2)}
                          </td>
                          <td className={`px-3 py-2 ${textAlign}`}>
                            <div className={`flex ${flexDirection} space-x-2`}>
                              <button
                                type="button"
                                onClick={() => handleEditItem(item)}
                                className="text-blue-600 hover:text-blue-800"
                                title={trans("buttons", "edit")}
                              >
                                <FaEdit className="text-sm" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="text-red-600 hover:text-red-800"
                                title={trans("buttons", "delete")}
                              >
                                <FaTrash className="text-sm" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaBox className="text-gray-400" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">
                    {trans("form", "no_items")}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {trans("form", "add_first_item")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className={`flex justify-between pt-4 border-t ${flexDirection}`}>
          <Link
            to="/deliveries"
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 text-sm rounded"
          >
            {trans("buttons", "cancel")}
          </Link>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSaveAndPrint}
              disabled={loading || formData.items.length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 text-sm rounded flex items-center gap-2"
            >
              <FaPrint />
              {trans("buttons", "save_print")}
            </button>
            <button
              type="submit"
              disabled={loading || formData.items.length === 0}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-6 py-2 text-sm rounded flex items-center gap-2"
            >
              <FaSave />
              {trans("buttons", "save")}
            </button>
          </div>
        </div>
      </form>

      {/* Print styles */}
      <style>{`
    @media print {
@media print {
  * {
    box-sizing: border-box;   /* ✅ IMPORTANT */
  }

  body {
    margin: 0;
    padding: 0;
  }

  body * {
    visibility: hidden;
  }

  .print-content,
  .print-content * {
    visibility: visible;
  }

  .print-content {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 72mm;
    max-width: 72mm;   /* ✅ prevent overflow */
    padding: 2mm;
    background: white;
    overflow: hidden;  /* ✅ stop extra width */
  }

  @page {
    size: 72mm auto;
    margin: 0;
  }
}
}`}</style>
    </div>
  );
};

export default AddDelivery;
