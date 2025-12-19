import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function StudyGroups() {
  const { user, token } = useAuth();
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ title: "", course: "", creatorName: "" });
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
      setForm({ title: "", course: "", creatorName: user?.name || "" });
      load();
    } catch (err) {
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
          {list.map((g) => (
            <li key={g._id}>
              <div>
                <strong>{g.title}</strong> ({g.course})
              </div>
              <div>Creator: {g.creatorName}</div>
              <div>Members: {g.members?.length || 0}</div>
              <div>Status: {g.status}</div>
            </li>
          ))}
          {list.length === 0 && <li>No groups yet.</li>}
        </ul>
      </div>
    </div>
  );
}
