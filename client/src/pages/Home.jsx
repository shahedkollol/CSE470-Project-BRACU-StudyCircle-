import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  return (
    <div>
      <h1>BRACU Study Circle (MVP)</h1>
      <p>
        {user
          ? `Welcome, ${user.name}`
          : "Please login or register to continue."}
      </p>
      <ul className="link-list">
        <li>
          <Link to="/study-groups">Study Groups</Link>
        </li>
        <li>
          <Link to="/events">Events</Link>
        </li>
        <li>
          <Link to="/tutoring/posts">Tutoring Posts</Link>
        </li>
        <li>
          <Link to="/tutoring/sessions">Tutoring Sessions</Link>
        </li>
        <li>
          <Link to="/resources">Resources</Link>
        </li>
        <li>
          <Link to="/thesis">Thesis Collaboration</Link>
        </li>
        <li>
          <Link to="/community">Community</Link>
        </li>
        <li>
          <Link to="/admin">Admin</Link>
        </li>
      </ul>
    </div>
  );
}
