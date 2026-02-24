import React, { useEffect, useState, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaMapMarkerAlt, FaUserTie, FaDollarSign,
  FaCheckCircle, FaRegCircle, FaPrint,
  FaSearch, FaTimes, FaBoxOpen, FaSmileWink, FaUserCircle
} from 'react-icons/fa';

// ---------- 🌍 Translations (from your example) ----------
const translations = {
  deliveries: {
    en: {
      tracking: "Code",
      customer: "Customer",
      province: "Province",
      agent: "Agent",
      add: "Add",
      condition: "Items assigned to Agent : ",
      date: "Date",
      actions: "Select All",
    },
    ps: {
      tracking: "کود",
      customer: "پیرودونکی",
      province: "ولایت",
      agent: "نماینده",
      add: "زیات کړي",
      condition: "اقلام به نماینده اختصاص داده شد :",
      date: "نیټه",
      actions: "ټول انتخاب کړه",
    },
    fa: {
      tracking: "کود",
      customer: "مشتری",
      province: "ولایت",
      add: "زیات کړي",
      agent: "نماینده",
      condition: "توکي نمایند ته وسپارلي :",
      date: "تاریخ",
      actions: "انتخاب همه",
    },
  },
  search: {
    en: {
      all: "Deselect All ",
      customer: "Customer Name",
      agent: "Agent Name",
      tracking: "Tracking Number",
    },
    ps: {
      all: "ټول مه انخابوه",
      customer: "د پیرودونکی نوم",
      agent: "د نماینده نوم",
      tracking: "د تعقیب نمبر",
    },
    fa: {
      all: "همه فیلدها",
      customer: "نام مشتری",
      agent: "نام نماینده",
      tracking: "شماره پیگیری",
    },
  },
  pagination: {
    en: {
      showing: "Showing",
      to: "to",
      of: "of",
      entries: "Items",
      per_page: "per page",
      results: "results",
    },
    ps: {
      showing: "ښکاره کول",
      to: "تر",
      of: "د",
      entries: "اجناس",
      per_page: "په هر پاڼه کې",
      results: "پايلې",
    },
    fa: {
      showing: "نمایش",
      to: "تا",
      of: "از",
      entries: "اجناس",
      per_page: "در هر صفحه",
      results: "نتیجه",
    },
  },
  return: {
    en: {
      reason: "Return Reason",
      fee: "Return Fee",
      handling_fee: "Handling Fee",
      notes: "Notes",
      refused: "Customer Refused",
      damaged: "Item Damaged",
      wrong_item: "Wrong Item",
      delayed: "Delayed Delivery",
      other: "Other",
      total_fee: "Total Charges",
      confirm_return: "Confirm Return",
      warning: "This will deduct commission from agent",
    },
    ps: {
      reason: "د بیرته ستنیدلو دلیل",
      fee: "د بیرته ستنیدلو فیس",
      handling_fee: "د چلولو فیس",
      notes: "یادښتونه",
      refused: "پیرودونکی انکار کړ",
      damaged: "توکی خراب شوی",
      wrong_item: "غلط توکی",
      delayed: "نور لیږد",
      other: "نور",
      total_fee: "ټول فیسونه",
      confirm_return: "بیرته ستنیدل تایید کړئ",
      warning: "دا به د نماینده څخه کمیسیون کموي",
    },
    fa: {
      reason: "دلیل مرجوعی",
      fee: "هزینه مرجوعی",
      handling_fee: "هزینه رسیدگی",
      notes: "یادداشت",
      refused: "مشتری رد کرد",
      damaged: "آیتم آسیب دیده",
      wrong_item: "آیتم نادرست",
      delayed: "تأخیر در تحویل",
      other: "سایر",
      total_fee: "کل هزینه‌ها",
      confirm_return: "تأیید مرجوعی",
      warning: "این کار کمیسیون نماینده را کسر می‌کند",
    },
  },
};

// ---------- 🌐 Translation helper ----------
const useTranslations = () => {
  const { language } = useLanguage();
  const trans = (category, key) => {
    return translations[category]?.[language]?.[key] ||
           translations[category]?.en?.[key] ||
           key;
  };
  return { trans };
};

// ---------- 🔍 Autocomplete with Floating Label ----------
const AutocompleteSelect = ({
  id,
  value,
  items = [],
  onChange,
  placeholder,
  icon: Icon,
  color = 'blue',
  disabled = false,
}) => {
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef(null);

  const selectedItem = items.find((item) => item.id === value);
  const displayValue = selectedItem ? selectedItem.label : '';

  useEffect(() => {
    setQuery(displayValue);
  }, [displayValue]);

  useEffect(() => {
    if (!query.trim()) {
      setFiltered(items.slice(0, 50));
    } else {
      const lower = query.toLowerCase();
      setFiltered(
        items
          .filter((item) => item.label.toLowerCase().includes(lower))
          .slice(0, 50)
      );
    }
  }, [query, items]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    onChange(item.id);
    setQuery(item.label);
    setIsOpen(false);
    setIsFocused(false);
  };

  const handleClear = () => {
    onChange('');
    setQuery('');
    setIsOpen(false);
    setIsFocused(true);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        <label
          htmlFor={id}
          className={`absolute left-10 transition-all pointer-events-none ${
            isFocused || value || query
              ? 'text-xs -top-2 bg-white px-1 text-gray-600'
              : 'text-sm top-3 text-gray-400'
          }`}
        >
          {placeholder}
        </label>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className={`text-${color}-400`} size={18} />
        </div>
        <input
          id={id}
          type="text"
          className={`w-full border-2 rounded-2xl pl-10 pr-12 py-3 text-sm
            ${disabled
              ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
              : `bg-white border-${color}-200 focus:border-${color}-400 focus:ring-4 focus:ring-${color}-100`
            } transition-all duration-200 outline-none`}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            if (!e.target.value) onChange('');
          }}
          onFocus={() => {
            setIsOpen(true);
            setIsFocused(true);
          }}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          autoComplete="off"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-1">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              title="Clear"
            >
              <FaTimes size={14} />
            </button>
          )}
          <FaSearch className={`text-${color}-300`} size={14} />
        </div>
      </div>
      {isOpen && !disabled && (
        <ul className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-lg max-h-60 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <li
                key={item.id}
                className={`px-4 py-3 cursor-pointer text-sm hover:bg-${color}-50 transition ${
                  item.id === value ? `bg-${color}-100 font-medium text-${color}-800` : ''
                }`}
                onClick={() => handleSelect(item)}
              >
                {item.label}
              </li>
            ))
          ) : (
            <li className="px-4 py-3 text-sm text-gray-500">😕 No results found</li>
          )}
        </ul>
      )}
    </div>
  );
};



// ---------- 🎀 Main BulkAssign Component ----------
const BulkAssign = () => {
  const { isRTL, language } = useLanguage();
  const { trans } = useTranslations();


  const [provinces, setProvinces] = useState([]);
  const [agents, setAgents] = useState([]);
  const [pendingDeliveries, setPendingDeliveries] = useState([]);
  const [selectedDeliveries, setSelectedDeliveries] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [commission, setCommission] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);
  const selectedAgentData = agents.find((a) => a.agent_id === selectedAgent);

  const selectedAgentName = selectedAgentData
    ? selectedAgentData.agent_name
    : "";


  // Load provinces and agents
  useEffect(() => {
    loadProvinces();
    loadAgents();
  }, []);

  const loadProvinces = async () => {
    const data = await window.electronAPI.getProvinces();
    setProvinces(data || []);
  };

  const loadAgents = async () => {
    const data = await window.electronAPI.getAgents();
    setAgents(data || []);
  };

  // Fetch deliveries when province changes
  useEffect(() => {
    if (selectedProvince) {
      fetchPendingDeliveries();
    } else {
      setPendingDeliveries([]);
      setSelectedDeliveries([]);
    }
  }, [selectedProvince]);

  const fetchPendingDeliveries = async () => {
    setLoadingDeliveries(true);
    try {
      const data = await window.electronAPI.getPendingDeliveriesByProvince(selectedProvince);
      setPendingDeliveries(data);
      console.log(data);
      setSelectedDeliveries([]);
    } catch {
      toast.error(trans('deliveries', 'condition') + ' load failed');
    } finally {
      setLoadingDeliveries(false);
    }
  };

  const toggleSelectDelivery = (deliveryId) => {
    setSelectedDeliveries((prev) =>
      prev.includes(deliveryId)
        ? prev.filter((id) => id !== deliveryId)
        : [...prev, deliveryId]
    );
  };

  const selectAll = () => {
    if (selectedDeliveries.length === pendingDeliveries.length) {
      setSelectedDeliveries([]);
    } else {
      setSelectedDeliveries(pendingDeliveries.map((d) => d.delivery_id));
    }
  };

  const handleAssign = async () => {
    if (!selectedAgent) {
      toast.error(trans('deliveries', 'agent') + ' required');
      return;
    }
    if (selectedDeliveries.length === 0) {
      toast.error(trans('deliveries', 'tracking') + ' required');
      return;
    }
    setLoading(true);
    try {
      const result = await window.electronAPI.assignAgentToDeliveries({
        agentId: selectedAgent,
        deliveryIds: selectedDeliveries,
        commissionAmount: parseFloat(commission) || 0,
        assignedDate: new Date().toISOString().split('T')[0],
      });
      toast.success(result.message);
      fetchPendingDeliveries();
    } catch (error) {
      toast.error(error.message || trans('return', 'reason'));
    } finally {
      setLoading(false);
    }
  };

 

  // Selection summary
  const selectedDeliveriesData = pendingDeliveries.filter((d) =>
    selectedDeliveries.includes(d.delivery_id)
  );
  const selectedTotalValue = selectedDeliveriesData.reduce(
    (sum, d) => sum + (parseFloat(d.total_value) || 0),
    0
  );
  const selectedCount = selectedDeliveries.length;

  // Options for autocompletes
  const provinceOptions = provinces.map((p) => ({
    id: p.province_id,
    label: p.province_name,
  }));
  const agentOptions = agents.map((a) => ({
    id: a.agent_id,
    label: `${a.agent_name} — ${a.phone}`,
  }));

  return (
    <div className="min-h-screen p-4 md:p-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto">
        {/* 🎯 Top Card – Province, Agent, Commission */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-md p-2 mb-3 border border-white/50">
          <div className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1 min-w-0 z-50">
              <AutocompleteSelect
                id="province-select"
                value={selectedProvince}
                items={provinceOptions}
                onChange={setSelectedProvince}
                placeholder={trans("deliveries", "province")}
                icon={FaMapMarkerAlt}
                color="blue"
              />
            </div>
            <div className="flex-1 min-w-0  z-50">
              <AutocompleteSelect
                id="agent-select"
                value={selectedAgent}
                items={agentOptions}
                onChange={setSelectedAgent}
                placeholder={trans("deliveries", "agent")}
                icon={FaUserTie}
                color="pink"
              />
            </div>
          </div>
        </div>

        {selectedProvince ? (
          <div className="bg-white rounded-3xl shadow-lg border border-blue-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 via-white to-pink-50 px-5 py-4 border-b border-blue-100 flex flex-wrap items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-2xl">
                  <FaBoxOpen className="text-blue-600" size={20} />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {trans("deliveries", "condition")}
                  {selectedAgentName}
                </h2>
              </div>
              {pendingDeliveries.length > 0 && (
                <button
                  onClick={selectAll}
                  className="text-sm font-medium text-pink-600 hover:text-pink-800 bg-pink-50 hover:bg-pink-100 px-4 py-2 rounded-full transition shadow-sm"
                >
                  {selectedDeliveries.length === pendingDeliveries.length
                    ? "✨ " + trans("search", "all")
                    : "✅ " + trans("deliveries", "actions")}
                </button>
              )}
            </div>

            {/* Delivery Cards */}
            {loadingDeliveries ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
              </div>
            ) : pendingDeliveries.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="bg-blue-50 inline-flex p-4 rounded-full mb-4">
                  <FaSmileWink className="text-blue-400 text-4xl" />
                </div>
                <p className="text-gray-600 text-lg font-medium">
                  {trans("pagination", "entries")} 0
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  🌍 {trans("deliveries", "province")}
                </p>
              </div>
            ) : (
              <>
                {/* ---------- 📋 RTL‑aware Delivery Table ---------- */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {/* Checkmark column – no text, no alignment issue */}
                        <th scope="col" className="px-4 py-3 w-10"></th>

                        {/* Text columns – align based on direction */}
                        <th
                          scope="col"
                          className={`px-4 py-3 ${isRTL ? "text-right" : "text-left"} text-xs font-medium text-gray-500 uppercase tracking-wider`}
                        >
                          {trans("deliveries", "tracking")}
                        </th>
                        <th
                          scope="col"
                          className={`px-4 py-3 ${isRTL ? "text-right" : "text-left"} text-xs font-medium text-gray-500 uppercase tracking-wider`}
                        >
                          {trans("deliveries", "customer")}
                        </th>
                        <th
                          scope="col"
                          className={`px-4 py-3 ${isRTL ? "text-right" : "text-left"} text-xs font-medium text-gray-500 uppercase tracking-wider`}
                        >
                          {trans("deliveries", "date")}
                        </th>

                        {/* Numeric columns – always right‑aligned */}
                        <th
                          scope="col"
                          className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {trans("pagination", "entries")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingDeliveries.map((delivery) => {
                        const isSelected = selectedDeliveries.includes(
                          delivery.delivery_id,
                        );
                        return (
                          <tr
                            key={delivery.delivery_id}
                            className={`hover:bg-blue-50/30 transition ${
                              isSelected ? "bg-pink-50" : ""
                            }`}
                          >
                            {/* Checkbox – stays at the visual start (right in RTL) */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              <button
                                onClick={() =>
                                  toggleSelectDelivery(delivery.delivery_id)
                                }
                                className="focus:outline-none"
                              >
                                {isSelected ? (
                                  <FaCheckCircle className="text-pink-500 text-xl" />
                                ) : (
                                  <FaRegCircle className="text-gray-300 text-xl hover:text-pink-400 transition" />
                                )}
                              </button>
                            </td>

                            {/* Text data – align with header */}
                            <td
                              className={`px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-800 ${
                                isRTL ? "text-right" : "text-left"
                              }`}
                            >
                              #{delivery.delivery_id}
                            </td>
                            <td
                              className={`px-4 py-3 whitespace-nowrap text-sm text-gray-700 ${
                                isRTL ? "text-right" : "text-left"
                              }`}
                            >
                              {delivery.customer_name || "N/A"}
                            </td>
                            <td
                              className={`px-4 py-3 whitespace-nowrap text-sm text-gray-700 ${
                                isRTL ? "text-right" : "text-left"
                              }`}
                            >
                              {delivery.delivery_date
                                ? new Date(
                                    delivery.delivery_date,
                                  ).toLocaleDateString()
                                : "N/A"}
                            </td>

                            {/* Numeric – always right‑aligned */}
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right">
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                                {delivery.total_items || 0}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* Action Bar */}
                <div className="bg-gradient-to-r from-blue-50 to-pink-50 px-5 py-4 border-t border-blue-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-3">
                    <button
                      onClick={handleAssign}
                      disabled={loading || selectedCount === 0}
                      className="flex items-center bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white font-medium py-3 px-6 rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-105 active:scale-95"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></span>
                          {trans("return", "confirm_return")}...
                        </span>
                      ) : (
                        <>🚀 {trans("deliveries", "add")}</>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="  rounded-3xl shadow-md p-12 text-center  ">
            <div className="bg-gradient-to-br from-blue-100 to-pink-100 inline-flex p-5 rounded-full mb-4">
              <FaMapMarkerAlt className="text-blue-500 text-5xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {trans("deliveries", "province")}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkAssign;