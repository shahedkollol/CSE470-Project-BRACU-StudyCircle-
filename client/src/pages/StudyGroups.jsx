import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function StudyGroups() {
  const { user, token } = useAuth();
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    title: "",
    course: "",
    creatorName: "",
    maxMembers: 4,
  });
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await api.studyGroups.list();
      setList(data);
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
        maxMembers: 4,
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
    <div className="grid">
      <div className="card">
        <h2>Create Study Group</h2>
        <form onSubmit={onSubmit}>
          <label>Title</label>
          <input name="title" value={form.title} onChange={onChange} required />
          <label>Course</label>
          <input
            name="course"
            value={form.course}
            onChange={onChange}
            required
          />
          <label>Max Members</label>
          <input
            name="maxMembers"
            type="number"
            value={form.maxMembers}
            onChange={onChange}
            min={1}
            required
          />
          <label>Creator Name</label>
          <input
            name="creatorName"
            value={form.creatorName}
            onChange={onChange}
            required
          />
          <button type="submit">Create</button>
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
                    <button onClick={() => leaveGroup(g._id)}>Leave</button>
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
