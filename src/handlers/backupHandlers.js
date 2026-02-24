const { dialog } = require("electron");
const { exec } = require("child_process");
const fs = require("fs/promises");
const path = require("path");

module.exports = (db) => {
  /**
   * Safely quote a MySQL identifier (table/column name) with backticks.
   * (Kept for potential future use, though not strictly needed for mysqldump.)
   */
  const quoteIdentifier = (id) => {
    if (!id || typeof id !== "string")
      throw new Error(`Invalid identifier: ${id}`);
    return "`" + id.replace(/`/g, "``") + "`";
  };

  // --- MySQL credentials (prefer environment variables in production) ---
  const MYSQL_USER = process.env.MYSQL_USER || "root";
  const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || "root";
  const MYSQL_DATABASE = "transport"; // your actual database name

  // Backup using mysqldump
  const backupDatabase = async () => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: "Save Database Backup",
      defaultPath: `backup-${new Date().toISOString().slice(0, 10)}.sql`,
      filters: [{ name: "SQL Files", extensions: ["sql"] }],
    });

    if (canceled || !filePath) {
      return { success: false, message: "Backup cancelled" };
    }

    // Optional: verify we are connected to the right database (using the provided pool)
    let connection;
    try {
      connection = await db.getConnection();
      const [[{ db_name: currentDb }]] = await connection.query(
        "SELECT DATABASE() AS db_name",
      );
      console.log(`Current database: ${currentDb || "(none)"}`);

      if (currentDb !== MYSQL_DATABASE) {
        try {
          await connection.query(`USE ${MYSQL_DATABASE}`);
          console.log(`Switched to database '${MYSQL_DATABASE}'`);
        } catch (switchErr) {
          // Non‑fatal – the mysqldump command will specify the database anyway
          console.warn("Could not switch database, but continuing...");
        }
      }
    } catch (err) {
      console.warn(
        "Database connection check failed, proceeding anyway:",
        err.message,
      );
    } finally {
      if (connection) connection.release();
    }

    // Build the mysqldump command (includes password on command line – consider mysql_config_editor for better security)
    const command = `mysqldump -u ${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} > "${filePath}"`;

    return new Promise((resolve) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error("mysqldump error:", error);
          return resolve({ success: false, message: error.message });
        }
        resolve({
          success: true,
          message: `Backup saved to ${path.basename(filePath)}`,
        });
      });
    });
  };

  // Restore using mysql client
  const restoreDatabase = async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: "Select Backup File",
      properties: ["openFile"],
      filters: [{ name: "SQL Files", extensions: ["sql"] }],
    });

    if (canceled || filePaths.length === 0) {
      return { success: false, message: "Restore cancelled" };
    }

    const filePath = filePaths[0];

    // Optional: verify connection (similar to backup)
    let connection;
    try {
      connection = await db.getConnection();
      // ... same checks as above (optional)
    } catch (err) {
      // ignore
    } finally {
      if (connection) connection.release();
    }

    // Build the mysql restore command (input redirection)
    const command = `mysql -u ${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} < "${filePath}"`;

    return new Promise((resolve) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error("mysql restore error:", error);
          return resolve({ success: false, message: error.message });
        }
        resolve({ success: true, message: "Database restored successfully" });
      });
    });
  };

  return { backupDatabase, restoreDatabase };
};
