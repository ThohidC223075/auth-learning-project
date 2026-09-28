import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { authApi } from "../api/auth";
import type { User } from "../api/auth";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi
      .me()
      .then((res) => setUser(res.data?.user ?? null))
      .catch(() => navigate("/signin", { replace: true }))
      .finally(() => setLoading(false));
  }, [navigate]);

  async function handleSignout() {
    try {
      await authApi.signout();
    } finally {
      navigate("/signin", { replace: true });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-lg shadow p-6 w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-gray-800">Home</h1>
        <p className="mt-2 text-gray-600">
          Welcome, <span className="font-medium">{user?.email}</span> 🎉
        </p>
        <button
          onClick={handleSignout}
          className="mt-6 w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}