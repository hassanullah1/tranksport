// dashboard.js (backend module)

module.exports = (db) => {
  /**
   * Calculate date range based on period and optional custom dates.
   * Returns an object with startDate and endDate as strings (YYYY-MM-DD) or null.
   */
  const getDateRange = (period, startDate, endDate) => {
    const now = new Date();
    let start = null;
    let end = null;

    // Format a Date object to YYYY-MM-DD using UTC components
    const formatUTCDate = (date) => {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    switch (period) {
      case "today": {
        const d = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
        );
        start = formatUTCDate(d);
        end = formatUTCDate(d);
        break;
      }
      case "week": {
        // Start of current week (Sunday) in UTC
        const dayOfWeek = now.getUTCDay(); // 0 = Sunday
        const startDate = new Date(
          Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() - dayOfWeek,
          ),
        );
        start = formatUTCDate(startDate);
        end = formatUTCDate(now); // today (UTC)
        break;
      }
      case "month": {
        const startDate = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
        );
        start = formatUTCDate(startDate);
        end = formatUTCDate(now);
        break;
      }
      case "year": {
        const startDate = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
        start = formatUTCDate(startDate);
        end = formatUTCDate(now);
        break;
      }
      case "custom":
        // Use the raw strings from the frontend – no conversion
        if (startDate && endDate) {
          start = startDate;
          end = endDate;
        }
        break;
      default:
        // fallback to week
        const dayOfWeek = now.getUTCDay();
        const defaultStart = new Date(
          Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() - dayOfWeek,
          ),
        );
        start = formatUTCDate(defaultStart);
        end = formatUTCDate(now);
        break;
    }

    return { startDate: start, endDate: end };
  };
  const getDashboardSummary = async (options = {}) => {
    const { period = "week", startDate, endDate } = options;
    const range = getDateRange(period, startDate, endDate);

    try {
      // Optional: log the range for debugging
      console.log("Dashboard range:", range);

      // 1. Delivery counts and return fees
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

      // 2. Financial sums and item counts per status
      let itemsQuery = `
      SELECT 
        COALESCE(SUM(CASE WHEN d.status = 'delivered' THEN di.total_cost ELSE 0 END), 0) AS total_cost_sum,
        COALESCE(SUM(CASE WHEN d.status = 'delivered' THEN di.commission_amount ELSE 0 END), 0) AS commission_sum,
        COALESCE(SUM(CASE WHEN d.status = 'delivered' THEN di.fess ELSE 0 END), 0) AS fess_sum,
        COALESCE(SUM(CASE WHEN d.status = 'delivered' THEN di.quantity ELSE 0 END), 0) AS total_items_sold,
        SUM(CASE WHEN d.status = 'pending' THEN di.quantity ELSE 0 END) AS pending_items,
        SUM(CASE WHEN d.status = 'delivered' THEN di.quantity ELSE 0 END) AS delivered_items,
        SUM(CASE WHEN d.status = 'cancelled' THEN di.quantity ELSE 0 END) AS cancelled_items,
        SUM(CASE WHEN d.status = 'rejected' THEN di.quantity ELSE 0 END) AS rejected_items
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

      return {
        success: true,
        data: {
          // Removed total_provinces and total_agents (they were undefined)
          total_deliveries: deliveryStats?.total_deliveries || 0,
          total_return_fees: parseFloat(deliveryStats?.total_return_fees || 0),
          total_cost_sum: parseFloat(itemsSums?.total_cost_sum || 0),
          commission_sum: parseFloat(itemsSums?.commission_sum || 0),
          fess_sum: parseFloat(itemsSums?.fess_sum || 0),
          total_items_sold: parseInt(itemsSums?.total_items_sold || 0),
          pending_items: parseInt(itemsSums?.pending_items || 0),
          delivered_items: parseInt(itemsSums?.delivered_items || 0),
          cancelled_items: parseInt(itemsSums?.cancelled_items || 0),
          rejected_items: parseInt(itemsSums?.rejected_items || 0),
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
