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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-lg)",
      }}
    >
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-md)",
        }}
      >
        <span style={{ fontSize: "2.5rem" }}>📚</span>
        <div>
          <h1 style={{ margin: 0 }}>Resource Library</h1>
          <p style={{ margin: 0, color: "var(--gray-500)" }}>
            Browse, share, and bookmark study materials
          </p>
        </div>
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: "var(--space-lg)",
          alignItems: "start",
        }}
      >
        {/* Left Sidebar: Filters + Create */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-md)",
            position: "sticky",
            top: "calc(var(--space-md) * 2 + 64px)",
          }}
        >
          {/* Filters Card */}
          <div className="card" style={{ padding: "var(--space-md)" }}>
            <h3
              style={{
                margin: "0 0 var(--space-sm) 0",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              🔍 Filters
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-sm)",
              }}
            >
              <input
                name="search"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                placeholder="Search..."
                style={{ fontSize: "0.875rem" }}
              />
              <input
                name="subject"
                value={filters.subject}
                onChange={(e) =>
                  setFilters({ ...filters, subject: e.target.value })
                }
                placeholder="Subject"
                style={{ fontSize: "0.875rem" }}
              />
              <input
                name="department"
                value={filters.department}
                onChange={(e) =>
                  setFilters({ ...filters, department: e.target.value })
                }
                placeholder="Department"
                style={{ fontSize: "0.875rem" }}
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "6px",
                }}
              >
                <input
                  name="fileType"
                  value={filters.fileType}
                  onChange={(e) =>
                    setFilters({ ...filters, fileType: e.target.value })
                  }
                  placeholder="Type"
                  style={{ fontSize: "0.875rem" }}
                />
                <input
                  name="tag"
                  value={filters.tag}
                  onChange={(e) =>
                    setFilters({ ...filters, tag: e.target.value })
                  }
                  placeholder="Tag"
                  style={{ fontSize: "0.875rem" }}
                />
              </div>
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
                placeholder="Min rating"
                style={{ fontSize: "0.875rem" }}
              />
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <input
                  type="date"
                  name="from"
                  value={filters.from}
                  onChange={(e) =>
                    setFilters({ ...filters, from: e.target.value })
                  }
                  style={{ fontSize: "0.8rem" }}
                  aria-label="From date"
                />
                <input
                  type="date"
                  name="to"
                  value={filters.to}
                  onChange={(e) =>
                    setFilters({ ...filters, to: e.target.value })
                  }
                  style={{ fontSize: "0.8rem" }}
                  aria-label="To date"
                />
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  type="button"
                  onClick={load}
                  style={{ flex: 1, fontSize: "0.85rem" }}
                >
                  Apply
                </button>
                <button
                  type="button"
                  className="btn-secondary"
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
                  style={{ fontSize: "0.85rem" }}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Create Resource Card */}
          <div className="card" style={{ padding: "var(--space-md)" }}>
            <h3
              style={{
                margin: "0 0 var(--space-sm) 0",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              ➕ Add Resource
            </h3>
            <form
              onSubmit={onSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-sm)",
              }}
            >
              <input
                name="title"
                value={form.title}
                onChange={onChange}
                placeholder="Title *"
                required
                style={{ fontSize: "0.875rem" }}
              />
              <input
                name="description"
                value={form.description}
                onChange={onChange}
                placeholder="Description"
                style={{ fontSize: "0.875rem" }}
              />
              <div
                style={{
                  border: "1px dashed var(--gray-300)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-sm)",
                  background: "var(--gray-50)",
                }}
              >
                <label
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--gray-500)",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Upload file
                </label>
                <input
                  type="file"
                  onChange={onFileChange}
                  style={{ fontSize: "0.8rem", width: "100%" }}
                />
              </div>
              <input
                name="fileUrl"
                value={form.fileUrl}
                onChange={onChange}
                placeholder="Or paste URL"
                style={{ fontSize: "0.875rem" }}
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "6px",
                }}
              >
                <input
                  name="subject"
                  value={form.subject}
                  onChange={onChange}
                  placeholder="Subject"
                  style={{ fontSize: "0.875rem" }}
                />
                <input
                  name="department"
                  value={form.department}
                  onChange={onChange}
                  placeholder="Dept"
                  style={{ fontSize: "0.875rem" }}
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "6px",
                }}
              >
                <input
                  name="fileType"
                  value={form.fileType}
                  onChange={onChange}
                  placeholder="Type"
                  style={{ fontSize: "0.875rem" }}
                />
                <input
                  name="tags"
                  value={form.tags}
                  onChange={onChange}
                  placeholder="Tags"
                  style={{ fontSize: "0.875rem" }}
                />
              </div>
              <button type="submit" style={{ fontSize: "0.85rem" }}>
                Create
              </button>
            </form>
            {error && (
              <p
                className="error"
                style={{ marginTop: "var(--space-sm)", fontSize: "0.85rem" }}
              >
                {error}
              </p>
            )}
          </div>

          {/* Bookmarks Section in Sidebar */}
          {user && (
            <div className="card" style={{ padding: "var(--space-md)" }}>
              <h3
                style={{
                  margin: "0 0 var(--space-sm) 0",
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                🔖 Bookmarks
                <span
                  style={{
                    fontSize: "0.75rem",
                    background: "var(--gray-100)",
                    color: "var(--gray-600)",
                    padding: "2px 6px",
                    borderRadius: "var(--radius-full)",
                    fontWeight: 500,
                  }}
                >
                  {bookmarks.length}
                </span>
              </h3>
              {bookmarks.length === 0 ? (
                <div style={{ fontSize: "0.85rem", color: "var(--gray-500)" }}>
                  No bookmarks yet.
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    maxHeight: "300px",
                    overflowY: "auto",
                  }}
                >
                  {bookmarks.map((b) => (
                    <div
                      key={b._id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px",
                        background: "var(--gray-50)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--gray-100)",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "0.85rem",
                            color: "var(--gray-800)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {b.resource?.title || b.resource}
                        </div>
                        {b.resource?.subject && (
                          <div
                            style={{
                              fontSize: "0.7rem",
                              color: "var(--gray-500)",
                            }}
                          >
                            {b.resource.subject}
                          </div>
                        )}
                      </div>
                      <div
                        style={{ display: "flex", gap: "4px", flexShrink: 0 }}
                      >
                        {b.resource?.fileUrl && (
                          <a
                            href={b.resource.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              textDecoration: "none",
                              fontSize: "0.7rem",
                              color: "white",
                              background: "var(--primary)",
                              padding: "4px 8px",
                              borderRadius: "var(--radius-sm)",
                              fontWeight: 600,
                            }}
                          >
                            Open
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            toggleBookmark(b.resource?._id || b.resource)
                          }
                          style={{
                            fontSize: "0.7rem",
                            background: "var(--gray-200)",
                            border: "none",
                            color: "var(--gray-600)",
                            cursor: "pointer",
                            padding: "4px 8px",
                            borderRadius: "var(--radius-sm)",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Content: Resources List */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-lg)",
          }}
        >
          {/* Resources Grid */}
          <div className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "var(--space-md)",
              }}
            >
              <h2 style={{ margin: 0 }}>Resources</h2>
              <span style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>
                {list.length} item{list.length !== 1 ? "s" : ""}
              </span>
            </div>

            {list.length === 0 ? (
              <div className="empty-state">No resources found.</div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "var(--space-md)",
                }}
              >
                {list.map((r) => (
                  <div
                    key={r._id}
                    className="resource-card"
                    style={{
                      border: "1px solid var(--gray-200)",
                      borderRadius: "var(--radius-lg)",
                      padding: "var(--space-md)",
                      background: "var(--bg-secondary)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--space-sm)",
                      transition: "box-shadow 0.2s, transform 0.2s",
                    }}
                  >
                    {/* Header */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "1rem",
                            color: "var(--gray-900)",
                          }}
                        >
                          {r.title}
                        </div>
                        {r.description && (
                          <div
                            style={{
                              color: "var(--gray-500)",
                              fontSize: "0.85rem",
                              marginTop: "2px",
                            }}
                          >
                            {r.description}
                          </div>
                        )}
                      </div>
                      {r.fileType && (
                        <span
                          style={{
                            background: "var(--primary)",
                            color: "white",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            padding: "2px 8px",
                            borderRadius: "var(--radius-full)",
                            textTransform: "uppercase",
                            marginLeft: "8px",
                            flexShrink: 0,
                          }}
                        >
                          {r.fileType}
                        </span>
                      )}
                    </div>

                    {/* Meta */}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                        fontSize: "0.8rem",
                        color: "var(--gray-500)",
                      }}
                    >
                      {r.subject && <span>📘 {r.subject}</span>}
                      {r.department && <span>🏛️ {r.department}</span>}
                    </div>

                    {/* Tags */}
                    {r.tags?.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "4px",
                        }}
                      >
                        {r.tags.map((tag, i) => (
                          <span
                            key={i}
                            style={{
                              background: "var(--gray-100)",
                              color: "var(--gray-600)",
                              fontSize: "0.75rem",
                              padding: "2px 8px",
                              borderRadius: "var(--radius-full)",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Stats Row */}
                    <div
                      style={{
                        display: "flex",
                        gap: "var(--space-md)",
                        fontSize: "0.8rem",
                        color: "var(--gray-600)",
                        padding: "8px 0",
                        borderTop: "1px solid var(--gray-100)",
                        borderBottom: "1px solid var(--gray-100)",
                      }}
                    >
                      <span>👁️ {r.viewCount ?? 0}</span>
                      <span>⬇️ {r.downloadCount ?? 0}</span>
                      <span>
                        ⭐{" "}
                        {r.averageRating?.toFixed
                          ? r.averageRating.toFixed(1)
                          : r.averageRating || 0}{" "}
                        <span style={{ color: "var(--gray-400)" }}>
                          ({r.reviewCount || 0})
                        </span>
                      </span>
                    </div>

                    {/* Actions */}
                    <div
                      style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}
                    >
                      <a
                        href={r.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => trackView(r._id)}
                        style={{
                          textDecoration: "none",
                          background: "var(--primary)",
                          color: "white",
                          padding: "6px 12px",
                          borderRadius: "var(--radius-md)",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                        }}
                      >
                        Open
                      </a>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => trackDownload(r._id)}
                        style={{ fontSize: "0.8rem", padding: "6px 12px" }}
                      >
                        Download
                      </button>
                      {user && (
                        <>
                          <button
                            type="button"
                            onClick={() => toggleBookmark(r._id)}
                            style={{
                              background: isBookmarked(r._id)
                                ? "var(--warning)"
                                : "var(--gray-100)",
                              color: isBookmarked(r._id)
                                ? "white"
                                : "var(--gray-700)",
                              border: "none",
                              padding: "6px 10px",
                              borderRadius: "var(--radius-md)",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                            }}
                          >
                            {isBookmarked(r._id) ? "★" : "☆"}
                          </button>
                          <button
                            type="button"
                            onClick={() => reportResource(r._id)}
                            style={{
                              background: "var(--gray-100)",
                              color: "var(--gray-600)",
                              border: "none",
                              padding: "6px 10px",
                              borderRadius: "var(--radius-md)",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                            }}
                          >
                            ⚠️
                          </button>
                        </>
                      )}
                    </div>

                    {/* Rating Input */}
                    {user && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px",
                          background: "var(--gray-50)",
                          borderRadius: "var(--radius-md)",
                        }}
                      >
                        <select
                          value={ratingDraft(r).stars}
                          onChange={(e) =>
                            onRatingChange(r._id, "stars", e.target.value)
                          }
                          style={{
                            fontSize: "0.8rem",
                            padding: "4px",
                            width: "55px",
                          }}
                        >
                          {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>
                              {n}★
                            </option>
                          ))}
                        </select>
                        <input
                          placeholder="Comment..."
                          value={ratingDraft(r).comment}
                          onChange={(e) =>
                            onRatingChange(r._id, "comment", e.target.value)
                          }
                          style={{
                            flex: 1,
                            fontSize: "0.8rem",
                            padding: "4px 8px",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => submitRating(r)}
                          style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                        >
                          Rate
                        </button>
                      </div>
                    )}

                    {/* Recent Reviews */}
                    {r.reviews?.length > 0 && (
                      <div
                        style={{ fontSize: "0.8rem", color: "var(--gray-600)" }}
                      >
                        <strong
                          style={{
                            fontSize: "0.7rem",
                            textTransform: "uppercase",
                            color: "var(--gray-400)",
                          }}
                        >
                          Reviews
                        </strong>
                        {r.reviews.slice(-2).map((rev) => (
                          <div
                            key={rev._id || rev.user}
                            style={{ marginTop: "4px" }}
                          >
                            {rev.stars}★ {rev.comment && `— ${rev.comment}`}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
