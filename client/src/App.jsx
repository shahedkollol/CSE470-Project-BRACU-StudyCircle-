// import React from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

import Admin from "./pages/Admin";
import AlumniCareers from "./pages/AlumniCareers";
import Community from "./pages/Community";
import Events from "./pages/Events";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Resources from "./pages/Resources";
import StudyGroups from "./pages/StudyGroups";
import Thesis from "./pages/Thesis";
import TutoringPosts from "./pages/TutoringPosts";
import TutoringSessions from "./pages/TutoringSessions";

function App() {
  const { user, login, logout } = useAuth();

  // ✅ TEMP DEMO LOGIN (so ProtectedRoute lets you in)
  const demoStudentLogin = () => {
    login({ id: "demo-student", name: "Demo Student", role: "student" });
  };

  const demoAdminLogin = () => {
    login({ id: "demo-admin", name: "Demo Admin", role: "admin" });
  };

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
          <Link to="/alumni">Careers</Link>
          {user && <Link to="/notifications">Notifications</Link>}
          {user && <Link to="/profile">Profile</Link>}
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

              {/* ✅ TEMP: Quick demo buttons */}
              <button onClick={demoStudentLogin} style={{ marginLeft: 8 }}>
                Demo Student
              </button>
              <button onClick={demoAdminLogin} style={{ marginLeft: 8 }}>
                Demo Admin
              </button>
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
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/alumni"
            element={
              <ProtectedRoute>
                <AlumniCareers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Admin />
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
