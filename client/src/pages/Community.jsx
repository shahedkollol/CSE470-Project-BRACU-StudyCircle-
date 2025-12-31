import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Community() {
  const { user, token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    description: "",
    requirements: "",
  });
  const [mentorshipAll, setMentorshipAll] = useState([]);
  const [mentorshipMine, setMentorshipMine] = useState([]);
  const [mentForm, setMentForm] = useState({ alumni: "", message: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [jobsData, mentData, mentMine] = await Promise.all([
          api.community.listJobs(),
          api.community.listMentorship(),
          token ? api.community.listMyMentorship(token) : Promise.resolve([]),
        ]);
        setJobs(jobsData);
        setMentorshipAll(mentData);
        setMentorshipMine(mentMine);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, [token]);

  const onJobChange = (e) =>
    setJobForm({ ...jobForm, [e.target.name]: e.target.value });
  const onMentChange = (e) =>
    setMentForm({ ...mentForm, [e.target.name]: e.target.value });

  const submitJob = async (e) => {
    e.preventDefault();
    setError("");
    const body = {
      ...jobForm,
      requirements: jobForm.requirements
        ? jobForm.requirements
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    };
    try {
      await api.community.createJob(body, token);
      setJobForm({ title: "", company: "", description: "", requirements: "" });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const submitMent = async (e) => {
    e.preventDefault();
    setError("");
    const body = {
      alumni: mentForm.alumni,
      message: mentForm.message,
    };
    try {
      await api.community.createMentorship(body, token);
      setMentForm({ alumni: "", message: "" });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const setStatus = async (id, status) => {
    try {
      setError("");
      await api.community.updateMentorshipStatus(id, status, token);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="grid">
      <div className="card">
        <h2>Create Job</h2>
        <form onSubmit={submitJob}>
          <label>Title</label>
          <input
            name="title"
            value={jobForm.title}
            onChange={onJobChange}
            required
          />
          <label>Company</label>
          <input
            name="company"
            value={jobForm.company}
            onChange={onJobChange}
            required
          />
          <label>Description</label>
          <input
            name="description"
            value={jobForm.description}
            onChange={onJobChange}
          />
          <label>Requirements (comma-separated)</label>
          <input
            name="requirements"
            value={jobForm.requirements}
            onChange={onJobChange}
          />
          <button type="submit">Create</button>
        </form>
      </div>
      <div className="card">
        <h2>Jobs</h2>
        <ul className="list">
          {jobs.map((j) => (
            <li key={j._id}>
              <div>
                <strong>{j.title}</strong> @ {j.company}
              </div>
              <div>{j.description}</div>
              <div>Requirements: {(j.requirements || []).join(", ")}</div>
            </li>
          ))}
          {jobs.length === 0 && <li>No jobs yet.</li>}
        </ul>
      </div>
      <div className="card">
        <h2>Mentorship Request</h2>
        <form onSubmit={submitMent}>
          <label>Alumni Id</label>
          <input
            name="alumni"
            value={mentForm.alumni}
            onChange={onMentChange}
            required
          />
          <label>Message</label>
          <input
            name="message"
            value={mentForm.message}
            onChange={onMentChange}
          />
          <button type="submit">Request</button>
        </form>
      </div>
      <div className="card">
        <h2>My Mentorship</h2>
        <ul className="list">
          {mentorshipMine.map((m) => {
            const canAct = user && m.alumni === (user.id || user._id);
            return (
              <li key={m._id}>
                <div>
                  <strong>{m.message || "No message"}</strong>
                </div>
                <div>Student: {m.student}</div>
                <div>Alumni: {m.alumni}</div>
                <div>Status: {m.status}</div>
                {canAct && (
                  <div className="actions-row">
                    <button onClick={() => setStatus(m._id, "ACCEPTED")}>
                      Accept
                    </button>
                    <button onClick={() => setStatus(m._id, "REJECTED")}>
                      Reject
                    </button>
                  </div>
                )}
              </li>
            );
          })}
          {mentorshipMine.length === 0 && <li>No mentorship requests yet.</li>}
        </ul>
      </div>
      <div className="card">
        <h2>All Mentorship Requests</h2>
        <ul className="list">
          {mentorshipAll.map((m) => (
            <li key={m._id}>
              <div>
                <strong>{m.message || "No message"}</strong>
              </div>
              <div>Student: {m.student}</div>
              <div>Alumni: {m.alumni}</div>
              <div>Status: {m.status}</div>
            </li>
          ))}
          {mentorshipAll.length === 0 && <li>No mentorship requests yet.</li>}
        </ul>
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
