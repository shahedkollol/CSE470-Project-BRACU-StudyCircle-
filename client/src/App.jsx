import { Link, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import Admin from "./pages/Admin";
import Community from "./pages/Community";
import Events from "./pages/Events";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Resources from "./pages/Resources";
import StudyGroups from "./pages/StudyGroups";
import Thesis from "./pages/Thesis";
import TutoringPosts from "./pages/TutoringPosts";
import TutoringSessions from "./pages/TutoringSessions";

function App() {
  const { user, logout } = useAuth();

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <Link to="/">BRACU Study Circle</Link>
        </div>
        <nav className="nav">
          <Link to="/study-groups">Study Groups</Link>
          <Link to="/events">Events</Link>
          <Link to="/tutoring/posts">Tutoring</Link>
          <Link to="/resources">Resources</Link>
          <Link to="/thesis">Thesis</Link>
          <Link to="/community">Community</Link>
          {user?.role === "admin" && <Link to="/admin">Admin</Link>}
        </nav>
        <div className="auth-box">
          {user ? (
            <>
              <span>{user.name}</span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </header>

      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/study-groups"
            element={
              <ProtectedRoute>
                <StudyGroups />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tutoring/posts"
            element={
              <ProtectedRoute>
                <TutoringPosts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tutoring/sessions"
            element={
              <ProtectedRoute>
                <TutoringSessions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <Resources />
              </ProtectedRoute>
            }
          />
          <Route
            path="/thesis"
            element={
              <ProtectedRoute>
                <Thesis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/community"
            element={
              <ProtectedRoute>
                <Community />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                {user?.role === "admin" ? (
                  <Admin />
                ) : (
                  <Navigate to="/" replace />
                )}
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
