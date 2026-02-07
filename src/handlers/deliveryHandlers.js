module.exports = (db) => {
  // Get all deliveries with items count
  const getDeliveries = async () => {
    try {
      const [rows] = await db.query(`
        SELECT 
          d.delivery_id,
          d.tracking_number,
          d.agent_id,
          d.province_id,
          d.customer_id,
          d.commission_amount,
          d.delivery_date,
          d.status,
          d.created_at,
          a.agent_name,
          p.province_name,
          c.customer_name,
          c.email as customer_email,
          c.phone as customer_phone,
          c.address as customer_address,
          -- Calculate totals from delivery_items
          COALESCE(SUM(di.quantity), 0) as total_quantity,
          COALESCE(SUM(di.total_cost), 0) as total_cost,
          COALESCE(SUM(di.selling_price * di.quantity), 0) as total_selling_price,
          COUNT(di.item_id) as items_count,
          -- Get first item name for display
          MAX(CASE WHEN di.item_id = (
            SELECT MIN(item_id) FROM delivery_items WHERE delivery_id = d.delivery_id
          ) THEN di.item_name END) as first_item_name,
          -- Calculate profit
          COALESCE(
            SUM(di.selling_price * di.quantity) - 
            SUM(di.total_cost) - 
            COALESCE(d.commission_amount, 0), 
            0
          ) as net_profit,
          DATE_FORMAT(d.delivery_date, '%Y-%m-%d') as delivery_date_formatted,
          DATE_FORMAT(d.created_at, '%Y-%m-%d %H:%i:%s') as created_at_formatted
        FROM deliveries d
        LEFT JOIN delivery_items di ON d.delivery_id = di.delivery_id
        LEFT JOIN agents a ON d.agent_id = a.agent_id
        LEFT JOIN provinces p ON d.province_id = p.province_id
        LEFT JOIN customers c ON d.customer_id = c.customer_id
        GROUP BY d.delivery_id, d.tracking_number, d.agent_id, d.province_id, 
                 d.customer_id, d.commission_amount, d.delivery_date, d.status, 
                 d.created_at, a.agent_name, p.province_name, 
                 c.customer_name, c.email, c.phone, c.address
        ORDER BY d.delivery_date DESC, d.delivery_id DESC
      `);
      
      return rows;
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      throw error;
    }
  };

  // Get single delivery with all items
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
            d.customer_id,
            d.commission_amount,
            d.delivery_date,
            d.status,
            d.created_at,
            a.agent_name,
            a.phone as agent_phone,
            p.province_name,
            c.customer_name,
            c.email as customer_email,
            c.phone as customer_phone,
            c.address as customer_address
          FROM deliveries d
          LEFT JOIN agents a ON d.agent_id = a.agent_id
          LEFT JOIN provinces p ON d.province_id = p.province_id
          LEFT JOIN customers c ON d.customer_id = c.customer_id
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
        
        // Calculate totals
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

  // Add new delivery with multiple items
  const addDelivery = async (deliveryData) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      // Generate tracking number
      const trackingNumber = `DEL${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      // Calculate commission if agent is selected
      let commission_amount = 0;
      if (deliveryData.agent_id && deliveryData.commission_amount) {
        commission_amount = parseFloat(deliveryData.commission_amount) || 0;
      }
      
      // Insert delivery header
      const [result] = await connection.query(
        `INSERT INTO deliveries (
          tracking_number, 
          agent_id, 
          province_id,
          customer_id,
          commission_amount,
          delivery_date, 
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          trackingNumber,
          deliveryData.agent_id || null,
          deliveryData.province_id || null,
          deliveryData.customer_id || null,
          commission_amount,
          deliveryData.delivery_date || new Date().toISOString().split('T')[0],
          deliveryData.status || 'pending'
        ]
      );
      
      const deliveryId = result.insertId;
      
      // Insert delivery items
      if (deliveryData.items && deliveryData.items.length > 0) {
        for (const item of deliveryData.items) {
          await connection.query(
            `INSERT INTO delivery_items (
              delivery_id, 
              item_name, 
              item_description, 
              unit_cost, 
              selling_price, 
              quantity
              
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
              deliveryId,
              item.item_name,
              item.item_description || '',
              parseFloat(item.unit_cost) || 0,
              parseFloat(item.selling_price) || parseFloat(item.unit_cost) * 1.3,
              parseInt(item.quantity) || 1
             
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
      
      // Calculate commission if agent is selected
      let commission_amount = 0;
      if (deliveryData.agent_id && deliveryData.commission_amount) {
        commission_amount = parseFloat(deliveryData.commission_amount) || 0;
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
          customer_id = ?,
          commission_amount = ?,
          delivery_date = ?, 
          status = ?
        WHERE delivery_id = ?`,
        [
          deliveryData.agent_id || null,
          deliveryData.province_id || null,
          deliveryData.customer_id || null,
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
          await connection.query(
            `INSERT INTO delivery_items (
              delivery_id, 
              item_name, 
              item_description, 
              unit_cost, 
              selling_price, 
              quantity
             
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
              deliveryData.delivery_id,
              item.item_name,
              item.item_description || '',
              parseFloat(item.unit_cost) || 0,
              parseFloat(item.selling_price) || parseFloat(item.unit_cost) * 1.3,
              parseInt(item.quantity) || 1
            
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

  // Search deliveries
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
          c.customer_name,
          COALESCE(SUM(di.quantity), 0) as total_quantity,
          COALESCE(SUM(di.total_cost), 0) as total_cost,
          COALESCE(SUM(di.selling_price * di.quantity), 0) as total_selling_price,
          COUNT(di.item_id) as items_count
        FROM deliveries d
        LEFT JOIN agents a ON d.agent_id = a.agent_id
        LEFT JOIN provinces p ON d.province_id = p.province_id
        LEFT JOIN customers c ON d.customer_id = c.customer_id
        LEFT JOIN delivery_items di ON d.delivery_id = di.delivery_id
        WHERE d.tracking_number LIKE ? 
          OR a.agent_name LIKE ?
          OR c.customer_name LIKE ?
          OR EXISTS (
            SELECT 1 FROM delivery_items di2 
            WHERE di2.delivery_id = d.delivery_id 
            AND di2.item_name LIKE ?
          )
        GROUP BY d.delivery_id, d.tracking_number, d.agent_id, d.province_id,
                 d.delivery_date, d.status, a.agent_name, p.province_name, c.customer_name
        ORDER BY d.delivery_date DESC
      `, [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]);
      return rows;
    } catch (error) {
      console.error("Error searching deliveries:", error);
      throw error;
    }
  };

  // Get delivery statistics
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
          COUNT(DISTINCT CASE WHEN d.status = 'delivered' THEN d.delivery_id END) as delivered_deliveries,
          COUNT(DISTINCT CASE WHEN d.status = 'cancelled' THEN d.delivery_id END) as cancelled_deliveries
        FROM deliveries d
        LEFT JOIN delivery_items di ON d.delivery_id = di.delivery_id
      `);
      return stats[0];
    } catch (error) {
      console.error("Error fetching delivery stats:", error);
      throw error;
    }
  };

  // Update delivery status
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

  // Generate invoice
  const generateInvoice = async (deliveryId) => {
    try {
      const connection = await db.getConnection();
      
      try {
        const [deliveryRows] = await connection.query(`
          SELECT 
            d.delivery_id,
            d.tracking_number,
            d.agent_id,
            d.province_id,
            d.customer_id,
            d.commission_amount,
            d.delivery_date,
            d.status,
            d.created_at,
            a.agent_name,
            a.phone as agent_phone,
            p.province_name,
            c.customer_name,
            c.email as customer_email,
            c.phone as customer_phone,
            c.address as customer_address,
            (SELECT COALESCE(SUM(total_cost), 0) FROM delivery_items WHERE delivery_id = d.delivery_id) as total_item_cost,
            (SELECT COALESCE(SUM(selling_price * quantity), 0) FROM delivery_items WHERE delivery_id = d.delivery_id) as total_amount,
            (SELECT COALESCE(SUM(quantity), 0) FROM delivery_items WHERE delivery_id = d.delivery_id) as total_quantity
          FROM deliveries d
          LEFT JOIN agents a ON d.agent_id = a.agent_id
          LEFT JOIN provinces p ON d.province_id = p.province_id
          LEFT JOIN customers c ON d.customer_id = c.customer_id
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
            selling_price * quantity as item_total
          FROM delivery_items 
          WHERE delivery_id = ?
          ORDER BY item_id
        `, [deliveryId]);
        
        delivery.items = itemRows;
        delivery.net_amount = delivery.total_amount - (delivery.commission_amount || 0);
        
        return delivery;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error("Error generating invoice:", error);
      throw error;
    }
  };

  // Get deliveries by date range
  const getDeliveriesByDateRange = async (startDate, endDate, status = null) => {
    try {
      let query = `
        SELECT 
          d.delivery_id,
          d.tracking_number,
          d.agent_id,
          d.province_id,
          d.customer_id,
          d.commission_amount,
          d.delivery_date,
          d.status,
          d.created_at,
          a.agent_name,
          p.province_name,
          c.customer_name,
          COALESCE(SUM(di.quantity), 0) as total_quantity,
          COALESCE(SUM(di.total_cost), 0) as total_cost,
          COALESCE(SUM(di.selling_price * di.quantity), 0) as total_selling_price,
          COUNT(di.item_id) as items_count,
          COALESCE(
            SUM(di.selling_price * di.quantity) - 
            SUM(di.total_cost) - 
            COALESCE(d.commission_amount, 0), 
            0
          ) as net_profit
        FROM deliveries d
        LEFT JOIN delivery_items di ON d.delivery_id = di.delivery_id
        LEFT JOIN agents a ON d.agent_id = a.agent_id
        LEFT JOIN provinces p ON d.province_id = p.province_id
        LEFT JOIN customers c ON d.customer_id = c.customer_id
        WHERE d.delivery_date BETWEEN ? AND ?
      `;
      
      const params = [startDate, endDate];
      
      if (status) {
        query += ' AND d.status = ?';
        params.push(status);
      }
      
      query += `
        GROUP BY d.delivery_id, d.tracking_number, d.agent_id, d.province_id, 
                 d.customer_id, d.commission_amount, d.delivery_date, d.status, 
                 d.created_at, a.agent_name, p.province_name, c.customer_name
        ORDER BY d.delivery_date DESC, d.delivery_id DESC
      `;
      
      const [rows] = await db.query(query, params);
      return rows;
    } catch (error) {
      console.error("Error fetching deliveries by date range:", error);
      throw error;
    }
  };

  // Get agent performance report
  const getAgentPerformanceReport = async () => {
    try {
      const [rows] = await db.query(`
        SELECT 
          a.agent_id,
          a.agent_name,
          a.phone,
          COUNT(DISTINCT d.delivery_id) as total_deliveries,
          COALESCE(SUM(di.quantity), 0) as total_items,
          COALESCE(SUM(d.commission_amount), 0) as total_commission_earned,
          COALESCE(AVG(d.commission_amount), 0) as avg_commission_per_delivery,
          COALESCE(SUM(di.total_cost), 0) as total_item_costs,
          COUNT(DISTINCT CASE WHEN d.status = 'delivered' THEN d.delivery_id END) as delivered_count,
          COUNT(DISTINCT CASE WHEN d.status = 'pending' THEN d.delivery_id END) as pending_count
        FROM agents a
        LEFT JOIN deliveries d ON a.agent_id = d.agent_id
        LEFT JOIN delivery_items di ON d.delivery_id = di.delivery_id
        GROUP BY a.agent_id, a.agent_name, a.phone
        ORDER BY total_commission_earned DESC
      `);
      return rows;
    } catch (error) {
      console.error("Error fetching agent performance report:", error);
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
    updateDeliveryStatus,
    generateInvoice,
    getDeliveriesByDateRange,
    getAgentPerformanceReport
  };
};