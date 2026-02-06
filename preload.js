const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Province Management
  getProvinces: () => ipcRenderer.invoke("get-provinces"),
  getProvince: (provinceId) => ipcRenderer.invoke("get-province", provinceId),
  addProvince: (provinceData) => ipcRenderer.invoke("add-province", provinceData),
  updateProvince: (provinceData) => ipcRenderer.invoke("update-province", provinceData),
  deleteProvince: (provinceId) => ipcRenderer.invoke("delete-province", provinceId),
  searchProvinces: (searchTerm) => ipcRenderer.invoke("search-provinces", searchTerm),
  getProvincesWithStats: () => ipcRenderer.invoke("get-provinces-with-stats"),

  // this agent related
  getAgents: () => ipcRenderer.invoke("get-agents"),
  getAgent: (agentId) => ipcRenderer.invoke("get-agent", agentId),
  addAgent: (agentData) => ipcRenderer.invoke("add-agent", agentData),
  updateAgent: (agentData) => ipcRenderer.invoke("update-agent", agentData),
  deleteAgent: (agentId) => ipcRenderer.invoke("delete-agent", agentId),
  searchAgents: (searchTerm) => ipcRenderer.invoke("search-agents", searchTerm),
  getAgentProvinces: (agentId) => ipcRenderer.invoke("get-agent-provinces", agentId),
  getAvailableProvinces: (agentId) => ipcRenderer.invoke("get-available-provinces", agentId),
  assignProvinceToAgent: (data) => ipcRenderer.invoke("assign-province-to-agent", data),
  removeProvinceFromAgent: (data) => ipcRenderer.invoke("remove-province-from-agent", data),
  getTopAgents: (limit) => ipcRenderer.invoke("get-top-agents", limit),


  // Customers Management
  getCustomers: () => ipcRenderer.invoke("get-customers"),
  getCustomer: (customerId) => ipcRenderer.invoke("get-customer", customerId),
  addCustomer: (customerData) => ipcRenderer.invoke("add-customer", customerData),
  updateCustomer: (customerData) => ipcRenderer.invoke("update-customer", customerData),
  deleteCustomer: (customerId) => ipcRenderer.invoke("delete-customer", customerId),
  searchCustomers: (searchTerm) => ipcRenderer.invoke("search-customers", searchTerm),
  
  // Deliveries/Bills Management
  getDeliveries: () => ipcRenderer.invoke("get-deliveries"),
  getDelivery: (deliveryId) => ipcRenderer.invoke("get-delivery", deliveryId),
  addDelivery: (deliveryData) => ipcRenderer.invoke("add-delivery", deliveryData),
  updateDelivery: (deliveryData) => ipcRenderer.invoke("update-delivery", deliveryData),
  deleteDelivery: (deliveryId) => ipcRenderer.invoke("delete-delivery", deliveryId),
  searchDeliveries: (searchTerm) => ipcRenderer.invoke("search-deliveries", searchTerm),
  getDeliveryStats: () => ipcRenderer.invoke("get-delivery-stats"),
  generateInvoice: (deliveryId) => ipcRenderer.invoke("generate-invoice", deliveryId),
  
});