module.exports = (db) => {
  // ------------------------------------------------------------
  // GET ALL DELIVERIES (with aggregated agent data)
  // ------------------------------------------------------------
  const getDeliveries = async () => {
    const [rows] = await db.query(`
      SELECT 
        d.delivery_id,
        
        d.province_id,
        d.customer_id,
        d.delivery_date,
        d.status,
        d.created_at,
        d.return_status,
        d.return_fee_charged,
        d.return_date,

        p.province_name,
        c.customer_name,
        c.email AS customer_email,
        c.phone AS customer_phone,
        c.address AS customer_address,

        -- JSON array of all assigned agents
        COALESCE(
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'assignment_id', da.assignment_id,
              'agent_id', a.agent_id,
              'agent_name', a.agent_name,
              'commission', da.commission_amount,
              'assignment_status', da.status,
              'assigned_date', da.assigned_date
            )
          ), '[]'
        ) AS agents,

        -- Simple comma‑separated agent names
        GROUP_CONCAT(DISTINCT a.agent_name SEPARATOR ', ') AS agent_names,

        -- Totals
        COALESCE(SUM(di.quantity), 0) AS total_quantity,
        COALESCE(SUM(di.total_cost), 0) AS total_cost,
     
        COUNT(DISTINCT di.item_id) AS items_count,

       

        DATE_FORMAT(d.delivery_date, '%Y-%m-%d') AS delivery_date_formatted

      FROM deliveries d
      LEFT JOIN delivery_items di ON d.delivery_id = di.delivery_id
      LEFT JOIN delivery_agent_assignments da ON d.delivery_id = da.delivery_id
      LEFT JOIN agents a ON da.agent_id = a.agent_id
      LEFT JOIN provinces p ON d.province_id = p.province_id
      LEFT JOIN customers c ON d.customer_id = c.customer_id

      GROUP BY d.delivery_id
      ORDER BY d.delivery_date DESC, d.delivery_id DESC
    `);

    return rows.map((row) => ({
      ...row,
      agents: JSON.parse(row.agents || "[]"),
    }));
  };

  // ------------------------------------------------------------
  // GET SINGLE DELIVERY (full details)
  // ------------------------------------------------------------
  const getDelivery = async (deliveryId) => {
    const [deliveryRows] = await db.query(
      `
      SELECT 
        d.delivery_id,
      
        d.province_id,
        d.customer_id,
        d.delivery_date,
        d.status,
        d.created_at,
        d.return_status,
        d.return_fee_charged,
        d.return_date,

        p.province_name,
        c.customer_name,
        c.email AS customer_email,
        c.phone AS customer_phone,
        c.address AS customer_address

      FROM deliveries d
      LEFT JOIN provinces p ON d.province_id = p.province_id
      LEFT JOIN customers c ON d.customer_id = c.customer_id
      WHERE d.delivery_id = ?
    `,
      [deliveryId],
    );

    if (deliveryRows.length === 0) return null;
    const delivery = deliveryRows[0];

    // Get assigned agents
    const [agentRows] = await db.query(
      `
      SELECT 
        da.assignment_id,
        da.agent_id,
        a.agent_name,
        a.phone AS agent_phone,
        da.commission_amount,
        da.assigned_date,
        da.status AS assignment_status,
        da.created_at,
        da.updated_at
      FROM delivery_agent_assignments da
      JOIN agents a ON da.agent_id = a.agent_id
      WHERE da.delivery_id = ?
      ORDER BY da.assigned_date DESC
    `,
      [deliveryId],
    );
    delivery.agents = agentRows;

    // Get items
    const [itemRows] = await db.query(
      `
      SELECT 
        item_id,
        item_name,
        item_description,
        unit_cost,
        
        quantity,
        total_cost
      FROM delivery_items 
      WHERE delivery_id = ?
      ORDER BY item_id
    `,
      [deliveryId],
    );
    delivery.items = itemRows;

    delivery.total_quantity = itemRows.reduce(
      (sum, i) => sum + (i.quantity || 0),
      0,
    );
    delivery.total_cost = itemRows.reduce(
      (sum, i) => sum + parseFloat(i.total_cost || 0),
      0,
    );

    return delivery;
  };
  const getDeliveriesWithFilters = async (filters) => {
    const connection = await db.getConnection();
    try {
      // Base query with joins
      let sql = `
        SELECT 
          d.delivery_id,
          d.delivery_date,
          d.status,
          d.return_status,
          d.return_fee_charged,
          d.return_date,
          d.created_at,
          c.customer_id,
          c.customer_name,
          c.phone AS customer_phone,
          p.province_id,
          p.province_name,
          a.agent_id,
          a.agent_name,
          a.phone AS agent_phone,
          -- total items count and total amount (you can adjust)
          COUNT(di.item_id) AS items_count,
          SUM(di.unit_cost * di.quantity) AS total_amount
        FROM deliveries d
        LEFT JOIN customers c ON d.customer_id = c.customer_id
        LEFT JOIN provinces p ON d.province_id = p.province_id
        LEFT JOIN delivery_agent_assignments daa ON d.delivery_id = daa.delivery_id
        LEFT JOIN agents a ON daa.agent_id = a.agent_id
        LEFT JOIN delivery_items di ON d.delivery_id = di.delivery_id
        WHERE 1=1
      `;

      const params = [];

      // Apply filters dynamically
      if (filters.status) {
        sql += ` AND d.status = ?`;
        params.push(filters.status);
      }

      if (filters.return_status && filters.return_status !== "none") {
        sql += ` AND d.return_status = ?`;
        params.push(filters.return_status);
      } else if (filters.return_status === "none") {
        sql += ` AND d.return_status = 'none'`;
      }

      if (filters.province_id) {
        sql += ` AND d.province_id = ?`;
        params.push(filters.province_id);
      }

      if (filters.agent_id) {
        sql += ` AND daa.agent_id = ?`;
        params.push(filters.agent_id);
      }

      if (filters.date_from) {
        sql += ` AND d.delivery_date >= ?`;
        params.push(filters.date_from);
      }

      if (filters.date_to) {
        sql += ` AND d.delivery_date <= ?`;
        params.push(filters.date_to);
      }

      if (filters.search) {
        const searchTerm = `%${filters.search}%`;
        sql += ` AND (
          d.delivery_id LIKE ? OR 
          c.customer_name LIKE ? 
        )`;
        params.push(searchTerm, searchTerm);
      }

      // Group by delivery to get aggregated counts correctly
      sql += ` GROUP BY d.delivery_id, c.customer_id, p.province_id, a.agent_id`;

      // Optional ordering
      sql += ` ORDER BY d.delivery_date DESC, d.delivery_id DESC`;

      const [rows] = await connection.query(sql, params);
      return rows;
    } catch (error) {
      console.error("Error in getDeliveriesWithFilters:", error);
      throw error;
    } finally {
      connection.release();
    }
  };

  // ------------------------------------------------------------
  // ADD DELIVERY (items + agent assignments)
  // ------------------------------------------------------------
  const addDelivery = async (deliveryData) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        `INSERT INTO deliveries (
           province_id, customer_id, delivery_date, status
        ) VALUES ( ?, ?, ?, ?)`,
        [
          deliveryData.province_id || null,
          deliveryData.customer_id || null,
          deliveryData.delivery_date || new Date().toISOString().split("T")[0],
          deliveryData.status || "pending",
        ],
      );

      const deliveryId = result.insertId;

      console.log(deliveryData);

      // Items
      if (deliveryData.items?.length) {
        for (const item of deliveryData.items) {
          await connection.query(
            `INSERT INTO delivery_items (
              delivery_id, item_name, item_description, 
              unit_cost, quantity, commission_amount, fess
            ) VALUES (?, ?, ?,  ?, ?, ?, ?)`,
            [
              deliveryId,
              item.item_name,
              item.description || "",
              parseFloat(item.unit_cost) || 0,

              parseInt(item.quantity) || 1,
              parseFloat(item.agent_cost) || 0,
              parseFloat(item.fess) || 0,
            ],
          );
        }
      }

      // Agent assignments
      if (deliveryData.agents?.length) {
        for (const agent of deliveryData.agents) {
          await connection.query(
            `INSERT INTO delivery_agent_assignments (
              delivery_id, agent_id, commission_amount, assigned_date, status
            ) VALUES (?, ?, ?, ?, ?)`,
            [
              deliveryId,
              agent.agent_id,
              parseFloat(agent.commission_amount) || 0,
              agent.assigned_date || new Date().toISOString().split("T")[0],
              agent.assignment_status || "pending",
            ],
          );
        }
      }

      await connection.commit();
      return {
        success: true,
        delivery_id: deliveryId,
        tracking_number: deliveryId,
        message: "Delivery added successfully!",
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };

  // ------------------------------------------------------------
  // UPDATE DELIVERY (replace items & agent assignments)
  // ------------------------------------------------------------
  const updateDelivery = async (deliveryData) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Update deliveries table
      await connection.query(
        `UPDATE deliveries SET 
         province_id = ?, customer_id = ?, delivery_date = ?, status = ?
       WHERE delivery_id = ?`,
        [
          deliveryData.province_id || null,
          deliveryData.customer_id || null,
          deliveryData.delivery_date || new Date().toISOString().split("T")[0],
          deliveryData.status || "pending",
          deliveryData.delivery_id,
        ],
      );

      // Replace items – delete old ones
      await connection.query(
        "DELETE FROM delivery_items WHERE delivery_id = ?",
        [deliveryData.delivery_id],
      );

      // Insert new items with all fields (same as addDelivery)
      if (deliveryData.items?.length) {
        for (const item of deliveryData.items) {
          await connection.query(
            `INSERT INTO delivery_items (
             delivery_id, item_name, item_description, 
             unit_cost, quantity, commission_amount, fess
           ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              deliveryData.delivery_id,
              item.item_name,
              item.description || "", // item_description
              parseFloat(item.unit_cost) || 0,
              parseInt(item.quantity) || 1,
              parseFloat(item.agent_cost) || 0, // commission_amount
              parseFloat(item.fess) || 0,
            ],
          );
        }
      }

      // Replace agent assignments (if any)
      await connection.query(
        "DELETE FROM delivery_agent_assignments WHERE delivery_id = ?",
        [deliveryData.delivery_id],
      );
      if (deliveryData.agents?.length) {
        for (const agent of deliveryData.agents) {
          await connection.query(
            `INSERT INTO delivery_agent_assignments (
             delivery_id, agent_id, commission_amount, assigned_date, status
           ) VALUES (?, ?, ?, ?, ?)`,
            [
              deliveryData.delivery_id,
              agent.agent_id,
              parseFloat(agent.commission_amount) || 0,
              agent.assigned_date || new Date().toISOString().split("T")[0],
              agent.assignment_status || "pending",
            ],
          );
        }
      }

      await connection.commit();
      return { success: true, message: "Delivery updated successfully!" };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };

  // ------------------------------------------------------------
  // DELETE DELIVERY (cascade will remove items & assignments)
  // ------------------------------------------------------------
  const deleteDelivery = async (deliveryId) => {
    await db.query("DELETE FROM deliveries WHERE delivery_id = ?", [
      deliveryId,
    ]);
    return { success: true, message: "Delivery deleted successfully!" };
  };

  // ------------------------------------------------------------
  // SEARCH DELIVERIES
  // ------------------------------------------------------------
  const searchDeliveries = async (searchTerm, searchType = "all") => {
    let query = `
      SELECT 
        d.delivery_id,
        
        d.province_id,
        d.customer_id,
        d.delivery_date,
        d.status,
        p.province_name,
        c.customer_name,
        COALESCE(
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'agent_id', a.agent_id,
              'agent_name', a.agent_name,
              'commission', da.commission_amount,
              'assignment_status', da.status
            )
          ), '[]'
        ) AS agents,
        GROUP_CONCAT(DISTINCT a.agent_name SEPARATOR ', ') AS agent_names,
        COALESCE(SUM(di.quantity), 0) AS total_quantity,
        COALESCE(SUM(di.total_cost), 0) AS total_cost,
        
        COUNT(DISTINCT di.item_id) AS items_count
      FROM deliveries d
      LEFT JOIN provinces p ON d.province_id = p.province_id
      LEFT JOIN customers c ON d.customer_id = c.customer_id
      LEFT JOIN delivery_agent_assignments da ON d.delivery_id = da.delivery_id
      LEFT JOIN agents a ON da.agent_id = a.agent_id
      LEFT JOIN delivery_items di ON d.delivery_id = di.delivery_id
      WHERE 1=1
    `;
    const params = [];

    if (searchTerm?.trim()) {
      if (searchType === "all" || searchType === "tracking") {
        query += ` AND d.delivery_id LIKE ?`;
        params.push(`%${searchTerm}%`);
      }
      if (searchType === "all" || searchType === "customer") {
        query += ` AND c.customer_name LIKE ?`;
        params.push(`%${searchTerm}%`);
      }
      if (searchType === "all" || searchType === "agent") {
        query += ` AND a.agent_name LIKE ?`;
        params.push(`%${searchTerm}%`);
      }
      // also search in item names via exists
      if (searchType === "all") {
        query += ` OR EXISTS (
          SELECT 1 FROM delivery_items di2 
          WHERE di2.delivery_id = d.delivery_id AND di2.item_name LIKE ?
        )`;
        params.push(`%${searchTerm}%`);
      }
    }

    query += ` GROUP BY d.delivery_id ORDER BY d.delivery_date DESC`;
    const [rows] = await db.query(query, params);
    return rows.map((row) => ({
      ...row,
      agents: JSON.parse(row.agents || "[]"),
    }));
  };

  // ------------------------------------------------------------
  // GET PENDING DELIVERIES BY PROVINCE (NEW)
  // ------------------------------------------------------------
  const getPendingDeliveriesByProvince = async (provinceId) => {
    const [rows] = await db.query(
      `
      SELECT 
        d.delivery_id,
        d.delivery_date,
        d.status,
        p.province_name,
        c.customer_name,
        COALESCE(SUM(di.quantity), 0) AS total_items,
     
        COUNT(DISTINCT di.item_id) AS item_count
      FROM deliveries d
      JOIN provinces p ON d.province_id = p.province_id
      LEFT JOIN customers c ON d.customer_id = c.customer_id
      LEFT JOIN delivery_items di ON d.delivery_id = di.delivery_id
      WHERE d.province_id = ? AND d.status = 'pending'
        AND NOT EXISTS (
          SELECT 1 FROM delivery_agent_assignments da 
          WHERE da.delivery_id = d.delivery_id
        )
      GROUP BY d.delivery_id
      ORDER BY d.delivery_date ASC
    `,
      [provinceId],
    );

    const formattedRows = rows.map((r) => ({
      ...r,
      delivery_date: r.delivery_date ? r.delivery_date.toISOString() : null,
    }));
    return formattedRows;
  };
  // ------------------------------------------------------------
  // GET ONLY ASSIGNED DELIVERIES (with agent data)
  // ------------------------------------------------------------
  const getAssignedDeliveries = async () => {
    const [rows] = await db.query(`
    SELECT 
      d.delivery_id,
   
      d.province_id,
      d.customer_id,
      d.delivery_date,
      d.status,
      d.created_at,
      d.return_status,
      d.return_fee_charged,
      d.return_date,

      p.province_name,
      c.customer_name,
      c.email AS customer_email,
      c.phone AS customer_phone,
      c.address AS customer_address,

      -- JSON array of all assigned agents
      COALESCE(
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'assignment_id', da.assignment_id,
            'agent_id', a.agent_id,
            'agent_name', a.agent_name,
            'commission', da.commission_amount,
            'assignment_status', da.status,
            'assigned_date', da.assigned_date
          )
        ), '[]'
      ) AS agents,

      -- Simple comma‑separated agent names
      GROUP_CONCAT(DISTINCT a.agent_name SEPARATOR ', ') AS agent_names,

      -- Totals
      COALESCE(SUM(di.quantity), 0) AS total_quantity,
      COALESCE(SUM(di.total_cost), 0) AS total_cost,

      COUNT(DISTINCT di.item_id) AS items_count,

  

      DATE_FORMAT(d.delivery_date, '%Y-%m-%d') AS delivery_date_formatted

    FROM deliveries d
    INNER JOIN delivery_agent_assignments da ON d.delivery_id = da.delivery_id   -- ← only assigned
    LEFT JOIN agents a ON da.agent_id = a.agent_id
    LEFT JOIN delivery_items di ON d.delivery_id = di.delivery_id
    LEFT JOIN provinces p ON d.province_id = p.province_id
    LEFT JOIN customers c ON d.customer_id = c.customer_id

    GROUP BY d.delivery_id
    ORDER BY d.delivery_date DESC, d.delivery_id DESC
  `);

    return rows.map((row) => ({
      ...row,
      agents: JSON.parse(row.agents || "[]"),
    }));
  };

  // ------------------------------------------------------------
  // SEARCH ONLY ASSIGNED DELIVERIES
  // ------------------------------------------------------------
  const searchAssignedDeliveries = async (searchTerm, searchType = "all") => {
    let query = `
    SELECT 
      d.delivery_id,
     
      d.province_id,
      d.customer_id,
      d.delivery_date,
      d.status,
      p.province_name,
      c.customer_name,
      COALESCE(
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'agent_id', a.agent_id,
            'agent_name', a.agent_name,
            'commission', da.commission_amount,
            'assignment_status', da.status
          )
        ), '[]'
      ) AS agents,
      GROUP_CONCAT(DISTINCT a.agent_name SEPARATOR ', ') AS agent_names,
      COALESCE(SUM(di.quantity), 0) AS total_quantity,
      COALESCE(SUM(di.total_cost), 0) AS total_cost,
     
      COUNT(DISTINCT di.item_id) AS items_count
    FROM deliveries d
    INNER JOIN delivery_agent_assignments da ON d.delivery_id = da.delivery_id
    LEFT JOIN agents a ON da.agent_id = a.agent_id
    LEFT JOIN provinces p ON d.province_id = p.province_id
    LEFT JOIN customers c ON d.customer_id = c.customer_id
    LEFT JOIN delivery_items di ON d.delivery_id = di.delivery_id
    WHERE 1=1
  `;
    const params = [];

    if (searchTerm?.trim()) {
      if (searchType === "all" || searchType === "tracking") {
        query += ` AND d.delivery_id LIKE ?`;
        params.push(`%${searchTerm}%`);
      }
      if (searchType === "all" || searchType === "customer") {
        query += ` AND c.customer_name LIKE ?`;
        params.push(`%${searchTerm}%`);
      }
      if (searchType === "all" || searchType === "agent") {
        query += ` AND a.agent_name LIKE ?`;
        params.push(`%${searchTerm}%`);
      }
      if (searchType === "all") {
        query += ` OR EXISTS (
        SELECT 1 FROM delivery_items di2 
        WHERE di2.delivery_id = d.delivery_id AND di2.item_name LIKE ?
      )`;
        params.push(`%${searchTerm}%`);
      }
    }

    query += ` GROUP BY d.delivery_id ORDER BY d.delivery_date DESC`;
    const [rows] = await db.query(query, params);
    return rows.map((row) => ({
      ...row,
      agents: JSON.parse(row.agents || "[]"),
    }));
  };

  // ------------------------------------------------------------
  // OPTIONAL: Stats for assigned deliveries (if you want stats to match the list)
  // ------------------------------------------------------------
  const getAssignedDeliveryStats = async () => {
    const [stats] = await db.query(`
    SELECT 
      COUNT(DISTINCT d.delivery_id) AS total_deliveries,
      COALESCE(SUM(item_stats.total_quantity), 0) AS total_items,
      COALESCE(SUM(item_stats.total_cost), 0) AS total_item_costs,
      COALESCE(SUM(comm_stats.total_commission), 0) AS total_commissions,
      
      
      COUNT(DISTINCT CASE WHEN d.status = 'pending' THEN d.delivery_id END) AS pending_deliveries,
      COUNT(DISTINCT CASE WHEN d.status = 'in_transit' THEN d.delivery_id END) AS in_transit_deliveries,
      COUNT(DISTINCT CASE WHEN d.status = 'delivered' THEN d.delivery_id END) AS delivered_deliveries,
      COUNT(DISTINCT CASE WHEN d.status = 'cancelled' THEN d.delivery_id END) AS cancelled_deliveries
    FROM deliveries d
    INNER JOIN delivery_agent_assignments da ON d.delivery_id = da.delivery_id
    LEFT JOIN (
      SELECT delivery_id, SUM(quantity) AS total_quantity, SUM(total_cost) AS total_cost,
             
      FROM delivery_items GROUP BY delivery_id
    ) item_stats ON d.delivery_id = item_stats.delivery_id
    LEFT JOIN (
      SELECT delivery_id, SUM(commission_amount) AS total_commission
      FROM delivery_agent_assignments GROUP BY delivery_id
    ) comm_stats ON d.delivery_id = comm_stats.delivery_id
  `);
    return stats[0];
  };

  // ------------------------------------------------------------
  // BULK ASSIGN AGENT TO MULTIPLE DELIVERIES (NEW)
  // ------------------------------------------------------------
  const assignAgentToDeliveries = async ({
    agentId,
    deliveryIds,
    commissionAmount,
    assignedDate,
  }) => {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const date = assignedDate || new Date().toISOString().split("T")[0];
      const amount = parseFloat(commissionAmount) || 0;

      // ✅ 1. Create Bill First
      const [billResult] = await connection.query(
        `INSERT INTO agent_delivery_bills (agent_id, bill_date)
       VALUES (?, ?)`,
        [agentId, date],
      );

      const billId = billResult.insertId; // 🔥 Important

      let insertedCount = 0;

      // ✅ 2. Assign Deliveries Under This Bill
      for (const deliveryId of deliveryIds) {
        // Check if already assigned
        const [existing] = await connection.query(
          "SELECT assignment_id FROM delivery_agent_assignments WHERE delivery_id = ?",
          [deliveryId],
        );

        if (existing.length > 0) continue;

        await connection.query(
          `INSERT INTO delivery_agent_assignments 
         (delivery_id, agent_id, commission_amount, assigned_date, status, bill_id)
         VALUES (?, ?, ?, ?, 'pending', ?)`,
          [deliveryId, agentId, amount, date, billId],
        );

        await connection.query(
          `UPDATE deliveries 
     SET status = 'in_transit'
     WHERE delivery_id = ? AND status = 'pending'`,
          [deliveryId],
        );

        insertedCount++;
      }

      await connection.commit();

      return {
        success: true,
        billId,
        message: `Created Bill #${billId} and assigned ${insertedCount} deliveries`,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };

  // ------------------------------------------------------------
  // GENERATE INVOICE (single delivery)
  // ------------------------------------------------------------
  const generateInvoice = async (deliveryId) => {
    const [deliveryRows] = await db.query(
      `
      SELECT 
        d.delivery_id,
        
        d.province_id,
        d.customer_id,
        d.delivery_date,
        d.status,
        d.created_at,
        p.province_name,
        c.customer_name,
        c.email AS customer_email,
        c.phone AS customer_phone,
        c.address AS customer_address,
        (SELECT COALESCE(SUM(total_cost), 0) FROM delivery_items WHERE delivery_id = d.delivery_id) AS total_item_cost,

        (SELECT COALESCE(SUM(quantity), 0) FROM delivery_items WHERE delivery_id = d.delivery_id) AS total_quantity,
        (SELECT COALESCE(SUM(commission_amount), 0) FROM delivery_agent_assignments WHERE delivery_id = d.delivery_id) AS total_commission
      FROM deliveries d
      LEFT JOIN provinces p ON d.province_id = p.province_id
      LEFT JOIN customers c ON d.customer_id = c.customer_id
      WHERE d.delivery_id = ?
    `,
      [deliveryId],
    );

    if (deliveryRows.length === 0) throw new Error("Delivery not found");
    const delivery = deliveryRows[0];

    const [itemRows] = await db.query(
      `
      SELECT 
        item_id,
        item_name,
        item_description,
        unit_cost,
     
        quantity,
        total_cost
      
      FROM delivery_items 
      WHERE delivery_id = ?
      ORDER BY item_id
    `,
      [deliveryId],
    );

    delivery.items = itemRows;
    delivery.net_amount =
      delivery.total_amount - (delivery.total_commission || 0);
    return delivery;
  };

  // ------------------------------------------------------------
  // GENERATE BULK INVOICES (NEW) – returns array of invoice data
  // ------------------------------------------------------------
  const generateBulkInvoices = async (deliveryIds) => {
    const invoices = [];
    for (const id of deliveryIds) {
      const invoice = await generateInvoice(id);
      invoices.push(invoice);
    }
    return invoices;
  };

  // ------------------------------------------------------------
  // GET DELIVERY STATS (fixed)
  // ------------------------------------------------------------
  // ==================== FIXED: getDeliveryStats ====================
  const getDeliveryStats = async () => {
    const [stats] = await db.query(`
      SELECT 
        COUNT(DISTINCT d.delivery_id) AS total_deliveries,
        COALESCE(SUM(item_stats.total_quantity), 0) AS total_items,
        COALESCE(SUM(item_stats.total_cost), 0) AS total_item_costs,
        COUNT(DISTINCT CASE WHEN d.status = 'pending' THEN d.delivery_id END) AS pending_deliveries,
        COUNT(DISTINCT CASE WHEN d.status = 'in_transit' THEN d.delivery_id END) AS in_transit_deliveries,
        COUNT(DISTINCT CASE WHEN d.status = 'delivered' THEN d.delivery_id END) AS delivered_deliveries,
        COUNT(DISTINCT CASE WHEN d.status = 'cancelled' THEN d.delivery_id END) AS cancelled_deliveries
      FROM deliveries d
      LEFT JOIN (
        SELECT delivery_id, SUM(quantity) AS total_quantity, SUM(total_cost) AS total_cost
        FROM delivery_items 
        GROUP BY delivery_id
      ) item_stats ON d.delivery_id = item_stats.delivery_id
      LEFT JOIN (
        SELECT delivery_id, SUM(commission_amount) AS total_commission
        FROM delivery_agent_assignments 
        GROUP BY delivery_id
      ) comm_stats ON d.delivery_id = comm_stats.delivery_id
    `);
    return stats[0];
  };

  // ==================== FIXED: searchDeliveries (accepts string or object) ====================
  const searchDeliveriesWithFilters = async (searchTerm) => {
    // If searchTerm is an object (from new filters), extract the search string
    let searchString = "";
    if (typeof searchTerm === "object" && searchTerm !== null) {
      searchString = searchTerm.search || "";
    } else {
      searchString = searchTerm || "";
    }

    const connection = await db.getConnection();
    try {
      let sql = `
        SELECT 
          d.delivery_id,
          d.delivery_date,
          d.status,
          d.return_status,
          d.return_fee_charged,
          d.return_date,
          d.created_at,
          c.customer_id,
          c.customer_name,
          c.phone AS customer_phone,
          p.province_id,
          p.province_name,
          a.agent_id,
          a.agent_name,
          a.phone AS agent_phone,
          COUNT(di.item_id) AS items_count,
          SUM(di.unit_cost * di.quantity) AS total_amount
        FROM deliveries d
        LEFT JOIN customers c ON d.customer_id = c.customer_id
        LEFT JOIN provinces p ON d.province_id = p.province_id
        LEFT JOIN delivery_agent_assignments daa ON d.delivery_id = daa.delivery_id
        LEFT JOIN agents a ON daa.agent_id = a.agent_id
        LEFT JOIN delivery_items di ON d.delivery_id = di.delivery_id
        WHERE 1=1
      `;
      const params = [];

      if (searchString.trim() !== "") {
        const term = `%${searchString}%`;
        sql += ` AND (d.delivery_id LIKE ? OR c.customer_name LIKE ? OR d.delivery_id LIKE ?)`;
        params.push(term, term, term);
      }

      sql += ` GROUP BY d.delivery_id, c.customer_id, p.province_id, a.agent_id`;
      sql += ` ORDER BY d.delivery_date DESC, d.delivery_id DESC`;

      const [rows] = await connection.query(sql, params);
      return rows;
    } catch (error) {
      console.error("Error in searchDeliveries:", error);
      throw error;
    } finally {
      connection.release();
    }
  };

  // ------------------------------------------------------------
  // OTHER REPORT FUNCTIONS (unchanged, but remove agent_id references)
  // ------------------------------------------------------------
  const getDeliveriesByDateRange = async (
    startDate,
    endDate,
    status = null,
  ) => {
    let query = `
      SELECT 
        d.delivery_id,
     
        d.province_id,
        d.customer_id,
        d.delivery_date,
        d.status,
        d.created_at,
        p.province_name,
        c.customer_name,
        COALESCE(SUM(di.quantity), 0) AS total_quantity,
        COALESCE(SUM(di.total_cost), 0) AS total_cost,
        
        COUNT(di.item_id) AS items_count,
        COALESCE(SUM(da.commission_amount), 0) AS total_commission,
       
      FROM deliveries d
      LEFT JOIN delivery_items di ON d.delivery_id = di.delivery_id
      LEFT JOIN delivery_agent_assignments da ON d.delivery_id = da.delivery_id
      LEFT JOIN provinces p ON d.province_id = p.province_id
      LEFT JOIN customers c ON d.customer_id = c.customer_id
      WHERE d.delivery_date BETWEEN ? AND ?
    `;
    const params = [startDate, endDate];
    if (status) {
      query += " AND d.status = ?";
      params.push(status);
    }
    query += ` GROUP BY d.delivery_id ORDER BY d.delivery_date DESC`;
    const [rows] = await db.query(query, params);
    return rows;
  };

  const getDeliveriesByAgent = async (agentId) => {
    const [rows] = await db.query(
      `
      SELECT 
        d.delivery_id,
      
        d.province_id,
        d.customer_id,
        d.delivery_date,
        d.status,
        d.created_at,
        p.province_name,
        c.customer_name,
        c.email AS customer_email,
        c.phone AS customer_phone,
        c.address AS customer_address,
        COALESCE(SUM(di.quantity), 0) AS total_quantity,
        COALESCE(SUM(di.total_cost), 0) AS total_cost,
        
        COALESCE(SUM(di.commission_amount), 0) AS total_item_commission,
        COUNT(di.item_id) AS items_count,
        COALESCE(SUM(da.commission_amount), 0) AS total_agent_commission,
        
        DATE_FORMAT(d.delivery_date, '%Y-%m-%d') AS delivery_date_formatted
      FROM deliveries d
      LEFT JOIN delivery_items di ON d.delivery_id = di.delivery_id
      LEFT JOIN delivery_agent_assignments da ON d.delivery_id = da.delivery_id AND da.agent_id = ?
      LEFT JOIN provinces p ON d.province_id = p.province_id
      LEFT JOIN customers c ON d.customer_id = c.customer_id
      WHERE da.agent_id = ?
      GROUP BY d.delivery_id
      ORDER BY d.delivery_date DESC
    `,
      [agentId, agentId],
    );
    return rows;
  };

  const getAgentPerformanceReport = async () => {
    const [rows] = await db.query(`
      SELECT 
        a.agent_id,
        a.agent_name,
        a.phone,
        COUNT(DISTINCT da.delivery_id) AS total_deliveries,
        COALESCE(SUM(da.commission_amount), 0) AS total_commission_earned,
        COALESCE(AVG(da.commission_amount), 0) AS avg_commission_per_delivery,
        COUNT(DISTINCT CASE WHEN d.status = 'delivered' THEN d.delivery_id END) AS delivered_count,
        COUNT(DISTINCT CASE WHEN d.status = 'pending' THEN d.delivery_id END) AS pending_count
      FROM agents a
      LEFT JOIN delivery_agent_assignments da ON a.agent_id = da.agent_id
      LEFT JOIN deliveries d ON da.delivery_id = d.delivery_id
      GROUP BY a.agent_id
      ORDER BY total_commission_earned DESC
    `);
    return rows;
  };

  // ------------------------------------------------------------
  // UPDATE DELIVERY STATUS
  // ------------------------------------------------------------
  const updateDeliveryStatus = async (deliveryId, status) => {
    const valid = ["pending", "in_transit", "delivered", "cancelled"];
    if (!valid.includes(status)) throw new Error("Invalid status");
    await db.query("UPDATE deliveries SET status = ? WHERE delivery_id = ?", [
      status,
      deliveryId,
    ]);
    return { success: true, message: `Status updated to ${status}` };
  };

  // ------------------------------------------------------------
  // RECORD RETURN (adjusted for assignments)
  // ------------------------------------------------------------
  const recordDeliveryReturn = async (returnData) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Update delivery
      await connection.query(
        `UPDATE deliveries SET 
          status = 'cancelled',
          return_status = 'full_return',
          return_fee_charged = ?,
          return_date = CURDATE()
         WHERE delivery_id = ?`,
        [
          parseFloat(returnData.return_fee || 0) +
            parseFloat(returnData.handling_fee || 0),
          returnData.delivery_id,
        ],
      );

      // Get active assignments
      const [assignments] = await connection.query(
        `SELECT assignment_id, agent_id, commission_amount 
         FROM delivery_agent_assignments 
         WHERE delivery_id = ? AND status IN ('pending', 'transaction')`,
        [returnData.delivery_id],
      );

      for (const ass of assignments) {
        const deduction = parseFloat(ass.commission_amount) * 0.5;
        await connection.query(
          `INSERT INTO agent_payments (
            agent_id, payment_amount, payment_date, period_start, period_end,
            payment_method, notes
          ) VALUES (?, ?, CURDATE(), CURDATE(), CURDATE(), ?, ?)`,
          [
            ass.agent_id,
            -deduction,
            "return_deduction",
            `Return for delivery #${returnData.delivery_id}. Reason: ${returnData.return_reason}. ${returnData.notes || ""}`,
          ],
        );
        await connection.query(
          `UPDATE delivery_agent_assignments SET status = 'cancelled' WHERE assignment_id = ?`,
          [ass.assignment_id],
        );
      }

      await connection.commit();
      return {
        success: true,
        message: "Return recorded, commissions adjusted.",
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };

  // ------------------------------------------------------------
  // GET ALL AGENT BILLS (with agent name & delivery count)
  // ------------------------------------------------------------
  const getAgentBills = async () => {
    const [rows] = await db.query(`
    SELECT 
      b.bill_id,
      b.agent_id,
      b.bill_date,
      b.created_at,
      a.agent_name,
      a.phone AS agent_phone,
      COUNT(da.assignment_id) AS total_deliveries,
      COALESCE(SUM(da.commission_amount), 0) AS total_commission,
      MAX(da.assigned_date) AS latest_delivery_date
    FROM agent_delivery_bills b
    JOIN agents a ON b.agent_id = a.agent_id
    LEFT JOIN delivery_agent_assignments da ON b.bill_id = da.bill_id
    GROUP BY b.bill_id
    ORDER BY b.bill_date DESC, b.bill_id DESC
  `);
    return rows;
  };

  // ------------------------------------------------------------
  // GET SINGLE BILL WITH ALL ITS DELIVERIES (full details)
  // ------------------------------------------------------------
  const getBillDetails = async (billId) => {
    // 1. Bill header
    const [billRows] = await db.query(
      `
    SELECT 
      b.bill_id,
      b.agent_id,
      b.bill_date,
      b.created_at,
      a.agent_name,
      a.phone AS agent_phone
    FROM agent_delivery_bills b
    JOIN agents a ON b.agent_id = a.agent_id
    WHERE b.bill_id = ?
  `,
      [billId],
    );
    if (billRows.length === 0) return null;
    const bill = billRows[0];

    // 2. Deliveries assigned to this bill (with aggregated totals)
    const [deliveryRows] = await db.query(
      `
    SELECT 
      d.delivery_id,
      d.delivery_date,
      d.status AS delivery_status,
      c.customer_name,
      c.phone AS customer_phone,
      p.province_name,
      da.assignment_id,
      da.commission_amount,
      da.assigned_date,
      da.status AS assignment_status,
      -- Items summary (optional but handy)
      COALESCE(SUM(di.quantity), 0) AS total_quantity,
      COALESCE(SUM(di.total_cost), 0) AS total_cost,
      COUNT(DISTINCT di.item_id) AS items_count
    FROM delivery_agent_assignments da
    JOIN deliveries d ON da.delivery_id = d.delivery_id
    LEFT JOIN customers c ON d.customer_id = c.customer_id
    LEFT JOIN provinces p ON d.province_id = p.province_id
    LEFT JOIN delivery_items di ON d.delivery_id = di.delivery_id
    WHERE da.bill_id = ?
    GROUP BY d.delivery_id, da.assignment_id
    ORDER BY da.assigned_date DESC
  `,
      [billId],
    );

    // 3. Fetch all items for these deliveries
    if (deliveryRows.length > 0) {
      const deliveryIds = deliveryRows.map((d) => d.delivery_id);
      const [itemRows] = await db.query(
        `
      SELECT 
        delivery_id,
        item_id,
        item_name,
        unit_cost,
        quantity,
        total_cost,
        item_description,
        commission_amount,
        fess
      FROM delivery_items
      WHERE delivery_id IN (?)
      ORDER BY delivery_id, item_id
    `,
        [deliveryIds],
      );

      // Group items by delivery_id
      const itemsByDelivery = {};
      itemRows.forEach((item) => {
        if (!itemsByDelivery[item.delivery_id]) {
          itemsByDelivery[item.delivery_id] = [];
        }
        itemsByDelivery[item.delivery_id].push(item);
      });

      // Attach items to each delivery
      deliveryRows.forEach((delivery) => {
        delivery.items = itemsByDelivery[delivery.delivery_id] || [];
      });
    } else {
      // No deliveries, set empty array for each (though none exist)
      deliveryRows.forEach((delivery) => {
        delivery.items = [];
      });
    }

    bill.deliveries = deliveryRows;
    bill.total_deliveries = deliveryRows.length;
    bill.total_commission = deliveryRows.reduce(
      (sum, d) => sum + parseFloat(d.commission_amount || 0),
      0,
    );
    bill.total_value = deliveryRows.reduce(
      (sum, d) => sum + parseFloat(d.total_cost || 0),
      0,
    );

    return bill;
  };

  // ------------------------------------------------------------
  // CREATE A NEW BILL (assigns a set of delivery assignments to a bill)
  // ------------------------------------------------------------
  const createAgentBill = async ({
    agentId,
    deliveryAssignmentIds,
    billDate,
  }) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Create the bill record
      const [billResult] = await connection.query(
        `INSERT INTO agent_delivery_bills (agent_id, bill_date) VALUES (?, ?)`,
        [agentId, billDate || new Date().toISOString().split("T")[0]],
      );
      const newBillId = billResult.insertId;

      // 2. Update the selected assignments with this bill_id
      if (deliveryAssignmentIds && deliveryAssignmentIds.length > 0) {
        // Ensure all assignments belong to the same agent (optional safety)
        const [check] = await connection.query(
          `SELECT COUNT(*) AS mismatch FROM delivery_agent_assignments 
         WHERE assignment_id IN (?) AND agent_id != ?`,
          [deliveryAssignmentIds, agentId],
        );
        if (check[0].mismatch > 0) {
          throw new Error(
            "All selected assignments must belong to the same agent",
          );
        }

        await connection.query(
          `UPDATE delivery_agent_assignments SET bill_id = ? 
         WHERE assignment_id IN (?)`,
          [newBillId, deliveryAssignmentIds],
        );
      }

      await connection.commit();
      return {
        success: true,
        bill_id: newBillId,
        message: `Bill #${newBillId} created with ${deliveryAssignmentIds.length} deliveries`,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };

  // ------------------------------------------------------------
  // OPTIONAL: GET UNBILLED DELIVERIES FOR AN AGENT (to select when creating a bill)
  // ------------------------------------------------------------
  const getUnbilledDeliveriesByAgent = async (agentId) => {
    const [rows] = await db.query(
      `
    SELECT 
      da.assignment_id,
      d.delivery_id,
    
      d.delivery_date,
      c.customer_name,
      da.commission_amount,
      da.assigned_date,
      d.status AS delivery_status
    FROM delivery_agent_assignments da
    JOIN deliveries d ON da.delivery_id = d.delivery_id
    LEFT JOIN customers c ON d.customer_id = c.customer_id
    WHERE da.agent_id = ? 
      AND da.bill_id IS NULL
      AND da.status IN ('completed', 'delivered')   -- only billable deliveries
    ORDER BY da.assigned_date DESC
  `,
      [agentId],
    );
    return rows;
  };

  // ------------------------------------------------------------
  // EXPORTS
  // ------------------------------------------------------------
  return {
    getDeliveries,
    getDeliveriesWithFilters,
    getDelivery,
    addDelivery,
    updateDelivery,
    deleteDelivery,
    searchDeliveries,
    searchDeliveriesWithFilters,
    getDeliveryStats,
    generateInvoice,
    getDeliveriesByAgent,
    getDeliveriesByDateRange,
    getAgentPerformanceReport,
    updateDeliveryStatus,
    recordDeliveryReturn,
    // NEW functions
    getPendingDeliveriesByProvince,
    assignAgentToDeliveries,
    generateBulkInvoices,
    getAssignedDeliveries,
    searchAssignedDeliveries,
    getAssignedDeliveryStats,
    getAgentBills,
    getBillDetails,
    createAgentBill,
    getUnbilledDeliveriesByAgent,
  };
};
