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
  const [reminderMessage, setReminderMessage] = useState("");

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
      await api.events.create({ ...form }, token);
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
      await api.events.rsvp(id, undefined, token);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const cancel = async (id) => {
    if (!user) return;
    try {
      setError("");
      await api.events.cancel(id, undefined, token);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const sendReminders = async () => {
    try {
      setReminderMessage("");
      setError("");
      const response = await api.events.sendReminders();
      setReminderMessage(
        `✅ Success! ${response.remindersSent} event reminder(s) sent to confirmed attendees.`
      );
      // Reload to refresh notification status
      setTimeout(() => load(), 1000);
    } catch (err) {
      setError(`Failed to send reminders: ${err.message}`);
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
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={sendReminders}
            style={{
              background: "#4CAF50",
              color: "white",
              padding: "10px 16px",
              borderRadius: 4,
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            📬 Send Reminders to Attendees
          </button>
          {reminderMessage && (
            <p style={{ color: "#4CAF50", marginTop: 12, fontWeight: "bold" }}>
              {reminderMessage}
            </p>
          )}
        </div>
        <ul className="list">
          {list.map((ev) => (
            <li key={ev._id}>
              <div>
                <strong>{ev.title}</strong>
              </div>
              <div>{ev.description}</div>
              <div>{ev.dateTime || `${ev.date} ${ev.time}`}</div>
              <div>{ev.location}</div>
              <div>
                Attendees: {ev.attendees?.length || 0}
                {ev.reminderSent && (
                  <span style={{ marginLeft: 8, color: "#4CAF50" }}>
                    ✓ Reminder sent
                  </span>
                )}
              </div>
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
