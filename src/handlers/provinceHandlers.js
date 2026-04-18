// provinceHandlers.js
const { ipcMain, dialog } = require("electron");
const fs = require("fs/promises");
const path = require("path");
module.exports = (db) => {
  // Get all provinces
 const getProvinces = async () => {
   try {
     const [rows] = await db.query(`
      SELECT 
        p.province_id,
        p.province_name,
        a.phone
      FROM provinces p
      LEFT JOIN agents a 
        ON p.province_id = a.province_id
      ORDER BY p.province_name
    `);

     return rows;
   } catch (error) {
     console.error("Error fetching provinces:", error);
     throw error;
   }
 };

  // Get single province by ID
  const getProvince = async (provinceId) => {
    try {
      const [rows] = await db.query(
        "SELECT * FROM provinces WHERE province_id = ?",
        [provinceId],
      );
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
        [province_name],
      );

      if (existing.length > 0) {
        throw new Error("Province already exists!");
      }

      // Insert new province
      const [result] = await db.query(
        "INSERT INTO provinces (province_name) VALUES (?)",
        [province_name],
      );

      return {
        success: true,
        province_id: result.insertId,
        message: "Province added successfully!",
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
        [province_name, province_id],
      );

      if (existing.length > 0) {
        throw new Error("Another province with this name already exists!");
      }

      // Update province
      const [result] = await db.query(
        "UPDATE provinces SET province_name = ? WHERE province_id = ?",
        [province_name, province_id],
      );

      return {
        success: true,
        affectedRows: result.affectedRows,
        message: "Province updated successfully!",
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
        [provinceId],
      );

      if (deliveries[0].count > 0) {
        throw new Error(
          "Cannot delete province with existing deliveries. Please reassign or delete deliveries first.",
        );
      }

      // Check if province has any agents assigned
      const [agents] = await db.query(
        "SELECT COUNT(*) as count FROM agents WHERE province_id = ?",
        [provinceId],
      );

      if (agents[0].count > 0) {
        throw new Error(
          "Cannot delete province with assigned agents. Please reassign agents first.",
        );
      }

      // Check if province has any customers
      const [customers] = await db.query(
        "SELECT COUNT(*) as count FROM customers WHERE province_id = ?",
        [provinceId],
      );

      if (customers[0].count > 0) {
        throw new Error(
          "Cannot delete province with customers. Please reassign customers first.",
        );
      }

      // Delete province
      const [result] = await db.query(
        "DELETE FROM provinces WHERE province_id = ?",
        [provinceId],
      );

      return {
        success: true,
        affectedRows: result.affectedRows,
        message: "Province deleted successfully!",
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
        [`%${searchTerm}%`],
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
         
          COALESCE(SUM(d.commission_amount), 0) as total_commissions,
        
          COUNT(DISTINCT a.agent_id) as agents_count,
          COUNT(DISTINCT c.customer_id) as customers_count
        
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
          COALESCE(SUM(di.quantity), 0) as items_count
         
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
          [provinceId],
        );

        if (provinceRows.length === 0) {
          return null;
        }

        const province = provinceRows[0];

        // Get agents in this province
        const [agentRows] = await connection.query(
          "SELECT agent_id, agent_name, phone FROM agents WHERE province_id = ? ORDER BY agent_name",
          [provinceId],
        );

        // Get customers in this province
        const [customerRows] = await connection.query(
          "SELECT customer_id, customer_name, email, phone, address FROM customers WHERE province_id = ? ORDER BY customer_name",
          [provinceId],
        );

        // Get deliveries statistics
        const [deliveryStats] = await connection.query(
          `
          SELECT 
            COUNT(*) as total_deliveries,
            COALESCE(SUM(di.quantity), 0) as total_items,
            COALESCE(SUM(di.total_cost), 0) as total_costs,
            COALESCE(SUM(d.commission_amount), 0) as total_commissions,
           
            COUNT(CASE WHEN d.status = 'pending' THEN 1 END) as pending_deliveries,
            COUNT(CASE WHEN d.status = 'in_transit' THEN 1 END) as in_transit_deliveries,
            COUNT(CASE WHEN d.status = 'delivered' THEN 1 END) as delivered_deliveries,
            COUNT(CASE WHEN d.status = 'cancelled' THEN 1 END) as cancelled_deliveries
          FROM deliveries d
          LEFT JOIN delivery_items di ON d.delivery_id = di.delivery_id
          WHERE d.province_id = ?
        `,
          [provinceId],
        );

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
  const addAgentPayment = async (paymentData) => {
    try {
      const { province_id, amount, payment_date, notes } = paymentData;

      // Get the agent for this province
      const [agentRows] = await db.query(
        "SELECT agent_id FROM agents WHERE province_id = ? LIMIT 1",
        [province_id],
      );

      if (agentRows.length === 0) {
        throw new Error("No agent found for this province");
      }

      const agent_id = agentRows[0].agent_id;

      const [result] = await db.query(
        `INSERT INTO agent_payments (agent_id, payment_amount, payment_date, notes)
       VALUES (?, ?, ?, ?)`,
        [agent_id, amount, payment_date, notes],
      );

      return {
        success: true,
        payment_id: result.insertId,
        message: "Payment recorded successfully",
      };
    } catch (error) {
      console.error("Error adding agent payment:", error);
      throw error;
    }
  };

  // Get payments by province (simplified)
  const getAgentPaymentsByProvince = async (provinceId) => {
    try {
      const [rows] = await db.query(
        `
      SELECT 
        payment_id,
        payment_amount,
        payment_date,
        notes,
        created_at
      FROM agent_payments
      WHERE agent_id = ?
      ORDER BY payment_date DESC, created_at DESC
    `,
        [agent_id],
      );
      return rows;
    } catch (error) {
      console.error("Error fetching payments by province:", error);
      throw error;
    }
  };
  // Get payments for a specific agent
  const getAgentPaymentsByAgent = async (agentId) => {
    try {
      const [rows] = await db.query(
        `
      SELECT * FROM agent_payments
      WHERE agent_id = ?
      ORDER BY payment_date DESC
    `,
        [agentId],
      );
      return rows;
    } catch (error) {
      console.error("Error fetching payments by agent:", error);
      throw error;
    }
  };

  // Update a payment (optional)
  const updateAgentPayment = async (paymentId, paymentData) => {
    try {
      const { amount, payment_date, notes } = paymentData;
      const [result] = await db.query(
        `UPDATE agent_payments
       SET payment_amount = ?, payment_date = ?, notes = ?
       WHERE payment_id = ?`,
        [amount, payment_date, notes, paymentId],
      );
      return {
        success: true,
        affectedRows: result.affectedRows,
        message: "Payment updated",
      };
    } catch (error) {
      console.error("Error updating payment:", error);
      throw error;
    }
  };

  // Delete a payment
  const deleteAgentPayment = async (paymentId) => {
    try {
      const [result] = await db.query(
        "DELETE FROM agent_payments WHERE payment_id = ?",
        [paymentId],
      );
      return {
        success: true,
        affectedRows: result.affectedRows,
        message: "Payment deleted",
      };
    } catch (error) {
      console.error("Error deleting payment:", error);
      throw error;
    }
  };

  // ==================== FINANCIAL SUMMARY ====================

  // Get financial summary for a province (overall and per agent)
  // Get financial summary for a province (overall and per agent)
  const getProvinceFinancialSummary = async (provinceId) => {
    try {
      // Get province and agent info
      const [provinceInfo] = await db.query(
        `
      SELECT 
        p.*,
        a.agent_id,
        a.agent_name,
        a.phone as agent_phone
      FROM provinces p
      LEFT JOIN agents a ON p.province_id = a.province_id
      WHERE p.province_id = ?
    `,
        [provinceId],
      );

      if (provinceInfo.length === 0) {
        return null;
      }

      // 1. Get delivery financial summary including customer amounts and fees
      const [financialRows] = await db.query(
        `
  SELECT 
    COALESCE(SUM(di.total_cost), 0) as total_customer_amount,
    
    COALESCE(SUM(
      CASE 
        WHEN d.status = 'delivered' 
        THEN di.commission_amount 
        ELSE 0 
      END
    ), 0) as total_commission,

    COALESCE(SUM(di.fess), 0) as total_free_amount,

    COALESCE(SUM(di.total_cost - di.commission_amount - di.fess), 0) as total_base_amount

  FROM delivery_items di
  JOIN deliveries d ON di.delivery_id = d.delivery_id
  WHERE d.province_id = ?
  `,
        [provinceId],
      );

      const totalCustomerAmount = financialRows[0].total_customer_amount;
      const totalCommission = financialRows[0].total_commission;
      const totalFreeAmount = financialRows[0].total_free_amount;
      const totalBaseAmount = financialRows[0].total_base_amount;
      const [agentRows] = await db.query(
        "SELECT agent_id FROM agents WHERE province_id = ? LIMIT 1",
        [provinceId],
      );

      if (agentRows.length === 0) {
        return {
          agent:null,
        };
      }
      const agent_id = agentRows[0].agent_id;

      // 2. Total payments received from the agent in this province
      const [paymentRows] = await db.query(
        `
      SELECT COALESCE(SUM(payment_amount), 0) as total_payments
      FROM agent_payments
      WHERE agent_id = ?
    `,
        [agent_id],
      );
      const totalPayments = paymentRows[0].total_payments;

      // 3. Get recent payments for this province
      const [recentPayments] = await db.query(
        `
      SELECT 
        payment_id,
        payment_amount,
        payment_date,
        notes,
        created_at
      FROM agent_payments
      WHERE agent_id = ?
      ORDER BY payment_date DESC, created_at DESC
      LIMIT 20
    `,
        [agent_id],
      );

      return {
        province_id: provinceId,
        province_name: provinceInfo[0].province_name,
        agent: {
          agent_id: provinceInfo[0].agent_id,
          agent_name: provinceInfo[0].agent_name || "No Agent Assigned",
          agent_phone: provinceInfo[0].agent_phone || "",
        },
        // Financial breakdown
        total_customer_amount: totalCustomerAmount, // Total money from customers
        total_base_amount: totalBaseAmount, // Base amount (customer - commission - free)
        total_commission: totalCommission, // Commission earned
        total_free_amount: totalFreeAmount, // Free/delivery fees
        total_payments: totalPayments, // Payments made to agent
        balance_due: totalCommission - totalPayments, // Balance due (commission - payments)

        // Verification calculations
        calculation_verification: {
          customer_amount_equals:
            totalCustomerAmount ===
            totalBaseAmount + totalCommission + totalFreeAmount,
          formula: "customer = base + commission + free",
        },
        recent_payments: recentPayments,
      };
    } catch (error) {
      console.error("Error fetching province financial summary:", error);
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
    getProvinceDetails,
    addAgentPayment,
    getAgentPaymentsByProvince,
    getAgentPaymentsByAgent,
    updateAgentPayment,
    deleteAgentPayment,
    getProvinceFinancialSummary,
  };
};
