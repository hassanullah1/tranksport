import React, { useRef } from "react";
import { FaPrint } from "react-icons/fa";

const BillPrintView = ({
  bill,
  language,
  isRTL,
  t,
  hidePrintButton = false,
}) => {
  console.log(bill);
  if (!bill) return null;

  const printRef = useRef();

  const trans = (key) => t[language]?.[key] || t.en[key] || key;

  // Helper to determine checkbox states
  const getDeliveryStatus = (delivery) => {
    const status = delivery.delivery_status;
    return {
      isCancelled: status === "cancelled",
      isRejected: status === "rejected",
      isDelivered: status === "delivered",
    };
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups to print");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <title>Bill #${bill.bill_id} - Rasa Transfer</title>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.2;
              max-width: 80mm;
              margin: 0 auto;
              padding: 5px;
              direction:"rtl"};
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
              margin-bottom: 8px;
            }
            th {
              border-top: 1px solid #000;
              border-bottom: 1px solid #000;
              text-align: center;
              padding: 3px;
              font-weight: bold;
            }
            td {
              text-align: center;
              padding: 2px;
            }
            .header {
              text-align: center;
              margin-bottom: 8px;
              border-bottom: 1px dashed #000;
              padding-bottom: 5px;
            }
            .header h1 {
              font-weight: bold;
              font-size: 16px;
              margin: 0;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 6px;
              padding: 3px 0;
              border-bottom: 1px dashed #000;
            }
            .summary {
              border-top: 1px dashed #000;
              border-bottom: 1px dashed #000;
              padding: 5px 0;
              margin-bottom: 8px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              font-size: 10px;
              margin-top: 10px;
            }
            .no-print { display: none; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <!-- Header -->
          <div class="header">
            <h1>مرکز انتقالات رسا</h1>
            <div style="font-size: 11px;">Rasa Transfer Company</div>
            <div style="font-size: 11px; margin-top: 3px;">📞 0731-574174</div>
          </div>

          <!-- Agent Info -->
          <div class="info-row">
            <div><strong>${trans("agent")}:</strong> ${bill.agent_name}</div>
            <div><strong>شماره:</strong> ${bill.agent_phone || "—"}</div>
          </div>

          <!-- Date & Bill Number -->
          <div class="info-row">
            <div><strong>${trans("date")}:</strong> ${new Date(bill.bill_date).toLocaleDateString()}</div>
            <div><strong>${trans("billNumber")}:</strong> ${bill.bill_id}</div>
          </div>

          <!-- Table -->
          <table>
            <thead>
              <tr>
                <th>کود</th>
                <th>توکی</th>
                <th>مشتری</th>
                
                <th>قیمت</th>
                
              </tr>
            </thead>
            <tbody>
              ${bill?.deliveries
                ?.map((delivery) => {
                  const { isCancelled, isRejected } =
                    getDeliveryStatus(delivery);
                  return delivery.items
                    .map(
                      (item, index) => `
                  <tr${index < delivery.items.length - 1 ? ' style="border-bottom: 1px dotted #ccc;"' : ""}>
                    <td>#${delivery.delivery_id}</td>
                    <td>${item.item_name}</td>
                    <td>${delivery.customer_name || "—"}</td>
                  
                    <td>${item.total_cost || "0"}</td>
                   
                  </tr>
                `,
                    )
                    .join("");
                })
                .join("")}
            </tbody>
          </table>

          <!-- Summary -->
          <div class="summary">
          
            <div class="summary-row" style="margin-top: 3px;">
              <span>${trans("totalValue")}:</span>
              <span>$${bill?.deliveries
                ?.reduce(
                  (sum, d) =>
                    sum +
                    d.items.reduce(
                      (itemSum, item) =>
                        itemSum + (parseFloat(item.total_cost) || 0),
                      0,
                    ),
                  0,
                )
                .toFixed(2)}</span>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <div>آدرس: مرکز تجارتی داوودی منزل B2 دوگان نمبر 105 - 137</div>
            <div style="margin-top: 5px;">تشکر از همکاری شما</div>
            <div style="margin-top: 3px;">________________</div>
            <div style="font-size: 9px; margin-top: 3px; color: #666;">
              ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div>
      {!hidePrintButton && (
        <div
          style={{
            textAlign: "center",
            marginBottom: "10px",
            padding: "10px",
            background: "#f0f0f0",
          }}
        >
          <button
            onClick={handlePrint}
            style={{
              padding: "8px 16px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaPrint /> Print Bill
          </button>
          <p style={{ marginTop: "5px", fontSize: "12px", color: "#666" }}>
            {isRTL ? "چاپ کنید" : "Click to print"}
          </p>
        </div>
      )}

      {/* Preview Content */}
      <div ref={printRef}>
        <div
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "12px",
            lineHeight: "1.2",
            maxWidth: "80mm",
            margin: "0 auto",
            padding: "5px",
            direction: "rtl" ,
          }}
        >
          {/* Simple Header */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "8px",
              borderBottom: "1px dashed #000",
              paddingBottom: "5px",
            }}
          >
            <div style={{ fontWeight: "bold", fontSize: "16px" }}>
              مرکز انتقالات رسا
            </div>
            <div style={{ fontSize: "11px" }}>Rasa Transfer Company</div>
            <div style={{ fontSize: "11px", marginTop: "3px" }}>
              📞 0792-261-621
            </div>
          </div>

          {/* Agent Info */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "6px",
              padding: "3px 0",
              borderBottom: "1px dashed #000",
            }}
          >
            <div>
              <span style={{ fontWeight: "bold" }}>ولایت:</span>{" "}
              {bill.deliveries[0].province_name || "N/A"}
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>شماره:</span>{" "}
              {bill.agent_phone || "—"}
            </div>
          </div>

          {/* Date & Bill Number */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
              padding: "3px 0",
              borderBottom: "1px dashed #000",
            }}
          >
            <div>
              <span style={{ fontWeight: "bold" }}>{trans("date")}:</span>{" "}
              {new Date(bill.bill_date).toLocaleDateString()}
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>{trans("billNumber")}:</span>{" "}
              {bill.bill_id}
            </div>
          </div>

          {/* Table with all columns */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "8px",
              fontSize: "11px",
            }}
          >
            <thead>
              <tr
                style={{
                  borderTop: "1px solid #000",
                  borderBottom: "1px solid #000",
                }}
              >
                <th
                  style={{
                    textAlign: "center",
                    padding: "3px",
                    fontWeight: "bold",
                  }}
                >
                  کود
                </th>
                <th
                  style={{
                    textAlign: "center",
                    padding: "3px",
                    fontWeight: "bold",
                  }}
                >
                  توکی
                </th>
                <th
                  style={{
                    textAlign: "center",
                    padding: "3px",
                    fontWeight: "bold",
                  }}
                >
                  مشتری
                </th>

                <th
                  style={{
                    textAlign: "center",
                    padding: "3px",
                    fontWeight: "bold",
                  }}
                >
                  قیمت
                </th>
              </tr>
            </thead>
            <tbody>
              {bill?.deliveries?.map((delivery) => {
                const { isCancelled, isRejected } = getDeliveryStatus(delivery);
                return delivery.items.map((item, index) => (
                  <tr
                    key={`${delivery.delivery_id}-${item.item_id || index}`}
                    style={{
                      borderBottom:
                        index < delivery.items.length - 1
                          ? "1px dotted #ccc"
                          : "none",
                    }}
                  >
                    <td style={{ textAlign: "center", padding: "2px" }}>
                      #{delivery.delivery_id}
                    </td>
                    <td style={{ textAlign: "center", padding: "2px" }}>
                      {item.item_name}
                    </td>
                    <td style={{ textAlign: "center", padding: "2px" }}>
                      {delivery.customer_name || "—"}
                    </td>

                    <td style={{ textAlign: "center", padding: "2px" }}>
                      {item.total_cost || "0"}
                    </td>
                  </tr>
                ));
              })}
            </tbody>
          </table>

          {/* Summary */}
          <div
            style={{
              borderTop: "1px dashed #000",
              borderBottom: "1px dashed #000",
              padding: "5px 0",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
                marginTop: "3px",
              }}
            >
              <span>{trans("totalValue")}:</span>
              <span>
                $
                {bill?.deliveries
                  ?.reduce(
                    (sum, d) =>
                      sum +
                      d.items.reduce(
                        (itemSum, item) =>
                          itemSum + (parseFloat(item.total_cost) || 0),
                        0,
                      ),
                    0,
                  )
                  .toFixed(2)}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{ textAlign: "center", fontSize: "10px", marginTop: "10px" }}
          >
            <div>آدرس: مرکز تجارتی داوودی منزل B2 دوگان نمبر 105 - 137</div>
            <div style={{ marginTop: "5px" }}>تشکر از همکاری شما</div>
            <div style={{ marginTop: "3px" }}>________________</div>
            <div style={{ fontSize: "9px", marginTop: "3px", color: "#666" }}>
              {new Date().toLocaleDateString()} -{" "}
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillPrintView;
