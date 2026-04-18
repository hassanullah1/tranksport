// expenseHandlers.js
module.exports = (db) => {
  // Get all expenses with optional date filtering
  const getExpenses = async (startDate = null, endDate = null) => {
    try {
      let query = `SELECT * FROM expenses`;
      let params = [];

      if (startDate && endDate) {
        query += ` WHERE DATE(expense_date) BETWEEN ? AND ?`;
        params = [startDate, endDate];
      } else if (startDate) {
        query += ` WHERE DATE(expense_date) >= ?`;
        params = [startDate];
      } else if (endDate) {
        query += ` WHERE DATE(expense_date) <= ?`;
        params = [endDate];
      }

      query += ` ORDER BY  created_at DESC`;

      const [rows] = await db.query(query, params);
      return rows;
    } catch (error) {
      console.error("Error fetching expenses:", error);
      throw error;
    }
  };

  // Get single expense by ID
  const getExpense = async (expenseId) => {
    try {
      const [rows] = await db.query(
        `SELECT * FROM expenses WHERE expense_id = ?`,
        [expenseId],
      );
      return rows[0] || null;
    } catch (error) {
      console.error("Error fetching expense:", error);
      throw error;
    }
  };

  // Add new expense
  const addExpense = async (expenseData) => {
    try {
      const { expense_description, amount, expense_date, created_by } =
        expenseData;

      const [result] = await db.query(
        `INSERT INTO expenses 
         (expense_description, amount, expense_date, created_by) 
         VALUES (?, ?, ?, ?)`,
        [expense_description, amount, expense_date, created_by || 1],
      );

      return {
        success: true,
        expense_id: result.insertId,
        message: "Expense added successfully!",
      };
    } catch (error) {
      console.error("Error adding expense:", error);
      throw error;
    }
  };

  // Update expense
  const updateExpense = async (expenseData) => {
    try {
      const { expense_id, expense_description, amount, expense_date } =
        expenseData;

      const [result] = await db.query(
        `UPDATE expenses 
         SET expense_description = ?, amount = ?, expense_date = ?
         WHERE expense_id = ?`,
        [expense_description, amount, expense_date, expense_id],
      );

      return {
        success: true,
        affectedRows: result.affectedRows,
        message: "Expense updated successfully!",
      };
    } catch (error) {
      console.error("Error updating expense:", error);
      throw error;
    }
  };

  // Delete expense
  const deleteExpense = async (expenseId) => {
    try {
      const [result] = await db.query(
        "DELETE FROM expenses WHERE expense_id = ?",
        [expenseId],
      );

      return {
        success: true,
        affectedRows: result.affectedRows,
        message: "Expense deleted successfully!",
      };
    } catch (error) {
      console.error("Error deleting expense:", error);
      throw error;
    }
  };

  // Search expenses
  const searchExpenses = async (searchTerm) => {
    try {
      const [rows] = await db.query(
        `SELECT * FROM expenses 
         WHERE expense_description LIKE ? 
         ORDER BY expense_date DESC`,
        [`%${searchTerm}%`],
      );
      return rows;
    } catch (error) {
      console.error("Error searching expenses:", error);
      throw error;
    }
  };

  // Get expenses by date range
  const getExpensesByDateRange = async (startDate, endDate) => {
    try {
      const [rows] = await db.query(
        `SELECT * FROM expenses 
         WHERE DATE(expense_date) BETWEEN ? AND ?
         ORDER BY expense_date DESC`,
        [startDate, endDate],
      );
      return rows;
    } catch (error) {
      console.error("Error fetching expenses by date range:", error);
      throw error;
    }
  };

  // Get expense statistics
  const getExpenseStats = async (startDate = null, endDate = null) => {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_expenses,
          COALESCE(SUM(amount), 0) as total_amount,
          COALESCE(AVG(amount), 0) as average_amount,
          MIN(amount) as min_amount,
          MAX(amount) as max_amount
        FROM expenses
      `;
      let params = [];

      if (startDate && endDate) {
        query += ` WHERE DATE(expense_date) BETWEEN ? AND ?`;
        params = [startDate, endDate];
      }

      const [stats] = await db.query(query, params);

      return {
        summary: stats[0],
      };
    } catch (error) {
      console.error("Error fetching expense stats:", error);
      throw error;
    }
  };

  return {
    getExpenses,
    getExpense,
    addExpense,
    updateExpense,
    deleteExpense,
    searchExpenses,
    getExpensesByDateRange,
    getExpenseStats,
  };
};
