// provinceHandlers.js
module.exports = (db) => {
  // Get all provinces
  const getProvinces = async () => {
    try {
      const [rows] = await db.query("SELECT * FROM provinces ORDER BY province_name");
      return rows;
    } catch (error) {
      console.error("Error fetching provinces:", error);
      throw error;
    }
  };

  // Get single province by ID
  const getProvince = async (provinceId) => {
    try {
      const [rows] = await db.query("SELECT * FROM provinces WHERE province_id = ?", [provinceId]);
      return rows[0] || null;
    } catch (error) {
      console.error("Error fetching province:", error);
      throw error;
    }
  };

  // Add new province
  const addProvince = async (provinceData) => {
    try {
      const { province_name } = provinceData;
      
      // Check if province already exists
      const [existing] = await db.query(
        "SELECT province_id FROM provinces WHERE province_name = ?", 
        [province_name]
      );
      
      if (existing.length > 0) {
        throw new Error("Province already exists!");
      }
      
      // Insert new province
      const [result] = await db.query(
        "INSERT INTO provinces (province_name) VALUES (?)",
        [province_name]
      );
      
      return { 
        success: true, 
        province_id: result.insertId, 
        message: "Province added successfully!" 
      };
    } catch (error) {
      console.error("Error adding province:", error);
      throw error;
    }
  };

  // Update province
  const updateProvince = async (provinceData) => {
    try {
      const { province_id, province_name } = provinceData;
      
      // Check if new name conflicts with another province
      const [existing] = await db.query(
        "SELECT province_id FROM provinces WHERE province_name = ? AND province_id != ?", 
        [province_name, province_id]
      );
      
      if (existing.length > 0) {
        throw new Error("Another province with this name already exists!");
      }
      
      // Update province
      const [result] = await db.query(
        "UPDATE provinces SET province_name = ? WHERE province_id = ?",
        [province_name, province_id]
      );
      
      return { 
        success: true, 
        affectedRows: result.affectedRows,
        message: "Province updated successfully!" 
      };
    } catch (error) {
      console.error("Error updating province:", error);
      throw error;
    }
  };

  // Delete province
  const deleteProvince = async (provinceId) => {
    try {
      // First check if province has any deliveries
      const [deliveries] = await db.query(
        "SELECT COUNT(*) as count FROM deliveries WHERE province_id = ?",
        [provinceId]
      );
      
      if (deliveries[0].count > 0) {
        throw new Error("Cannot delete province with existing deliveries. Please reassign or delete deliveries first.");
      }
      
      // Check if province has any agents assigned
      const [agents] = await db.query(
        "SELECT COUNT(*) as count FROM agents WHERE province_id = ?",
        [provinceId]
      );
      
      if (agents[0].count > 0) {
        throw new Error("Cannot delete province with assigned agents. Please reassign agents first.");
      }
      
      // Check if province has any customers
      const [customers] = await db.query(
        "SELECT COUNT(*) as count FROM customers WHERE province_id = ?",
        [provinceId]
      );
      
      if (customers[0].count > 0) {
        throw new Error("Cannot delete province with customers. Please reassign customers first.");
      }
      
      // Delete province
      const [result] = await db.query(
        "DELETE FROM provinces WHERE province_id = ?",
        [provinceId]
      );
      
      return { 
        success: true, 
        affectedRows: result.affectedRows,
        message: "Province deleted successfully!" 
      };
    } catch (error) {
      console.error("Error deleting province:", error);
      throw error;
    }
  };

  // Search provinces
  const searchProvinces = async (searchTerm) => {
    try {
      const [rows] = await db.query(
        "SELECT * FROM provinces WHERE province_name LIKE ? ORDER BY province_name",
        [`%${searchTerm}%`]
      );
      return rows;
    } catch (error) {
      console.error("Error searching provinces:", error);
      throw error;
    }
  };

  // Get provinces with delivery count and statistics
  const getProvincesWithStats = async () => {
    try {
      const [rows] = await db.query(`
        SELECT 
          p.*,
          COUNT(DISTINCT d.delivery_id) as total_deliveries,
          COALESCE(SUM(di.quantity), 0) as total_items,
          COALESCE(SUM(di.total_cost), 0) as total_item_costs,
          COALESCE(SUM(d.commission_amount), 0) as total_commissions,
          COALESCE(SUM(di.selling_price * di.quantity), 0) as total_revenue,
          COALESCE(SUM(di.selling_price * di.quantity) - SUM(di.total_cost) - SUM(d.commission_amount), 0) as total_profit,
          COUNT(DISTINCT a.agent_id) as total_agents,
          COUNT(DISTINCT c.customer_id) as total_customers,
          COUNT(DISTINCT CASE WHEN d.status = 'delivered' THEN d.delivery_id END) as delivered_deliveries,
          COUNT(DISTINCT CASE WHEN d.status = 'pending' THEN d.delivery_id END) as pending_deliveries
        FROM provinces p
        LEFT JOIN deliveries d ON p.province_id = d.province_id
        LEFT JOIN delivery_items di ON d.delivery_id = di.delivery_id
        LEFT JOIN agents a ON p.province_id = a.province_id
        LEFT JOIN customers c ON p.province_id = c.province_id
        GROUP BY p.province_id
        ORDER BY p.province_name
      `);
      return rows;
    } catch (error) {
      console.error("Error fetching provinces with stats:", error);
      throw error;
    }
  };

  // Get province performance report
  const getProvincePerformanceReport = async () => {
    try {
      const [rows] = await db.query(`
        SELECT 
          p.province_id,
          p.province_name,
          COUNT(DISTINCT d.delivery_id) as total_deliveries,
          COALESCE(SUM(di.quantity), 0) as total_items,
          COALESCE(SUM(di.total_cost), 0) as total_costs,
          COALESCE(SUM(di.selling_price * di.quantity), 0) as total_revenue,
          COALESCE(SUM(d.commission_amount), 0) as total_commissions,
          COALESCE(SUM(di.selling_price * di.quantity) - SUM(di.total_cost) - SUM(d.commission_amount), 0) as total_profit,
          COUNT(DISTINCT a.agent_id) as agents_count,
          COUNT(DISTINCT c.customer_id) as customers_count,
          ROUND(COALESCE(SUM(di.selling_price * di.quantity) / NULLIF(COUNT(DISTINCT d.delivery_id), 0), 0), 2) as avg_revenue_per_delivery
        FROM provinces p
        LEFT JOIN deliveries d ON p.province_id = d.province_id
        LEFT JOIN delivery_items di ON d.delivery_id = di.delivery_id
        LEFT JOIN agents a ON p.province_id = a.province_id
        LEFT JOIN customers c ON p.province_id = c.province_id
        GROUP BY p.province_id, p.province_name
        ORDER BY total_revenue DESC
      `);
      return rows;
    } catch (error) {
      console.error("Error fetching province performance report:", error);
      throw error;
    }
  };

  // Get provinces with available agents (for delivery assignment)
  const getProvincesWithAgents = async () => {
    try {
      const [rows] = await db.query(`
        SELECT 
          p.*,
          COUNT(a.agent_id) as available_agents_count,
          GROUP_CONCAT(a.agent_name ORDER BY a.agent_name SEPARATOR ', ') as available_agents
        FROM provinces p
        LEFT JOIN agents a ON p.province_id = a.province_id
        GROUP BY p.province_id
        HAVING available_agents_count > 0
        ORDER BY p.province_name
      `);
      return rows;
    } catch (error) {
      console.error("Error fetching provinces with agents:", error);
      throw error;
    }
  };

  // Get province analytics (for dashboard)
  const getProvinceAnalytics = async () => {
    try {
      const [rows] = await db.query(`
        SELECT 
          p.province_name,
          COUNT(DISTINCT d.delivery_id) as deliveries_count,
          COUNT(DISTINCT a.agent_id) as agents_count,
          COUNT(DISTINCT c.customer_id) as customers_count,
          COALESCE(SUM(di.quantity), 0) as items_count,
          COALESCE(SUM(di.selling_price * di.quantity), 0) as revenue,
          ROUND(COALESCE(SUM(di.selling_price * di.quantity) / NULLIF(COUNT(DISTINCT d.delivery_id), 0), 0), 2) as avg_order_value
        FROM provinces p
        LEFT JOIN deliveries d ON p.province_id = d.province_id
        LEFT JOIN delivery_items di ON d.delivery_id = di.delivery_id
        LEFT JOIN agents a ON p.province_id = a.province_id
        LEFT JOIN customers c ON p.province_id = c.province_id
        GROUP BY p.province_id, p.province_name
        ORDER BY revenue DESC
      `);
      return rows;
    } catch (error) {
      console.error("Error fetching province analytics:", error);
      throw error;
    }
  };

  // Get province details with all related data
  const getProvinceDetails = async (provinceId) => {
    try {
      const connection = await db.getConnection();
      
      try {
        // Get province basic info
        const [provinceRows] = await connection.query(
          "SELECT * FROM provinces WHERE province_id = ?",
          [provinceId]
        );
        
        if (provinceRows.length === 0) {
          return null;
        }
        
        const province = provinceRows[0];
        
        // Get agents in this province
        const [agentRows] = await connection.query(
          "SELECT agent_id, agent_name, phone FROM agents WHERE province_id = ? ORDER BY agent_name",
          [provinceId]
        );
        
        // Get customers in this province
        const [customerRows] = await connection.query(
          "SELECT customer_id, customer_name, email, phone, address FROM customers WHERE province_id = ? ORDER BY customer_name",
          [provinceId]
        );
        
        // Get deliveries statistics
        const [deliveryStats] = await connection.query(`
          SELECT 
            COUNT(*) as total_deliveries,
            COALESCE(SUM(di.quantity), 0) as total_items,
            COALESCE(SUM(di.total_cost), 0) as total_costs,
            COALESCE(SUM(d.commission_amount), 0) as total_commissions,
            COALESCE(SUM(di.selling_price * di.quantity), 0) as total_revenue,
            COALESCE(SUM(di.selling_price * di.quantity) - SUM(di.total_cost) - SUM(d.commission_amount), 0) as total_profit,
            COUNT(CASE WHEN d.status = 'pending' THEN 1 END) as pending_deliveries,
            COUNT(CASE WHEN d.status = 'in_transit' THEN 1 END) as in_transit_deliveries,
            COUNT(CASE WHEN d.status = 'delivered' THEN 1 END) as delivered_deliveries,
            COUNT(CASE WHEN d.status = 'cancelled' THEN 1 END) as cancelled_deliveries
          FROM deliveries d
          LEFT JOIN delivery_items di ON d.delivery_id = di.delivery_id
          WHERE d.province_id = ?
        `, [provinceId]);
        
        province.agents = agentRows;
        province.customers = customerRows;
        province.stats = deliveryStats[0] || {};
        
        return province;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error("Error fetching province details:", error);
      throw error;
    }
  };

  return {
    getProvinces,
    getProvince,
    addProvince,
    updateProvince,
    deleteProvince,
    searchProvinces,
    getProvincesWithStats,
    getProvincePerformanceReport,
    getProvincesWithAgents,
    getProvinceAnalytics,
    getProvinceDetails
  };
};