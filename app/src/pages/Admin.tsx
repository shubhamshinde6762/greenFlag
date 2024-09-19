import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

interface MouseMetrics {
  average_speed?: number;
  acceleration?: number;
}

interface KeyboardMetrics {
  average_interval?: number;
}

interface ValidationResults {
  fingerprint_present?: boolean;
  ip_valid?: boolean;
  mouse_movement_valid?: boolean;
  session_duration_valid?: boolean;
  user_agent_valid?: boolean;
}

interface VerificationLog {
  timestamp?: string;
  ip_address?: string;
  user_agent?: string;
  time_on_page?: number;
  idle_time?: number;
  mouse_metrics?: MouseMetrics;
  keyboard_metrics?: KeyboardMetrics;
  notes?: string;
  model_features?: any[]; // Placeholder for any model features
  is_bot?: boolean;
  validation_results?: ValidationResults;
}

const Admin: React.FC = () => {
  const [logs, setLogs] = useState<VerificationLog[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<VerificationLog | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [page, limit]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null); // Reset error before fetching

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/admin/verification-logs?page=${page}&limit=${limit}`
      );
      if (response.data && response.data.logs) {
        setLogs(response.data.logs);
        setTotalPages(response.data.total_pages || 0);
      } else {
        setError("No logs found");
      }
    } catch (error) {
      setError("Error fetching logs. Please try again.");
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const openModal = (log: VerificationLog) => {
    setSelectedLog(log);
  };

  const closeModal = () => {
    setSelectedLog(null);
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <header className="bg-white p-4 rounded-md shadow-md mb-6">
        <h1 className="text-2xl font-semibold">Verification Logs</h1>
      </header>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : logs.length === 0 ? (
        <div className="text-center">No logs available.</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border-collapse">
              <thead>
                <tr>
                  <th className="border-b-2 p-4 text-center text-lg">
                    Timestamp
                  </th>
                  <th className="border-b-2 p-4 text-center text-lg">
                    IP Address
                  </th>
                  <th className="border-b-2 p-4 text-center text-lg">
                    User Agent
                  </th>
                  <th className="border-b-2 p-4 text-center text-lg">
                    Time on Page
                  </th>
                  <th className="border-b-2 p-4 text-center text-lg">
                    Avg Mouse Speed
                  </th>
                  <th className="border-b-2 p-4 text-center text-lg">
                    Mouse Acceleration
                  </th>
                  <th className="border-b-2 p-4 text-center text-lg">Is Bot</th>
                  <th className="border-b-2 p-4 text-center text-lg">
                    Other Info
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-slate-100 transition-all duration-200"
                  >
                    <td className="p-4 text-center">
                      {log.timestamp
                        ? new Date(log.timestamp).toLocaleString()
                        : "N/A"}
                    </td>
                    <td className="p-4 text-center">
                      {log.ip_address || "N/A"}
                    </td>
                    <td className="p-4 text-center">
                      {log.user_agent || "N/A"}
                    </td>
                    <td className="p-4 text-center">
                      {log.time_on_page
                        ? log.time_on_page.toFixed(2) + "s"
                        : "N/A"}
                    </td>
                    <td className="p-4 text-center">
                      {log.mouse_metrics?.average_speed
                        ? log.mouse_metrics.average_speed.toFixed(2)
                        : "N/A"}
                    </td>
                    <td className="p-4 text-center">
                      {log.mouse_metrics?.acceleration
                        ? log.mouse_metrics.acceleration.toFixed(2)
                        : "N/A"}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-block rounded-lg py-1 px-3 text-center text-sm font-medium w-20 ${
                          log.is_bot
                            ? "bg-red-100 text-red-700 border border-red-500"
                            : "bg-green-100 text-green-700 border border-green-500"
                        }`}
                      >
                        {log.is_bot ? "Bot" : "Human"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        className="bg-blue-500 text-white font-bold px-4 py-2 rounded"
                        onClick={() => openModal(log)}
                      >
                        Detailed Info
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div>
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300"
              >
                Previous
              </button>
              <span className="mx-4">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300"
              >
                Next
              </button>
            </div>
            <div>
              <label htmlFor="limit" className="mr-2">
                Logs per page:
              </label>
              <select
                id="limit"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="border rounded-md p-1"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        </>
      )}

      {selectedLog && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white p-6 rounded-md max-w-2xl w-full shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Verification Log Details
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="font-semibold">IP Address:</p>
                <p>{selectedLog.ip_address || "N/A"}</p>
              </div>
              <div>
                <p className="font-semibold">User Agent:</p>
                <p>{selectedLog.user_agent || "N/A"}</p>
              </div>
              <div>
                <p className="font-semibold">Time on Page:</p>
                <p>
                  {selectedLog.time_on_page
                    ? selectedLog.time_on_page.toFixed(2) + "s"
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="font-semibold">Idle Time:</p>
                <p>{selectedLog.idle_time?.toFixed(2) || "N/A"}s</p>
              </div>
              <div>
                <p className="font-semibold">Notes:</p>
                <p>{selectedLog.notes || "None"}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Mouse Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Avg Mouse Speed:</p>
                  <p>
                    {selectedLog.mouse_metrics?.average_speed?.toFixed(2) ||
                      "N/A"}
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Mouse Acceleration:</p>
                  <p>
                    {selectedLog.mouse_metrics?.acceleration?.toFixed(2) ||
                      "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Validation Results</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <p className="font-semibold mr-2">Fingerprint Present:</p>
                  {selectedLog.validation_results?.fingerprint_present ? (
                    <FaCheckCircle className="text-green-500" />
                  ) : (
                    <FaTimesCircle className="text-red-500" />
                  )}
                </li>
                <li className="flex items-center">
                  <p className="font-semibold mr-2">IP Valid:</p>
                  {selectedLog.validation_results?.ip_valid ? (
                    <FaCheckCircle className="text-green-500" />
                  ) : (
                    <FaTimesCircle className="text-red-500" />
                  )}
                </li>
                <li className="flex items-center">
                  <p className="font-semibold mr-2">Mouse Movement Valid:</p>
                  {selectedLog.validation_results?.mouse_movement_valid ? (
                    <FaCheckCircle className="text-green-500" />
                  ) : (
                    <FaTimesCircle className="text-red-500" />
                  )}
                </li>
                <li className="flex items-center">
                  <p className="font-semibold mr-2">Session Duration Valid:</p>
                  {selectedLog.validation_results?.session_duration_valid ? (
                    <FaCheckCircle className="text-green-500" />
                  ) : (
                    <FaTimesCircle className="text-red-500" />
                  )}
                </li>
                <li className="flex items-center">
                  <p className="font-semibold mr-2">User Agent Valid:</p>
                  {selectedLog.validation_results?.user_agent_valid ? (
                    <FaCheckCircle className="text-green-500" />
                  ) : (
                    <FaTimesCircle className="text-red-500" />
                  )}
                </li>
              </ul>
            </div>

            <button
              className="absolute top-2 right-2 bg-red-500 text-white px-1 py-1 rounded-full"
              onClick={closeModal}
            >
              <FaTimesCircle className="text-white text-xl" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
