import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { FaTruckLoading } from "react-icons/fa";

const LoadingScreen = () => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm">
      <div className="text-center">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
          <FaTruckLoading className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary-600 text-3xl" />
        </div>
        <p className="mt-6 text-lg font-semibold text-gray-700">
          {t('app.loading')}
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Please wait while we prepare your dashboard...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;