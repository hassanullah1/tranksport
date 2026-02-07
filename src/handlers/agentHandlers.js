// agentHandlers.js
module.exports = (db) => {
  // Get all agents with their province
  const getAgents = async () => {
    try {
      const [rows] = await db.query(`
        SELECT 
          a.*,
          p.province_name,
          COUNT(DISTINCT d.delivery_id) as total_deliveries
        FROM agents a
        LEFT JOIN provinces p ON a.province_id = p.province_id
        LEFT JOIN deliveries d ON a.agent_id = d.agent_id
        GROUP BY a.agent_id
        ORDER BY a.agent_name
      `);
      return rows;
    } catch (error) {
      console.error("Error fetching agents:", error);
      throw error;
    }
  };

  // Add new agent
  const addAgent = async (agentData) => {
    try {
      const { agent_name, phone, province_id } = agentData;
      
      // Check if agent already exists
      const [existing] = await db.query(
        "SELECT agent_id FROM agents WHERE agent_name = ?", 
        [agent_name]
      );
      
      if (existing.length > 0) {
        throw new Error("Agent with this name already exists!");
      }
      
      // If province_id is provided, check if it exists
      if (province_id) {
        const [province] = await db.query(
          "SELECT province_id FROM provinces WHERE province_id = ?", 
          [province_id]
        );
        
        if (province.length === 0) {
          throw new Error("Selected province does not exist!");
        }
      }
      
      // Insert new agent
      const [result] = await db.query(
        "INSERT INTO agents (agent_name, phone, province_id) VALUES (?, ?, ?)",
        [agent_name, phone, province_id || null]
      );
      
      return { 
        success: true, 
        agent_id: result.insertId, 
        message: "Agent added successfully!" 
      };
    } catch (error) {
      console.error("Error adding agent:", error);
      throw error;
    }
  };

  // Update agent
  const updateAgent = async (agentData) => {
    try {
      const { agent_id, agent_name, phone, province_id } = agentData;
      
      // Check if new name conflicts with another agent
      const [existing] = await db.query(
        "SELECT agent_id FROM agents WHERE agent_name = ? AND agent_id != ?", 
        [agent_name, agent_id]
      );
      
      if (existing.length > 0) {
        throw new Error("Another agent with this name already exists!");
      }
      
      // If province_id is provided, check if it exists
      if (province_id) {
        const [province] = await db.query(
          "SELECT province_id FROM provinces WHERE province_id = ?", 
          [province_id]
        );
        
        if (province.length === 0) {
          throw new Error("Selected province does not exist!");
        }
      }
      
      // Update agent
      const [result] = await db.query(
        "UPDATE agents SET agent_name = ?, phone = ?, province_id = ? WHERE agent_id = ?",
        [agent_name, phone, province_id || null, agent_id]
      );
      
      return { 
        success: true, 
        affectedRows: result.affectedRows,
        message: "Agent updated successfully!" 
      };
    } catch (error) {
      console.error("Error updating agent:", error);
      throw error;
    }
  };

  // Delete agent
  const deleteAgent = async (agentId) => {
    try {
      // First check if agent has any deliveries
      const [deliveries] = await db.query(
        "SELECT COUNT(*) as count FROM deliveries WHERE agent_id = ?",
        [agentId]
      );
      
      if (deliveries[0].count > 0) {
        throw new Error("Cannot delete agent with existing deliveries. Please reassign deliveries first.");
      }
      
      // Delete agent
      const [result] = await db.query(
        "DELETE FROM agents WHERE agent_id = ?",
        [agentId]
      );
      
      return { 
        success: true, 
        affectedRows: result.affectedRows,
        message: "Agent deleted successfully!" 
      };
    } catch (error) {
      console.error("Error deleting agent:", error);
      throw error;
    }
  };

  // Search agents
  const searchAgents = async (searchTerm) => {
    try {
      const [rows] = await db.query(`
        SELECT 
          a.*,
          p.province_name
        FROM agents a
        LEFT JOIN provinces p ON a.province_id = p.province_id
        WHERE a.agent_name LIKE ? OR a.phone LIKE ?
        ORDER BY a.agent_name
      `, [`%${searchTerm}%`, `%${searchTerm}%`]);
      return rows;
    } catch (error) {
      console.error("Error searching agents:", error);
      throw error;
    }
  };

  // Get agents by province (for delivery form)
  const getAgentsByProvince = async (provinceId) => {
    try {
      const [rows] = await db.query(`
        SELECT * FROM agents 
        WHERE province_id = ?
        ORDER BY agent_name
      `, [provinceId]);
      return rows;
    } catch (error) {
      console.error("Error fetching agents by province:", error);
      throw error;
    }
  };

  // Check if province is already assigned to another agent
  const checkProvinceAssignment = async (provinceId, excludeAgentId = null) => {
    try {
      let query = "SELECT agent_id, agent_name FROM agents WHERE province_id = ?";
      const params = [provinceId];
      
      if (excludeAgentId) {
        query += " AND agent_id != ?";
        params.push(excludeAgentId);
      }
      
      const [rows] = await db.query(query, params);
      return rows;
    } catch (error) {
      console.error("Error checking province assignment:", error);
      throw error;
    }
  };

  return {
    getAgents,
    getAgentsByProvince,
    addAgent,
    updateAgent,
    deleteAgent,
    searchAgents,
    checkProvinceAssignment
  };
};