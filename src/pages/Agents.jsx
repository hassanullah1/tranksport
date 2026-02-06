import React, { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaSync, 
  FaFilter,
  FaUserTie,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaBox,
  FaTimes,
  FaCheck,
  FaPhone,
  FaEnvelope,
  FaPercent,
  FaUserPlus,
  FaUserMinus,
  FaList,
  FaChartLine
} from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Agents = () => {
  const { t, language, isRTL } = useLanguage();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showProvincesModal, setShowProvincesModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  
  // Selected items
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentProvinces, setAgentProvinces] = useState([]);
  const [availableProvinces, setAvailableProvinces] = useState([]);
  
  // Form states
  const [newAgent, setNewAgent] = useState({
    agent_name: "",
    email: "",
    phone: "",
    commission_rate: 10.00
  });
  
  const [editAgent, setEditAgent] = useState({
    agent_id: "",
    agent_name: "",
    email: "",
    phone: "",
    commission_rate: 10.00
  });

  // Load agents on component mount
  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const data = await window.electronAPI.getAgents();
      setAgents(data);
    } catch (error) {
      toast.error(error.message || "Failed to load agents");
      console.error("Error loading agents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      if (searchTerm.trim() === "") {
        loadAgents();
      } else {
        const data = await window.electronAPI.searchAgents(searchTerm);
        setAgents(data);
      }
    } catch (error) {
      toast.error("Search failed");
      console.error("Error searching agents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAgent = async () => {
    if (!newAgent.agent_name.trim()) {
      toast.error("Please enter agent name");
      return;
    }

    try {
      const result = await window.electronAPI.addAgent(newAgent);
      toast.success(result.message);
      setShowAddModal(false);
      setNewAgent({
        agent_name: "",
        email: "",
        phone: "",
        commission_rate: 10.00
      });
      loadAgents();
    } catch (error) {
      toast.error(error.message || "Failed to add agent");
    }
  };

  const handleEditAgent = async () => {
    if (!editAgent.agent_name.trim()) {
      toast.error("Please enter agent name");
      return;
    }

    try {
      const result = await window.electronAPI.updateAgent(editAgent);
      toast.success(result.message);
      setShowEditModal(false);
      loadAgents();
    } catch (error) {
      toast.error(error.message || "Failed to update agent");
    }
  };

  const handleDeleteAgent = async () => {
    if (!selectedAgent) return;

    try {
      const result = await window.electronAPI.deleteAgent(selectedAgent.agent_id);
      toast.success(result.message);
      setShowDeleteModal(false);
      setSelectedAgent(null);
      loadAgents();
    } catch (error) {
      toast.error(error.message || "Failed to delete agent");
    }
  };

  const loadAgentProvinces = async (agentId) => {
    try {
      const [provinces, available] = await Promise.all([
        window.electronAPI.getAgentProvinces(agentId),
        window.electronAPI.getAvailableProvinces(agentId)
      ]);
      setAgentProvinces(provinces);
      setAvailableProvinces(available);
    } catch (error) {
      toast.error("Failed to load provinces");
      console.error("Error loading provinces:", error);
    }
  };

  const handleAssignProvince = async (provinceId) => {
    if (!selectedAgent) return;

    try {
      const result = await window.electronAPI.assignProvinceToAgent({
        agentId: selectedAgent.agent_id,
        provinceId
      });
      toast.success(result.message);
      loadAgentProvinces(selectedAgent.agent_id);
    } catch (error) {
      toast.error(error.message || "Failed to assign province");
    }
  };

  const handleRemoveProvince = async (provinceId) => {
    if (!selectedAgent) return;

    try {
      const result = await window.electronAPI.removeProvinceFromAgent({
        agentId: selectedAgent.agent_id,
        provinceId
      });
      toast.success(result.message);
      loadAgentProvinces(selectedAgent.agent_id);
    } catch (error) {
      toast.error(error.message || "Failed to remove province");
    }
  };

  const openEditModal = (agent) => {
    setEditAgent({
      agent_id: agent.agent_id,
      agent_name: agent.agent_name,
      email: agent.email || "",
      phone: agent.phone || "",
      commission_rate: agent.commission_rate || 10.00
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (agent) => {
    setSelectedAgent(agent);
    setShowDeleteModal(true);
  };

  const openProvincesModal = async (agent) => {
    setSelectedAgent(agent);
    setShowProvincesModal(true);
    await loadAgentProvinces(agent.agent_id);
  };

  const openAssignModal = async (agent) => {
    setSelectedAgent(agent);
    setShowAssignModal(true);
    await loadAgentProvinces(agent.agent_id);
  };

  // Performance rating based on commission earned
  const getPerformanceRating = (commission) => {
    if (commission === 0) return "bg-gray-100 text-gray-800";
    if (commission < 100) return "bg-yellow-100 text-yellow-800";
    if (commission < 500) return "bg-blue-100 text-blue-800";
    if (commission < 1000) return "bg-green-100 text-green-800";
    return "bg-purple-100 text-purple-800";
  };

  // Translation objects
  const translations = {
    header: {
      en: { title: "Agents Management", subtitle: "Manage delivery agents and their assignments" },
      ps: { title: "د اجنټانو مدیریت", subtitle: "د لیږد اجنټان او د دوی دندې اداره کړئ" },
      fa: { title: "مدیریت نمایندگان", subtitle: "مدیریت نمایندگان تحویل و وظایف آنها" }
    },
    buttons: {
      en: {
        add_agent: "Add New Agent",
        search: "Search",
        refresh: "Refresh",
        clear: "Clear",
        cancel: "Cancel",
        update: "Update Agent",
        delete: "Delete Agent",
        view_provinces: "View Provinces",
        assign_province: "Assign Province"
      },
      ps: {
        add_agent: "نوی اجنټ اضافه کړئ",
        search: "پلټل",
        refresh: "بیا ډیرول",
        clear: "پاکول",
        cancel: "لغوه کول",
        update: "اجنټ تازه کول",
        delete: "اجنټ ړنګول",
        view_provinces: "ولایتونه وګورئ",
        assign_province: "ولایت سپارل"
      },
      fa: {
        add_agent: "افزودن نماینده جدید",
        search: "جستجو",
        refresh: "بارگذاری مجدد",
        clear: "پاک کردن",
        cancel: "لغو",
        update: "به روز رسانی نماینده",
        delete: "حذف نماینده",
        view_provinces: "مشاهده ولایات",
        assign_province: "اختصاص ولایت"
      }
    },
    table: {
      en: {
        name: "Agent Name",
        email: "Email",
        phone: "Phone",
        commission: "Commission Rate",
        deliveries: "Deliveries",
        items: "Items",
        commission_earned: "Commission Earned",
        provinces: "Provinces",
        status: "Status",
        created: "Created",
        actions: "Actions"
      },
      ps: {
        name: "د اجنټ نوم",
        email: "ایمیل",
        phone: "تلیفون",
        commission: "د کمیسیون کچه",
        deliveries: "لیږدونه",
        items: "توکي",
        commission_earned: "کمیشن ترلاسه شوی",
        provinces: "ولایتونه",
        status: "حالت",
        created: "جوړ شوی",
        actions: "کړنې"
      },
      fa: {
        name: "نام نماینده",
        email: "ایمیل",
        phone: "تلفن",
        commission: "نرخ کمیسیون",
        deliveries: "تحویل‌ها",
        items: "آیتم‌ها",
        commission_earned: "کمیسیون کسب شده",
        provinces: "ولایات",
        status: "وضعیت",
        created: "ایجاد شده",
        actions: "اقدامات"
      }
    },
    stats: {
      en: {
        total_agents: "Total Agents",
        active_agents: "Active Agents",
        total_commission: "Total Commission"
      },
      ps: {
        total_agents: "ټول اجنټان",
        active_agents: "فعال اجنټان",
        total_commission: "ټول کمیسیون"
      },
      fa: {
        total_agents: "کل نمایندگان",
        active_agents: "نمایندگان فعال",
        total_commission: "کل کمیسیون"
      }
    },
    modals: {
      add: {
        en: {
          title: "Add New Agent",
          name: "Agent Name *",
          email: "Email",
          phone: "Phone",
          commission: "Commission Rate %",
          placeholder_name: "Enter agent name",
          placeholder_email: "Enter email address",
          placeholder_phone: "Enter phone number",
          button: "Add Agent"
        },
        ps: {
          title: "نوی اجنټ اضافه کړئ",
          name: "د اجنټ نوم *",
          email: "ایمیل",
          phone: "تلیفون",
          commission: "د کمیسیون کچه %",
          placeholder_name: "د اجنټ نوم ولیکئ",
          placeholder_email: "ایمیل آدرس ولیکئ",
          placeholder_phone: "تلیفون شمیره ولیکئ",
          button: "اجنټ اضافه کړئ"
        },
        fa: {
          title: "افزودن نماینده جدید",
          name: "نام نماینده *",
          email: "ایمیل",
          phone: "تلفن",
          commission: "نرخ کمیسیون %",
          placeholder_name: "نام نماینده را وارد کنید",
          placeholder_email: "آدرس ایمیل را وارد کنید",
          placeholder_phone: "شماره تلفن را وارد کنید",
          button: "افزودن نماینده"
        }
      },
      edit: {
        en: {
          title: "Edit Agent",
          name: "Agent Name *",
          email: "Email",
          phone: "Phone",
          commission: "Commission Rate %",
          placeholder_name: "Enter agent name",
          placeholder_email: "Enter email address",
          placeholder_phone: "Enter phone number",
          button: "Update Agent"
        },
        ps: {
          title: "اجنټ سمول",
          name: "د اجنټ نوم *",
          email: "ایمیل",
          phone: "تلیفون",
          commission: "د کمیسیون کچه %",
          placeholder_name: "د اجنټ نوم ولیکئ",
          placeholder_email: "ایمیل آدرس ولیکئ",
          placeholder_phone: "تلیفون شمیره ولیکئ",
          button: "اجنټ تازه کول"
        },
        fa: {
          title: "ویرایش نماینده",
          name: "نام نماینده *",
          email: "ایمیل",
          phone: "تلفن",
          commission: "نرخ کمیسیون %",
          placeholder_name: "نام نماینده را وارد کنید",
          placeholder_email: "آدرس ایمیل را وارد کنید",
          placeholder_phone: "شماره تلفن را وارد کنید",
          button: "به روز رسانی نماینده"
        }
      }
    },
    messages: {
      en: {
        loading: "Loading agents...",
        no_data: "No Agents Found",
        add_first: "Add your first agent to get started",
        search_placeholder: "Search agents by name, email or phone...",
        no_provinces: "No provinces assigned",
        no_available_provinces: "No available provinces"
      },
      ps: {
        loading: "اجنټان ډیریدل...",
        no_data: "هیڅ اجنټ و نه موندل شو",
        add_first: "د پیل کولو لپاره خپل لومړی اجنټ اضافه کړئ",
        search_placeholder: "اجنټان د نوم، ایمیل یا تلیفون له مخې پلټل...",
        no_provinces: "هیڅ ولایت نه دی سپارل شوی",
        no_available_provinces: "هیڅ شتون لرونکی ولایت نشته"
      },
      fa: {
        loading: "در حال بارگذاری نمایندگان...",
        no_data: "هیچ نماینده‌ای یافت نشد",
        add_first: "برای شروع، اولین نماینده خود را اضافه کنید",
        search_placeholder: "جستجوی نمایندگان بر اساس نام، ایمیل یا تلفن...",
        no_provinces: "هیچ ولایتی اختصاص داده نشده",
        no_available_provinces: "هیچ ولایت در دسترسی وجود ندارد"
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
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 md:mt-0 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center"
          >
            <FaUserPlus className={`${isRTL ? 'ml-2' : 'mr-2'}`} /> 
            {trans('buttons', 'add_agent')}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaUserTie className="text-blue-600 text-xl" />
              </div>
              <div className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
                <p className="text-sm text-gray-500">{trans('stats', 'total_agents')}</p>
                <p className="text-2xl font-bold text-gray-800">
                  {agents.length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <FaBox className="text-green-600 text-xl" />
              </div>
              <div className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
                <p className="text-sm text-gray-500">{trans('stats', 'active_agents')}</p>
                <p className="text-2xl font-bold text-gray-800">
                  {agents.filter(a => a.total_deliveries > 0).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FaMoneyBillWave className="text-purple-600 text-xl" />
              </div>
              <div className={`${isRTL ? 'mr-4' : 'ml-4'}`}>
                <p className="text-sm text-gray-500">{trans('stats', 'total_commission')}</p>
                <p className="text-2xl font-bold text-gray-800">
                  ${agents.reduce((sum, a) => sum + (parseFloat(a.total_commission_earned) || 0), 0).toFixed(2)}
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
                placeholder={trans('messages', 'search_placeholder')}
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
              onClick={loadAgents}
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

      {/* Agents Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">{trans('messages', 'loading')}</p>
            </div>
          </div>
        ) : agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <FaUserTie className="text-gray-300 text-6xl mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">{trans('messages', 'no_data')}</h3>
            <p className="text-gray-500 mt-2">{trans('messages', 'add_first')}</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              {trans('buttons', 'add_agent')}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                    {trans('table', 'name')}
                  </th>
                  <th className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                    {trans('table', 'commission')}
                  </th>
                  <th className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                    {trans('table', 'deliveries')}
                  </th>
                  <th className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                    {trans('table', 'commission_earned')}
                  </th>
                  <th className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                    {trans('table', 'provinces')}
                  </th>
                  <th className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                    {trans('table', 'actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {agents.map((agent) => (
                  <tr key={agent.agent_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center ${isRTL ? 'ml-3' : 'mr-3'}`}>
                          <FaUserTie className="text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {agent.agent_name}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:space-x-4 rtl:sm:space-x-reverse text-sm text-gray-500 mt-1">
                            {agent.email && (
                              <div className="flex items-center">
                                <FaEnvelope className="w-3 h-3 mr-1 rtl:mr-0 rtl:ml-1" />
                                {agent.email}
                              </div>
                            )}
                            {agent.phone && (
                              <div className="flex items-center">
                                <FaPhone className="w-3 h-3 mr-1 rtl:mr-0 rtl:ml-1" />
                                {agent.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FaPercent className="text-gray-400 mr-2 rtl:mr-0 rtl:ml-2" />
                        <span className="font-semibold text-gray-900">
                          {agent.commission_rate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-lg font-semibold text-gray-900">
                        {agent.total_deliveries || 0}
                      </div>
                      <div className="text-sm text-gray-500">
                        {agent.total_items_delivered || 0} {trans('table', 'items')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${getPerformanceRating(agent.total_commission_earned || 0)}`}>
                        ${(agent.total_commission_earned || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {agent.assigned_provinces_count || 0} {trans('table', 'provinces')}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">
                        {agent.assigned_provinces || trans('messages', 'no_provinces')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => openProvincesModal(agent)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors"
                          title={trans('buttons', 'view_provinces')}
                        >
                          <FaList />
                        </button>
                        <button
                          onClick={() => openAssignModal(agent)}
                          className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 p-2 rounded-lg transition-colors"
                          title={trans('buttons', 'assign_province')}
                        >
                          <FaMapMarkerAlt />
                        </button>
                        <button
                          onClick={() => openEditModal(agent)}
                          className="text-yellow-600 hover:text-yellow-900 bg-yellow-50 hover:bg-yellow-100 p-2 rounded-lg transition-colors"
                          title={language === 'en' ? "Edit" : language === 'ps' ? "سمول" : "ویرایش"}
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => openDeleteModal(agent)}
                          className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                          title={language === 'en' ? "Delete" : language === 'ps' ? "ړنګول" : "حذف"}
                          disabled={agent.total_deliveries > 0}
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

      {/* Add Agent Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {trans('modals.add', 'title')}
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
                    {trans('modals.add', 'name')}
                  </label>
                  <input
                    type="text"
                    value={newAgent.agent_name}
                    onChange={(e) => setNewAgent({...newAgent, agent_name: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder={trans('modals.add', 'placeholder_name')}
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {trans('modals.add', 'email')}
                  </label>
                  <input
                    type="email"
                    value={newAgent.email}
                    onChange={(e) => setNewAgent({...newAgent, email: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder={trans('modals.add', 'placeholder_email')}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {trans('modals.add', 'phone')}
                  </label>
                  <input
                    type="tel"
                    value={newAgent.phone}
                    onChange={(e) => setNewAgent({...newAgent, phone: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder={trans('modals.add', 'placeholder_phone')}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {trans('modals.add', 'commission')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={newAgent.commission_rate}
                    onChange={(e) => setNewAgent({...newAgent, commission_rate: parseFloat(e.target.value) || 10.00})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
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
                  onClick={handleAddAgent}
                  className="px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors flex items-center"
                >
                  <FaUserPlus className={`${isRTL ? 'ml-2' : 'mr-2'}`} /> 
                  {trans('modals.add', 'button')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Agent Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {trans('modals.edit', 'title')}
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
                    {trans('modals.edit', 'name')}
                  </label>
                  <input
                    type="text"
                    value={editAgent.agent_name}
                    onChange={(e) => setEditAgent({...editAgent, agent_name: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder={trans('modals.edit', 'placeholder_name')}
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {trans('modals.edit', 'email')}
                  </label>
                  <input
                    type="email"
                    value={editAgent.email}
                    onChange={(e) => setEditAgent({...editAgent, email: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder={trans('modals.edit', 'placeholder_email')}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {trans('modals.edit', 'phone')}
                  </label>
                  <input
                    type="tel"
                    value={editAgent.phone}
                    onChange={(e) => setEditAgent({...editAgent, phone: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder={trans('modals.edit', 'placeholder_phone')}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {trans('modals.edit', 'commission')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={editAgent.commission_rate}
                    onChange={(e) => setEditAgent({...editAgent, commission_rate: parseFloat(e.target.value) || 10.00})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
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
                  onClick={handleEditAgent}
                  className="px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors flex items-center"
                >
                  <FaCheck className={`${isRTL ? 'ml-2' : 'mr-2'}`} /> 
                  {trans('modals.edit', 'button')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Provinces Modal */}
      {showProvincesModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {selectedAgent.agent_name} - {trans('table', 'provinces')}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {trans('messages', 'assigned_provinces')}
                  </p>
                </div>
                <button
                  onClick={() => setShowProvincesModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>
              
              <div className="max-h-[60vh] overflow-y-auto">
                {agentProvinces.length === 0 ? (
                  <div className="text-center py-12">
                    <FaMapMarkerAlt className="text-gray-300 text-5xl mx-auto mb-4" />
                    <p className="text-gray-600">{trans('messages', 'no_provinces')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {agentProvinces.map((province) => (
                      <div key={province.province_id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3 rtl:mr-0 rtl:ml-3">
                              <FaMapMarkerAlt className="text-primary-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{province.province_name}</h4>
                              <p className="text-sm text-gray-500">
                                {trans('table', 'assigned_on')}: {new Date(province.assignment_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveProvince(province.province_id)}
                            className="text-red-600 hover:text-red-800 p-2"
                            title={language === 'en' ? "Remove" : language === 'ps' ? "لیرې کول" : "حذف"}
                          >
                            <FaUserMinus />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowProvincesModal(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {trans('buttons', 'close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Province Modal */}
      {showAssignModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {trans('buttons', 'assign_province')} - {selectedAgent.agent_name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {trans('messages', 'available_provinces')}
                  </p>
                </div>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>
              
              <div className="max-h-[60vh] overflow-y-auto">
                {availableProvinces.length === 0 ? (
                  <div className="text-center py-12">
                    <FaMapMarkerAlt className="text-gray-300 text-5xl mx-auto mb-4" />
                    <p className="text-gray-600">{trans('messages', 'no_available_provinces')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableProvinces.map((province) => (
                      <div key={province.province_id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 rtl:mr-0 rtl:ml-3">
                              <FaMapMarkerAlt className="text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{province.province_name}</h4>
                              <p className="text-sm text-gray-500">
                                ID: {province.province_id}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleAssignProvince(province.province_id)}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center"
                          >
                            <FaUserPlus className="mr-2 rtl:mr-0 rtl:ml-2" />
                            {trans('buttons', 'assign')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {trans('buttons', 'close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {language === 'en' ? 'Delete Agent' : language === 'ps' ? 'اجنټ ړنګول' : 'حذف نماینده'}
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
                  {language === 'en' ? 'Delete' : language === 'ps' ? 'ړنګول' : 'حذف'} {selectedAgent.agent_name}?
                </h4>
                
                <p className="text-gray-600 mb-4">
                  {language === 'en' 
                    ? 'Are you sure you want to delete this agent? This action cannot be undone.' 
                    : language === 'ps'
                    ? 'آیا تاسو ډاډه یاست چې تاسو غواړئ دا اجنټ حذف کړئ؟ دا عمل لغوه نشي کیدی.'
                    : 'آیا مطمئن هستید که می‌خواهید این نماینده را حذف کنید؟ این عمل قابل برگشت نیست.'}
                </p>
                
                {selectedAgent.total_deliveries > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center text-red-700">
                      <FaTimes className="mr-2 rtl:mr-0 rtl:ml-2" />
                      <span className="font-medium">
                        {language === 'en' 
                          ? `⚠️ This agent has ${selectedAgent.total_deliveries} deliveries.`
                          : language === 'ps'
                          ? `⚠️ دا اجنټ ${selectedAgent.total_deliveries} لیږدونه لري.`
                          : `⚠️ این نماینده دارای ${selectedAgent.total_deliveries} تحویل است.`}
                      </span>
                    </div>
                    <p className="text-red-600 text-sm mt-2">
                      {language === 'en' 
                        ? 'You must reassign deliveries before deleting this agent.'
                        : language === 'ps'
                        ? 'تاسو باید د لیږدونو بیا سپارل د دې اجنټ ړنګولو دمخه ترسره کړئ.'
                        : 'شما باید تحویل‌ها را دوباره اختصاص دهید قبل از حذف این نماینده.'}
                    </p>
                  </div>
                )}
              </div>
              
              <div className={`flex justify-${isRTL ? 'start' : 'end'} space-x-3 rtl:space-x-reverse mt-8`}>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {trans('buttons', 'cancel')}
                </button>
                <button
                  onClick={handleDeleteAgent}
                  className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center"
                  disabled={selectedAgent.total_deliveries > 0}
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

export default Agents;