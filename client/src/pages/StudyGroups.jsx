import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function StudyGroups() {
  const { user, token } = useAuth();
  const [list, setList] = useState([]);
  const [groupsCreatedToday, setGroupsCreatedToday] = useState(0);
  const [form, setForm] = useState({
    title: "",
    course: "",
    creatorName: "",
    maxMembers: 2,
  });
  const [error, setError] = useState("");

  const DAILY_LIMIT = 5;
  const remainingGroups = DAILY_LIMIT - groupsCreatedToday;
  const isLimitReached = groupsCreatedToday >= DAILY_LIMIT;

  const load = async () => {
    try {
      const data = await api.studyGroups.list();
      setList(data);

      // Count groups created today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const groupsToday = data.filter((g) => {
        const createdDate = new Date(g.createdAt);
        createdDate.setHours(0, 0, 0, 0);
        return createdDate.getTime() === today.getTime();
      });
      setGroupsCreatedToday(groupsToday.length);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (user)
      setForm((f) => ({ ...f, creatorName: user.name || f.creatorName }));
  }, [user]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.studyGroups.create(form, token);
      setForm({
        title: "",
        course: "",
        creatorName: user?.name || "",
        maxMembers: 2,
      });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const joinGroup = async (groupId) => {
    if (!user) {
      setError("Please click Demo Student or Demo Admin button to login first");
      return;
    }
    setError("");
    try {
      await api.studyGroups.join(groupId, user, token);
      load();
    } catch (err) {
      console.error("Join error:", err);
      setError(err.message);
    }
  };

  const leaveGroup = async (groupId) => {
    if (!user) {
      setError("Please login to leave a group");
      return;
    }
    setError("");
    try {
      await api.studyGroups.leave(groupId, user, token);
      load();
    } catch (err) {
      console.error("Leave error:", err);
      setError(err.message);
    }
  };

  return (
    <div>
      {/* Daily Limit Notification Bar */}
      <div
        style={{
          padding: "12px 20px",
          marginBottom: 16,
          borderRadius: 4,
          fontWeight: "bold",
          backgroundColor: isLimitReached ? "#ffebee" : "#e8f5e9",
          borderLeft: `4px solid ${isLimitReached ? "#c62828" : "#2e7d32"}`,
          color: isLimitReached ? "#c62828" : "#2e7d32",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>
          {isLimitReached ? (
            <>⛔ Daily Limit Reached: 5/5 groups created today</>
          ) : (
            <>
              📊 Groups Created Today: {groupsCreatedToday}/{DAILY_LIMIT} (
              {remainingGroups} remaining)
            </>
          )}
        </span>
      </div>

      <div className="grid">
        <div className="card">
          <h2>Create Study Group</h2>
          {isLimitReached && (
            <p
              style={{
                padding: 12,
                background: "#ffebee",
                color: "#c62828",
                borderRadius: 4,
                marginBottom: 16,
              }}
            >
              ⛔ Daily limit of 5 groups has been reached. Please try again
              tomorrow.
            </p>
          )}
          <form onSubmit={onSubmit} style={{ pointerEvents: isLimitReached ? "none" : "auto", opacity: isLimitReached ? 0.5 : 1 }}>
            <label>Title</label>
            <input name="title" value={form.title} onChange={onChange} required disabled={isLimitReached} />
            <label>Course</label>
            <input
              name="course"
              value={form.course}
              onChange={onChange}
              required
              disabled={isLimitReached}
            />
            <label>Max Members</label>
            <input
              name="maxMembers"
              type="number"
              value={form.maxMembers}
              onChange={onChange}
              min={1}
              required
              disabled={isLimitReached}
            />
            <label>Creator Name</label>
            <input
              name="creatorName"
              value={form.creatorName}
              onChange={onChange}
              required
              disabled={isLimitReached}
            />
            <button type="submit" disabled={isLimitReached}>
              Create
            </button>
          </form>
          {error && <p className="error">{error}</p>}
        </div>
      <div className="card">
        <h2>Study Groups</h2>
        <ul className="list">
          {list.map((g) => {
            const membersCount =
              g.membersCount ?? (g.members ? g.members.length : 0);
            const max = g.maxMembers || 4;
            const isMember =
              user &&
              g.members &&
              g.members.some(
                (m) =>
                  (m._id || m).toString() ===
                  (user.id || user._id || user).toString()
              );
            const isFull = membersCount >= max;
            return (
              <li key={g._id}>
                <div>
                  <strong>{g.title}</strong> ({g.course})
                </div>
                <div>Creator: {g.creatorName}</div>
                <div>
                  Members: {membersCount} / {max}
                </div>
                <div>Status: {g.status}</div>
                <div style={{ marginTop: 8 }}>
                  {isMember ? (
                    <>
                      <button
                        onClick={() => leaveGroup(g._id)}
                        style={{ marginRight: 8 }}
                      >
                        Leave
                      </button>
                      <Link to={`/study-groups/${g._id}/resources`}>
                        <button style={{ marginRight: 0 }}>Resources</button>
                      </Link>
                    </>
                  ) : (
                    <button onClick={() => joinGroup(g._id)} disabled={isFull}>
                      {isFull ? "Full" : "Join"}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
          {list.length === 0 && <li>No groups yet.</li>}
        </ul>
      </div>
    </div>
  );
}
