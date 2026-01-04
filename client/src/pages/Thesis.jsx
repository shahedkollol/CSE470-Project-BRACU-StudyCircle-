import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Thesis() {
  const { user, token } = useAuth();

  // Repository state
  const [theses, setTheses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Upload form state
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    brief: "",
    abstract: "",
    department: "",
    keywords: "",
    year: new Date().getFullYear(),
    gitRepoUrl: "",
    designation: "",
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [codeFile, setCodeFile] = useState(null);

  // View modal state
  const [selectedThesis, setSelectedThesis] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Citation modal state
  const [citation, setCitation] = useState("");
  const [showCitationModal, setShowCitationModal] = useState(false);

  // Review form state
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(0);

  // Groups state (keep existing functionality)
  const [groups, setGroups] = useState([]);
  const [groupForm, setGroupForm] = useState({
    groupName: "",
    researchInterests: "",
  });
  const [joinId, setJoinId] = useState("");
  const [showGroups, setShowGroups] = useState(false);

  // Load theses on mount
  const loadTheses = async () => {
    setLoading(true);
    try {
      const data = await api.thesis.listRepository({ keyword: searchTerm });
      setTheses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTheses();
  }, []);

  const loadGroups = async () => {
    try {
      const data = await api.thesis.listGroups();
      setGroups(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    loadTheses();
  };

  // Upload form handlers
  const handleUploadChange = (e) => {
    setUploadForm({ ...uploadForm, [e.target.name]: e.target.value });
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const body = {
        title: uploadForm.title,
        brief: uploadForm.brief,
        abstract: uploadForm.abstract,
        department: uploadForm.department,
        keywords: uploadForm.keywords,
        year: uploadForm.year,
        gitRepoUrl: uploadForm.gitRepoUrl,
        designation: uploadForm.designation,
      };

      if (pdfFile) body.pdf = pdfFile;
      if (codeFile) body.code = codeFile;

      await api.thesis.createThesis(body, token);
      setUploadForm({
        title: "",
        brief: "",
        abstract: "",
        department: "",
        keywords: "",
        year: new Date().getFullYear(),
        gitRepoUrl: "",
        designation: "",
      });
      setPdfFile(null);
      setCodeFile(null);
      setShowUploadForm(false);
      loadTheses();
    } catch (err) {
      setError(err.message);
    }
  };

  // Voting handlers
  const handleUpvote = async (id) => {
    try {
      await api.thesis.upvote(id, token);
      loadTheses();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDownvote = async (id) => {
    try {
      await api.thesis.downvote(id, token);
      loadTheses();
    } catch (err) {
      setError(err.message);
    }
  };

  // View thesis
  const handleView = async (id) => {
    try {
      const thesis = await api.thesis.getThesis(id);
      setSelectedThesis(thesis);
      setShowViewModal(true);
    } catch (err) {
      setError(err.message);
    }
  };

  // Citation
  const handleCite = async (id) => {
    try {
      const data = await api.thesis.getCitation(id);
      setCitation(data.citation);
      setShowCitationModal(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const copyCitation = () => {
    navigator.clipboard.writeText(citation);
    alert("Citation copied to clipboard!");
  };

  // Download handler
  const handleDownload = async (thesis, type) => {
    const url = type === "pdf" ? thesis.pdfUrl : thesis.codeUrl;
    if (!url) return;

    try {
      await api.thesis.trackDownload(thesis._id);
      window.open(url, "_blank");
    } catch (err) {
      // Still allow download even if tracking fails
      window.open(url, "_blank");
    }
  };

  // Add review with rating
  const handleAddReview = async () => {
    if (!reviewComment.trim() || !selectedThesis) return;
    try {
      const reviews = await api.thesis.addReview(
        selectedThesis._id,
        { comment: reviewComment, rating: reviewRating || undefined },
        token
      );
      // Reload thesis to get updated average rating
      const updated = await api.thesis.getThesis(selectedThesis._id);
      setSelectedThesis(updated);
      setReviewComment("");
      setReviewRating(0);
    } catch (err) {
      setError(err.message);
    }
  };

  // Star rating component
  const StarRating = ({ rating, onRate, readonly = false }) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? "filled" : ""} ${readonly ? "readonly" : ""}`}
            onClick={() => !readonly && onRate && onRate(star)}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  // Groups handlers
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

  const isUserVoted = (thesis, type) => {
    const userId = user?.id || user?._id;
    if (!userId) return false;
    const arr = type === "up" ? thesis.upvotes : thesis.downvotes;
    return arr?.some((id) => id === userId || id?.toString() === userId);
  };

  return (
    <div className="thesis-page">
      {/* Header Section */}
      <div className="thesis-header">
        <h1>📚 Thesis Repository</h1>
        <p>Browse, upload, and cite research papers from BRAC University</p>
      </div>

      {/* Action Bar */}
      <div className="thesis-actions">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search theses by keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        <div className="action-buttons">
          <button onClick={() => setShowUploadForm(!showUploadForm)} className="btn-primary">
            {showUploadForm ? "Cancel" : "📤 Upload Thesis"}
          </button>
          <button onClick={() => { setShowGroups(!showGroups); if (!showGroups) loadGroups(); }} className="btn-secondary">
            {showGroups ? "Hide Groups" : "👥 Thesis Groups"}
          </button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {/* Upload Form */}
      {showUploadForm && (
        <div className="card upload-card">
          <h2>Upload New Thesis</h2>
          <form onSubmit={handleUploadSubmit}>
            <label>Title *</label>
            <input
              name="title"
              value={uploadForm.title}
              onChange={handleUploadChange}
              required
              placeholder="Enter thesis title"
            />

            <label>Brief Description</label>
            <input
              name="brief"
              value={uploadForm.brief}
              onChange={handleUploadChange}
              placeholder="Short summary (1-2 sentences)"
            />

            <label>Abstract</label>
            <textarea
              name="abstract"
              value={uploadForm.abstract}
              onChange={handleUploadChange}
              placeholder="Full abstract of the thesis"
              rows={4}
            />

            <div className="form-row">
              <div className="form-group">
                <label>Department</label>
                <input
                  name="department"
                  value={uploadForm.department}
                  onChange={handleUploadChange}
                  placeholder="e.g., CSE"
                />
              </div>
              <div className="form-group">
                <label>Year</label>
                <input
                  name="year"
                  type="number"
                  value={uploadForm.year}
                  onChange={handleUploadChange}
                />
              </div>
              <div className="form-group">
                <label>Designation</label>
                <select name="designation" value={uploadForm.designation} onChange={handleUploadChange}>
                  <option value="">Select...</option>
                  <option value="Student">Student</option>
                  <option value="Faculty">Faculty</option>
                  <option value="Researcher">Researcher</option>
                  <option value="PhD Candidate">PhD Candidate</option>
                </select>
              </div>
            </div>

            <label>Keywords (comma-separated)</label>
            <input
              name="keywords"
              value={uploadForm.keywords}
              onChange={handleUploadChange}
              placeholder="AI, Machine Learning, NLP"
            />

            <label>🔗 GitHub/GitLab Repository URL (optional)</label>
            <input
              name="gitRepoUrl"
              value={uploadForm.gitRepoUrl}
              onChange={handleUploadChange}
              placeholder="https://github.com/username/repo"
              type="url"
            />

            <div className="form-row files">
              <div className="form-group">
                <label>📄 PDF Paper *</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPdfFile(e.target.files[0])}
                />
              </div>
              <div className="form-group">
                <label>💻 Code Files (optional)</label>
                <input
                  type="file"
                  accept=".zip,.tar.gz,.gz"
                  onChange={(e) => setCodeFile(e.target.files[0])}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary">Submit Thesis</button>
          </form>
        </div>
      )}

      {/* Groups Section */}
      {showGroups && (
        <div className="groups-section">
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
            <h2>Active Groups</h2>
            <ul className="list">
              {groups.map((g) => (
                <li key={g._id}>
                  <div><strong>{g.groupName}</strong></div>
                  <div>Interests: {(g.researchInterests || []).join(", ")}</div>
                  <div>Members: {g.members?.length || 0}</div>
                  <div>Leader: {g.leader?.name || g.leader}</div>
                </li>
              ))}
              {groups.length === 0 && <li>No groups yet.</li>}
            </ul>
          </div>
        </div>
      )}

      {/* Thesis List */}
      <div className="thesis-list">
        {loading && <p>Loading...</p>}
        {!loading && theses.length === 0 && <p>No theses found. Be the first to upload!</p>}
        {theses.map((thesis) => (
          <div key={thesis._id} className="thesis-card">
            <div className="thesis-votes">
              <button
                className={`vote-btn up ${isUserVoted(thesis, "up") ? "active" : ""}`}
                onClick={() => handleUpvote(thesis._id)}
                title="Upvote"
              >
                ▲
              </button>
              <span className="vote-count">{(thesis.upvotes?.length || 0) - (thesis.downvotes?.length || 0)}</span>
              <button
                className={`vote-btn down ${isUserVoted(thesis, "down") ? "active" : ""}`}
                onClick={() => handleDownvote(thesis._id)}
                title="Downvote"
              >
                ▼
              </button>
            </div>
            <div className="thesis-content">
              <div className="thesis-title-row">
                <h3>{thesis.title}</h3>
                {thesis.averageRating > 0 && (
                  <span className="avg-rating" title="Average Rating">
                    ⭐ {thesis.averageRating.toFixed(1)}
                  </span>
                )}
              </div>
              {thesis.brief && <p className="thesis-brief">{thesis.brief}</p>}
              <div className="thesis-meta">
                <span>👤 {thesis.authors?.map((a) => a.name || a).join(", ") || "Unknown"}</span>
                {thesis.designation && <span className="designation-badge">{thesis.designation}</span>}
                <span>📅 {thesis.year || new Date(thesis.createdAt).getFullYear()}</span>
                <span>🏛️ {thesis.department || "N/A"}</span>
                <span>👁️ {thesis.viewCount || 0} views</span>
                <span>⬇️ {thesis.downloadCount || 0} downloads</span>
              </div>
              {thesis.keywords?.length > 0 && (
                <div className="thesis-keywords">
                  {thesis.keywords.map((kw, i) => (
                    <span key={i} className="keyword-tag">{kw}</span>
                  ))}
                </div>
              )}
              <div className="thesis-actions-row">
                <button onClick={() => handleView(thesis._id)} className="btn-view">📖 View</button>
                <button onClick={() => handleCite(thesis._id)} className="btn-cite">📋 Cite</button>
                {thesis.pdfUrl && (
                  <button onClick={() => handleDownload(thesis, "pdf")} className="btn-download">⬇️ PDF</button>
                )}
                {thesis.codeUrl && (
                  <button onClick={() => handleDownload(thesis, "code")} className="btn-download">💻 Code</button>
                )}
                {thesis.gitRepoUrl && (
                  <a href={thesis.gitRepoUrl} target="_blank" rel="noopener noreferrer" className="btn-github">
                    🔗 GitHub
                  </a>
                )}
                <span className="review-count">💬 {thesis.reviews?.length || 0} reviews</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Modal */}
      {showViewModal && selectedThesis && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowViewModal(false)}>×</button>
            <h2>{selectedThesis.title}</h2>

            {selectedThesis.averageRating > 0 && (
              <div className="avg-rating-display">
                <StarRating rating={Math.round(selectedThesis.averageRating)} readonly />
                <span>{selectedThesis.averageRating.toFixed(1)} / 5</span>
              </div>
            )}

            <div className="thesis-meta-detail">
              <p><strong>Authors:</strong> {selectedThesis.authors?.map((a) => a.name || a).join(", ")}</p>
              <p><strong>Department:</strong> {selectedThesis.department}</p>
              <p><strong>Year:</strong> {selectedThesis.year}</p>
              {selectedThesis.designation && (
                <p><strong>Designation:</strong> {selectedThesis.designation}</p>
              )}
              {selectedThesis.supervisor?.name && (
                <p><strong>Supervisor:</strong> {selectedThesis.supervisor.name}</p>
              )}
            </div>

            {selectedThesis.abstract && (
              <div className="abstract-section">
                <h4>Abstract</h4>
                <p>{selectedThesis.abstract}</p>
              </div>
            )}

            {selectedThesis.pdfUrl && (
              <div className="pdf-viewer">
                <h4>📄 Paper</h4>
                <iframe
                  src={`${selectedThesis.pdfUrl}#toolbar=0&navpanes=0`}
                  title="Thesis PDF"
                  width="100%"
                  height="500px"
                />
                <button onClick={() => handleDownload(selectedThesis, "pdf")} className="btn-primary">
                  ⬇️ Download PDF
                </button>
              </div>
            )}

            {selectedThesis.codeUrl && (
              <div className="code-section">
                <h4>💻 Code Files</h4>
                <p>Code files are attached to this thesis.</p>
                <button onClick={() => handleDownload(selectedThesis, "code")} className="btn-primary">
                  ⬇️ Download Code
                </button>
              </div>
            )}

            {selectedThesis.gitRepoUrl && (
              <div className="git-section">
                <h4>🔗 GitHub Repository</h4>
                <a href={selectedThesis.gitRepoUrl} target="_blank" rel="noopener noreferrer">
                  {selectedThesis.gitRepoUrl}
                </a>
              </div>
            )}

            {/* Reviews Section */}
            <div className="reviews-section">
              <h4>💬 Reviews ({selectedThesis.reviews?.length || 0})</h4>
              <div className="reviews-list">
                {selectedThesis.reviews?.map((review, i) => (
                  <div key={i} className="review-item">
                    <div className="review-header">
                      <strong>{review.user?.name || "Anonymous"}</strong>
                      {review.rating && (
                        <StarRating rating={review.rating} readonly />
                      )}
                      <span className="review-date">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p>{review.comment}</p>
                  </div>
                ))}
                {(!selectedThesis.reviews || selectedThesis.reviews.length === 0) && (
                  <p>No reviews yet. Be the first to review!</p>
                )}
              </div>

              {user && (
                <div className="add-review">
                  <h5>Add Your Review</h5>
                  <div className="rating-input">
                    <label>Your Rating:</label>
                    <StarRating rating={reviewRating} onRate={setReviewRating} />
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Write your review..."
                    rows={3}
                  />
                  <button onClick={handleAddReview} className="btn-primary">
                    Submit Review
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Citation Modal */}
      {showCitationModal && (
        <div className="modal-overlay" onClick={() => setShowCitationModal(false)}>
          <div className="modal-content citation-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCitationModal(false)}>×</button>
            <h2>📋 Citation</h2>
            <div className="citation-box">
              <p>{citation}</p>
            </div>
            <button onClick={copyCitation} className="btn-primary">
              Copy to Clipboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
