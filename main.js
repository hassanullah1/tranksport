const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const mysql = require("mysql2/promise");

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

const createProvinceHandlers = require("./src/handlers/provinceHandlers");
const createAgentHandlers = require("./src/handlers/agentHandlers");
const createCustomerHandlers = require("./src/handlers/customerHandlers");
const createDeliveryHandlers = require("./src/handlers/deliveryHandlers");


const provinceHandlers = createProvinceHandlers(db);
const agentHandlers = createAgentHandlers(db);
const customerHandlers = createCustomerHandlers(db);
const deliveryHandlers = createDeliveryHandlers(db);
// Test connection
(async () => {
  try {
    const conn = await db.getConnection();
    console.log("Connected to MySQL database.");
    conn.release();
  } catch (err) {
    console.error("MySQL connection error:", err);
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
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "dist", "index.html"));
  }
}

app.whenReady().then(createWindow);

/* ================= IPC HANDLERS ================= */

// Patients
ipcMain.handle("get-patients", async () => {
  const [rows] = await db.query("SELECT * FROM agents");
  return rows;
});

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

ipcMain.handle("get-delivery-stats", async () => {
  return await deliveryHandlers.getDeliveryStats();
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

ipcMain.handle("update-delivery-status", async (event, deliveryId, status) => {
  return await deliveryHandlers.updateDeliveryStatus(deliveryId, status);
});

ipcMain.handle("get-deliveries-by-date-range", async (event, startDate, endDate) => {
  return await deliveryHandlers.getDeliveriesByDateRange(startDate, endDate);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    db.end();
    app.quit();
  }
});