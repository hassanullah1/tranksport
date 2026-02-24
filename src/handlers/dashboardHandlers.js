
module.exports = (db) => {
  /**
   * Get date range based on predefined period
   * @param {string} period - 'week', 'month', 'year', or 'custom'
   * @param {string} startDate - custom start date (YYYY-MM-DD)
   * @param {string} endDate - custom end date (YYYY-MM-DD)
   * @returns {object} { startDate, endDate }
   */
  const getDateRange = (period, startDate, endDate) => {
    const now = new Date();
    let start = null;
    let end = null;

    if (period === "week") {
      // Start of current week (Sunday as first day)
      const day = now.getDay(); // 0 = Sunday
      start = new Date(now);
      start.setDate(now.getDate() - day);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
    } else if (period === "month") {
      // Start of current month
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
    } else if (period === "year") {
      // Start of current year
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
    } else if (period === "custom") {
      // Use provided custom dates
      if (startDate && endDate) {
        start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
      }
    }

    // Format as YYYY-MM-DD for MySQL DATE comparison
    const formatDate = (date) => {
      if (!date) return null;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    return {
      startDate: formatDate(start),
      endDate: formatDate(end),
    };
  };

  /**
   * Get dashboard summary statistics
   * @param {object} options - { period, startDate, endDate }
   * @returns {object} Summary statistics
   */
  const getDashboardSummary = async (options = {}) => {
    const { period = "week", startDate, endDate } = options;
    const range = getDateRange(period, startDate, endDate);

    try {
      // 1. Total provinces (always overall, not filtered by date)
      const [[provinceCount]] = await db.query(
        "SELECT COUNT(*) AS total FROM provinces",
      );

      // 2. Total agents (overall)
      const [[agentCount]] = await db.query(
        "SELECT COUNT(*) AS total FROM agents",
      );

      // 3. Deliveries count and return fee sum (filtered by delivery_date)
      let deliveryStatsQuery = `
        SELECT 
          COUNT(*) AS total_deliveries,
          COALESCE(SUM(return_fee_charged), 0) AS total_return_fees
        FROM deliveries
        WHERE 1=1
      `;
      const deliveryParams = [];
      if (range.startDate) {
        deliveryStatsQuery += " AND delivery_date >= ?";
        deliveryParams.push(range.startDate);
      }
      if (range.endDate) {
        deliveryStatsQuery += " AND delivery_date <= ?";
        deliveryParams.push(range.endDate);
      }
      const [[deliveryStats]] = await db.query(
        deliveryStatsQuery,
        deliveryParams,
      );

      // 4. Financial sums from delivery_items (join with deliveries for date filtering)
     let itemsQuery = `
  SELECT 
    COALESCE(SUM(
      CASE 
        WHEN d.return_status = 'none' 
        THEN di.total_cost 
        ELSE 0 
      END
    ), 0) AS total_cost_sum,

    COALESCE(SUM(di.commission_amount), 0) AS commission_sum,
    COALESCE(SUM(di.fess), 0) AS fess_sum,
    COALESCE(SUM(di.quantity), 0) AS total_items_sold

  FROM delivery_items di
  INNER JOIN deliveries d ON di.delivery_id = d.delivery_id
  WHERE 1=1
`;

      const itemsParams = [];
      if (range.startDate) {
        itemsQuery += " AND d.delivery_date >= ?";
        itemsParams.push(range.startDate);
      }
      if (range.endDate) {
        itemsQuery += " AND d.delivery_date <= ?";
        itemsParams.push(range.endDate);
      }
      const [[itemsSums]] = await db.query(itemsQuery, itemsParams);

      // 5. Possibly average delivery value, etc. – we can add more later

      return {
        success: true,
        data: {
          total_provinces: provinceCount?.total || 0,
          total_agents: agentCount?.total || 0,
          total_deliveries: deliveryStats?.total_deliveries || 0,
          total_return_fees: parseFloat(deliveryStats?.total_return_fees || 0),
          total_cost_sum: parseFloat(itemsSums?.total_cost_sum || 0),
          commission_sum: parseFloat(itemsSums?.commission_sum || 0),
          fess_sum: parseFloat(itemsSums?.fess_sum || 0),
          total_items_sold: parseInt(itemsSums?.total_items_sold || 0),
        },
        range: {
          period,
          startDate: range.startDate,
          endDate: range.endDate,
        },
      };
    } catch (error) {
      console.error("Error in getDashboardSummary:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  };

  return {
    getDashboardSummary,
  };
};
