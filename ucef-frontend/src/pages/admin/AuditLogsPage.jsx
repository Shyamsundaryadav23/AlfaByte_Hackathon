import React, { useEffect, useState } from "react";
import { fetchAuditLogs } from "../../services/apiAdmin";

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const data = await fetchAuditLogs();
    setLogs(data);
  };

  return (
    <div className="min-h-screen bg-gray-100 px-8 py-6">
      <h1 className="text-3xl font-bold mb-6">Audit Logs</h1>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left">Time</th>
              <th className="p-4 text-left">User</th>
              <th className="p-4 text-left">Old Role</th>
              <th className="p-4 text-left">New Role</th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b">
                <td className="p-4">{log.changed_at}</td>
                <td className="p-4">{log.user_id}</td>
                <td className="p-4">{log.old_role}</td>
                <td className="p-4">{log.new_role}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs.length === 0 && (
          <p className="p-6 text-gray-500">No audit logs found.</p>
        )}
      </div>
    </div>
  );
};

export default AuditLogsPage;
