import React, { useState } from "react";

const Settings = () => {
  const [backupStatus, setBackupStatus] = useState("");
  const [restoreStatus, setRestoreStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleBackup = async () => {
    setIsLoading(true);
    setBackupStatus("Processing backup...");
    try {
      const result = await window.electronAPI.backupDatabase();
      setBackupStatus(
        result.success ? `✅ ${result.message}` : `❌ ${result.message}`,
      );
    } catch (error) {
      setBackupStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    setRestoreStatus("Processing restore...");
    try {
      const result = await window.electronAPI.restoreDatabase();
      setRestoreStatus(
        result.success ? `✅ ${result.message}` : `❌ ${result.message}`,
      );
    } catch (error) {
      setRestoreStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[500px] bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center p-2 overflow-hidden box-border">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/50">
        <h1 className="text-3xl font-bold text-gray-800 mb-1 flex items-center gap-2">
          <span role="img" aria-label="settings" className="text-4xl">
            ⚙️
          </span>
          <span>Settings</span>
        </h1>
        <p className="text-gray-600 mb-4 text-lg">
          Keep your data safe and sound ✨
        </p>

        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span role="img" aria-label="database" className="text-2xl">
              🗄️
            </span>
            Database Backup & Restore
          </h2>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button
              onClick={handleBackup}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-medium py-3 px-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-300 transform hover:scale-105 active:scale-95"
            >
              💾 Backup Database
            </button>
            <button
              onClick={handleRestore}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-medium py-3 px-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-300 transform hover:scale-105 active:scale-95"
            >
              🔄 Restore Database
            </button>
          </div>

          {backupStatus && (
            <div
              className={`mt-3 p-4 rounded-2xl border ${
                backupStatus.includes("✅")
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              <p className="flex items-center gap-2 text-sm md:text-base">
                {backupStatus}
              </p>
            </div>
          )}

          {restoreStatus && (
            <div
              className={`mt-3 p-4 rounded-2xl border ${
                restoreStatus.includes("✅")
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              <p className="flex items-center gap-2 text-sm md:text-base">
                {restoreStatus}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Settings;
