import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function TutoringPosts() {
  const { user, token } = useAuth();
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    subject: "",
    description: "",
    postType: "OFFER",
  });
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await api.tutoring.listPosts();
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
      await api.tutoring.createPost(
        { ...form, author: user?.id || user?._id },
        token
      );
      setForm({ subject: "", description: "", postType: "OFFER" });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="grid">
      <div className="card">
        <h2>Create Tutoring Post</h2>
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
          <label>Post Type</label>
          <select name="postType" value={form.postType} onChange={onChange}>
            <option value="OFFER">Offer</option>
            <option value="REQUEST">Request</option>
          </select>
          <button type="submit">Create</button>
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
              <div>Author: {p.author?.name || p.author}</div>
            </li>
          ))}
          {list.length === 0 && <li>No posts yet.</li>}
        </ul>
      </div>
    </div>
  );
}
