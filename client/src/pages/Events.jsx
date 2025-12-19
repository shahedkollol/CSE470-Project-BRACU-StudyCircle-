import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Events() {
  const { user, token } = useAuth();
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    dateTime: "",
    location: "",
  });
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await api.events.list();
      setList(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.events.create(
        { ...form, creator: user?._id || user?.id },
        token
      );
      setForm({ title: "", description: "", dateTime: "", location: "" });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const rsvp = async (id) => {
    if (!user) return;
    try {
      setError("");
      await api.events.rsvp(id, user.id || user._id, token);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const cancel = async (id) => {
    if (!user) return;
    try {
      setError("");
      await api.events.cancel(id, user.id || user._id, token);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="grid">
      <div className="card">
        <h2>Create Event</h2>
        <form onSubmit={onSubmit}>
          <label>Title</label>
          <input name="title" value={form.title} onChange={onChange} required />
          <label>Description</label>
          <input
            name="description"
            value={form.description}
            onChange={onChange}
          />
          <label>Date & Time (ISO)</label>
          <input
            name="dateTime"
            value={form.dateTime}
            onChange={onChange}
            placeholder="2025-12-21T14:00:00Z"
            required
          />
          <label>Location</label>
          <input
            name="location"
            value={form.location}
            onChange={onChange}
            required
          />
          <button type="submit">Create</button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
      <div className="card">
        <h2>Events</h2>
        <ul className="list">
          {list.map((ev) => (
            <li key={ev._id}>
              <div>
                <strong>{ev.title}</strong>
              </div>
              <div>{ev.description}</div>
              <div>{ev.dateTime || `${ev.date} ${ev.time}`}</div>
              <div>{ev.location}</div>
              <div>Attendees: {ev.attendees?.length || 0}</div>
              {user && (
                <div className="actions-row">
                  <button onClick={() => rsvp(ev._id)}>RSVP</button>
                  <button onClick={() => cancel(ev._id)}>Cancel</button>
                </div>
              )}
            </li>
          ))}
          {list.length === 0 && <li>No events yet.</li>}
        </ul>
      </div>
    </div>
  );
}
