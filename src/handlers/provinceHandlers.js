// provinceHandlers.js
const mysql = require("mysql2/promise");

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

  // Get provinces with delivery count
  const getProvincesWithStats = async () => {
    try {
      const [rows] = await db.query(`
        SELECT 
          p.*,
          COUNT(d.delivery_id) as total_deliveries,
          COALESCE(SUM(d.quantity), 0) as total_items
        FROM provinces p
        LEFT JOIN deliveries d ON p.province_id = d.province_id
        GROUP BY p.province_id
        ORDER BY p.province_name
      `);
      return rows;
    } catch (error) {
      console.error("Error fetching provinces with stats:", error);
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
    getProvincesWithStats
  };
};