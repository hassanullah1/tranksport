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
  FaList
} from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Agents = () => {
  const { t, language, isRTL } = useLanguage();
  const [agents, setAgents] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Selected agent
  const [selectedAgent, setSelectedAgent] = useState(null);
  
  // Form states
  const [newAgent, setNewAgent] = useState({
    agent_name: "",
    phone: "",
    province_id: ""
  });
  
  const [editAgent, setEditAgent] = useState({
    agent_id: "",
    agent_name: "",
    phone: "",
    province_id: ""
  });

  // Load agents and provinces on component mount
  useEffect(() => {
    loadAgents();
    loadProvinces();
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

  const loadProvinces = async () => {
    try {
      const data = await window.electronAPI.getProvinces();
      setProvinces(data);
    } catch (error) {
      console.error("Error loading provinces:", error);
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
        phone: "",
        province_id: ""
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

  const openEditModal = (agent) => {
    setEditAgent({
      agent_id: agent.agent_id,
      agent_name: agent.agent_name,
      phone: agent.phone || "",
      province_id: agent.province_id || ""
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (agent) => {
    setSelectedAgent(agent);
    setShowDeleteModal(true);
  };

  // Get province name by ID
  const getProvinceName = (provinceId) => {
    const province = provinces.find(p => p.province_id == provinceId);
    return province ? province.province_name : "Not assigned";
  };

  // Translation objects
  const translations = {
    header: {
      en: { title: "Agents Management", subtitle: "Manage delivery agents and their assigned provinces" },
      ps: { title: "د اجنټانو مدیریت", subtitle: "د لیږد اجنټان او د دوی د ولایتونو اداره کړئ" },
      fa: { title: "مدیریت نمایندگان", subtitle: "مدیریت نمایندگان تحویل و ولایت‌های آنها" }
    },
    buttons: {
      en: {
        add_agent: "Add New Agent",
        search: "Search",
        refresh: "Refresh",
        clear: "Clear",
        cancel: "Cancel",
        update: "Update Agent",
        delete: "Delete Agent"
      },
      ps: {
        add_agent: "نوی اجنټ اضافه کړئ",
        search: "پلټل",
        refresh: "بیا ډیرول",
        clear: "پاکول",
        cancel: "لغوه کول",
        update: "اجنټ تازه کول",
        delete: "اجنټ ړنګول"
      },
      fa: {
        add_agent: "افزودن نماینده جدید",
        search: "جستجو",
        refresh: "بارگذاری مجدد",
        clear: "پاک کردن",
        cancel: "لغو",
        update: "به روز رسانی نماینده",
        delete: "حذف نماینده"
      }
    },
    form: {
      en: {
        name: "Agent Name *",
        phone: "Phone",
        province: "Assigned Province",
        select_province: "Select Province",
        no_province: "No province assigned"
      },
      ps: {
        name: "د اجنټ نوم *",
        phone: "تلیفون",
        province: "تخصیص شوی ولایت",
        select_province: "ولایت غوره کړئ",
        no_province: "هیڅ ولایت نه دی تخصیص شوی"
      },
      fa: {
        name: "نام نماینده *",
        phone: "تلفن",
        province: "ولایت اختصاص داده شده",
        select_province: "ولایت انتخاب کنید",
        no_province: "هیچ ولایتی اختصاص داده نشده"
      }
    },
    messages: {
      en: {
        loading: "Loading agents...",
        no_data: "No Agents Found",
        add_first: "Add your first agent to get started",
        search_placeholder: "Search agents by name or phone...",
        assigned_province: "Assigned Province"
      },
      ps: {
        loading: "اجنټان ډیریدل...",
        no_data: "هیڅ اجنټ و نه موندل شو",
        add_first: "د پیل کولو لپاره خپل لومړی اجنټ اضافه کړئ",
        search_placeholder: "اجنټان د نوم یا تلیفون له مخې پلټل...",
        assigned_province: "تخصیص شوی ولایت"
      },
      fa: {
        loading: "در حال بارگذاری نمایندگان...",
        no_data: "هیچ نماینده‌ای یافت نشد",
        add_first: "برای شروع، اولین نماینده خود را اضافه کنید",
        search_placeholder: "جستجوی نمایندگان بر اساس نام یا تلفن...",
        assigned_province: "ولایت اختصاص داده شده"
      }
    }
  };

  const trans = (category, key) => {
    return translations[category]?.[language]?.[key] || 
           translations[category]?.en?.[key] || 
           key;
  };

  if (loading && agents.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
            className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
          >
            <FaPlus className={`${isRTL ? 'ml-2' : 'mr-2'}`} /> 
            {trans('buttons', 'add_agent')}
          </button>
        </div>

        {/* Stats Cards */}
        
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
                className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none`}
              />
              <FaSearch className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3.5 text-gray-400`} />
            </div>
          </div>
          
          <div className="flex space-x-3 rtl:space-x-reverse">
            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors flex items-center"
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
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
                    Agent Name
                  </th>
                  <th className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                    Phone
                  </th>
                  <th className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                    {trans('messages', 'assigned_province')}
                  </th>
                  <th className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {agents.map((agent) => (
                  <tr key={agent.agent_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center ${isRTL ? 'ml-3' : 'mr-3'}`}>
                          <FaUserTie className="text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {agent.agent_name}
                          </div>
                         
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FaPhone className="text-gray-400 mr-2 rtl:mr-0 rtl:ml-2" />
                        <span className="text-gray-900">
                          {agent.phone || "Not provided"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="text-gray-400 mr-2 rtl:mr-0 rtl:ml-2" />
                        <span className="text-gray-900">
                          {getProvinceName(agent.province_id)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => openEditModal(agent)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => openDeleteModal(agent)}
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

      {/* Add Agent Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Add New Agent
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
                    {trans('form', 'name')}
                  </label>
                  <input
                    type="text"
                    value={newAgent.agent_name}
                    onChange={(e) => setNewAgent({...newAgent, agent_name: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter agent name"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {trans('form', 'phone')}
                  </label>
                  <input
                    type="tel"
                    value={newAgent.phone}
                    onChange={(e) => setNewAgent({...newAgent, phone: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {trans('form', 'province')}
                  </label>
                  <select
                    value={newAgent.province_id}
                    onChange={(e) => setNewAgent({...newAgent, province_id: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">{trans('form', 'select_province')}</option>
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
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {trans('buttons', 'cancel')}
                </button>
                <button
                  onClick={handleAddAgent}
                  className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <FaPlus className={`${isRTL ? 'ml-2' : 'mr-2'}`} /> 
                  {trans('buttons', 'add_agent')}
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
                  Edit Agent
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
                    {trans('form', 'name')}
                  </label>
                  <input
                    type="text"
                    value={editAgent.agent_name}
                    onChange={(e) => setEditAgent({...editAgent, agent_name: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter agent name"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {trans('form', 'phone')}
                  </label>
                  <input
                    type="tel"
                    value={editAgent.phone}
                    onChange={(e) => setEditAgent({...editAgent, phone: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {trans('form', 'province')}
                  </label>
                  <select
                    value={editAgent.province_id}
                    onChange={(e) => setEditAgent({...editAgent, province_id: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">{trans('form', 'select_province')}</option>
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
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {trans('buttons', 'cancel')}
                </button>
                <button
                  onClick={handleEditAgent}
                  className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <FaCheck className={`${isRTL ? 'ml-2' : 'mr-2'}`} /> 
                  {trans('buttons', 'update')}
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
                  Delete Agent
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
                  Delete {selectedAgent.agent_name}?
                </h4>
                
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete this agent? This action cannot be undone.
                </p>
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