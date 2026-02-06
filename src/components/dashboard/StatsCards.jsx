import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  FaTruck,
  FaMoneyBillWave,
  FaUserTie,
  FaMapMarkerAlt,
  FaChartLine,
  FaArrowUp,
  FaArrowDown
} from "react-icons/fa";

const StatsCards = () => {
  const { t } = useLanguage();

  const stats = [
    {
      id: 1,
      title: t('stats.total_deliveries'),
      value: "1,245",
      change: "+12.5%",
      changeType: "increase",
      icon: FaTruck,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      id: 2,
      title: t('stats.total_revenue'),
      value: "$48,500",
      change: "+8.2%",
      changeType: "increase",
      icon: FaMoneyBillWave,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      id: 3,
      title: t('stats.active_agents'),
      value: "28",
      change: "+3",
      changeType: "increase",
      icon: FaUserTie,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    {
      id: 4,
      title: t('stats.active_provinces'),
      value: "15",
      change: "+2",
      changeType: "increase",
      icon: FaMapMarkerAlt,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
              <div className="flex items-center mt-3">
                {stat.changeType === "increase" ? (
                  <FaArrowUp className="text-green-500 mr-2" />
                ) : (
                  <FaArrowDown className="text-red-500 mr-2" />
                )}
                <span
                  className={`text-sm font-medium ${
                    stat.changeType === "increase"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stat.change} from last month
                </span>
              </div>
            </div>
            <div className={`p-3 ${stat.bgColor} rounded-xl`}>
              <stat.icon className={`text-2xl ${stat.iconColor}`} />
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${stat.color} rounded-full`}
                style={{ width: "75%" }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;