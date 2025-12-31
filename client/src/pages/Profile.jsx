import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, updateProfile, refreshProfile } = useAuth();
  const [form, setForm] = useState({ name: "", department: "", batch: "" });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const fresh = await refreshProfile();
        if (fresh) {
          setForm({
            name: fresh.name || "",
            department: fresh.department || "",
            batch: fresh.batch || "",
          });
        }
      } catch (err) {
        // fall back to current user if refresh fails
        if (user) {
          setForm({
            name: user.name || "",
            department: user.department || "",
            batch: user.batch || "",
          });
        }
      }
    };
    load();
  }, []); // intentionally run once

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setError("");
    try {
      await updateProfile(form);
      setStatus("Profile updated");
    } catch (err) {
      setError(err.message || "Update failed");
    }
  };

  return (
    <div className="card">
      <h2>Your Profile</h2>
      <form onSubmit={onSubmit}>
        <label>Name</label>
        <input name="name" value={form.name} onChange={onChange} required />
        <label>Department</label>
        <input
          name="department"
          value={form.department}
          onChange={onChange}
          required
        />
        <label>Batch</label>
        <input name="batch" value={form.batch} onChange={onChange} required />
        <button type="submit">Save</button>
      </form>
      {status && <p className="success">{status}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
