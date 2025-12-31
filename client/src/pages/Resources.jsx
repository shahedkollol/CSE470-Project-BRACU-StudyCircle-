import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Resources() {
  const { user, token } = useAuth();
  const [list, setList] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [form, setForm] = useState({
    title: "",
    fileUrl: "",
    subject: "",
    department: "",
  });
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await api.resources.list();
      setList(data);
      if (user) {
        const bm = await api.resources.bookmarks(user.id || user._id, token);
        setBookmarks(bm);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, [user]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.resources.create({ ...form }, token);
      setForm({ title: "", fileUrl: "", subject: "", department: "" });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleBookmark = async (id) => {
    if (!user) return;
    try {
      setError("");
      const userId = user.id || user._id;
      const isBookmarked = bookmarks.some(
        (b) => b.resource?._id === id || b.resource === id
      );
      if (isBookmarked) {
        await api.resources.unbookmark(id, userId, token);
      } else {
        await api.resources.bookmark(id, userId, token);
      }
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const isBookmarked = (id) =>
    bookmarks.some((b) => b.resource?._id === id || b.resource === id);

  return (
    <div className="grid">
      <div className="card">
        <h2>Create Resource</h2>
        <form onSubmit={onSubmit}>
          <label>Title</label>
          <input name="title" value={form.title} onChange={onChange} required />
          <label>File URL</label>
          <input
            name="fileUrl"
            value={form.fileUrl}
            onChange={onChange}
            required
          />
          <label>Subject</label>
          <input name="subject" value={form.subject} onChange={onChange} />
          <label>Department</label>
          <input
            name="department"
            value={form.department}
            onChange={onChange}
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
              <div>
                {r.subject} {r.department ? `| ${r.department}` : ""}
              </div>
              <div>
                <a href={r.fileUrl} target="_blank" rel="noreferrer">
                  Open
                </a>
              </div>
              {user && (
                <button onClick={() => toggleBookmark(r._id)}>
                  {isBookmarked(r._id) ? "Unbookmark" : "Bookmark"}
                </button>
              )}
            </li>
          ))}
          {list.length === 0 && <li>No resources yet.</li>}
        </ul>
      </div>
      {user && (
        <div className="card">
          <h2>Your Bookmarks</h2>
          <ul className="list">
            {bookmarks.map((b) => (
              <li key={b._id}>
                <div>
                  <strong>{b.resource?.title || b.resource}</strong>
                </div>
              </li>
            ))}
            {bookmarks.length === 0 && <li>No bookmarks yet.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
