import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Notifications() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.notifications.list(token);
      setItems(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const markRead = async (id) => {
    try {
      setError("");
      await api.notifications.markRead(id, token);
      setItems((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card">
      <h2>Notifications</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      <ul className="list">
        {items.map((n) => (
          <li key={n._id} style={{ opacity: n.read ? 0.6 : 1 }}>
            <div style={{ fontWeight: "bold" }}>{n.title}</div>
            <div>{n.message}</div>
            <div style={{ fontSize: "0.85rem", color: "#555" }}>
              {new Date(n.createdAt).toLocaleString()}
            </div>
            {!n.read && (
              <button type="button" onClick={() => markRead(n._id)}>
                Mark as read
              </button>
            )}
          </li>
        ))}
        {items.length === 0 && !loading && <li>No notifications yet.</li>}
      </ul>
    </div>
  );
}
