const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const mysql = require("mysql2/promise");
const { dialog } = require("electron");
const fs = require("fs/promises");

const isDev = process.env.VITE_DEV === "true";

// 🔹 MySQL connection pool
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",          // put your MySQL password
  database: "transport",    // your database name
  waitForConnections: true,
  connectionLimit: 10,
});
const createdashboardHandlers = require("./src/handlers/dashboardHandlers");
const createBackupHandlers = require("./src/handlers/backupHandlers");
const createProvinceHandlers = require("./src/handlers/provinceHandlers");
const createAgentHandlers = require("./src/handlers/agentHandlers");
const createCustomerHandlers = require("./src/handlers/customerHandlers");
const createDeliveryHandlers = require("./src/handlers/deliveryHandlers");
// Import the financial handlers
const createfinancialHandlers = require('./src/handlers/financialHandlers');
const createExpenseHandlers = require("./src/handlers/expenseHandlers");

// After creating other handlers
const expenseHandlers = createExpenseHandlers(db);
const provinceHandlers = createProvinceHandlers(db);
const dashboardHandlers = createdashboardHandlers(db);
const agentHandlers = createAgentHandlers(db);
const customerHandlers = createCustomerHandlers(db);
const deliveryHandlers = createDeliveryHandlers(db);
const financialHandlers = createfinancialHandlers(db);
const backupHandlers = createBackupHandlers(db);





// Test connection and show error if it fails
(async () => {
  try {
    const conn = await db.getConnection();
    log.info("MySQL connected");
    conn.release();
  } catch (err) {
    log.error("MySQL connection error:", err);
    dialog.showErrorBox(
      "Database Error",
      `Failed to connect to MySQL.\n\nMake sure MySQL is running and credentials are correct.\n\n${err.message}`,
    );
    app.quit(); // optionally quit if DB is essential
  }
})();

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

 if (isDev) {
   win.loadURL("http://localhost:5173");
  //  win.webContents.openDevTools();
 } else {
   const indexPath = path.join(__dirname, "dist", "index.html");
   console.log("Loading:", indexPath);
   win.loadFile(indexPath);
  //  win.webContents.openDevTools(); // keep for now (debug)
 }
}

app.whenReady().then(createWindow);




// Patients
ipcMain.handle("get-patients", async () => {
  const [rows] = await db.query("SELECT * FROM agents");
  return rows;
});
ipcMain.handle("get-dashboard-summary", (event, options) =>  dashboardHandlers.getDashboardSummary(options));

ipcMain.handle("get-provinces", () => provinceHandlers.getProvinces());
ipcMain.handle("get-province", (event, provinceId) => provinceHandlers.getProvince(provinceId));
ipcMain.handle("add-province", (event, provinceData) => provinceHandlers.addProvince(provinceData));
ipcMain.handle("update-province", (event, provinceData) => provinceHandlers.updateProvince(provinceData));
ipcMain.handle("delete-province", (event, provinceId) => provinceHandlers.deleteProvince(provinceId));
ipcMain.handle("search-provinces", (event, searchTerm) => provinceHandlers.searchProvinces(searchTerm));
ipcMain.handle("get-provinces-with-stats", () => provinceHandlers.getProvincesWithStats());
// this agent 
ipcMain.handle("get-agents", () => agentHandlers.getAgents());

ipcMain.handle("add-agent", (event, agentData) => agentHandlers.addAgent(agentData));
ipcMain.handle("update-agent", (event, agentData) => agentHandlers.updateAgent(agentData));
ipcMain.handle("delete-agent", (event, agentId) => agentHandlers.deleteAgent(agentId));
ipcMain.handle("search-agents", (event, searchTerm) => agentHandlers.searchAgents(searchTerm));

ipcMain.handle("get-available-provinces", (event, agentId) => agentHandlers.getAvailableProvinces(agentId));
ipcMain.handle("assign-province-to-agent", (event, assignmentData) => agentHandlers.assignProvinceToAgent(assignmentData));
ipcMain.handle("remove-province-from-agent", (event, assignmentData) => agentHandlers.removeProvinceFromAgent(assignmentData));

ipcMain.handle("get-agents-with-province-count", () => agentHandlers.getAgentsWithProvinceCount());
ipcMain.handle("bulk-assign-provinces", (event, bulkData) => agentHandlers.bulkAssignProvinces(bulkData));






// Customer Handlers
ipcMain.handle("get-customers", async () => {
  return await customerHandlers.getCustomers();
});

ipcMain.handle("get-customer", async (event, customerId) => {
  return await customerHandlers.getCustomer(customerId);
});

ipcMain.handle("add-customer", async (event, customerData) => {
  return await customerHandlers.addCustomer(customerData);
});

ipcMain.handle("update-customer", async (event, customerData) => {
  return await customerHandlers.updateCustomer(customerData);
});

ipcMain.handle("delete-customer", async (event, customerId) => {
  return await customerHandlers.deleteCustomer(customerId);
});

ipcMain.handle("search-customers", async (event, searchTerm) => {
  return await customerHandlers.searchCustomers(searchTerm);
});

// Delivery Handlers
ipcMain.handle("get-deliveries", async () => {
  return await deliveryHandlers.getDeliveries();
});
// In your main process file, add:
ipcMain.handle('get-agent-deliveries', async (event, agentId) => {
  try {
    return await deliveryHandlers.getDeliveriesByAgent(agentId);
  } catch (error) {
    console.error('Error getting agent deliveries:', error);
    throw error;
  }
});

ipcMain.handle("get-delivery", async (event, deliveryId) => {
  return await deliveryHandlers.getDelivery(deliveryId);
});

ipcMain.handle("add-delivery", async (event, deliveryData) => {
  return await deliveryHandlers.addDelivery(deliveryData);
});






ipcMain.handle("update-delivery", async (event, deliveryData) => {
  return await deliveryHandlers.updateDelivery(deliveryData);
});

ipcMain.handle("delete-delivery", async (event, deliveryId) => {
  return await deliveryHandlers.deleteDelivery(deliveryId);
});

ipcMain.handle("search-deliveries", async (event, searchTerm) => {
  return await deliveryHandlers.searchDeliveries(searchTerm);
});


ipcMain.handle("get-delivery-stats", deliveryHandlers.getDeliveryStats);
ipcMain.handle("search-deliveries-with-filters", async (event, searchTerm) => {
  return await deliveryHandlers.searchDeliveriesWithFilters(searchTerm);
});
ipcMain.handle("get-deliveries-with-filters", async (event, filters) => {
  return await deliveryHandlers.getDeliveriesWithFilters(filters);
});




ipcMain.handle("generate-invoice", async (event, deliveryId) => {
  const delivery = await deliveryHandlers.getInvoiceDetails(deliveryId);
  return {
    success: true,
    delivery,
    message: "Invoice generated successfully!",
    timestamp: new Date().toISOString()
  };
});

ipcMain.handle("get-delivery-items", async (event, deliveryId) => {
  return await deliveryHandlers.getDeliveryItems(deliveryId);
});

ipcMain.handle("record-delivery-return", async (event, returnData) => {
    return await deliveryHandlers.recordDeliveryReturn(returnData);
});



ipcMain.handle("update-delivery-status", async (event, deliveryId, status) => {
  return await deliveryHandlers.updateDeliveryStatus(deliveryId, status);
});


ipcMain.handle("getPendingDeliveriesBy_Province", async (event,provinceId) => {
  return await deliveryHandlers.getPendingDeliveriesByProvince(provinceId);
});


ipcMain.handle("get-deliveries-by-date-range", async (event, startDate, endDate) => {
  return await deliveryHandlers.getDeliveriesByDateRange(startDate, endDate);
});
ipcMain.handle('assignAgentTo_Deliveries', async (event, data) => {
  return await deliveryHandlers.assignAgentToDeliveries(data);
});
ipcMain.handle('generateBulk_Invoices', async (event, deliveryIds) => {
  return await deliveryHandlers.generateBulkInvoices(deliveryIds);
});
ipcMain.handle('get-assigned-deliveries', async () => {
  return await deliveryHandlers.getAssignedDeliveries();
});

ipcMain.handle('search-assigned-deliveries', async (event, searchTerm, searchType) => {
  return await deliveryHandlers.searchAssignedDeliveries(searchTerm, searchType);
});

ipcMain.handle('get-assigned-delivery-stats', async () => {  // optional
  return await deliveryHandlers.getAssignedDeliveryStats();
});
 ipcMain.handle('get-agent-performance', async () => {
  return await deliveryHandlers.getAgentPerformanceReport();
});

ipcMain.handle('get-deliveries-by-agent', async (event, agentId) => {
  return await deliveryHandlers.getDeliveriesByAgent(agentId);
});
ipcMain.handle('get-agent-bills', async () => {
  return await deliveryHandlers.getAgentBills();
});

ipcMain.handle('get-bill-details', async (event, billId) => {
  return await deliveryHandlers.getBillDetails(billId);
});

ipcMain.handle('create-agent-bill', async (event, billData) => {
  return await deliveryHandlers.createAgentBill(billData);
});

ipcMain.handle('get-unbilled-deliveries-by-agent', async (event, agentId) => {
  return await deliveryHandlers.getUnbilledDeliveriesByAgent(agentId);
});









// Register IPC handlers
ipcMain.handle('get-financial-summary', async () => {
  return await financialHandlers.getFinancialSummary();
});

ipcMain.handle('get-monthly-financials', async () => {
  return await financialHandlers.getMonthlyFinancials();
});

ipcMain.handle('get-top-agents', async (event, limit) => {
  return await financialHandlers.getTopAgents(limit);
});

ipcMain.handle('get-recent-bills', async (event, limit) => {
  return await financialHandlers.getRecentBills(limit);
});

ipcMain.handle('get-recent-payments', async (event, limit) => {
  return await financialHandlers.getRecentPayments(limit);
});
ipcMain.handle("backup-database", async (event) => {
  return await backupHandlers.backupDatabase();
});

ipcMain.handle("restore-database", async (event) => {
  return await backupHandlers.restoreDatabase();
});










/// this is for expense 
ipcMain.handle("get-expenses", async (event, startDate, endDate) => {
  return await expenseHandlers.getExpenses(startDate, endDate);
});

ipcMain.handle("get-expense", async (event, expenseId) => {
  return await expenseHandlers.getExpense(expenseId);
});

ipcMain.handle("add-expense", async (event, expenseData) => {
  return await expenseHandlers.addExpense(expenseData);
});

ipcMain.handle("update-expense", async (event, expenseData) => {
  return await expenseHandlers.updateExpense(expenseData);
});

ipcMain.handle("delete-expense", async (event, expenseId) => {
  return await expenseHandlers.deleteExpense(expenseId);
});

ipcMain.handle("search-expenses", async (event, searchTerm) => {
  return await expenseHandlers.searchExpenses(searchTerm);
});

ipcMain.handle(
  "get-expenses-by-date-range",
  async (event, startDate, endDate) => {
    return await expenseHandlers.getExpensesByDateRange(startDate, endDate);
  },
);

ipcMain.handle("get-expense-stats", async (event, startDate, endDate) => {
  return await expenseHandlers.getExpenseStats(startDate, endDate);
});


// Agent payments
ipcMain.handle('add-agent-payment', async (event, paymentData) => {
  return await provinceHandlers.addAgentPayment(paymentData);
});
ipcMain.handle('get-agent-payments-by-province', async (event, provinceId) => {
  return await provinceHandlers.getAgentPaymentsByProvince(provinceId);
});
ipcMain.handle('get-agent-payments-by-agent', async (event, agentId) => {
  return await provinceHandlers.getAgentPaymentsByAgent(agentId);
});
ipcMain.handle('update-agent-payment', async (event, paymentId, paymentData) => {
  return await provinceHandlers.updateAgentPayment(paymentId, paymentData);
});
ipcMain.handle('delete-agent-payment', async (event, paymentId) => {
  return await provinceHandlers.deleteAgentPayment(paymentId);
});
ipcMain.handle('get-province-financial-summary', async (event, provinceId) => {
  return await provinceHandlers.getProvinceFinancialSummary(provinceId);
});


// ipcMain.on("print-page", (event) => {
//   const win = BrowserWindow.getFocusedWindow();
//   win.webContents.print({
//     silent: false,
//     printBackground: true,
//   });
// });

ipcMain.on("print-page", (event) => {
  console.log("Print-page IPC received");
  const win = BrowserWindow.getFocusedWindow();
  if (!win) {
    console.error("No focused window");
    return;
  }
  try {
   
    win.webContents.print(
      { silent: false, printBackground: true },
      (success, errorType) => {
        if (!success) {
          console.error("Print failed:", errorType);
        } else {
          console.log("Print initiated successfully");
        }
      },
    );
  } catch (err) {
    console.error("Exception in print:", err);
  }
});


app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    db.end();
    app.quit();
  }
});