// deliveryHandlers.js - FIXED VERSION
module.exports = (db) => {
  // Get all deliveries with full details (FIXED)
  const getDeliveries = async () => {
    try {
      const [rows] = await db.query(`
        SELECT 
          d.delivery_id,
          d.tracking_number,
          d.agent_id,
          d.province_id,
          d.commission_amount,
          d.delivery_date,
          d.status,
          d.created_at,
          -- Calculate totals from delivery_items
          COALESCE(SUM(di.quantity), 0) as total_quantity,
          COALESCE(SUM(di.total_cost), 0) as total_cost,
          COALESCE(SUM(di.selling_price * di.quantity), 0) as total_selling_price,
          -- Get agent details
          a.agent_name,
          a.commission_rate,
          -- Get province details
          p.province_name,
          -- Get customer details (if customer_id existed, but it doesn't)
          '' as customer_name,
          '' as customer_email,
          '' as customer_phone,
          '' as customer_address,
          -- Calculate profit
          COALESCE(SUM(di.selling_price * di.quantity) - SUM(di.total_cost) - d.commission_amount, 0) as net_profit,
          DATE_FORMAT(d.delivery_date, '%Y-%m-%d') as delivery_date_formatted
        FROM deliveries d
        LEFT JOIN delivery_items di ON d.delivery_id = di.delivery_id
        LEFT JOIN agents a ON d.agent_id = a.agent_id
        LEFT JOIN provinces p ON d.province_id = p.province_id
        GROUP BY d.delivery_id, d.tracking_number, d.agent_id, d.province_id, 
                 d.commission_amount, d.delivery_date, d.status, d.created_at,
                 a.agent_name, a.commission_rate, p.province_name
        ORDER BY d.delivery_date DESC, d.delivery_id DESC
      `);
      return rows;
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      throw error;
    }
  };

  // Rest of your functions remain the same...
  // Get single delivery by ID with items
  const getDelivery = async (deliveryId) => {
    try {
      const connection = await db.getConnection();
      
      try {
        // Get delivery header
        const [deliveryRows] = await connection.query(`
          SELECT 
            d.delivery_id,
            d.tracking_number,
            d.agent_id,
            d.province_id,
            d.commission_amount,
            d.delivery_date,
            d.status,
            d.created_at,
            a.agent_name,
            a.commission_rate,
            a.email as agent_email,
            a.phone as agent_phone,
            p.province_name
          FROM deliveries d
          LEFT JOIN agents a ON d.agent_id = a.agent_id
          LEFT JOIN provinces p ON d.province_id = p.province_id
          WHERE d.delivery_id = ?
        `, [deliveryId]);
        
        if (deliveryRows.length === 0) {
          return null;
        }
        
        const delivery = deliveryRows[0];
        
        // Get delivery items
        const [itemRows] = await connection.query(`
          SELECT 
            item_id,
            delivery_id,
            item_name,
            item_description,
            unit_cost,
            selling_price,
            quantity,
            total_cost,
            commission_amount
          FROM delivery_items 
          WHERE delivery_id = ?
          ORDER BY item_id
        `, [deliveryId]);
        
        delivery.items = itemRows;
        
        // Calculate totals from items
        if (delivery.items && delivery.items.length > 0) {
          delivery.total_quantity = delivery.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
          delivery.total_cost = delivery.items.reduce((sum, item) => sum + (parseFloat(item.total_cost) || 0), 0);
          delivery.total_selling_price = delivery.items.reduce((sum, item) => 
            sum + ((parseFloat(item.selling_price) || 0) * (item.quantity || 1)), 0);
          delivery.net_profit = delivery.total_selling_price - delivery.total_cost - (parseFloat(delivery.commission_amount) || 0);
        } else {
          delivery.total_quantity = 0;
          delivery.total_cost = 0;
          delivery.total_selling_price = 0;
          delivery.net_profit = 0;
        }
        
        return delivery;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error("Error fetching delivery:", error);
      throw error;
    }
  };

  // Add new delivery (bill) with items
  const addDelivery = async (deliveryData) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      // Generate tracking number
      const trackingNumber = `DEL${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      // Calculate commission amount based on total cost and agent commission rate
      let commission_amount = 0;
      let totalCost = 0;
      let totalSellingPrice = 0;
      let totalQuantity = 0;
      
      // First calculate totals from items
      if (deliveryData.items && deliveryData.items.length > 0) {
        totalCost = deliveryData.items.reduce((sum, item) => 
          sum + (parseFloat(item.unit_cost) * parseInt(item.quantity || 1)), 0);
        totalSellingPrice = deliveryData.items.reduce((sum, item) => 
          sum + (parseFloat(item.selling_price || item.unit_cost * 1.3) * parseInt(item.quantity || 1)), 0);
        totalQuantity = deliveryData.items.reduce((sum, item) => 
          sum + parseInt(item.quantity || 1), 0);
      }
      
      // Calculate commission if agent is selected
      if (deliveryData.agent_id && totalCost > 0) {
        const [agent] = await connection.query(
          "SELECT commission_rate FROM agents WHERE agent_id = ?",
          [deliveryData.agent_id]
        );
        if (agent.length > 0) {
          commission_amount = totalCost * (parseFloat(agent[0].commission_rate) / 100);
        }
      }
      
      // Insert delivery header
      const [result] = await connection.query(
        `INSERT INTO deliveries (
          tracking_number, 
          agent_id, 
          province_id, 
          commission_amount,
          delivery_date, 
          status
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          trackingNumber,
          deliveryData.agent_id || null,
          deliveryData.province_id || null,
          commission_amount,
          deliveryData.delivery_date || new Date().toISOString().split('T')[0],
          deliveryData.status || 'pending'
        ]
      );
      
      const deliveryId = result.insertId;
      
      // Insert delivery items
      if (deliveryData.items && deliveryData.items.length > 0) {
        for (const item of deliveryData.items) {
          const itemCommission = item.commission_amount || 0;
          await connection.query(
            `INSERT INTO delivery_items (
              delivery_id, 
              item_name, 
              item_description, 
              unit_cost, 
              selling_price, 
              quantity,
              commission_amount
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              deliveryId,
              item.item_name,
              item.item_description || '',
              parseFloat(item.unit_cost) || 0,
              parseFloat(item.selling_price) || parseFloat(item.unit_cost) * 1.3,
              parseInt(item.quantity) || 1,
              itemCommission
            ]
          );
        }
      }
      
      await connection.commit();
      
      return { 
        success: true, 
        delivery_id: deliveryId, 
        tracking_number: trackingNumber,
        message: "Delivery added successfully!" 
      };
    } catch (error) {
      await connection.rollback();
      console.error("Error adding delivery:", error);
      throw error;
    } finally {
      connection.release();
    }
  };

  // Update delivery with items
  const updateDelivery = async (deliveryData) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      // Calculate new totals from items
      let totalCost = 0;
      let totalSellingPrice = 0;
      let totalQuantity = 0;
      let commission_amount = 0;
      
      if (deliveryData.items && deliveryData.items.length > 0) {
        totalCost = deliveryData.items.reduce((sum, item) => 
          sum + (parseFloat(item.unit_cost) * parseInt(item.quantity || 1)), 0);
        totalSellingPrice = deliveryData.items.reduce((sum, item) => 
          sum + (parseFloat(item.selling_price || item.unit_cost * 1.3) * parseInt(item.quantity || 1)), 0);
        totalQuantity = deliveryData.items.reduce((sum, item) => 
          sum + parseInt(item.quantity || 1), 0);
      }
      
      // Calculate commission if agent is selected
      if (deliveryData.agent_id && totalCost > 0) {
        const [agent] = await connection.query(
          "SELECT commission_rate FROM agents WHERE agent_id = ?",
          [deliveryData.agent_id]
        );
        if (agent.length > 0) {
          commission_amount = totalCost * (parseFloat(agent[0].commission_rate) / 100);
        }
      } else {
        // Keep existing commission amount if no agent is selected
        const [current] = await connection.query(
          "SELECT commission_amount FROM deliveries WHERE delivery_id = ?",
          [deliveryData.delivery_id]
        );
        if (current.length > 0) {
          commission_amount = parseFloat(current[0].commission_amount) || 0;
        }
      }
      
      // Update delivery header
      const [result] = await connection.query(
        `UPDATE deliveries SET 
          agent_id = ?, 
          province_id = ?, 
          commission_amount = ?,
          delivery_date = ?, 
          status = ?
        WHERE delivery_id = ?`,
        [
          deliveryData.agent_id || null,
          deliveryData.province_id || null,
          commission_amount,
          deliveryData.delivery_date || new Date().toISOString().split('T')[0],
          deliveryData.status || 'pending',
          deliveryData.delivery_id
        ]
      );
      
      // Delete existing items
      await connection.query(
        "DELETE FROM delivery_items WHERE delivery_id = ?",
        [deliveryData.delivery_id]
      );
      
      // Insert updated items
      if (deliveryData.items && deliveryData.items.length > 0) {
        for (const item of deliveryData.items) {
          const itemCommission = item.commission_amount || 0;
          await connection.query(
            `INSERT INTO delivery_items (
              delivery_id, 
              item_name, 
              item_description, 
              unit_cost, 
              selling_price, 
              quantity,
              commission_amount
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              deliveryData.delivery_id,
              item.item_name,
              item.item_description || '',
              parseFloat(item.unit_cost) || 0,
              parseFloat(item.selling_price) || parseFloat(item.unit_cost) * 1.3,
              parseInt(item.quantity) || 1,
              itemCommission
            ]
          );
        }
      }
      
      await connection.commit();
      
      return { 
        success: true, 
        affectedRows: result.affectedRows,
        message: "Delivery updated successfully!" 
      };
    } catch (error) {
      await connection.rollback();
      console.error("Error updating delivery:", error);
      throw error;
    } finally {
      connection.release();
    }
  };

  // Delete delivery
  const deleteDelivery = async (deliveryId) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      // Delete items first
      await connection.query(
        "DELETE FROM delivery_items WHERE delivery_id = ?",
        [deliveryId]
      );
      
      // Delete delivery
      const [result] = await connection.query(
        "DELETE FROM deliveries WHERE delivery_id = ?",
        [deliveryId]
      );
      
      await connection.commit();
      
      return { 
        success: true, 
        affectedRows: result.affectedRows,
        message: "Delivery deleted successfully!" 
      };
    } catch (error) {
      await connection.rollback();
      console.error("Error deleting delivery:", error);
      throw error;
    } finally {
      connection.release();
    }
  };

  // Search deliveries (FIXED)
  const searchDeliveries = async (searchTerm) => {
    try {
      const [rows] = await db.query(`
        SELECT 
          d.delivery_id,
          d.tracking_number,
          d.agent_id,
          d.province_id,
          d.delivery_date,
          d.status,
          a.agent_name,
          p.province_name,
          COALESCE(SUM(di.quantity), 0) as total_quantity,
          COALESCE(SUM(di.total_cost), 0) as total_cost,
          COALESCE(SUM(di.selling_price * di.quantity), 0) as total_selling_price
        FROM deliveries d
        LEFT JOIN agents a ON d.agent_id = a.agent_id
        LEFT JOIN provinces p ON d.province_id = p.province_id
        LEFT JOIN delivery_items di ON d.delivery_id = di.delivery_id
        WHERE d.tracking_number LIKE ? 
          OR a.agent_name LIKE ?
          OR EXISTS (
            SELECT 1 FROM delivery_items di2 
            WHERE di2.delivery_id = d.delivery_id 
            AND di2.item_name LIKE ?
          )
        GROUP BY d.delivery_id, d.tracking_number, d.agent_id, d.province_id,
                 d.delivery_date, d.status, a.agent_name, p.province_name
        ORDER BY d.delivery_date DESC
      `, [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]);
      return rows;
    } catch (error) {
      console.error("Error searching deliveries:", error);
      throw error;
    }
  };

  // Get delivery statistics (NO CHANGE)
  const getDeliveryStats = async () => {
    try {
      const [stats] = await db.query(`
        SELECT 
          COUNT(DISTINCT d.delivery_id) as total_deliveries,
          COALESCE(SUM(di.quantity), 0) as total_items,
          COALESCE(SUM(di.total_cost), 0) as total_item_costs,
          COALESCE(SUM(d.commission_amount), 0) as total_commissions,
          COALESCE(SUM(di.selling_price * di.quantity), 0) as total_revenue,
          COALESCE(SUM(di.selling_price * di.quantity) - SUM(di.total_cost) - SUM(d.commission_amount), 0) as total_profit,
          COUNT(DISTINCT CASE WHEN d.status = 'pending' THEN d.delivery_id END) as pending_deliveries,
          COUNT(DISTINCT CASE WHEN d.status = 'in_transit' THEN d.delivery_id END) as in_transit_deliveries,
          COUNT(DISTINCT CASE WHEN d.status = 'delivered' THEN d.delivery_id END) as delivered_deliveries
        FROM deliveries d
        LEFT JOIN delivery_items di ON d.delivery_id = di.delivery_id
      `);
      return stats[0];
    } catch (error) {
      console.error("Error fetching delivery stats:", error);
      throw error;
    }
  };

  // Get delivery items (NO CHANGE)
  const getDeliveryItems = async (deliveryId) => {
    try {
      const [rows] = await db.query(`
        SELECT 
          item_id,
          delivery_id,
          item_name,
          item_description,
          unit_cost,
          selling_price,
          quantity,
          total_cost,
          commission_amount
        FROM delivery_items 
        WHERE delivery_id = ?
        ORDER BY item_id
      `, [deliveryId]);
      return rows;
    } catch (error) {
      console.error("Error fetching delivery items:", error);
      throw error;
    }
  };

  // Generate invoice/bill details (FIXED)
  const getInvoiceDetails = async (deliveryId) => {
    try {
      const connection = await db.getConnection();
      
      try {
        // Get delivery header with all details
        const [deliveryRows] = await connection.query(`
          SELECT 
            d.delivery_id,
            d.tracking_number,
            d.agent_id,
            d.province_id,
            d.commission_amount,
            d.delivery_date,
            d.status,
            d.created_at,
            a.agent_name,
            a.email as agent_email,
            a.phone as agent_phone,
            a.commission_rate,
            p.province_name,
            -- Calculate totals from items
            (SELECT COALESCE(SUM(total_cost), 0) FROM delivery_items WHERE delivery_id = d.delivery_id) as total_item_cost,
            (SELECT COALESCE(SUM(selling_price * quantity), 0) FROM delivery_items WHERE delivery_id = d.delivery_id) as total_amount,
            d.commission_amount as total_commission,
            (SELECT COALESCE(SUM(selling_price * quantity) - SUM(total_cost), 0) FROM delivery_items WHERE delivery_id = d.delivery_id) - d.commission_amount as net_profit
          FROM deliveries d
          LEFT JOIN agents a ON d.agent_id = a.agent_id
          LEFT JOIN provinces p ON d.province_id = p.province_id
          WHERE d.delivery_id = ?
        `, [deliveryId]);
        
        if (deliveryRows.length === 0) {
          throw new Error("Delivery not found");
        }
        
        const delivery = deliveryRows[0];
        
        // Get delivery items
        const [itemRows] = await connection.query(`
          SELECT 
            item_id,
            item_name,
            item_description,
            unit_cost,
            selling_price,
            quantity,
            total_cost,
            commission_amount
          FROM delivery_items 
          WHERE delivery_id = ?
          ORDER BY item_id
        `, [deliveryId]);
        
        delivery.items = itemRows;
        
        return delivery;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error("Error generating invoice details:", error);
      throw error;
    }
  };

  // Update delivery status (NO CHANGE)
  const updateDeliveryStatus = async (deliveryId, status) => {
    try {
      const validStatuses = ['pending', 'in_transit', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new Error("Invalid status");
      }
      
      const [result] = await db.query(
        "UPDATE deliveries SET status = ? WHERE delivery_id = ?",
        [status, deliveryId]
      );
      
      return { 
        success: true, 
        affectedRows: result.affectedRows,
        message: `Delivery status updated to ${status}` 
      };
    } catch (error) {
      console.error("Error updating delivery status:", error);
      throw error;
    }
  };

  // Get deliveries by date range (FIXED)
  const getDeliveriesByDateRange = async (startDate, endDate) => {
    try {
      const [rows] = await db.query(`
        SELECT 
          d.delivery_id,
          d.tracking_number,
          d.agent_id,
          d.province_id,
          d.delivery_date,
          d.status,
          a.agent_name,
          p.province_name,
          COALESCE(SUM(di.quantity), 0) as total_quantity,
          COALESCE(SUM(di.total_cost), 0) as total_cost,
          COALESCE(SUM(di.selling_price * di.quantity), 0) as total_selling_price
        FROM deliveries d
        LEFT JOIN agents a ON d.agent_id = a.agent_id
        LEFT JOIN provinces p ON d.province_id = p.province_id
        LEFT JOIN delivery_items di ON d.delivery_id = di.delivery_id
        WHERE d.delivery_date BETWEEN ? AND ?
        GROUP BY d.delivery_id, d.tracking_number, d.agent_id, d.province_id,
                 d.delivery_date, d.status, a.agent_name, p.province_name
        ORDER BY d.delivery_date DESC
      `, [startDate, endDate]);
      return rows;
    } catch (error) {
      console.error("Error fetching deliveries by date range:", error);
      throw error;
    }
  };

  return {
    getDeliveries,
    getDelivery,
    addDelivery,
    updateDelivery,
    deleteDelivery,
    searchDeliveries,
    getDeliveryStats,
    getDeliveryItems,
    getInvoiceDetails,
    updateDeliveryStatus,
    getDeliveriesByDateRange
  };
};