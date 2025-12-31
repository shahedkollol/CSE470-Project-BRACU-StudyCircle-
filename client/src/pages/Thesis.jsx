import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Thesis() {
  const { user, token } = useAuth();
  const [groups, setGroups] = useState([]);
  const [groupForm, setGroupForm] = useState({
    groupName: "",
    researchInterests: "",
  });
  const [joinId, setJoinId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [thesisForm, setThesisForm] = useState({
    title: "",
    department: "",
    abstract: "",
  });
  const [error, setError] = useState("");

  const loadGroups = async () => {
    try {
      const data = await api.thesis.listGroups();
      setGroups(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const onGroupChange = (e) =>
    setGroupForm({ ...groupForm, [e.target.name]: e.target.value });

  const createGroup = async (e) => {
    e.preventDefault();
    setError("");
    const body = {
      groupName: groupForm.groupName,
      researchInterests: groupForm.researchInterests
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    try {
      await api.thesis.createGroup(body, token);
      setGroupForm({ groupName: "", researchInterests: "" });
      loadGroups();
    } catch (err) {
      setError(err.message);
    }
  };

  const joinGroup = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.thesis.joinGroup(joinId, undefined, token);
      setJoinId("");
      loadGroups();
    } catch (err) {
      setError(err.message);
    }
  };

  const search = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await api.thesis.search(searchTerm);
      setResults(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const createThesis = async (e) => {
    e.preventDefault();
    setError("");
    const body = {
      title: thesisForm.title,
      department: thesisForm.department,
      abstract: thesisForm.abstract,
      authors: [user?.id || user?._id].filter(Boolean),
      status: "PUBLISHED",
    };
    try {
      await api.thesis.createThesis(body, token);
      setThesisForm({ title: "", department: "", abstract: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="grid">
      <div className="card">
        <h2>Create Thesis Group</h2>
        <form onSubmit={createGroup}>
          <label>Group Name</label>
          <input
            name="groupName"
            value={groupForm.groupName}
            onChange={onGroupChange}
            required
          />
          <label>Research Interests (comma-separated)</label>
          <input
            name="researchInterests"
            value={groupForm.researchInterests}
            onChange={onGroupChange}
          />
          <button type="submit">Create Group</button>
        </form>
        <h3>Join Group</h3>
        <form onSubmit={joinGroup}>
          <label>Group Id</label>
          <input value={joinId} onChange={(e) => setJoinId(e.target.value)} />
          <button type="submit">Join</button>
        </form>
      </div>
      <div className="card">
        <h2>Groups</h2>
        <ul className="list">
          {groups.map((g) => (
            <li key={g._id}>
              <div>
                <strong>{g.groupName}</strong>
              </div>
              <div>Interests: {(g.researchInterests || []).join(", ")}</div>
              <div>Members: {g.members?.length || 0}</div>
              <div>Leader: {g.leader?.name || g.leader}</div>
            </li>
          ))}
          {groups.length === 0 && <li>No groups yet.</li>}
        </ul>
      </div>
      <div className="card">
        <h2>Search Theses</h2>
        <form onSubmit={search}>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="keyword"
          />
          <button type="submit">Search</button>
        </form>
        <ul className="list">
          {results.map((t) => (
            <li key={t._id}>
              <strong>{t.title}</strong> ({t.department})
            </li>
          ))}
          {results.length === 0 && <li>No theses found.</li>}
        </ul>
      </div>
      <div className="card">
        <h2>Create Thesis Entry</h2>
        <form onSubmit={createThesis}>
          <label>Title</label>
          <input
            value={thesisForm.title}
            onChange={(e) =>
              setThesisForm({ ...thesisForm, title: e.target.value })
            }
            required
          />
          <label>Department</label>
          <input
            value={thesisForm.department}
            onChange={(e) =>
              setThesisForm({ ...thesisForm, department: e.target.value })
            }
          />
          <label>Abstract</label>
          <textarea
            value={thesisForm.abstract}
            onChange={(e) =>
              setThesisForm({ ...thesisForm, abstract: e.target.value })
            }
          />
          <button type="submit">Create Thesis</button>
        </form>
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
