// ------------------------------------------------------------
// FINANCIAL REPORT – aggregated statistics
// ------------------------------------------------------------

module.exports = (db) => {
const getFinancialSummary = async () => {
  const [summary] = await db.query(`
    SELECT
    
      COALESCE(SUM(di.total_cost), 0) AS total_cost,
     
      
      -- Delivery counts
      COUNT(DISTINCT d.delivery_id) AS total_deliveries,
      COUNT(DISTINCT CASE WHEN d.status = 'pending' THEN d.delivery_id END) AS pending_deliveries,
      COUNT(DISTINCT CASE WHEN d.status = 'in_transit' THEN d.delivery_id END) AS in_transit_deliveries,
      COUNT(DISTINCT CASE WHEN d.status = 'delivered' THEN d.delivery_id END) AS delivered_deliveries,
      COUNT(DISTINCT CASE WHEN d.status = 'cancelled' THEN d.delivery_id END) AS cancelled_deliveries,
      
      -- Return fees collected
      COALESCE(SUM(d.return_fee_charged), 0) AS total_return_fees,
      
      -- Bills
      COUNT(DISTINCT b.bill_id) AS total_bills,
      COALESCE(SUM(da.commission_amount), 0) AS total_billed_commission
      
    FROM deliveries d
    LEFT JOIN delivery_items di ON d.delivery_id = di.delivery_id
    LEFT JOIN delivery_agent_assignments da ON d.delivery_id = da.delivery_id
    LEFT JOIN agent_delivery_bills b ON da.bill_id = b.bill_id
  `);
  return summary[0];
};

// ------------------------------------------------------------
// Monthly financial breakdown (last 12 months)
// ------------------------------------------------------------
const getMonthlyFinancials = async () => {
  const [rows] = await db.query(`
    SELECT
      DATE_FORMAT(d.delivery_date, '%Y-%m') AS month,
     
      COALESCE(SUM(di.total_cost), 0) AS cost,
    
      COUNT(DISTINCT d.delivery_id) AS deliveries
    FROM deliveries d
    LEFT JOIN delivery_items di ON d.delivery_id = di.delivery_id
    LEFT JOIN delivery_agent_assignments da ON d.delivery_id = da.delivery_id
    WHERE d.delivery_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
    GROUP BY DATE_FORMAT(d.delivery_date, '%Y-%m')
    ORDER BY month DESC
  `);
  return rows;
};

// ------------------------------------------------------------
// Top agents by total commission earned
// ------------------------------------------------------------
const getTopAgents = async (limit = 5) => {
  const [rows] = await db.query(`
    SELECT
      a.agent_id,
      a.agent_name,
      a.phone,
      COUNT(DISTINCT da.delivery_id) AS deliveries_handled,
      COALESCE(SUM(da.commission_amount), 0) AS total_commission,
      COALESCE(AVG(da.commission_amount), 0) AS avg_commission
    FROM agents a
    JOIN delivery_agent_assignments da ON a.agent_id = da.agent_id
    GROUP BY a.agent_id
    ORDER BY total_commission DESC
    LIMIT ?
  `, [limit]);
  return rows;
};

// ------------------------------------------------------------
// Recent bills with agent names and totals
// ------------------------------------------------------------
const getRecentBills = async (limit = 10) => {
  const [rows] = await db.query(`
    SELECT
      b.bill_id,
      b.bill_date,
      b.created_at,
      a.agent_name,
      a.phone AS agent_phone,
      COUNT(da.assignment_id) AS delivery_count,
      COALESCE(SUM(da.commission_amount), 0) AS total_commission
    FROM agent_delivery_bills b
    JOIN agents a ON b.agent_id = a.agent_id
    LEFT JOIN delivery_agent_assignments da ON b.bill_id = da.bill_id
    GROUP BY b.bill_id
    ORDER BY b.bill_date DESC, b.bill_id DESC
    LIMIT ?
  `, [limit]);
  return rows;
};

// ------------------------------------------------------------
// Recent agent payments (if you have agent_payments table)
// ------------------------------------------------------------
const getRecentPayments = async (limit = 10) => {
  // This assumes you have an 'agent_payments' table with fields:
  // payment_id, agent_id, payment_date, amount, method, notes
  const [rows] = await db.query(`
    SELECT
      p.payment_id,
      p.payment_date,
      p.payment_amount,
      p.payment_method,
      p.notes,
      a.agent_name,
      a.phone
    FROM agent_payments p
    JOIN agents a ON p.agent_id = a.agent_id
    ORDER BY p.payment_date DESC
    LIMIT ?
  `, [limit]);
  return rows;
};

  return {
    getFinancialSummary,
  getMonthlyFinancials,
  getTopAgents,
  getRecentBills,
  getRecentPayments,
  };
};
