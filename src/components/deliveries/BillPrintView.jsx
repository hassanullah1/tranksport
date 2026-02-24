import React from "react";
import { FaPhone, FaMapMarkerAlt } from "react-icons/fa";

const BillPrintView = ({ bill, language, isRTL, t }) => {
  console.log(bill);
  if (!bill) return null;

  const alignClass = isRTL ? "text-right" : "text-left";

  const trans = (key) => t[language]?.[key] || t.en[key] || key;

  return (
    <div className="print-invoice">
      {/* Modern Header */}

      {/* ===== MODERN HEADER ===== */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100  p-6 mb-2 border border-gray-200 ">
        {/* Row 1: Logo + Company | Phone */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white rounded-full border-2 border-blue-600 shadow-md shadow-blue-200/50 flex items-center justify-center overflow-hidden">
              <img
                src="/log.jpeg"
                alt="logo"
                className="w-20 h-20 object-cover"
              />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-blue-900 leading-tight">
                مرکز انتقالات رسا
              </div>
              <div className="text-base font-normal text-blue-900 tracking-wide mt-1">
                Rasa Transfer Company
              </div>
            </div>
          </div>

          <div className="text-lg font-semibold text-blue-600 bg-blue-100 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-blue-200 shadow-sm">
            📞 ۰۲۱-۱۲۳۴۵۶۷۸
          </div>
        </div>

        {/* Row 2: Agent Info (left) | Date & Number (right) */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200/70">
          {/* Agent Info */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-blue-600 bg-gray-100 px-3 py-1 rounded-full">
              👤 نماینده
            </span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-900">
                {bill.agent_name}
              </span>
              <span className="text-sm font-medium text-gray-700 border-r border-gray-300 pr-3">
                {bill.agent_phone || "—"}
              </span>
            </div>
          </div>

          {/* Date & Number */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-200">
              <span className="text-xs font-normal text-blue-600">تاریخ</span>
              <span className="text-sm font-semibold text-gray-900 ltr">
                {new Date(bill.bill_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-200">
              <span className="text-xs font-normal text-blue-600">
                شماره بل
              </span>
              <span className="text-sm font-semibold text-gray-900 ltr">
                {bill.bill_id}
              </span>
            </div>
          </div>
        </div>
      </div>

      <hr className="separator" />

      {/* Deliveries table (no actions column) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100/80">
              <th
                className={`px-3 py-2 ${alignClass} text-xs font-semibold text-gray-500 uppercase tracking-wider`}
              >
                {trans("tracking")}
              </th>
              <th
                className={`px-3 py-2 ${alignClass} text-xs font-semibold text-gray-500 uppercase tracking-wider`}
              >
                {trans("Name")}
              </th>
              <th
                className={`px-3 py-2 ${alignClass} text-xs font-semibold text-gray-500 uppercase tracking-wider`}
              >
                {trans("customer")}
              </th>
              <th
                className={`px-3 py-2 ${alignClass} text-xs font-semibold text-gray-500 uppercase tracking-wider`}
              >
                {trans("province")}
              </th>
              <th
                className={`px-3 py-2 ${alignClass} text-xs font-semibold text-gray-500 uppercase tracking-wider`}
              >
                {trans("total")}
              </th>
              <th
                className={`px-3 py-2 ${alignClass} text-xs font-semibold text-gray-500 uppercase tracking-wider`}
              >
                {trans("arrive")}
              </th>
              <th
                className={`px-3 py-2 ${alignClass} text-xs font-semibold text-gray-500 uppercase tracking-wider`}
              >
                {trans("approve")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bill?.deliveries?.map((delivery) =>
              delivery.items.map((item) => (
                <tr key={`${delivery.delivery_id}-${item.item_id}`}>
                  <td className={`px-3 py-2 ${alignClass}`}>
                    #{delivery.delivery_id}
                  </td>
                  <td className={`px-3 py-2 ${alignClass}`}>
                    {item.item_name}
                  </td>
                  <td className={`px-3 py-2 ${alignClass}`}>
                    {delivery.customer_name || "N/A"}
                    {delivery.customer_phone && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {delivery.customer_phone}
                      </div>
                    )}
                  </td>
                  <td className={`px-3 py-2 ${alignClass}`}>
                    {delivery.province_name || "N/A"}
                  </td>
                  <td className={`px-3 py-2 ${alignClass}`}>
                    {item.total_cost || "N/A"}
                  </td>
                  <td className={`px-3 py-2 ${alignClass}`}></td>
                  <td className={`px-3 py-2 ${alignClass}`}></td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>

      {/* Address repeated (optional) */}
      <div className="address-line text-xs text-gray-500 mt-3 text-center">
        آدرس: مرکز تجارتی داوودی منزل B2 دوگان نمبر 105 - 137
      </div>
    </div>
  );
};

export default BillPrintView;
