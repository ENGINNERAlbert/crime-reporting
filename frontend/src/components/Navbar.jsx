import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css"; // You’ll need to create this file for styling

const Navbar = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen(prev => !prev);
  };

  return (
    <nav className="navbar">
      <div className="navbar-header">
        <h2 className="navbar-title">THE REAL CRIME REPORTING WEBSITE</h2>
        <button className="menu-toggle" onClick={toggleMenu}>
          ☰
        </button>
      </div>

      <ul className={`menu ${menuOpen ? "open" : ""}`}>
        <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>

        {!user ? (
          <>
            <li><Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link></li>
            <li><Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link></li>
          </>
        ) : (
          <>
            <li><Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link></li>
            <li><Link to="/submit-report" onClick={() => setMenuOpen(false)}>Report Crime</Link></li>
            <li><Link to="/notifications" onClick={() => setMenuOpen(false)}>Notifications</Link></li>

            {user.role === "citizen" && (
              <>
                <li><Link to="/analytics" onClick={() => setMenuOpen(false)}>Analytics</Link></li>
                <li><Link to="/reports" onClick={() => setMenuOpen(false)}>View Reports</Link></li>
              </>
            )}

            {user.role === "law_enforcement" && (
              <>
                <li><Link to="/manage-reports" onClick={() => setMenuOpen(false)}>Manage Reports</Link></li>
                <li><Link to="/analytics" onClick={() => setMenuOpen(false)}>Analytics</Link></li>
                <li><Link to="/reports" onClick={() => setMenuOpen(false)}>View Reports</Link></li>
              </>
            )}

            {user.role === "admin" && (
              <>
                <li><Link to="/admin-dashboard" onClick={() => setMenuOpen(false)}>Admin Dashboard</Link></li>
                <li><Link to="/analytics" onClick={() => setMenuOpen(false)}>Analytics</Link></li>
                <li><Link to="/reports" onClick={() => setMenuOpen(false)}>View Reports</Link></li>
               
              </>
            )}

            <li><button onClick={handleLogout}>Logout</button></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
