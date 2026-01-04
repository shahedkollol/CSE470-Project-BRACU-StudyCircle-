import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function GroupResources() {
  const { groupId } = useParams();
  const { user, token } = useAuth();
  const [resources, setResources] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "",
    fileUrl: "",
    fileType: "PDF",
    tags: "",
  });

  const load = async () => {
    try {
      const data = await api.studyGroups.groupResources(groupId);
      setResources(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (groupId) load();
  }, [groupId]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        ...form,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
      };
      await api.studyGroups.uploadGroupResource(groupId, payload, token);
      setForm({
        title: "",
        description: "",
        subject: "",
        fileUrl: "",
        fileType: "PDF",
        tags: "",
      });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteResource = async (resourceId) => {
    if (!confirm("Delete this resource?")) return;
    try {
      await api.studyGroups.deleteGroupResource(groupId, resourceId, token);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="grid">
      <div className="card">
        <h2>Share Resource</h2>
        <form onSubmit={onSubmit}>
          <label>Title *</label>
          <input name="title" value={form.title} onChange={onChange} required />

          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            rows={3}
          />

          <label>Subject</label>
          <input name="subject" value={form.subject} onChange={onChange} />

          <label>File URL *</label>
          <input
            name="fileUrl"
            value={form.fileUrl}
            onChange={onChange}
            placeholder="https://example.com/file.pdf"
            required
          />

          <label>File Type</label>
          <select name="fileType" value={form.fileType} onChange={onChange}>
            <option>PDF</option>
            <option>DOCX</option>
            <option>PPT</option>
            <option>OTHER</option>
          </select>

          <label>Tags (comma-separated)</label>
          <input
            name="tags"
            value={form.tags}
            onChange={onChange}
            placeholder="e.g. notes, exam, lecture"
          />

          <button type="submit">Upload</button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>

      <div className="card">
        <h2>Group Resources</h2>
        <ul className="list">
          {resources.map((r) => (
            <li key={r._id}>
              <div>
                <strong>{r.title}</strong>
                {r.subject && (
                  <div style={{ fontSize: "0.9rem" }}>Subject: {r.subject}</div>
                )}
              </div>
              {r.description && (
                <div style={{ fontSize: "0.9rem", color: "var(--gray-600)" }}>
                  {r.description}
                </div>
              )}
              <div style={{ fontSize: "0.85rem", marginTop: 6 }}>
                <span style={{ marginRight: 12 }}>📄 {r.fileType}</span>
                <span style={{ marginRight: 12 }}>👤 {r.uploader?.name}</span>
              </div>
              {r.tags?.length > 0 && (
                <div style={{ fontSize: "0.85rem", marginTop: 4 }}>
                  {r.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        display: "inline-block",
                        background: "var(--gray-100)",
                        padding: "2px 8px",
                        borderRadius: 4,
                        marginRight: 4,
                        marginTop: 4,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 8 }}>
                <a href={r.fileUrl} target="_blank" rel="noopener noreferrer">
                  <button style={{ marginRight: 4 }}>Download</button>
                </a>
                {(user?._id === r.uploader?._id || user?.role === "admin") && (
                  <button
                    onClick={() => deleteResource(r._id)}
                    style={{ background: "var(--error)", color: "white" }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
          {resources.length === 0 && (
            <li>No resources shared yet. Be the first to upload!</li>
          )}
        </ul>
      </div>
    </div>
  );
}
