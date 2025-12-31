import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function TutoringSessions() {
  const { user, token } = useAuth();
  const [list, setList] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [form, setForm] = useState({
    learner: "",
    subject: "",
    scheduledTime: "",
    location: "",
  });
  const [ratingDrafts, setRatingDrafts] = useState({});
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await api.tutoring.listSessions();
      setList(data);
      setRatingDrafts({});
    } catch (err) {
      setError(err.message);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const data = await api.tutoring.leaderboard();
      setLeaderboard(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
    loadLeaderboard();
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.tutoring.createSession({ ...form }, token);
      setForm({
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

  const updateStatus = async (id, status) => {
    setError("");
    try {
      await api.tutoring.updateSessionStatus(id, status, token);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const ratingDraft = (session) =>
    ratingDrafts[session._id] || {
      stars: session.rating?.stars ? String(session.rating.stars) : "5",
      review: session.rating?.review || "",
    };

  const onRatingChange = (sessionId, field, value) => {
    setRatingDrafts((prev) => ({
      ...prev,
      [sessionId]: { ...prev[sessionId], [field]: value },
    }));
  };

  const submitRating = async (session) => {
    setError("");
    const draft = ratingDraft(session);
    try {
      await api.tutoring.rateSession(
        session._id,
        { stars: Number(draft.stars), review: draft.review },
        token
      );
      load();
      loadLeaderboard();
    } catch (err) {
      setError(err.message);
    }
  };

  const isTutor = (session) =>
    user && (user.id === session.tutor?._id || user._id === session.tutor);
  const isLearner = (session) =>
    user && (user.id === session.learner?._id || user._id === session.learner);

  return (
    <div className="grid">
      <div className="card">
        <h2>Create Session</h2>
        <form onSubmit={onSubmit}>
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
              {s.rating?.stars ? (
                <div>
                  Rating: {s.rating.stars} ★
                  {s.rating.review ? ` — ${s.rating.review}` : ""}
                </div>
              ) : null}
              {user && (
                <div className="actions-row" style={{ marginTop: "6px" }}>
                  {s.status === "PENDING" && isTutor(s) && (
                    <>
                      <button onClick={() => updateStatus(s._id, "ACCEPTED")}>
                        Accept
                      </button>
                      <button onClick={() => updateStatus(s._id, "REJECTED")}>
                        Reject
                      </button>
                    </>
                  )}
                  {s.status === "ACCEPTED" && isTutor(s) && (
                    <button onClick={() => updateStatus(s._id, "COMPLETED")}>
                      Complete
                    </button>
                  )}
                  {s.status !== "CANCELLED" &&
                    s.status !== "REJECTED" &&
                    s.status !== "COMPLETED" &&
                    (isTutor(s) || isLearner(s)) && (
                      <button onClick={() => updateStatus(s._id, "CANCELLED")}>
                        Cancel
                      </button>
                    )}
                </div>
              )}
              {user && s.status === "COMPLETED" && isLearner(s) && (
                <div style={{ marginTop: "8px" }}>
                  <label>Rate this session</label>
                  <div className="actions-row">
                    <select
                      value={ratingDraft(s).stars}
                      onChange={(e) =>
                        onRatingChange(s._id, "stars", e.target.value)
                      }
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    <input
                      placeholder="Review (optional)"
                      value={ratingDraft(s).review}
                      onChange={(e) =>
                        onRatingChange(s._id, "review", e.target.value)
                      }
                    />
                    <button onClick={() => submitRating(s)}>Submit</button>
                  </div>
                </div>
              )}
            </li>
          ))}
          {list.length === 0 && <li>No sessions yet.</li>}
        </ul>
      </div>
      <div className="card">
        <h2>Tutor Leaderboard</h2>
        <ol className="list" style={{ listStyle: "decimal" }}>
          {leaderboard.map((entry) => (
            <li key={entry.tutorId}>
              <div>
                <strong>{entry.tutorName || "(Unknown)"}</strong>
              </div>
              <div>Average Rating: {entry.avgRating ?? "N/A"}</div>
              <div>Completed Sessions: {entry.completed}</div>
            </li>
          ))}
          {leaderboard.length === 0 && <li>No rated sessions yet.</li>}
        </ol>
      </div>
    </div>
  );
}
