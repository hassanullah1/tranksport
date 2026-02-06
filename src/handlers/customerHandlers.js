// customerHandlers.js
module.exports = (db) => {
  // Get all customers
  const getCustomers = async () => {
    try {
      const [rows] = await db.query(`
        SELECT 
          c.*,
          p.province_name
        FROM customers c
        LEFT JOIN provinces p ON c.province_id = p.province_id
        ORDER BY c.customer_name
      `);
      return rows;
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
  };

  // Get single customer by ID
  const getCustomer = async (customerId) => {
    try {
      const [rows] = await db.query("SELECT * FROM customers WHERE customer_id = ?", [customerId]);
      return rows[0] || null;
    } catch (error) {
      console.error("Error fetching customer:", error);
      throw error;
    }
  };

  // Add new customer
  const addCustomer = async (customerData) => {
    try {
      const { customer_name, email, phone, address, province_id } = customerData;
      
      const [result] = await db.query(
        "INSERT INTO customers (customer_name, email, phone, address, province_id) VALUES (?, ?, ?, ?, ?)",
        [customer_name, email || null, phone || null, address || null, province_id || null]
      );
      
      return { 
        success: true, 
        customer_id: result.insertId, 
        message: "Customer added successfully!" 
      };
    } catch (error) {
      console.error("Error adding customer:", error);
      throw error;
    }
  };

  // Update customer
  const updateCustomer = async (customerData) => {
    try {
      const { customer_id, customer_name, email, phone, address, province_id } = customerData;
      
      const [result] = await db.query(
        "UPDATE customers SET customer_name = ?, email = ?, phone = ?, address = ?, province_id = ? WHERE customer_id = ?",
        [customer_name, email || null, phone || null, address || null, province_id || null, customer_id]
      );
      
      return { 
        success: true, 
        affectedRows: result.affectedRows,
        message: "Customer updated successfully!" 
      };
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  };

  // Delete customer
  const deleteCustomer = async (customerId) => {
    try {
      // Check if customer has any deliveries
      const [deliveries] = await db.query(
        "SELECT COUNT(*) as count FROM deliveries WHERE customer_id = ?",
        [customerId]
      );
      
      if (deliveries[0].count > 0) {
        throw new Error("Cannot delete customer with existing deliveries.");
      }
      
      const [result] = await db.query(
        "DELETE FROM customers WHERE customer_id = ?",
        [customerId]
      );
      
      return { 
        success: true, 
        affectedRows: result.affectedRows,
        message: "Customer deleted successfully!" 
      };
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw error;
    }
  };

  // Search customers
  const searchCustomers = async (searchTerm) => {
    try {
      const [rows] = await db.query(
        `SELECT 
          c.*,
          p.province_name
        FROM customers c
        LEFT JOIN provinces p ON c.province_id = p.province_id
        WHERE c.customer_name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?
        ORDER BY c.customer_name`,
        [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
      );
      return rows;
    } catch (error) {
      console.error("Error searching customers:", error);
      throw error;
    }
  };

  return {
    getCustomers,
    getCustomer,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers
  };
};