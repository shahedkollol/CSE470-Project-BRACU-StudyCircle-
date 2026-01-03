import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

function EntryCard({ entry, onDelete, onEdit }) {
  return (
    <li className="card" style={{ padding: "12px" }}>
      {entry.user && entry.user.name && (
        <div
          style={{
            marginBottom: "8px",
            borderBottom: "1px solid #eee",
            paddingBottom: "8px",
          }}
        >
          <strong>{entry.user.name}</strong>
          <span
            style={{ fontSize: "0.85em", color: "#666", marginLeft: "8px" }}
          >
            {entry.user.batch && `Batch ${entry.user.batch}`}
            {entry.user.department && ` • ${entry.user.department}`}
          </span>
        </div>
      )}
      <div>
        <strong>{entry.title}</strong> @ {entry.company}
      </div>
      <div>
        {entry.industry || ""} {entry.location ? `| ${entry.location}` : ""}
      </div>
      <div>
        {entry.startDate?.slice(0, 10)} -{" "}
        {entry.endDate?.slice(0, 10) || "Present"}
      </div>
      {entry.description && <div>{entry.description}</div>}
      {(onEdit || onDelete) && (
        <div className="actions-row" style={{ marginTop: "8px" }}>
          {onEdit && <button onClick={() => onEdit(entry)}>Edit</button>}
          {onDelete && (
            <button onClick={() => onDelete(entry._id)}>Delete</button>
          )}
        </div>
      )}
    </li>
  );
}

export default function AlumniCareers() {
  const { token } = useAuth();
  const [mine, setMine] = useState([]);
  const [form, setForm] = useState({
    id: null,
    title: "",
    company: "",
    industry: "",
    location: "",
    startDate: "",
    endDate: "",
    description: "",
  });
  const [searchForm, setSearchForm] = useState({
    company: "",
    industry: "",
    title: "",
    location: "",
  });
  const [searchResults, setSearchResults] = useState([]);
  const [analytics, setAnalytics] = useState({ byIndustry: [], byYear: [] });
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const isEditing = useMemo(() => Boolean(form.id), [form.id]);

  useEffect(() => {
    const loadMine = async () => {
      try {
        const data = await api.alumni.listMine(token);
        setMine(data);
      } catch (err) {
        setError(err.message);
      }
    };

    const loadAnalytics = async () => {
      try {
        const data = await api.alumni.analytics();
        setAnalytics(data);
      } catch {
        // analytics are optional; do not block
      }
    };

    if (token) {
      loadMine();
    }
    loadAnalytics();
  }, [token]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onSearchChange = (e) =>
    setSearchForm({ ...searchForm, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({
      id: null,
      title: "",
      company: "",
      industry: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");
    try {
      const payload = { ...form };
      delete payload.id;
      if (isEditing) {
        await api.alumni.update(form.id, payload, token);
        setStatus("Updated");
      } else {
        await api.alumni.create(payload, token);
        setStatus("Created");
      }
      resetForm();
      loadMine();
    } catch (err) {
      setError(err.message || "Save failed");
    }
  };

  const onEdit = (entry) => {
    setForm({
      id: entry._id,
      title: entry.title || "",
      company: entry.company || "",
      industry: entry.industry || "",
      location: entry.location || "",
      startDate: entry.startDate ? entry.startDate.slice(0, 10) : "",
      endDate: entry.endDate ? entry.endDate.slice(0, 10) : "",
      description: entry.description || "",
    });
  };

  const onDelete = async (id) => {
    setError("");
    setStatus("");
    try {
      await api.alumni.remove(id, token);
      loadMine();
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  };

  const doSearch = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const results = await api.alumni.search(searchForm);
      setSearchResults(results);
    } catch (err) {
      setError(err.message || "Search failed");
    }
  };

  return (
    <div className="grid">
      <div className="card">
        <h2>{isEditing ? "Edit" : "Add"} Employment</h2>
        <form onSubmit={submit} className="form-grid">
          <label>Title</label>
          <input name="title" value={form.title} onChange={onChange} required />
          <label>Company</label>
          <input
            name="company"
            value={form.company}
            onChange={onChange}
            required
          />
          <label>Industry</label>
          <input name="industry" value={form.industry} onChange={onChange} />
          <label>Location</label>
          <input name="location" value={form.location} onChange={onChange} />
          <label>Start Date</label>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={onChange}
            required
          />
          <label>End Date</label>
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={onChange}
          />
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
          />
          <div className="actions-row">
            <button type="submit">{isEditing ? "Update" : "Create"}</button>
            {isEditing && (
              <button type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
        {status && <p className="success">{status}</p>}
        {error && <p className="error">{error}</p>}
      </div>

      <div className="card">
        <h2>My Employment</h2>
        <ul className="list">
          {mine.map((m) => (
            <EntryCard
              key={m._id}
              entry={m}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
          {mine.length === 0 && <li>No entries yet.</li>}
        </ul>
      </div>

      <div className="card">
        <h2>Search Alumni</h2>
        <form onSubmit={doSearch} className="form-grid">
          <label>Company</label>
          <input
            name="company"
            value={searchForm.company}
            onChange={onSearchChange}
          />
          <label>Industry</label>
          <input
            name="industry"
            value={searchForm.industry}
            onChange={onSearchChange}
          />
          <label>Title</label>
          <input
            name="title"
            value={searchForm.title}
            onChange={onSearchChange}
          />
          <label>Location</label>
          <input
            name="location"
            value={searchForm.location}
            onChange={onSearchChange}
          />
          <button type="submit">Search</button>
        </form>
        <ul className="list">
          {searchResults.map((r) => (
            <EntryCard key={r._id} entry={r} />
          ))}
          {searchResults.length === 0 && <li>No matches.</li>}
        </ul>
      </div>

      <div className="card">
        <h2>Analytics</h2>
        <div
          style={{
            display: "grid",
            gap: "24px",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          }}
        >
          <div>
            <h3>By Industry</h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {analytics.byIndustry?.map((row) => {
                const max = Math.max(
                  ...(analytics.byIndustry?.map((r) => r.count) || [0]),
                  1
                );
                const pct = (row.count / max) * 100;
                return (
                  <div key={row._id}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.9em",
                        marginBottom: "4px",
                      }}
                    >
                      <span>{row._id}</span>
                      <strong>{row.count}</strong>
                    </div>
                    <div
                      style={{
                        background: "#f0f0f0",
                        height: "8px",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${pct}%`,
                          background: "#4caf50",
                          height: "100%",
                          transition: "width 0.5s ease",
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {(!analytics.byIndustry ||
                analytics.byIndustry.length === 0) && <p>No data.</p>}
            </div>
          </div>
          <div>
            <h3>By Start Year</h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {analytics.byYear?.map((row) => {
                const max = Math.max(
                  ...(analytics.byYear?.map((r) => r.count) || [0]),
                  1
                );
                const pct = (row.count / max) * 100;
                return (
                  <div key={row._id}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.9em",
                        marginBottom: "4px",
                      }}
                    >
                      <span>{row._id}</span>
                      <strong>{row.count}</strong>
                    </div>
                    <div
                      style={{
                        background: "#f0f0f0",
                        height: "8px",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${pct}%`,
                          background: "#2196f3",
                          height: "100%",
                          transition: "width 0.5s ease",
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {(!analytics.byYear || analytics.byYear.length === 0) && (
                <p>No data.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
