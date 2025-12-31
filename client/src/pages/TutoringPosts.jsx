import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function TutoringPosts() {
  const { user, token } = useAuth();
  const [list, setList] = useState([]);
  const [filters, setFilters] = useState({
    subject: "",
    postType: "",
    meetingMode: "",
    rateMin: "",
    rateMax: "",
    availability: "",
    sort: "newest",
  });
  const [favorites, setFavorites] = useState(new Set());
  const [form, setForm] = useState({
    subject: "",
    description: "",
    postType: "OFFER",
    availability: "",
    meetingMode: "ONLINE",
    rate: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const load = async (overrideFilters = filters) => {
    try {
      const cleaned = {};
      Object.entries(overrideFilters).forEach(([key, val]) => {
        if (val === undefined || val === "") return;
        if (key === "sort" && val === "newest") return;
        cleaned[key] = val;
      });

      const data = await api.tutoring.listPosts(cleaned);
      setList(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadFavorites = async () => {
    if (!user) {
      setFavorites(new Set());
      return;
    }
    try {
      const favs = await api.tutoring.listFavorites(token);
      const ids = new Set((favs || []).map((f) => f._id || f));
      setFavorites(ids);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
    loadFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        subject: form.subject,
        description: form.description,
        postType: form.postType,
        availability: form.availability
          ? form.availability
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        meetingMode: form.meetingMode,
        rate: form.rate ? Number(form.rate) : undefined,
      };

      if (editingId) {
        await api.tutoring.updatePost(editingId, payload, token);
      } else {
        await api.tutoring.createPost(payload, token);
      }

      setForm({
        subject: "",
        description: "",
        postType: "OFFER",
        availability: "",
        meetingMode: "ONLINE",
        rate: "",
      });
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const onEdit = (post) => {
    setEditingId(post._id);
    setForm({
      subject: post.subject || "",
      description: post.description || "",
      postType: post.postType || "OFFER",
      availability: Array.isArray(post.availability)
        ? post.availability.join(", ")
        : "",
      meetingMode: post.meetingMode || "ONLINE",
      rate: post.rate ?? "",
    });
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    setError("");
    try {
      await api.tutoring.deletePost(id, token);
      if (editingId === id) setEditingId(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleFavorite = async (tutorId) => {
    if (!user) {
      setError("Login to favorite tutors");
      return;
    }
    if (!tutorId) return;
    setError("");
    const isFav = favorites.has(tutorId);
    try {
      if (isFav) {
        await api.tutoring.removeFavorite(tutorId, token);
      } else {
        await api.tutoring.addFavorite(tutorId, token);
      }
      await loadFavorites();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="grid">
      <div className="card">
        <h2>Filters</h2>
        <div
          className="grid"
          style={{ gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}
        >
          <div>
            <label>Subject</label>
            <input
              name="subject"
              value={filters.subject}
              onChange={(e) =>
                setFilters({ ...filters, subject: e.target.value })
              }
              placeholder="e.g., Data Structures"
            />
          </div>
          <div>
            <label>Availability contains</label>
            <input
              name="availability"
              value={filters.availability}
              onChange={(e) =>
                setFilters({ ...filters, availability: e.target.value })
              }
              placeholder="Sun"
            />
          </div>
          <div>
            <label>Post Type</label>
            <select
              name="postType"
              value={filters.postType}
              onChange={(e) =>
                setFilters({ ...filters, postType: e.target.value })
              }
            >
              <option value="">Any</option>
              <option value="OFFER">Offer</option>
              <option value="REQUEST">Request</option>
            </select>
          </div>
          <div>
            <label>Meeting Mode</label>
            <select
              name="meetingMode"
              value={filters.meetingMode}
              onChange={(e) =>
                setFilters({ ...filters, meetingMode: e.target.value })
              }
            >
              <option value="">Any</option>
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>
          <div>
            <label>Rate Min</label>
            <input
              type="number"
              name="rateMin"
              min="0"
              step="0.01"
              value={filters.rateMin}
              onChange={(e) =>
                setFilters({ ...filters, rateMin: e.target.value })
              }
            />
          </div>
          <div>
            <label>Rate Max</label>
            <input
              type="number"
              name="rateMax"
              min="0"
              step="0.01"
              value={filters.rateMax}
              onChange={(e) =>
                setFilters({ ...filters, rateMax: e.target.value })
              }
            />
          </div>
          <div>
            <label>Sort</label>
            <select
              name="sort"
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            >
              <option value="newest">Newest</option>
              <option value="rateAsc">Rate: Low to High</option>
              <option value="rateDesc">Rate: High to Low</option>
            </select>
          </div>
        </div>
        <div className="actions-row" style={{ marginTop: "8px" }}>
          <button type="button" onClick={() => load(filters)}>
            Apply Filters
          </button>
          <button
            type="button"
            onClick={() => {
              const cleared = {
                subject: "",
                postType: "",
                meetingMode: "",
                rateMin: "",
                rateMax: "",
                availability: "",
                sort: "newest",
              };
              setFilters(cleared);
              load(cleared);
            }}
          >
            Clear
          </button>
        </div>
      </div>
      <div className="card">
        <h2>{editingId ? "Edit Tutoring Post" : "Create Tutoring Post"}</h2>
        <form onSubmit={onSubmit}>
          <label>Subject</label>
          <input
            name="subject"
            value={form.subject}
            onChange={onChange}
            required
          />
          <label>Description</label>
          <input
            name="description"
            value={form.description}
            onChange={onChange}
          />
          <label>Availability (comma separated)</label>
          <input
            name="availability"
            value={form.availability}
            onChange={onChange}
            placeholder="Sun 7pm, Wed 8pm"
          />
          <label>Meeting Mode</label>
          <select
            name="meetingMode"
            value={form.meetingMode}
            onChange={onChange}
          >
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
            <option value="HYBRID">Hybrid</option>
          </select>
          <label>Rate (per hour)</label>
          <input
            name="rate"
            type="number"
            value={form.rate}
            onChange={onChange}
            min="0"
            step="0.01"
          />
          <label>Post Type</label>
          <select name="postType" value={form.postType} onChange={onChange}>
            <option value="OFFER">Offer</option>
            <option value="REQUEST">Request</option>
          </select>
          <div className="actions-row">
            <button type="submit">{editingId ? "Update" : "Create"}</button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({
                    subject: "",
                    description: "",
                    postType: "OFFER",
                    availability: "",
                    meetingMode: "ONLINE",
                    rate: "",
                  });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
      <div className="card">
        <h2>Tutoring Posts</h2>
        <ul className="list">
          {list.map((p) => (
            <li key={p._id}>
              <div>
                <strong>{p.subject}</strong> ({p.postType})
              </div>
              <div>{p.description}</div>
              {p.availability?.length ? (
                <div>Availability: {p.availability.join(", ")}</div>
              ) : null}
              {p.meetingMode && <div>Mode: {p.meetingMode}</div>}
              {p.rate !== undefined && p.rate !== null && p.rate !== "" ? (
                <div>Rate: {p.rate}</div>
              ) : null}
              <div>Author: {p.author?.name || p.author}</div>
              {user && p.author && (
                <div className="actions-row" style={{ marginTop: "6px" }}>
                  {user.role === "student" && (
                    <button
                      type="button"
                      onClick={() => toggleFavorite(p.author?._id || p.author)}
                    >
                      {favorites.has(p.author?._id || p.author)
                        ? "★ Unfavorite"
                        : "☆ Favorite"}
                    </button>
                  )}
                  {(user.id === p.author?._id ||
                    user._id === p.author ||
                    user.role === "admin") && (
                    <>
                      <button onClick={() => onEdit(p)}>Edit</button>
                      <button onClick={() => onDelete(p._id)}>Delete</button>
                    </>
                  )}
                </div>
              )}
            </li>
          ))}
          {list.length === 0 && <li>No posts yet.</li>}
        </ul>
      </div>
    </div>
  );
}
