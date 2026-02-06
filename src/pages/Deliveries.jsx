import React, { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
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
  FaMapMarkerAlt,
  FaPrint,
  FaEye,
  FaTimes,
  FaCheck,
  FaDownload,
  FaClipboardList,
  FaCalendarAlt,
  FaFileInvoice,
  FaTag
} from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import InvoicePrint from "../components/InvoicePrint";

const Deliveries = () => {
  const { t, language, isRTL } = useLanguage();
  const [deliveries, setDeliveries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  
  // Selected items
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  
  // Form states
  const [newDelivery, setNewDelivery] = useState({
    item_name: "",
    item_description: "",
    quantity: 1,
    item_cost: 0,
    selling_price: 0,
    customer_id: "",
    agent_id: "",
    province_id: "",
    delivery_date: new Date().toISOString().split('T')[0],
    status: "pending"
  });
  
  const [editDelivery, setEditDelivery] = useState({
    delivery_id: "",
    item_name: "",
    item_description: "",
    quantity: 1,
    item_cost: 0,
    selling_price: 0,
    customer_id: "",
    agent_id: "",
    province_id: "",
    delivery_date: new Date().toISOString().split('T')[0],
    status: "pending"
  });

  const [newCustomer, setNewCustomer] = useState({
    customer_name: "",
    email: "",
    phone: "",
    address: "",
    province_id: ""
  });

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [deliveriesData, customersData, agentsData, provincesData, statsData] = await Promise.all([
        window.electronAPI.getDeliveries(),
        window.electronAPI.getCustomers(),
        window.electronAPI.getAgents(),
        window.electronAPI.getProvinces(),
        window.electronAPI.getDeliveryStats()
      ]);
      
      setDeliveries(deliveriesData);
      setCustomers(customersData);
      setAgents(agentsData);
      setProvinces(provincesData);
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
        const data = await window.electronAPI.searchDeliveries(searchTerm);
        setDeliveries(data);
      }
    } catch (error) {
      toast.error("Search failed");
      console.error("Error searching deliveries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDelivery = async () => {
    if (!newDelivery.item_name.trim()) {
      toast.error("Please enter item name");
      return;
    }
    if (newDelivery.item_cost <= 0) {
      toast.error("Please enter valid item cost");
      return;
    }

    try {
      const result = await window.electronAPI.addDelivery(newDelivery);
      toast.success(result.message);
      setShowAddModal(false);
      resetNewDeliveryForm();
      loadAllData();
    } catch (error) {
      toast.error(error.message || "Failed to add delivery");
    }
  };

  const handleEditDelivery = async () => {
    if (!editDelivery.item_name.trim()) {
      toast.error("Please enter item name");
      return;
    }
    if (editDelivery.item_cost <= 0) {
      toast.error("Please enter valid item cost");
      return;
    }

    try {
      const result = await window.electronAPI.updateDelivery(editDelivery);
      toast.success(result.message);
      setShowEditModal(false);
      loadAllData();
    } catch (error) {
      toast.error(error.message || "Failed to update delivery");
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

  const handleAddCustomer = async () => {
    if (!newCustomer.customer_name.trim()) {
      toast.error("Please enter customer name");
      return;
    }

    try {
      const result = await window.electronAPI.addCustomer(newCustomer);
      toast.success(result.message);
      setShowCustomerModal(false);
      setNewCustomer({
        customer_name: "",
        email: "",
        phone: "",
        address: "",
        province_id: ""
      });
      // Refresh customers list
      const customersData = await window.electronAPI.getCustomers();
      setCustomers(customersData);
    } catch (error) {
      toast.error(error.message || "Failed to add customer");
    }
  };

  const handlePrintInvoice = async (delivery) => {
    try {
      const result = await window.electronAPI.generateInvoice(delivery.delivery_id);
      setInvoiceData(result.delivery);
      setShowPrintModal(true);
    } catch (error) {
      toast.error("Failed to generate invoice");
    }
  };

  const handleViewDetails = (delivery) => {
    setSelectedDelivery(delivery);
    setShowViewModal(true);
  };

  const resetNewDeliveryForm = () => {
    setNewDelivery({
      item_name: "",
      item_description: "",
      quantity: 1,
      item_cost: 0,
      selling_price: 0,
      customer_id: "",
      agent_id: "",
      province_id: "",
      delivery_date: new Date().toISOString().split('T')[0],
      status: "pending"
    });
  };

  // Calculate commission when item cost or agent changes
  useEffect(() => {
    if (newDelivery.agent_id && newDelivery.item_cost > 0) {
      const agent = agents.find(a => a.agent_id == newDelivery.agent_id);
      if (agent) {
        const commission = newDelivery.item_cost * (agent.commission_rate / 100);
        setNewDelivery(prev => ({
          ...prev,
          commission_amount: commission
        }));
      }
    }
  }, [newDelivery.agent_id, newDelivery.item_cost, agents]);

  useEffect(() => {
    if (editDelivery.agent_id && editDelivery.item_cost > 0) {
      const agent = agents.find(a => a.agent_id == editDelivery.agent_id);
      if (agent) {
        const commission = editDelivery.item_cost * (agent.commission_rate / 100);
        setEditDelivery(prev => ({
          ...prev,
          commission_amount: commission
        }));
      }
    }
  }, [editDelivery.agent_id, editDelivery.item_cost, agents]);

  // Status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
      in_transit: { color: "bg-blue-100 text-blue-800", text: "In Transit" },
      delivered: { color: "bg-green-100 text-green-800", text: "Delivered" },
      cancelled: { color: "bg-red-100 text-red-800", text: "Cancelled" }
    };
    
    const statusInfo = statusMap[status] || statusMap.pending;
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
      {statusInfo.text}
    </span>;
  };

  // Translation objects
  const translations = {
    header: {
      en: { title: "Deliveries & Bills", subtitle: "Manage deliveries, create bills and invoices" },
      ps: { title: "لیږدونه او بلونه", subtitle: "لیږدونه اداره کړئ، بلونه او رسیدونه جوړ کړئ" },
      fa: { title: "تحویل‌ها و صورتحساب‌ها", subtitle: "مدیریت تحویل‌ها، ایجاد صورتحساب و فاکتور" }
    },
    buttons: {
      en: {
        add_delivery: "Add New Delivery",
        add_customer: "Add New Customer",
        search: "Search",
        refresh: "Refresh",
        clear: "Clear",
        cancel: "Cancel",
        update: "Update Delivery",
        delete: "Delete",
        print: "Print Invoice",
        view: "View Details",
        save: "Save",
        generate: "Generate Bill"
      },
      ps: {
        add_delivery: "نوی لیږد اضافه کړئ",
        add_customer: "نوی پیرودونکی اضافه کړئ",
        search: "پلټل",
        refresh: "بیا ډیرول",
        clear: "پاکول",
        cancel: "لغوه کول",
        update: "لیږد تازه کول",
        delete: "ړنګول",
        print: "رسید چاپ کول",
        view: "تفصیلات وګورئ",
        save: "ساتل",
        generate: "بل جوړول"
      },
      fa: {
        add_delivery: "افزودن تحویل جدید",
        add_customer: "افزودن مشتری جدید",
        search: "جستجو",
        refresh: "بارگذاری مجدد",
        clear: "پاک کردن",
        cancel: "لغو",
        update: "به روز رسانی تحویل",
        delete: "حذف",
        print: "چاپ فاکتور",
        view: "مشاهده جزئیات",
        save: "ذخیره",
        generate: "ایجاد صورتحساب"
      }
    },
    stats: {
      en: {
        total_deliveries: "Total Deliveries",
        pending: "Pending",
        delivered: "Delivered",
        total_revenue: "Total Revenue",
        total_profit: "Total Profit"
      },
      ps: {
        total_deliveries: "ټول لیږدونه",
        pending: "پاتې",
        delivered: "لیږل شوی",
        total_revenue: "ټول عاید",
        total_profit: "ټول ګټه"
      },
      fa: {
        total_deliveries: "کل تحویل‌ها",
        pending: "در انتظار",
        delivered: "تحویل شده",
        total_revenue: "کل درآمد",
        total_profit: "کل سود"
      }
    },
    table: {
      en: {
        tracking: "Tracking #",
        item: "Item",
        customer: "Customer",
        agent: "Agent",
        province: "Province",
        quantity: "Qty",
        cost: "Cost",
        price: "Price",
        commission: "Commission",
        date: "Date",
        status: "Status",
        actions: "Actions"
      },
      ps: {
        tracking: "تعقیب نمبر",
        item: "توکی",
        customer: "پیرودونکی",
        agent: "اجنټ",
        province: "ولایت",
        quantity: "مقدار",
        cost: "لګښت",
        price: "نرخ",
        commission: "کمیسیون",
        date: "نیټه",
        status: "حالت",
        actions: "کړنې"
      },
      fa: {
        tracking: "شماره پیگیری",
        item: "آیتم",
        customer: "مشتری",
        agent: "نماینده",
        province: "ولایت",
        quantity: "تعداد",
        cost: "هزینه",
        price: "قیمت",
        commission: "کمیسیون",
        date: "تاریخ",
        status: "وضعیت",
        actions: "اقدامات"
      }
    },
    form: {
      en: {
        item_name: "Item Name *",
        description: "Description",
        quantity: "Quantity",
        item_cost: "Item Cost ($) *",
        selling_price: "Selling Price ($)",
        customer: "Customer",
        agent: "Agent",
        province: "Province",
        date: "Delivery Date",
        status: "Status",
        select_customer: "Select Customer",
        select_agent: "Select Agent",
        select_province: "Select Province",
        select_status: "Select Status"
      },
      ps: {
        item_name: "د توکی نوم *",
        description: "تفصیل",
        quantity: "مقدار",
        item_cost: "د توکی لګښت ($) *",
        selling_price: "پلورنځی ($)",
        customer: "پیرودونکی",
        agent: "اجنټ",
        province: "ولایت",
        date: "د لیږد نیټه",
        status: "حالت",
        select_customer: "پیرودونکی غوره کړئ",
        select_agent: "اجنټ غوره کړئ",
        select_province: "ولایت غوره کړئ",
        select_status: "حالت غوره کړئ"
      },
      fa: {
        item_name: "نام آیتم *",
        description: "توضیحات",
        quantity: "تعداد",
        item_cost: "هزینه آیتم ($) *",
        selling_price: "قیمت فروش ($)",
        customer: "مشتری",
        agent: "نماینده",
        province: "ولایت",
        date: "تاریخ تحویل",
        status: "وضعیت",
        select_customer: "انتخاب مشتری",
        select_agent: "انتخاب نماینده",
        select_province: "انتخاب ولایت",
        select_status: "انتخاب وضعیت"
      }
    },
    customer_form: {
      en: {
        title: "Add New Customer",
        name: "Customer Name *",
        email: "Email",
        phone: "Phone",
        address: "Address",
        province: "Province"
      },
      ps: {
        title: "نوی پیرودونکی اضافه کړئ",
        name: "د پیرودونکی نوم *",
        email: "ایمیل",
        phone: "تلیفون",
        address: "آدرس",
        province: "ولایت"
      },
      fa: {
        title: "افزودن مشتری جدید",
        name: "نام مشتری *",
        email: "ایمیل",
        phone: "تلفن",
        address: "آدرس",
        province: "ولایت"
      }
    }
  };

  // Helper function to get translation
  const trans = (category, key) => {
    return translations[category]?.[language]?.[key] || 
           translations[category]?.en?.[key] || 
           key;
  };

  return (
    <div className="p-4 md:p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <ToastContainer 
        position={isRTL ? "top-left" : "top-right"} 
        autoClose={3000} 
        rtl={isRTL}
      />

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {trans('header', 'title')}
            </h1>
            <p className="text-gray-600">
              {trans('header', 'subtitle')}
            </p>
          </div>
          <div className="flex space-x-3 rtl:space-x-reverse mt-4 md:mt-0">
            <button
              onClick={() => setShowCustomerModal(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center"
            >
              <FaUser className={`${isRTL ? 'ml-2' : 'mr-2'}`} /> 
              {trans('buttons', 'add_customer')}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center"
            >
              <FaPlus className={`${isRTL ? 'ml-2' : 'mr-2'}`} /> 
              {trans('buttons', 'add_delivery')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaTruck className="text-blue-600 text-xl" />
              </div>
              <div className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
                <p className="text-sm text-gray-500">{trans('stats', 'total_deliveries')}</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats?.total_deliveries || 0}
                </p>
                <div className="flex space-x-2 rtl:space-x-reverse mt-1">
                  <span className="text-xs text-yellow-600">{stats?.pending_deliveries || 0} {trans('stats', 'pending')}</span>
                  <span className="text-xs text-green-600">{stats?.delivered_deliveries || 0} {trans('stats', 'delivered')}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <FaBox className="text-green-600 text-xl" />
              </div>
              <div className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
                <p className="text-sm text-gray-500">{trans('table', 'quantity')}</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats?.total_items || 0}
                </p>
                <div className="text-xs text-gray-500 mt-1">
                  {trans('stats', 'total_items')}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FaMoneyBillWave className="text-purple-600 text-xl" />
              </div>
              <div className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
                <p className="text-sm text-gray-500">{trans('stats', 'total_revenue')}</p>
                <p className="text-2xl font-bold text-gray-800">
                  ${(stats?.total_revenue || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <FaFileInvoice className="text-orange-600 text-xl" />
              </div>
              <div className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
                <p className="text-sm text-gray-500">{trans('stats', 'total_profit')}</p>
                <p className="text-2xl font-bold text-gray-800">
                  ${(stats?.total_profit || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by tracking number, item, customer or agent..."
                className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none`}
              />
              <FaSearch className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3.5 text-gray-400`} />
            </div>
          </div>
          
          <div className="flex space-x-3 rtl:space-x-reverse">
            <button
              onClick={handleSearch}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors flex items-center"
            >
              <FaSearch className={`${isRTL ? 'ml-2' : 'mr-2'}`} /> 
              {trans('buttons', 'search')}
            </button>
            <button
              onClick={loadAllData}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2.5 px-6 rounded-lg transition-colors flex items-center"
            >
              <FaSync className={`${isRTL ? 'ml-2' : 'mr-2'}`} /> 
              {trans('buttons', 'refresh')}
            </button>
            <button
              onClick={() => setSearchTerm('')}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 px-6 rounded-lg transition-colors flex items-center"
            >
              <FaFilter className={`${isRTL ? 'ml-2' : 'mr-2'}`} /> 
              {trans('buttons', 'clear')}
            </button>
          </div>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading deliveries...</p>
            </div>
          </div>
        ) : deliveries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <FaTruck className="text-gray-300 text-6xl mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">No Deliveries Found</h3>
            <p className="text-gray-500 mt-2">Add your first delivery to get started</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              {trans('buttons', 'add_delivery')}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                    {trans('table', 'tracking')}
                  </th>
                  <th className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                    {trans('table', 'item')}
                  </th>
                  <th className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                    {trans('table', 'customer')}
                  </th>
                  <th className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                    {trans('table', 'date')}
                  </th>
                  <th className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                    {trans('table', 'price')}
                  </th>
                  <th className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                    {trans('table', 'status')}
                  </th>
                  <th className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                    {trans('table', 'actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deliveries.map((delivery) => (
                  <tr key={delivery.delivery_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {delivery.tracking_number}
                      </div>
                      <div className="text-xs text-gray-500">
                        #{delivery.delivery_id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center ${isRTL ? 'ml-3' : 'mr-3'}`}>
                          <FaBox className="text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {delivery.item_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Qty: {delivery.quantity} × ${delivery.item_cost}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {delivery.customer_name || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {delivery.agent_name || "No agent"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {delivery.delivery_date_formatted || delivery.delivery_date}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        ${(delivery.quantity * delivery.selling_price).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Profit: ${(delivery.net_profit || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(delivery.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        <button
                          onClick={() => handleViewDetails(delivery)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors"
                          title={trans('buttons', 'view')}
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handlePrintInvoice(delivery)}
                          className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 p-2 rounded-lg transition-colors"
                          title={trans('buttons', 'print')}
                        >
                          <FaPrint />
                        </button>
                        <button
                          onClick={() => {
                            setEditDelivery({
                              delivery_id: delivery.delivery_id,
                              item_name: delivery.item_name,
                              item_description: delivery.item_description || "",
                              quantity: delivery.quantity,
                              item_cost: delivery.item_cost,
                              selling_price: delivery.selling_price,
                              customer_id: delivery.customer_id || "",
                              agent_id: delivery.agent_id || "",
                              province_id: delivery.province_id || "",
                              delivery_date: delivery.delivery_date,
                              status: delivery.status
                            });
                            setShowEditModal(true);
                          }}
                          className="text-yellow-600 hover:text-yellow-900 bg-yellow-50 hover:bg-yellow-100 p-2 rounded-lg transition-colors"
                          title={language === 'en' ? "Edit" : language === 'ps' ? "سمول" : "ویرایش"}
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDelivery(delivery);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                          title={language === 'en' ? "Delete" : language === 'ps' ? "ړنګول" : "حذف"}
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

      {/* Add Delivery Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl my-8">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {trans('buttons', 'add_delivery')}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Item Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 border-b pb-2">
                    Item Details
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {trans('form', 'item_name')}
                    </label>
                    <input
                      type="text"
                      value={newDelivery.item_name}
                      onChange={(e) => setNewDelivery({...newDelivery, item_name: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      placeholder="Enter item name"
                      autoFocus
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {trans('form', 'description')}
                    </label>
                    <textarea
                      value={newDelivery.item_description}
                      onChange={(e) => setNewDelivery({...newDelivery, item_description: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      rows="3"
                      placeholder="Enter item description"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {trans('form', 'quantity')}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={newDelivery.quantity}
                        onChange={(e) => setNewDelivery({...newDelivery, quantity: parseInt(e.target.value) || 1})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {trans('form', 'item_cost')}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newDelivery.item_cost}
                        onChange={(e) => setNewDelivery({...newDelivery, item_cost: parseFloat(e.target.value) || 0})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {trans('form', 'selling_price')}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newDelivery.selling_price}
                      onChange={(e) => setNewDelivery({...newDelivery, selling_price: parseFloat(e.target.value) || 0})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Right Column - Delivery Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 border-b pb-2">
                    Delivery Details
                  </h4>
                  
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {trans('form', 'customer')}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCustomerModal(true)}
                      className="text-sm text-primary-600 hover:text-primary-800"
                    >
                      <FaPlus className="inline mr-1" /> Add New
                    </button>
                  </div>
                  <select
                    value={newDelivery.customer_id}
                    onChange={(e) => setNewDelivery({...newDelivery, customer_id: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  >
                    <option value="">{trans('form', 'select_customer')}</option>
                    {customers.map(customer => (
                      <option key={customer.customer_id} value={customer.customer_id}>
                        {customer.customer_name}
                      </option>
                    ))}
                  </select>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {trans('form', 'agent')}
                    </label>
                    <select
                      value={newDelivery.agent_id}
                      onChange={(e) => setNewDelivery({...newDelivery, agent_id: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    >
                      <option value="">{trans('form', 'select_agent')}</option>
                      {agents.map(agent => (
                        <option key={agent.agent_id} value={agent.agent_id}>
                          {agent.agent_name} ({agent.commission_rate}%)
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {trans('form', 'province')}
                    </label>
                    <select
                      value={newDelivery.province_id}
                      onChange={(e) => setNewDelivery({...newDelivery, province_id: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    >
                      <option value="">{trans('form', 'select_province')}</option>
                      {provinces.map(province => (
                        <option key={province.province_id} value={province.province_id}>
                          {province.province_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {trans('form', 'date')}
                    </label>
                    <input
                      type="date"
                      value={newDelivery.delivery_date}
                      onChange={(e) => setNewDelivery({...newDelivery, delivery_date: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {trans('form', 'status')}
                    </label>
                    <select
                      value={newDelivery.status}
                      onChange={(e) => setNewDelivery({...newDelivery, status: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_transit">In Transit</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-gray-50 rounded-lg p-4 mt-4">
                    <h5 className="font-semibold text-gray-700 mb-3">Summary</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Item Cost:</span>
                        <span className="font-medium">${(newDelivery.item_cost * newDelivery.quantity).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Selling Price:</span>
                        <span className="font-medium">${(newDelivery.selling_price * newDelivery.quantity).toFixed(2)}</span>
                      </div>
                      {newDelivery.agent_id && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Commission:</span>
                          <span className="font-medium">
                            ${(newDelivery.item_cost * newDelivery.quantity * (agents.find(a => a.agent_id == newDelivery.agent_id)?.commission_rate || 0) / 100).toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t">
                        <span className="font-semibold text-gray-700">Estimated Profit:</span>
                        <span className="font-bold text-green-600">
                          ${(
                            (newDelivery.selling_price * newDelivery.quantity) - 
                            (newDelivery.item_cost * newDelivery.quantity) - 
                            (newDelivery.item_cost * newDelivery.quantity * (agents.find(a => a.agent_id == newDelivery.agent_id)?.commission_rate || 0) / 100)
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={`flex justify-${isRTL ? 'start' : 'end'} space-x-3 rtl:space-x-reverse mt-8`}>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {trans('buttons', 'cancel')}
                </button>
                <button
                  onClick={handleAddDelivery}
                  className="px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors flex items-center"
                >
                  <FaCheck className={`${isRTL ? 'ml-2' : 'mr-2'}`} /> 
                  {trans('buttons', 'save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Delivery Modal - Similar to Add Modal but with editDelivery state */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl my-8">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {trans('buttons', 'update')}
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>
              
              {/* Similar form structure as Add Modal but with editDelivery */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Item Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 border-b pb-2">
                    Item Details
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {trans('form', 'item_name')}
                    </label>
                    <input
                      type="text"
                      value={editDelivery.item_name}
                      onChange={(e) => setEditDelivery({...editDelivery, item_name: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      autoFocus
                    />
                  </div>
                  
                  {/* Add all other fields similar to Add Modal */}
                </div>

                {/* Right Column - Delivery Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 border-b pb-2">
                    Delivery Details
                  </h4>
                  
                  {/* Add all other fields similar to Add Modal */}
                </div>
              </div>
              
              <div className={`flex justify-${isRTL ? 'start' : 'end'} space-x-3 rtl:space-x-reverse mt-8`}>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {trans('buttons', 'cancel')}
                </button>
                <button
                  onClick={handleEditDelivery}
                  className="px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors flex items-center"
                >
                  <FaCheck className={`${isRTL ? 'ml-2' : 'mr-2'}`} /> 
                  {trans('buttons', 'update')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {trans('customer_form', 'title')}
                </h3>
                <button
                  onClick={() => setShowCustomerModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {trans('customer_form', 'name')}
                  </label>
                  <input
                    type="text"
                    value={newCustomer.customer_name}
                    onChange={(e) => setNewCustomer({...newCustomer, customer_name: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="Enter customer name"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {trans('customer_form', 'email')}
                  </label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="Enter email address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {trans('customer_form', 'phone')}
                  </label>
                  <input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {trans('customer_form', 'address')}
                  </label>
                  <textarea
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    rows="3"
                    placeholder="Enter address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {trans('customer_form', 'province')}
                  </label>
                  <select
                    value={newCustomer.province_id}
                    onChange={(e) => setNewCustomer({...newCustomer, province_id: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select Province</option>
                    {provinces.map(province => (
                      <option key={province.province_id} value={province.province_id}>
                        {province.province_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className={`flex justify-${isRTL ? 'start' : 'end'} space-x-3 rtl:space-x-reverse mt-8`}>
                <button
                  onClick={() => setShowCustomerModal(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {trans('buttons', 'cancel')}
                </button>
                <button
                  onClick={handleAddCustomer}
                  className="px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors flex items-center"
                >
                  <FaUser className={`${isRTL ? 'ml-2' : 'mr-2'}`} /> 
                  {trans('buttons', 'add_customer')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Delivery Details - {selectedDelivery.tracking_number}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    #{selectedDelivery.delivery_id}
                  </p>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Item & Customer Info */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-3">Item Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Item Name:</span>
                        <span className="font-medium">{selectedDelivery.item_name}</span>
                      </div>
                      {selectedDelivery.item_description && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Description:</span>
                          <span className="font-medium text-right">{selectedDelivery.item_description}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium">{selectedDelivery.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Item Cost:</span>
                        <span className="font-medium">${selectedDelivery.item_cost}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-3">Customer Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{selectedDelivery.customer_name || "N/A"}</span>
                      </div>
                      {selectedDelivery.customer_phone && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium">{selectedDelivery.customer_phone}</span>
                        </div>
                      )}
                      {selectedDelivery.customer_address && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Address:</span>
                          <span className="font-medium text-right">{selectedDelivery.customer_address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Delivery & Financial Info */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-3">Delivery Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Agent:</span>
                        <span className="font-medium">{selectedDelivery.agent_name || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Province:</span>
                        <span className="font-medium">{selectedDelivery.province_name || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Date:</span>
                        <span className="font-medium">{selectedDelivery.delivery_date_formatted || selectedDelivery.delivery_date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span>{getStatusBadge(selectedDelivery.status)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-3">Financial Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Item Cost:</span>
                        <span className="font-medium">${(selectedDelivery.quantity * selectedDelivery.item_cost).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Selling Price:</span>
                        <span className="font-medium">${(selectedDelivery.quantity * selectedDelivery.selling_price).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Commission ({selectedDelivery.commission_rate || 0}%):</span>
                        <span className="font-medium">${(selectedDelivery.quantity * selectedDelivery.commission_amount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="font-semibold text-gray-700">Net Profit:</span>
                        <span className="font-bold text-green-600">
                          ${((selectedDelivery.quantity * selectedDelivery.selling_price) - 
                            (selectedDelivery.quantity * selectedDelivery.item_cost) - 
                            (selectedDelivery.quantity * selectedDelivery.commission_amount)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6 space-x-3 rtl:space-x-reverse">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {trans('buttons', 'close')}
                </button>
                <button
                  onClick={() => handlePrintInvoice(selectedDelivery)}
                  className="px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors flex items-center"
                >
                  <FaPrint className={`${isRTL ? 'ml-2' : 'mr-2'}`} /> 
                  {trans('buttons', 'print')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Invoice Modal */}
      {showPrintModal && invoiceData && (
        <InvoicePrint
          invoiceData={invoiceData}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {language === 'en' ? 'Delete Delivery' : language === 'ps' ? 'لیږد ړنګول' : 'حذف تحویل'}
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
                  {language === 'en' ? 'Delete' : language === 'ps' ? 'ړنګول' : 'حذف'} {selectedDelivery.item_name}?
                </h4>
                
                <p className="text-gray-600 mb-6">
                  {language === 'en' 
                    ? 'Are you sure you want to delete this delivery? This action cannot be undone.' 
                    : language === 'ps'
                    ? 'آیا تاسو ډاډه یاست چې تاسو غواړئ دا لیږد حذف کړئ؟ دا عمل لغوه نشي کیدی.'
                    : 'آیا مطمئن هستید که می‌خواهید این تحویل را حذف کنید؟ این عمل قابل برگشت نیست.'}
                </p>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-left rtl:text-right">
                  <div className="font-medium text-red-700 mb-2">Delivery Details:</div>
                  <div className="text-sm text-red-600">
                    • Tracking: {selectedDelivery.tracking_number}<br />
                    • Item: {selectedDelivery.item_name}<br />
                    • Amount: ${(selectedDelivery.quantity * selectedDelivery.selling_price).toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div className={`flex justify-${isRTL ? 'start' : 'end'} space-x-3 rtl:space-x-reverse mt-8`}>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {trans('buttons', 'cancel')}
                </button>
                <button
                  onClick={handleDeleteDelivery}
                  className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <FaTrash className={`${isRTL ? 'ml-2' : 'mr-2'}`} /> 
                  {trans('buttons', 'delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deliveries;