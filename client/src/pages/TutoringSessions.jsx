import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function TutoringSessions() {
  const { user, token } = useAuth();
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    tutor: "",
    learner: "",
    subject: "",
    scheduledTime: "",
    location: "",
  });
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await api.tutoring.listSessions();
      setList(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, tutor: user.id || user._id }));
  }, [user]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.tutoring.createSession({ ...form }, token);
      setForm({
        tutor: user?.id || user?._id || "",
        learner: "",
        subject: "",
        scheduledTime: "",
        location: "",
      });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="grid">
      <div className="card">
        <h2>Create Session</h2>
        <form onSubmit={onSubmit}>
          <label>Tutor Id</label>
          <input name="tutor" value={form.tutor} onChange={onChange} required />
          <label>Learner Id</label>
          <input
            name="learner"
            value={form.learner}
            onChange={onChange}
            required
          />
          <label>Subject</label>
          <input
            name="subject"
            value={form.subject}
            onChange={onChange}
            required
          />
          <label>Scheduled Time (ISO)</label>
          <input
            name="scheduledTime"
            value={form.scheduledTime}
            onChange={onChange}
            placeholder="2025-12-20T10:00:00Z"
            required
          />
          <label>Location</label>
          <input name="location" value={form.location} onChange={onChange} />
          <button type="submit">Create</button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
      <div className="card">
        <h2>Sessions</h2>
        <ul className="list">
          {list.map((s) => (
            <li key={s._id}>
              <div>
                <strong>{s.subject}</strong>
              </div>
              <div>Tutor: {s.tutor?.name || s.tutor}</div>
              <div>Learner: {s.learner?.name || s.learner}</div>
              <div>{s.scheduledTime}</div>
              <div>{s.location}</div>
              <div>Status: {s.status}</div>
            </li>
          ))}
          {list.length === 0 && <li>No sessions yet.</li>}
        </ul>
      </div>
    </div>
  );
}
