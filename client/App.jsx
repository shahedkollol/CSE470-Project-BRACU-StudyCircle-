import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import ThesisGroups from './pages/ThesisGroups';
import Repository from './pages/Repository';

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* Simple Navbar */}
        <nav className="bg-gray-800 p-4 text-white flex gap-4">
          <Link to="/" className="font-bold">Login</Link>
          <Link to="/groups">Groups</Link>
          <Link to="/repository">Repository</Link>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/groups" element={<ThesisGroups />} />
          <Route path="/repository" element={<Repository />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
