import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Resources() {
  const { user, token } = useAuth();
  const [list, setList] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    subject: "",
    department: "",
    tag: "",
    fileType: "",
    minRating: "",
    from: "",
    to: "",
  });
  const [form, setForm] = useState({
    title: "",
    fileUrl: "",
    subject: "",
    department: "",
    fileType: "",
    tags: "",
    description: "",
  });
  const [fileInput, setFileInput] = useState(null);
  const [ratingDrafts, setRatingDrafts] = useState({});
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const filtered = {};
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== "") filtered[k] = v;
      });
      const data = await api.resources.list(filtered);
      setList(data);
      if (user) {
        const bm = await api.resources.bookmarks(user.id || user._id, token);
        setBookmarks(bm);
      }
      setRatingDrafts({});
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, [user]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    setFileInput(file || null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        ...form,
        tags: form.tags
          ? form.tags
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        file: fileInput || undefined,
      };
      if (!payload.file && !payload.fileUrl) {
        throw new Error("Upload a file or provide a file URL");
      }
      await api.resources.create(payload, token);
      setForm({
        title: "",
        fileUrl: "",
        subject: "",
        department: "",
        fileType: "",
        tags: "",
        description: "",
      });
      setFileInput(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleBookmark = async (id) => {
    if (!user) {
      setError("Login to bookmark resources");
      return;
    }
    try {
      setError("");
      const isBookmarked = bookmarks.some(
        (b) => b.resource?._id === id || b.resource === id
      );
      if (isBookmarked) {
        await api.resources.unbookmark(id, token);
      } else {
        await api.resources.bookmark(id, token);
      }
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const reportResource = async (id) => {
    if (!user) {
      setError("Login to report resources");
      return;
    }
    const reason = prompt("Why are you reporting this resource?");
    if (!reason) return;
    setError("");
    try {
      await api.resources.report(id, { reason }, token);
      alert("Report submitted");
    } catch (err) {
      setError(err.message);
    }
  };

  const ratingDraft = (resource) =>
    ratingDrafts[resource._id] ||
    (() => {
      const mine = resource.reviews?.find(
        (rev) =>
          user &&
          (rev.user === (user.id || user._id) ||
            rev.user?._id === (user.id || user._id))
      );
      return {
        stars: mine?.stars
          ? String(mine.stars)
          : resource.averageRating
          ? String(Math.round(resource.averageRating))
          : "5",
        comment: mine?.comment || "",
      };
    })();

  const onRatingChange = (id, field, value) => {
    setRatingDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const submitRating = async (resource) => {
    if (!user) {
      setError("Login to rate resources");
      return;
    }
    setError("");
    const draft = ratingDraft(resource);
    try {
      await api.resources.addReview(
        resource._id,
        { stars: Number(draft.stars), comment: draft.comment },
        token
      );
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const trackView = async (id) => {
    try {
      await api.resources.trackView(id);
    } catch (err) {
      // non-blocking
    }
  };

  const trackDownload = async (id) => {
    try {
      await api.resources.trackDownload(id);
    } catch (err) {
      // non-blocking
    }
  };

  const isBookmarked = (id) =>
    bookmarks.some((b) => b.resource?._id === id || b.resource === id);

  return (
    <div className="grid">
      <div className="card">
        <h2>Filters</h2>
        <div
          className="grid"
          style={{ gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}
        >
          <div>
            <label>Search (title/desc/tags)</label>
            <input
              name="search"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              placeholder="keyword"
            />
          </div>
          <div>
            <label>Tag contains</label>
            <input
              name="tag"
              value={filters.tag}
              onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
              placeholder="SRS"
            />
          </div>
          <div>
            <label>Subject</label>
            <input
              name="subject"
              value={filters.subject}
              onChange={(e) =>
                setFilters({ ...filters, subject: e.target.value })
              }
            />
          </div>
          <div>
            <label>Department</label>
            <input
              name="department"
              value={filters.department}
              onChange={(e) =>
                setFilters({ ...filters, department: e.target.value })
              }
            />
          </div>
          <div>
            <label>File Type</label>
            <input
              name="fileType"
              value={filters.fileType}
              onChange={(e) =>
                setFilters({ ...filters, fileType: e.target.value })
              }
              placeholder="PDF"
            />
          </div>
          <div>
            <label>Min Rating</label>
            <input
              type="number"
              min="1"
              max="5"
              step="0.1"
              name="minRating"
              value={filters.minRating}
              onChange={(e) =>
                setFilters({ ...filters, minRating: e.target.value })
              }
            />
          </div>
          <div>
            <label>From (date)</label>
            <input
              type="date"
              name="from"
              value={filters.from}
              onChange={(e) => setFilters({ ...filters, from: e.target.value })}
            />
          </div>
          <div>
            <label>To (date)</label>
            <input
              type="date"
              name="to"
              value={filters.to}
              onChange={(e) => setFilters({ ...filters, to: e.target.value })}
            />
          </div>
        </div>
        <div className="actions-row" style={{ marginTop: "8px" }}>
          <button type="button" onClick={load}>
            Apply
          </button>
          <button
            type="button"
            onClick={() => {
              const cleared = {
                search: "",
                subject: "",
                department: "",
                tag: "",
                fileType: "",
                minRating: "",
                from: "",
                to: "",
              };
              setFilters(cleared);
              load();
            }}
          >
            Clear
          </button>
        </div>
      </div>
      <div className="card">
        <h2>Create Resource</h2>
        <form onSubmit={onSubmit}>
          <label>Title</label>
          <input name="title" value={form.title} onChange={onChange} required />
          <label>Description</label>
          <input
            name="description"
            value={form.description}
            onChange={onChange}
          />
          <label>File Upload (optional)</label>
          <input type="file" onChange={onFileChange} />
          <label>File URL (optional)</label>
          <input name="fileUrl" value={form.fileUrl} onChange={onChange} />
          <label>File Type</label>
          <input
            name="fileType"
            value={form.fileType}
            onChange={onChange}
            placeholder="PDF"
          />
          <label>Subject</label>
          <input name="subject" value={form.subject} onChange={onChange} />
          <label>Department</label>
          <input
            name="department"
            value={form.department}
            onChange={onChange}
          />
          <label>Tags (comma separated)</label>
          <input
            name="tags"
            value={form.tags}
            onChange={onChange}
            placeholder="SRS, template"
          />
          <button type="submit">Create</button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
      <div className="card">
        <h2>Resources</h2>
        <ul className="list">
          {list.map((r) => (
            <li key={r._id}>
              <div>
                <strong>{r.title}</strong>
              </div>
              <div>{r.description}</div>
              <div>
                {[r.subject, r.department, r.fileType]
                  .filter(Boolean)
                  .join(" | ")}
              </div>
              {r.tags?.length ? <div>Tags: {r.tags.join(", ")}</div> : null}
              <div>
                <a
                  href={r.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackView(r._id)}
                >
                  Open
                </a>{" "}
                |{" "}
                <button type="button" onClick={() => trackDownload(r._id)}>
                  Mark Download
                </button>
              </div>
              <div>
                Views: {r.viewCount ?? 0} | Downloads: {r.downloadCount ?? 0}
              </div>
              <div>
                Avg Rating:{" "}
                {r.averageRating?.toFixed
                  ? r.averageRating.toFixed(2)
                  : r.averageRating || 0}{" "}
                ({r.reviewCount || 0})
              </div>
              {r.reviews?.length ? (
                <div style={{ marginTop: "6px" }}>
                  <strong>Recent Reviews</strong>
                  <ul>
                    {r.reviews.slice(-3).map((rev) => (
                      <li key={rev._id || rev.user}>
                        {rev.stars}★ {rev.comment}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {user && (
                <div className="actions-row" style={{ marginTop: "6px" }}>
                  <button onClick={() => toggleBookmark(r._id)}>
                    {isBookmarked(r._id) ? "Unbookmark" : "Bookmark"}
                  </button>
                  <button type="button" onClick={() => reportResource(r._id)}>
                    Report
                  </button>
                </div>
              )}
              {user && (
                <div style={{ marginTop: "8px" }}>
                  <label>Rate this resource</label>
                  <div className="actions-row">
                    <select
                      value={ratingDraft(r).stars}
                      onChange={(e) =>
                        onRatingChange(r._id, "stars", e.target.value)
                      }
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    <input
                      placeholder="Comment (optional)"
                      value={ratingDraft(r).comment}
                      onChange={(e) =>
                        onRatingChange(r._id, "comment", e.target.value)
                      }
                    />
                    <button type="button" onClick={() => submitRating(r)}>
                      Submit
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
          {list.length === 0 && <li>No resources yet.</li>}
        </ul>
      </div>
      {user && (
        <div className="card">
          <h2>Your Bookmarks</h2>

          {bookmarks.length === 0 ? (
            <div className="empty-state">No bookmarks yet.</div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "var(--space-md)",
              }}
            >
              {bookmarks.map((b) => (
                <div
                  key={b._id}
                  style={{
                    border: "1px solid var(--gray-200)",
                    borderRadius: "var(--radius-lg)",
                    padding: "var(--space-md)",
                    background: "var(--bg-secondary)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div style={{ fontWeight: 700, color: "var(--gray-900)" }}>
                    {b.resource?.title || b.resource}
                  </div>
                  {b.resource?.subject && (
                    <div style={{ color: "var(--gray-500)", marginTop: "4px" }}>
                      {b.resource.subject}
                    </div>
                  )}
                  <div className="actions-row" style={{ marginTop: "10px" }}>
                    {b.resource?.fileUrl && (
                      <a
                        href={b.resource.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary"
                        style={{
                          textDecoration: "none",
                          padding: "6px 10px",
                          borderRadius: "var(--radius-md)",
                          fontSize: "0.85rem",
                        }}
                      >
                        Open
                      </a>
                    )}
                    <button
                      type="button"
                      className="btn-sm"
                      onClick={() =>
                        toggleBookmark(b.resource?._id || b.resource)
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
