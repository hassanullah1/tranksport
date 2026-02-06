import React, { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaSync, 
  FaFilter,
  FaMapMarkerAlt,
  FaBox,
  FaChartLine,
  FaTimes,
  FaCheck
} from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Provinces = () => {
  const { t, language, isRTL } = useLanguage();
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState(null);
  
  // Form states
  const [newProvince, setNewProvince] = useState({
    province_name: ""
  });
  
  const [editProvince, setEditProvince] = useState({
    province_id: "",
    province_name: ""
  });

  // Load provinces on component mount
  useEffect(() => {
    loadProvinces();
  }, []);

  const loadProvinces = async () => {
    try {
      setLoading(true);
      const data = await window.electronAPI.getProvincesWithStats();
      setProvinces(data);
    } catch (error) {
      toast.error(t('error.load_provinces') || error.message || "Failed to load provinces");
      console.error("Error loading provinces:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      if (searchTerm.trim() === "") {
        loadProvinces();
      } else {
        const data = await window.electronAPI.searchProvinces(searchTerm);
        setProvinces(data);
      }
    } catch (error) {
      toast.error(t('error.search_failed') || "Search failed");
      console.error("Error searching provinces:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProvince = async () => {
    if (!newProvince.province_name.trim()) {
      toast.error(t('error.enter_province_name') || "Please enter province name");
      return;
    }

    try {
      const result = await window.electronAPI.addProvince(newProvince);
      toast.success(result.message || t('success.province_added') || "Province added successfully!");
      setShowAddModal(false);
      setNewProvince({ province_name: "" });
      loadProvinces();
    } catch (error) {
      toast.error(error.message || t('error.add_province_failed') || "Failed to add province");
    }
  };

  const handleEditProvince = async () => {
    if (!editProvince.province_name.trim()) {
      toast.error(t('error.enter_province_name') || "Please enter province name");
      return;
    }

    try {
      const result = await window.electronAPI.updateProvince(editProvince);
      toast.success(result.message || t('success.province_updated') || "Province updated successfully!");
      setShowEditModal(false);
      loadProvinces();
    } catch (error) {
      toast.error(error.message || t('error.update_province_failed') || "Failed to update province");
    }
  };

  const handleDeleteProvince = async () => {
    if (!selectedProvince) return;

    try {
      const result = await window.electronAPI.deleteProvince(selectedProvince.province_id);
      toast.success(result.message || t('success.province_deleted') || "Province deleted successfully!");
      setShowDeleteModal(false);
      setSelectedProvince(null);
      loadProvinces();
    } catch (error) {
      toast.error(error.message || t('error.delete_province_failed') || "Failed to delete province");
    }
  };

  const openEditModal = (province) => {
    setEditProvince({
      province_id: province.province_id,
      province_name: province.province_name
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (province) => {
    setSelectedProvince(province);
    setShowDeleteModal(true);
  };

  // Status badge based on delivery count - with translations
  const getStatusBadge = (deliveryCount) => {
    const statusText = {
      en: {
        inactive: "Inactive",
        low_activity: "Low Activity",
        active: "Active",
        very_active: "Very Active"
      },
      ps: {
        inactive: "غیر فعال",
        low_activity: "کم فعالیت",
        active: "فعال",
        very_active: "ډیر فعال"
      },
      fa: {
        inactive: "غیرفعال",
        low_activity: "فعالیت کم",
        active: "فعال",
        very_active: "خیلی فعال"
      }
    };

    let status = "";
    let colorClass = "";
    
    if (deliveryCount === 0) {
      status = statusText[language]?.inactive || statusText.en.inactive;
      colorClass = "bg-gray-100 text-gray-800";
    } else if (deliveryCount < 10) {
      status = statusText[language]?.low_activity || statusText.en.low_activity;
      colorClass = "bg-yellow-100 text-yellow-800";
    } else if (deliveryCount < 50) {
      status = statusText[language]?.active || statusText.en.active;
      colorClass = "bg-blue-100 text-blue-800";
    } else {
      status = statusText[language]?.very_active || statusText.en.very_active;
      colorClass = "bg-green-100 text-green-800";
    }
    
    return <span className={`px-2 py-1 text-xs font-medium ${colorClass} rounded-full`}>{status}</span>;
  };

  // Translation mapping for UI elements
  const translations = {
    header: {
      en: {
        title: "Provinces Management",
        subtitle: "Manage and track all delivery provinces"
      },
      ps: {
        title: "د ولایتونو مدیریت",
        subtitle: "ټول د لیږد ولایتونه اداره او تعقیب کړئ"
      },
      fa: {
        title: "مدیریت ولایات",
        subtitle: "مدیریت و پیگیری تمام ولایات تحویل"
      }
    },
    buttons: {
      en: {
        add_province: "Add New Province",
        search: "Search",
        refresh: "Refresh",
        clear: "Clear",
        cancel: "Cancel",
        update: "Update Province",
        delete: "Delete Province"
      },
      ps: {
        add_province: "نوی ولایت اضافه کړئ",
        search: "پلټل",
        refresh: "بیا ډیرول",
        clear: "پاکول",
        cancel: "لغوه کول",
        update: "ولایت تازه کول",
        delete: "ولایت ړنګول"
      },
      fa: {
        add_province: "افزودن ولایت جدید",
        search: "جستجو",
        refresh: "بارگذاری مجدد",
        clear: "پاک کردن",
        cancel: "لغو",
        update: "به روز رسانی ولایت",
        delete: "حذف ولایت"
      }
    },
    table: {
      en: {
        province_name: "Province Name",
        deliveries: "Deliveries",
        items: "Items",
        status: "Status",
        created: "Created",
        actions: "Actions",
        id: "ID",
        deliveries_text: "deliveries",
        items_text: "items"
      },
      ps: {
        province_name: "د ولایت نوم",
        deliveries: "لیږدونه",
        items: "توکي",
        status: "حالت",
        created: "جوړ شوی",
        actions: "کړنې",
        id: "آی ډي",
        deliveries_text: "لیږدونه",
        items_text: "توکي"
      },
      fa: {
        province_name: "نام ولایت",
        deliveries: "تحویل‌ها",
        items: "آیتم‌ها",
        status: "وضعیت",
        created: "ایجاد شده",
        actions: "اقدامات",
        id: "شناسه",
        deliveries_text: "تحویل",
        items_text: "آیتم"
      }
    },
    modals: {
      add: {
        en: {
          title: "Add New Province",
          label: "Province Name *",
          placeholder: "Enter province name",
          button: "Add Province"
        },
        ps: {
          title: "نوی ولایت اضافه کړئ",
          label: "د ولایت نوم *",
          placeholder: "د ولایت نوم ولیکئ",
          button: "ولایت اضافه کړئ"
        },
        fa: {
          title: "افزودن ولایت جدید",
          label: "نام ولایت *",
          placeholder: "نام ولایت را وارد کنید",
          button: "افزودن ولایت"
        }
      },
      edit: {
        en: {
          title: "Edit Province",
          label: "Province Name *",
          placeholder: "Enter province name",
          button: "Update Province"
        },
        ps: {
          title: "ولایت سمول",
          label: "د ولایت نوم *",
          placeholder: "د ولایت نوم ولیکئ",
          button: "ولایت تازه کول"
        },
        fa: {
          title: "ویرایش ولایت",
          label: "نام ولایت *",
          placeholder: "نام ولایت را وارد کنید",
          button: "به روز رسانی ولایت"
        }
      },
      delete: {
        en: {
          title: "Delete Province",
          confirm: "Are you sure you want to delete this province? This action cannot be undone.",
          warning: "⚠️ This province has {count} deliveries. Deleting it will also remove these deliveries.",
          button: "Delete Province"
        },
        ps: {
          title: "ولایت ړنګول",
          confirm: "آیا تاسو ډاډه یاست چې تاسو غواړئ دا ولایت حذف کړئ؟ دا عمل لغوه نشي کیدی.",
          warning: "⚠️ دا ولایت {count} لیږدونه لري. دا ړنګول به دا لیږدونه هم لیرې کړي.",
          button: "ولایت ړنګول"
        },
        fa: {
          title: "حذف ولایت",
          confirm: "آیا مطمئن هستید که می‌خواهید این ولایت را حذف کنید؟ این عمل قابل برگشت نیست.",
          warning: "⚠️ این ولایت دارای {count} تحویل است. حذف آن این تحویل‌ها را نیز حذف خواهد کرد.",
          button: "حذف ولایت"
        }
      }
    },
    messages: {
      en: {
        loading: "Loading provinces...",
        no_data: "No Provinces Found",
        add_first: "Add your first province to get started",
        search_placeholder: "Search provinces..."
      },
      ps: {
        loading: "ولایتونه ډیریدل...",
        no_data: "هیڅ ولایت و نه موندل شو",
        add_first: "د پیل کولو لپاره خپل لومړی ولایت اضافه کړئ",
        search_placeholder: "ولایتونه پلټل..."
      },
      fa: {
        loading: "در حال بارگذاری ولایات...",
        no_data: "هیچ ولایتی یافت نشد",
        add_first: "برای شروع، اولین ولایت خود را اضافه کنید",
        search_placeholder: "جستجوی ولایات..."
      }
    },
    stats: {
      en: {
        total_provinces: "Total Provinces",
        total_deliveries: "Total Deliveries",
        active_provinces: "Active Provinces"
      },
      ps: {
        total_provinces: "ټول ولایتونه",
        total_deliveries: "ټول لیږدونه",
        active_provinces: "فعال ولایتونه"
      },
      fa: {
        total_provinces: "کل ولایات",
        total_deliveries: "کل تحویل‌ها",
        active_provinces: "ولایات فعال"
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
            <FaPlus className={`${isRTL ? 'ml-2' : 'mr-2'}`} /> 
            {trans('buttons', 'add_province')}
          </button>
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
              onClick={loadProvinces}
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

      {/* Provinces Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">{trans('messages', 'loading')}</p>
            </div>
          </div>
        ) : provinces.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <FaMapMarkerAlt className="text-gray-300 text-6xl mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">{trans('messages', 'no_data')}</h3>
            <p className="text-gray-500 mt-2">{trans('messages', 'add_first')}</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              {trans('buttons', 'add_province')}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                    {trans('table', 'province_name')}
                  </th>
                  <th className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                    {trans('table', 'deliveries')}
                  </th>
                  <th className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                    {trans('table', 'items')}
                  </th>
                  <th className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                    {trans('table', 'status')}
                  </th>
                  <th className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                    {trans('table', 'created')}
                  </th>
                  <th className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                    {trans('table', 'actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {provinces.map((province) => (
                  <tr key={province.province_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center ${isRTL ? 'ml-3' : 'mr-3'}`}>
                          <FaMapMarkerAlt className="text-primary-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {province.province_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {trans('table', 'id')}: {province.province_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-semibold text-gray-900">
                        {province.total_deliveries || 0}
                      </div>
                      <div className="text-sm text-gray-500">
                        {trans('table', 'deliveries_text')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-semibold text-gray-900">
                        {province.total_items || 0}
                      </div>
                      <div className="text-sm text-gray-500">
                        {trans('table', 'items_text')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(province.total_deliveries || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(province.created_at).toLocaleDateString(language === 'en' ? 'en-US' : language === 'fa' ? 'fa-IR' : 'ps-AF')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        <button
                          onClick={() => openEditModal(province)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors"
                          title={language === 'en' ? "Edit" : language === 'ps' ? "سمول" : "ویرایش"}
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => openDeleteModal(province)}
                          className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                          title={language === 'en' ? "Delete" : language === 'ps' ? "ړنګول" : "حذف"}
                          disabled={province.total_deliveries > 0}
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

      {/* Add Province Modal */}
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
                    {trans('modals.add', 'label')}
                  </label>
                  <input
                    type="text"
                    value={newProvince.province_name}
                    onChange={(e) => setNewProvince({ province_name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder={trans('modals.add', 'placeholder')}
                    autoFocus
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
                  onClick={handleAddProvince}
                  className="px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors flex items-center"
                >
                  <FaPlus className={`${isRTL ? 'ml-2' : 'mr-2'}`} /> 
                  {trans('modals.add', 'button')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Province Modal */}
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
                    {trans('modals.edit', 'label')}
                  </label>
                  <input
                    type="text"
                    value={editProvince.province_name}
                    onChange={(e) => setEditProvince({...editProvince, province_name: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder={trans('modals.edit', 'placeholder')}
                    autoFocus
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
                  onClick={handleEditProvince}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProvince && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {trans('modals.delete', 'title')}
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
                  {language === 'en' ? 'Delete' : language === 'ps' ? 'ړنګول' : 'حذف'} {selectedProvince.province_name}?
                </h4>
                
                <p className="text-gray-600 mb-6">
                  {trans('modals.delete', 'confirm')}
                  {selectedProvince.total_deliveries > 0 && (
                    <span className="block text-red-600 font-medium mt-2">
                      {trans('modals.delete', 'warning').replace('{count}', selectedProvince.total_deliveries)}
                    </span>
                  )}
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
                  onClick={handleDeleteProvince}
                  className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <FaTrash className={`${isRTL ? 'ml-2' : 'mr-2'}`} /> 
                  {trans('modals.delete', 'button')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Provinces;