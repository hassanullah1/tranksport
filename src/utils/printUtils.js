// utils/printUtils.js
export const printBill = (bill) => {
  // Create a new window for printing
  const printWindow = window.open("", "_blank");

  // Get the HTML content from the BillPrintView component
  const printContent = document.getElementById("bill-print-content");

  if (!printContent) return;

  // Write the print content to the new window
  printWindow.document.write(`
    <html>
      <head>
        <title>Print Bill</title>
        <style>
          @media print {
            body { margin: 0; padding: 10px; }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  // Print and close the window
  printWindow.print();
  printWindow.close();
};
