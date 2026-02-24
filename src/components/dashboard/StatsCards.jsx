// components/dashboard/StatsCards.jsx

import React from "react";

const StatsCards = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`${stat.color} rounded-2xl shadow-lg p-6 text-white transform transition-all duration-300 hover:scale-105`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 font-medium">{stat.title}</p>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
            </div>
            <span className="text-4xl opacity-80">{stat.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
