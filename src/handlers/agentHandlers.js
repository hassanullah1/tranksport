// agentHandlers.js
module.exports = (db) => {
  // Get all agents with statistics
  const getAgents = async () => {
    try {
      const [rows] = await db.query(`
        SELECT 
          a.*,
          COUNT(DISTINCT d.delivery_id) as total_deliveries,
         
          COALESCE(SUM(d.commission_amount), 0) as total_commission_earned,
          COUNT(DISTINCT ap.province_id) as assigned_provinces_count,
          GROUP_CONCAT(DISTINCT p.province_name SEPARATOR ', ') as assigned_provinces
        FROM agents a
        LEFT JOIN deliveries d ON a.agent_id = d.agent_id
        LEFT JOIN agent_provinces ap ON a.agent_id = ap.agent_id
        LEFT JOIN provinces p ON ap.province_id = p.province_id
        GROUP BY a.agent_id
        ORDER BY a.agent_name
      `);
      return rows;
    } catch (error) {
      console.error("Error fetching agents:", error);
      throw error;
    }
  };

  // Get single agent by ID
  const getAgent = async (agentId) => {
    try {
      const [rows] = await db.query(
        "SELECT * FROM agents WHERE agent_id = ?", 
        [agentId]
      );
      return rows[0] || null;
    } catch (error) {
      console.error("Error fetching agent:", error);
      throw error;
    }
  };

  // Add new agent
  const addAgent = async (agentData) => {
    try {
      const { agent_name, email, phone, commission_rate } = agentData;
      
      // Check if agent already exists
      const [existing] = await db.query(
        "SELECT agent_id FROM agents WHERE agent_name = ?", 
        [agent_name]
      );
      
      if (existing.length > 0) {
        throw new Error("Agent already exists!");
      }
      
      // Insert new agent
      const [result] = await db.query(
        "INSERT INTO agents (agent_name, email, phone, commission_rate) VALUES (?, ?, ?, ?)",
        [agent_name, email, phone, commission_rate]
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
      const { agent_id, agent_name, email, phone, commission_rate } = agentData;
      
      // Check if new name conflicts with another agent
      const [existing] = await db.query(
        "SELECT agent_id FROM agents WHERE agent_name = ? AND agent_id != ?", 
        [agent_name, agent_id]
      );
      
      if (existing.length > 0) {
        throw new Error("Another agent with this name already exists!");
      }
      
      // Update agent
      const [result] = await db.query(
        "UPDATE agents SET agent_name = ?, email = ?, phone = ?, commission_rate = ? WHERE agent_id = ?",
        [agent_name, email, phone, commission_rate, agent_id]
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
      
      // Delete agent_provinces associations first
      await db.query(
        "DELETE FROM agent_provinces WHERE agent_id = ?",
        [agentId]
      );
      
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
          COUNT(DISTINCT d.delivery_id) as total_deliveries,
          COALESCE(SUM(d.quantity), 0) as total_items_delivered,
          COALESCE(SUM(d.commission_amount), 0) as total_commission_earned,
          COUNT(DISTINCT ap.province_id) as assigned_provinces_count,
          GROUP_CONCAT(DISTINCT p.province_name SEPARATOR ', ') as assigned_provinces
        FROM agents a
        LEFT JOIN deliveries d ON a.agent_id = d.agent_id
        LEFT JOIN agent_provinces ap ON a.agent_id = ap.agent_id
        LEFT JOIN provinces p ON ap.province_id = p.province_id
        WHERE a.agent_name LIKE ? OR a.email LIKE ? OR a.phone LIKE ?
        GROUP BY a.agent_id
        ORDER BY a.agent_name
      `, [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]);
      return rows;
    } catch (error) {
      console.error("Error searching agents:", error);
      throw error;
    }
  };

  // Get agent's assigned provinces
  const getAgentProvinces = async (agentId) => {
    try {
      const [rows] = await db.query(`
        SELECT p.*, ap.assignment_date 
        FROM provinces p
        INNER JOIN agent_provinces ap ON p.province_id = ap.province_id
        WHERE ap.agent_id = ?
        ORDER BY p.province_name
      `, [agentId]);
      return rows;
    } catch (error) {
      console.error("Error fetching agent provinces:", error);
      throw error;
    }
  };

  // Get available provinces for an agent (not yet assigned)
  const getAvailableProvinces = async (agentId) => {
    try {
      const [rows] = await db.query(`
        SELECT p.* 
        FROM provinces p
        WHERE p.province_id NOT IN (
          SELECT province_id 
          FROM agent_provinces 
          WHERE agent_id = ?
        )
        ORDER BY p.province_name
      `, [agentId]);
      return rows;
    } catch (error) {
      console.error("Error fetching available provinces:", error);
      throw error;
    }
  };

  // Assign province to agent
  const assignProvinceToAgent = async (assignmentData) => {
    try {
      const { agentId, provinceId } = assignmentData;
      
      // Check if assignment already exists
      const [existing] = await db.query(
        "SELECT * FROM agent_provinces WHERE agent_id = ? AND province_id = ?", 
        [agentId, provinceId]
      );
      
      if (existing.length > 0) {
        throw new Error("This province is already assigned to the agent!");
      }
      
      // Assign province
      const [result] = await db.query(
        "INSERT INTO agent_provinces (agent_id, province_id, assignment_date) VALUES (?, ?, NOW())",
        [agentId, provinceId]
      );
      
      return { 
        success: true, 
        message: "Province assigned successfully!" 
      };
    } catch (error) {
      console.error("Error assigning province:", error);
      throw error;
    }
  };

  // Remove province from agent
  const removeProvinceFromAgent = async (assignmentData) => {
    try {
      const { agentId, provinceId } = assignmentData;
      
      // Check if agent has deliveries in this province
      const [deliveries] = await db.query(
        "SELECT COUNT(*) as count FROM deliveries WHERE agent_id = ? AND province_id = ?",
        [agentId, provinceId]
      );
      
      if (deliveries[0].count > 0) {
        throw new Error("Cannot remove province with existing deliveries. Please reassign deliveries first.");
      }
      
      // Remove assignment
      const [result] = await db.query(
        "DELETE FROM agent_provinces WHERE agent_id = ? AND province_id = ?",
        [agentId, provinceId]
      );
      
      return { 
        success: true, 
        affectedRows: result.affectedRows,
        message: "Province removed successfully!" 
      };
    } catch (error) {
      console.error("Error removing province:", error);
      throw error;
    }
  };

  // Get agent performance statistics
  const getAgentStats = async (agentId, period = 'month') => {
    try {
      let dateCondition = '';
      if (period === 'week') {
        dateCondition = 'AND delivery_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
      } else if (period === 'month') {
        dateCondition = 'AND delivery_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
      } else if (period === 'year') {
        dateCondition = 'AND delivery_date >= DATE_SUB(NOW(), INTERVAL 365 DAY)';
      }
      
      const [rows] = await db.query(`
        SELECT 
          COUNT(*) as delivery_count,
          COALESCE(SUM(quantity), 0) as item_count,
          COALESCE(SUM(commission_amount), 0) as commission_earned,
          AVG(commission_amount) as avg_commission_per_delivery,
          MAX(commission_amount) as max_commission,
          MIN(commission_amount) as min_commission
        FROM deliveries 
        WHERE agent_id = ? ${dateCondition}
      `, [agentId]);
      
      return rows[0] || {};
    } catch (error) {
      console.error("Error fetching agent stats:", error);
      throw error;
    }
  };

  // Get agents with their assigned provinces count
  const getAgentsWithProvinceCount = async () => {
    try {
      const [rows] = await db.query(`
        SELECT 
          a.*,
          COUNT(ap.province_id) as province_count
        FROM agents a
        LEFT JOIN agent_provinces ap ON a.agent_id = ap.agent_id
        GROUP BY a.agent_id
        ORDER BY a.agent_name
      `);
      return rows;
    } catch (error) {
      console.error("Error fetching agents with province count:", error);
      throw error;
    }
  };

  // Bulk assign provinces to agent
  const bulkAssignProvinces = async (bulkData) => {
    try {
      const { agentId, provinceIds } = bulkData;
      
      // Start transaction
      const connection = await db.getConnection();
      await connection.beginTransaction();
      
      try {
        // Remove existing assignments
        await connection.query(
          "DELETE FROM agent_provinces WHERE agent_id = ?",
          [agentId]
        );
        
        // Insert new assignments
        for (const provinceId of provinceIds) {
          await connection.query(
            "INSERT INTO agent_provinces (agent_id, province_id, assignment_date) VALUES (?, ?, NOW())",
            [agentId, provinceId]
          );
        }
        
        await connection.commit();
        connection.release();
        
        return { 
          success: true, 
          message: `${provinceIds.length} provinces assigned successfully!` 
        };
      } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error("Error bulk assigning provinces:", error);
      throw error;
    }
  };

  return {
    getAgents,
    getAgent,
    addAgent,
    updateAgent,
    deleteAgent,
    searchAgents,
    getAgentProvinces,
    getAvailableProvinces,
    assignProvinceToAgent,
    removeProvinceFromAgent,
    getAgentStats,
    getAgentsWithProvinceCount,
    bulkAssignProvinces
  };
};