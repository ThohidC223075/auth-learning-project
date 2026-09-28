import { useEffect, useState } from "react";

type Health = {
  server: string;
  database: string;
  smtp: string;
};

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then((data: Health) => setHealth(data))
      .catch(() => setError("Could not connect to backend"));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow w-80">
        <h1 className="text-xl font-bold mb-4">Connection Check</h1>
        {error && <p className="text-red-600">{error}</p>}
        {!health && !error && <p className="text-gray-500">Checking...</p>}
        {health && (
          <ul className="space-y-1">
            <li>Server: {health.server}</li>
            <li>Database: {health.database}</li>
            <li>SMTP: {health.smtp}</li>
          </ul>
        )}
      </div>
    </div>
  );
}