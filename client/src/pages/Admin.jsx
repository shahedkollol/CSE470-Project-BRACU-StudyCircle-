import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Admin() {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("users"); // users, groups, sessions, features

  const loadUsers = async () => {
    try {
      const data = await api.admin.listUsers(token);
      setUsers(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadGroups = async () => {
    try {
      const data = await api.studyGroups.list();
      setGroups(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadSessions = async () => {
    try {
      const data = await api.tutoring.listSessions();
      setSessions(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadUsers();
    loadGroups();
    loadSessions();
  }, []);

  const updateRole = async (id, role) => {
    try {
      await api.admin.updateRole(id, role, token);
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const removeUser = async (id) => {
    try {
      await api.admin.deleteUser(id, token);
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user)
    return <div className="card">Login as admin to view admin panel.</div>;

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {error && (
        <p className="error" style={{ marginBottom: 16 }}>
          {error}
        </p>
      )}

      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          borderBottom: "2px solid var(--gray-200)",
          paddingBottom: 8,
        }}
      >
        <button
          onClick={() => setTab("users")}
          style={{
            padding: "8px 16px",
            background: tab === "users" ? "var(--primary)" : "var(--gray-200)",
            color: tab === "users" ? "white" : "var(--gray-800)",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          👤 Users ({users.length})
        </button>
        <button
          onClick={() => setTab("groups")}
          style={{
            padding: "8px 16px",
            background: tab === "groups" ? "var(--primary)" : "var(--gray-200)",
            color: tab === "groups" ? "white" : "var(--gray-800)",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          📚 Study Groups ({groups.length})
        </button>
        <button
          onClick={() => setTab("sessions")}
          style={{
            padding: "8px 16px",
            background:
              tab === "sessions" ? "var(--primary)" : "var(--gray-200)",
            color: tab === "sessions" ? "white" : "var(--gray-800)",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          🎓 Tutoring Sessions ({sessions.length})
        </button>
        <button
          onClick={() => setTab("features")}
          style={{
            padding: "8px 16px",
            background:
              tab === "features" ? "var(--primary)" : "var(--gray-200)",
            color: tab === "features" ? "white" : "var(--gray-800)",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          ✨ Features Implemented
        </button>
      </div>

      {/* Users Tab */}
      {tab === "users" && (
        <div className="card">
          <h3>User Management</h3>
          <ul className="list">
            {users.map((u) => (
              <li key={u._id}>
                <div>
                  <strong>{u.name}</strong> — {u.email}
                </div>
                <div style={{ marginTop: 8 }}>
                  <select
                    defaultValue={u.role}
                    onChange={(e) => updateRole(u._id, e.target.value)}
                    style={{ marginRight: 8 }}
                  >
                    <option value="student">student</option>
                    <option value="alumni">alumni</option>
                    <option value="faculty">faculty</option>
                    <option value="admin">admin</option>
                  </select>
                  <button
                    onClick={() => removeUser(u._id)}
                    style={{ background: "var(--error)", color: "white" }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
            {users.length === 0 && <li>No users yet.</li>}
          </ul>
        </div>
      )}

      {/* Groups Tab */}
      {tab === "groups" && (
        <div className="card">
          <h3>Study Groups Overview</h3>
          <ul className="list">
            {groups.map((g) => (
              <li key={g._id}>
                <div>
                  <strong>{g.title}</strong> ({g.course})
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: "0.9rem",
                    color: "var(--gray-600)",
                  }}
                >
                  Creator: {g.creatorName} | Members:{" "}
                  {g.membersCount || g.members?.length || 0} /{" "}
                  {g.maxMembers || 4} | Status: {g.status}
                </div>
              </li>
            ))}
            {groups.length === 0 && <li>No study groups yet.</li>}
          </ul>
        </div>
      )}

      {/* Sessions Tab */}
      {tab === "sessions" && (
        <div className="card">
          <h3>Tutoring Sessions Overview</h3>
          <ul className="list">
            {sessions.map((s) => (
              <li key={s._id}>
                <div>
                  <strong>{s.subject}</strong> — Status: {s.status}
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: "0.9rem",
                    color: "var(--gray-600)",
                  }}
                >
                  {s.tutor?.name && `Tutor: ${s.tutor.name}`} |{" "}
                  {s.learner?.name && `Learner: ${s.learner.name}`}
                </div>
                {s.scheduledTime && (
                  <div style={{ marginTop: 4, fontSize: "0.85rem" }}>
                    📅 {new Date(s.scheduledTime).toLocaleString()}
                  </div>
                )}
              </li>
            ))}
            {sessions.length === 0 && <li>No tutoring sessions yet.</li>}
          </ul>
        </div>
      )}

      {/* Features Tab */}
      {tab === "features" && (
        <div className="card">
          <h3>Features Implemented</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 16,
            }}
          >
            <div
              style={{
                padding: 16,
                background: "var(--gray-50)",
                borderRadius: 8,
                border: "1px solid var(--gray-200)",
              }}
            >
              <h4>📚 Study Groups with Member Limits</h4>
              <ul style={{ fontSize: "0.9rem", lineHeight: 1.8 }}>
                <li>✅ Create study groups with custom max members</li>
                <li>✅ Join/Leave groups (respects capacity limits)</li>
                <li>✅ Display "Full" when group reaches max capacity</li>
                <li>✅ Show member count (X / max)</li>
              </ul>
            </div>

            <div
              style={{
                padding: 16,
                background: "var(--gray-50)",
                borderRadius: 8,
                border: "1px solid var(--gray-200)",
              }}
            >
              <h4>🗂️ Member-Only Group Resources</h4>
              <ul style={{ fontSize: "0.9rem", lineHeight: 1.8 }}>
                <li>✅ Members can share resources within groups</li>
                <li>✅ Only group members can view/download</li>
                <li>✅ Upload with title, description, tags</li>
                <li>✅ Delete resources (owner/admin only)</li>
              </ul>
            </div>

            <div
              style={{
                padding: 16,
                background: "var(--gray-50)",
                borderRadius: 8,
                border: "1px solid var(--gray-200)",
              }}
            >
              <h4>📅 Unified Tutoring Calendar</h4>
              <ul style={{ fontSize: "0.9rem", lineHeight: 1.8 }}>
                <li>✅ Month view calendar of tutoring sessions</li>
                <li>✅ Prev/Next month navigation</li>
                <li>✅ Display sessions by date with time</li>
                <li>✅ Show tutor, learner, and subject info</li>
              </ul>
            </div>

            <div
              style={{
                padding: 16,
                background: "var(--gray-50)",
                borderRadius: 8,
                border: "1px solid var(--gray-200)",
              }}
            >
              <h4>🔐 Access Control</h4>
              <ul style={{ fontSize: "0.9rem", lineHeight: 1.8 }}>
                <li>✅ Group resources member-only access</li>
                <li>✅ Join blocked when group is full</li>
                <li>✅ Admin can manage all resources</li>
                <li>✅ Error messages for unauthorized access</li>
              </ul>
            </div>

            <div
              style={{
                padding: 16,
                background: "var(--gray-50)",
                borderRadius: 8,
                border: "1px solid var(--gray-200)",
              }}
            >
              <h4>💻 Frontend Fixes</h4>
              <ul style={{ fontSize: "0.9rem", lineHeight: 1.8 }}>
                <li>✅ Fixed Vite React plugin configuration</li>
                <li>✅ Fixed join/leave API calls (userId in body)</li>
                <li>✅ Demo login buttons for testing</li>
                <li>✅ Improved error messages</li>
              </ul>
            </div>

            <div
              style={{
                padding: 16,
                background: "var(--gray-50)",
                borderRadius: 8,
                border: "1px solid var(--gray-200)",
              }}
            >
              <h4>📊 Database & API</h4>
              <ul style={{ fontSize: "0.9rem", lineHeight: 1.8 }}>
                <li>✅ Added maxMembers to StudyGroup model</li>
                <li>✅ Added groupId to Resource model</li>
                <li>✅ RESTful endpoints for group resources</li>
                <li>✅ Membership validation on all group routes</li>
              </ul>
            </div>
          </div>

          <div
            style={{
              marginTop: 24,
              padding: 16,
              background: "var(--info)",
              color: "white",
              borderRadius: 8,
            }}
          >
            <strong>📝 Git History:</strong> All features committed and pushed
            to <code>sumaiya-study-groups</code> branch
          </div>
        </div>
      )}
    </div>
  );
}
