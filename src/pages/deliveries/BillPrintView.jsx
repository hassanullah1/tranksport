import React from "react";

const BillPrintView = ({ bill, language, isRTL, t }) => {



  if (!bill) return null;

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        lineHeight: "1.5",
        width: "100%", // Fill the parent container exactly
        margin: 0,
        padding: 0,
        direction: "rtl",
        textAlign: "right",
      }}
    >
      {/* Header */}
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
          {"    ("+bill.province_name+")   "}  | <span dir="ltr">☎ (+93) {bill.phone}</span>
        </div>
      </div>

      {/* Customer Info */}
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
          <span style={{ fontWeight: "bold" }}>مشتری:</span>{" "}
          {bill?.deliveries[0]?.customer_name || "—"}
        </div>
        <div>
          <span style={{ fontWeight: "bold" }}>شماره:</span>{" "}
          {bill?.deliveries[0]?.customer_phone || "—"}
        </div>
      </div>

      {/* Bill Info */}
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
          <span style={{ fontWeight: "bold" }}>تاریخ:</span>{" "}
          {new Date(bill.bill_date).toLocaleDateString()}
        </div>
        <div>
          <span style={{ fontWeight: "bold" }}>بل نمبر:</span> {bill.bill_id}
        </div>
      </div>

      {/* Table – use table-layout: fixed for consistent column widths */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "8px",
          fontSize: "11px",
          border: "1px solid #000",
          tableLayout: "fixed", // Prevent column overflow
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th
              style={{
                border: "1px solid #000",
                padding: "4px 2px",
                width: "35%",
              }}
            >
              توکی
            </th>
            <th
              style={{
                border: "1px solid #000",
                padding: "4px 2px",
                width: "15%",
              }}
            >
              تعداد
            </th>
            <th
              style={{
                border: "1px solid #000",
                padding: "4px 2px",
                width: "20%",
              }}
            >
              قیمت
            </th>
            <th style={{ width: "20%" }}>انتقال {/* or */} </th>
            <th
              style={{
                border: "1px solid #000",
                padding: "4px 2px",
                width: "30%",
              }}
            >
              مجموعه
            </th>
          </tr>
        </thead>
        <tbody>
          {bill?.deliveries?.map((delivery) =>
            delivery.items.map((item, index) => (
              <tr
                key={`${delivery.delivery_id}-${item.item_id || item.id || index}`}
              >
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px 2px",
                    wordBreak: "break-word",
                  }}
                >
                  {item.item_name}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px 2px",
                    textAlign: "center",
                  }}
                >
                  {item.quantity || "0"}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px 2px",
                    textAlign: "center",
                  }}
                >
                  {item.unit_cost || "0"}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "2px 1px",
                    textAlign: "center",
                  }}
                >
                  {(
                    parseFloat(item.fess || 0) +
                    parseFloat(item.commission || 0)
                  ).toFixed(0)}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "2px 1px",
                    textAlign: "center",
                  }}
                >
                  {(
                    parseInt(item.quantity || 1) *
                    (parseFloat(item.unit_cost || 0) +
                      parseFloat(item.fess || 0) +
                      parseFloat(item.commission || 0))
                  ).toFixed(2)}
                </td>
              </tr>
            )),
          )}
        </tbody>
      </table>

      {/* Total */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontWeight: "bold",
          borderTop: "1px dashed #000",
          borderBottom: "1px dashed #000",
          padding: "5px 0",
          marginBottom: "8px",
        }}
      >
        <span>مجموعه کل:</span>
        <span>
          {bill?.deliveries
            ?.reduce(
              (sum, d) =>
                sum +
                d.items.reduce(
                  (itemSum, item) =>
                    itemSum +
                    parseInt(item.quantity || 1) *
                      (parseFloat(item.unit_cost || 0) +
                        parseFloat(item.fess || 0) +
                        parseFloat(item.commission || 0)),
                  0,
                ),
              0,
            )
            .toFixed(2)}
        </span>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", fontSize: "10px", marginTop: "10px" }}>
        <div>آدرس: مرکز تجارتی داوودی منزل B2 دوگان نمبر 105 - 137</div>
        <div style={{ marginTop: "5px" }}>تشکر از همکاری شما</div>
        <div style={{ marginTop: "1px" }}>________________</div>
      </div>
    </div>
  );
};

export default BillPrintView;
