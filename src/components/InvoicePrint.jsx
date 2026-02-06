import React, { useRef } from "react";
import { FaTimes, FaPrint, FaDownload } from "react-icons/fa";
import { useReactToPrint } from "react-to-print";

const InvoicePrint = ({ invoiceData, onClose }) => {
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Invoice-${invoiceData.tracking_number}`,
    onAfterPrint: () => console.log("Printed successfully!")
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateTotals = () => {
    const quantity = invoiceData.quantity || 1;
    const itemCost = invoiceData.item_cost || 0;
    const sellingPrice = invoiceData.selling_price || 0;
    const commission = invoiceData.commission_amount || 0;
    
    return {
      totalItemCost: (quantity * itemCost).toFixed(2),
      totalSellingPrice: (quantity * sellingPrice).toFixed(2),
      totalCommission: (quantity * commission).toFixed(2),
      netProfit: ((quantity * sellingPrice) - (quantity * itemCost) - (quantity * commission)).toFixed(2)
    };
  };

  const totals = calculateTotals();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Invoice / Delivery Bill</h2>
            <p className="text-gray-600">Print or download this invoice</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center"
            >
              <FaPrint className="mr-2" /> Print
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div ref={componentRef} className="bg-white p-8">
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">DELIVERY SERVICE</h1>
                <p className="text-gray-600">Professional Delivery Solutions</p>
                <p className="text-gray-600">Kabul, Afghanistan</p>
                <p className="text-gray-600">Phone: +93 123 456 789</p>
                <p className="text-gray-600">Email: info@deliveryservice.com</p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-primary-600">INVOICE</h2>
                <div className="mt-4">
                  <p className="text-gray-700">
                    <span className="font-semibold">Invoice #:</span> {invoiceData.tracking_number}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Date:</span> {formatDate(invoiceData.delivery_date)}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Status:</span> {invoiceData.status?.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>

            {/* Sender & Receiver Info */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              {/* Sender Information */}
              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-lg text-gray-800 mb-3 border-b pb-2">From (Sender)</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <span className="font-semibold">Delivery Service Co.</span>
                  </p>
                  <p className="text-gray-600">Main Office, Kabul</p>
                  <p className="text-gray-600">Phone: +93 123 456 789</p>
                  <p className="text-gray-600">Email: sender@deliveryservice.com</p>
                </div>
              </div>

              {/* Receiver Information */}
              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-lg text-gray-800 mb-3 border-b pb-2">To (Receiver)</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <span className="font-semibold">{invoiceData.customer_name || "Customer"}</span>
                  </p>
                  {invoiceData.customer_address && (
                    <p className="text-gray-600">{invoiceData.customer_address}</p>
                  )}
                  {invoiceData.customer_phone && (
                    <p className="text-gray-600">Phone: {invoiceData.customer_phone}</p>
                  )}
                  {invoiceData.customer_email && (
                    <p className="text-gray-600">Email: {invoiceData.customer_email}</p>
                  )}
                  {invoiceData.province_name && (
                    <p className="text-gray-600">Province: {invoiceData.province_name}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Item Details */}
            <div className="mb-8">
              <h3 className="font-bold text-lg text-gray-800 mb-4 border-b pb-2">Item Details</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-4 text-left font-semibold text-gray-700">Description</th>
                      <th className="py-3 px-4 text-left font-semibold text-gray-700">Quantity</th>
                      <th className="py-3 px-4 text-left font-semibold text-gray-700">Unit Cost</th>
                      <th className="py-3 px-4 text-left font-semibold text-gray-700">Selling Price</th>
                      <th className="py-3 px-4 text-left font-semibold text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-semibold text-gray-800">{invoiceData.item_name}</p>
                          {invoiceData.item_description && (
                            <p className="text-gray-600 text-sm mt-1">{invoiceData.item_description}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">{invoiceData.quantity}</td>
                      <td className="py-4 px-4">${invoiceData.item_cost?.toFixed(2)}</td>
                      <td className="py-4 px-4">${invoiceData.selling_price?.toFixed(2)}</td>
                      <td className="py-4 px-4 font-semibold">${totals.totalSellingPrice}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-lg text-gray-800 mb-3 border-b pb-2">Delivery Information</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <span className="font-semibold">Agent:</span> {invoiceData.agent_name || "Not Assigned"}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Commission Rate:</span> {invoiceData.commission_rate || 0}%
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Delivery Date:</span> {formatDate(invoiceData.delivery_date)}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Expected Delivery:</span> Within 3-5 business days
                  </p>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-lg text-gray-800 mb-3 border-b pb-2">Payment Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="font-semibold">${totals.totalSellingPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Item Cost:</span>
                    <span className="text-gray-700">${totals.totalItemCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Agent Commission:</span>
                    <span className="text-gray-700">${totals.totalCommission}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-bold text-gray-800">Net Profit:</span>
                    <span className="font-bold text-green-600">${totals.netProfit}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="border-t pt-8">
              <h3 className="font-bold text-lg text-gray-800 mb-3">Terms & Conditions</h3>
              <div className="text-gray-600 text-sm">
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Payment is due within 30 days of invoice date.</li>
                  <li>Delivery time may vary based on location and weather conditions.</li>
                  <li>Items must be inspected upon delivery. Claims must be made within 24 hours.</li>
                  <li>Agent commission is calculated based on the agreed rate.</li>
                  <li>This is a computer-generated invoice and does not require a signature.</li>
                </ol>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-8 border-t text-center text-gray-500 text-sm">
              <p>Thank you for choosing our delivery service!</p>
              <p className="mt-1">For any queries, contact us at support@deliveryservice.com or call +93 123 456 789</p>
              <p className="mt-4 font-semibold">This invoice is valid only for the above mentioned details.</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors flex items-center"
            >
              <FaPrint className="mr-2" /> Print Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrint;