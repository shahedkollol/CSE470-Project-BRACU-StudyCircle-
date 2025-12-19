import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Admin() {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await api.admin.listUsers(token);
      setUsers(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateRole = async (id, role) => {
    try {
      await api.admin.updateRole(id, role, token);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    try {
      await api.admin.deleteUser(id, token);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user) return <div className="card">Login as admin to view users.</div>;

  return (
    <div className="card">
      <h2>Admin — Users</h2>
      {error && <p className="error">{error}</p>}
      <ul className="list">
        {users.map((u) => (
          <li key={u._id}>
            <div>
              <strong>{u.name}</strong> — {u.email} ({u.role})
            </div>
            <div className="actions-row">
              <select
                defaultValue={u.role}
                onChange={(e) => updateRole(u._id, e.target.value)}
              >
                <option value="student">student</option>
                <option value="alumni">alumni</option>
                <option value="faculty">faculty</option>
                <option value="admin">admin</option>
              </select>
              <button onClick={() => remove(u._id)}>Delete</button>
            </div>
          </li>
        ))}
        {users.length === 0 && <li>No users yet.</li>}
      </ul>
    </div>
  );
}
