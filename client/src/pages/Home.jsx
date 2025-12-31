import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  const features = [
    { to: "/study-groups", icon: "👥", label: "Study Groups" },
    { to: "/events", icon: "📅", label: "Events" },
    { to: "/tutoring/posts", icon: "📝", label: "Tutoring Posts" },
    { to: "/tutoring/sessions", icon: "🎓", label: "Tutoring Sessions" },
    { to: "/resources", icon: "📚", label: "Resources" },
    { to: "/thesis", icon: "📖", label: "Thesis Collaboration" },
    { to: "/community", icon: "💬", label: "Community" },
    { to: "/alumni", icon: "💼", label: "Alumni Careers" },
  ];

  return (
    <div>
      <div className="hero">
        <h1>BRACU Study Circle</h1>
        <p>
          {user
            ? `Welcome back, ${user.name}! Ready to learn and collaborate?`
            : "Connect with fellow students, share resources, and excel together."}
        </p>
      </div>

      {!user && (
        <div
          className="card"
          style={{ textAlign: "center", marginBottom: "var(--space-lg)" }}
        >
          <p style={{ margin: 0 }}>
            Please <Link to="/login">login</Link> or{" "}
            <Link to="/register">register</Link> to access all features.
          </p>
        </div>
      )}

      <ul className="link-list">
        {features.map((f) => (
          <li key={f.to}>
            <Link to={f.to}>
              <span style={{ fontSize: "1.25rem" }}>{f.icon}</span>
              {f.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
