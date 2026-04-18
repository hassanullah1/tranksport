const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Add these to your electronAPI object
  getExpenses: (startDate, endDate) =>
    ipcRenderer.invoke("get-expenses", startDate, endDate),
  getExpense: (expenseId) => ipcRenderer.invoke("get-expense", expenseId),
  addExpense: (expenseData) => ipcRenderer.invoke("add-expense", expenseData),
  updateExpense: (expenseData) =>
    ipcRenderer.invoke("update-expense", expenseData),
  deleteExpense: (expenseId) => ipcRenderer.invoke("delete-expense", expenseId),
  searchExpenses: (searchTerm) =>
    ipcRenderer.invoke("search-expenses", searchTerm),
  getExpensesByDateRange: (startDate, endDate) =>
    ipcRenderer.invoke("get-expenses-by-date-range", startDate, endDate),
  getExpenseStats: (startDate, endDate) =>
    ipcRenderer.invoke("get-expense-stats", startDate, endDate),

  // Province Management
  getProvinces: () => ipcRenderer.invoke("get-provinces"),
  getProvince: (provinceId) => ipcRenderer.invoke("get-province", provinceId),
  addProvince: (provinceData) =>
    ipcRenderer.invoke("add-province", provinceData),
  updateProvince: (provinceData) =>
    ipcRenderer.invoke("update-province", provinceData),
  deleteProvince: (provinceId) =>
    ipcRenderer.invoke("delete-province", provinceId),
  searchProvinces: (searchTerm) =>
    ipcRenderer.invoke("search-provinces", searchTerm),
  getProvincesWithStats: () => ipcRenderer.invoke("get-provinces-with-stats"),

  // this agent related
  getAgents: () => ipcRenderer.invoke("get-agents"),

  addAgent: (agentData) => ipcRenderer.invoke("add-agent", agentData),
  updateAgent: (agentData) => ipcRenderer.invoke("update-agent", agentData),
  deleteAgent: (agentId) => ipcRenderer.invoke("delete-agent", agentId),
  searchAgents: (searchTerm) => ipcRenderer.invoke("search-agents", searchTerm),
  getAgentProvinces: (agentId) =>
    ipcRenderer.invoke("get-agent-provinces", agentId),
  getAvailableProvinces: (agentId) =>
    ipcRenderer.invoke("get-available-provinces", agentId),
  assignProvinceToAgent: (data) =>
    ipcRenderer.invoke("assign-province-to-agent", data),
  removeProvinceFromAgent: (data) =>
    ipcRenderer.invoke("remove-province-from-agent", data),
  getTopAgents: (limit) => ipcRenderer.invoke("get-top-agents", limit),

  // Customers Management
  getCustomers: () => ipcRenderer.invoke("get-customers"),
  getCustomer: (customerId) => ipcRenderer.invoke("get-customer", customerId),
  addCustomer: (customerData) =>
    ipcRenderer.invoke("add-customer", customerData),
  updateCustomer: (customerData) =>
    ipcRenderer.invoke("update-customer", customerData),
  deleteCustomer: (customerId) =>
    ipcRenderer.invoke("delete-customer", customerId),
  searchCustomers: (searchTerm) =>
    ipcRenderer.invoke("search-customers", searchTerm),

  // Deliveries/Bills Management
  // updateDeliveryStatus: (deliveryId, newStatus) =>
  //   ipcRenderer.invoke("update-delivery-status", deliveryId, newStatus),

  getAgentDeliveries: (agentId) =>
    ipcRenderer.invoke("get-agent-deliveries", agentId),
  getDeliveries: () => ipcRenderer.invoke("get-deliveries"),
  getDelivery: (deliveryId) => ipcRenderer.invoke("get-delivery", deliveryId),
  addDelivery: (deliveryData) =>
    ipcRenderer.invoke("add-delivery", deliveryData),
  updateDelivery: (deliveryData) =>
    ipcRenderer.invoke("update-delivery", deliveryData),
  deleteDelivery: (deliveryId) =>
    ipcRenderer.invoke("delete-delivery", deliveryId),
  searchDeliveries: (searchTerm) =>
    ipcRenderer.invoke("search-deliveries", searchTerm),

  generateInvoice: (deliveryId) =>
    ipcRenderer.invoke("generate-invoice", deliveryId),
  recordDeliveryReturn: (returnData) =>
    ipcRenderer.invoke("record-delivery-return", returnData),
  updateDeliveryStatus: (deliveryId, newStatus) =>
    ipcRenderer.invoke("update-delivery-status", deliveryId, newStatus),
  getPendingDeliveriesByProvince: (provinceId) =>
    ipcRenderer.invoke("getPendingDeliveriesBy_Province", provinceId),
  assignAgentToDeliveries: (data) =>
    ipcRenderer.invoke("assignAgentTo_Deliveries", data),
  generateBulkInvoices: (deliveryIds) =>
    ipcRenderer.invoke("generateBulk_Invoices", deliveryIds),

  getAssignedDeliveries: () => ipcRenderer.invoke("get-assigned-deliveries"),
  searchAssignedDeliveries: (term, type) =>
    ipcRenderer.invoke("search-assigned-deliveries", term, type),
  getAssignedDeliveryStats: () =>
    ipcRenderer.invoke("get-assigned-delivery-stats"),
  getAgentPerformance: () => ipcRenderer.invoke("get-agent-performance"),
  getDeliveriesByAgent: (agentId) =>
    ipcRenderer.invoke("get-deliveries-by-agent", agentId),
  getAgentBills: () => ipcRenderer.invoke("get-agent-bills"),
  getBillDetails: (billId) => ipcRenderer.invoke("get-bill-details", billId),
  createAgentBill: (billData) =>
    ipcRenderer.invoke("create-agent-bill", billData),
  getUnbilledDeliveriesByAgent: (agentId) =>
    ipcRenderer.invoke("get-unbilled-deliveries-by-agent", agentId),
  searchDeliveriesWithFilters: (params) =>
    ipcRenderer.invoke("search-deliveries-with-filters", params),

  // New functions
  getDeliveryStats: () => ipcRenderer.invoke("get-delivery-stats"),
  getDeliveriesWithFilters: (filters) =>
    ipcRenderer.invoke("get-deliveries-with-filters", filters),

  // Financial
  getFinancialSummary: () => ipcRenderer.invoke("get-financial-summary"),
  getMonthlyFinancials: () => ipcRenderer.invoke("get-monthly-financials"),
  getTopAgents: (limit) => ipcRenderer.invoke("get-top-agents", limit),
  getRecentBills: (limit) => ipcRenderer.invoke("get-recent-bills", limit),
  getRecentPayments: (limit) =>
    ipcRenderer.invoke("get-recent-payments", limit),
  backupDatabase: () => ipcRenderer.invoke("backup-database"),
  restoreDatabase: () => ipcRenderer.invoke("restore-database"),
  getDashboardSummary: (options) =>
    ipcRenderer.invoke("get-dashboard-summary", options),
  addAgentPayment: (paymentData) =>
    ipcRenderer.invoke("add-agent-payment", paymentData),
  getAgentPaymentsByProvince: (provinceId) =>
    ipcRenderer.invoke("get-agent-payments-by-province", provinceId),
  getAgentPaymentsByAgent: (agentId) =>
    ipcRenderer.invoke("get-agent-payments-by-agent", agentId),
  updateAgentPayment: (paymentId, paymentData) =>
    ipcRenderer.invoke("update-agent-payment", paymentId, paymentData),
  deleteAgentPayment: (paymentId) =>
    ipcRenderer.invoke("delete-agent-payment", paymentId),
  getProvinceFinancialSummary: (provinceId) =>
    ipcRenderer.invoke("get-province-financial-summary", provinceId),
  printPage: () => ipcRenderer.send("print-page"),
});