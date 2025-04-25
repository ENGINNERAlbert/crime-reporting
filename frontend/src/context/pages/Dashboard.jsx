import React from "react";
import { useAuth } from "../AuthContext";
import { Link } from "react-router-dom";
import backgroundImage from "../../assets/shield-icon.png";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();

  const roleDescriptions = {
    admin: "You manage users and have full access to all reports.",
    law_enforcement: "You track and update reports to maintain law and order.",
    citizen: "You can report crime in your area. Stay alert, stay safe.",
  };

  return (
    <div
      className="dashboard-container"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
        backgroundColor: "#1a1a1a",
        minHeight: "100vh",
        color: "#fff",
        position: "relative",
        fontFamily: "'Poppins', sans-serif", // 👈 Font applied here
      }}
    >
      <div
        className="dashboard-overlay"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          width: "100%",
          height: "100%",
          padding: "2rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          className="dashboard-hero-text"
          style={{ maxWidth: "800px", textAlign: "center" }}
        >
          <h1>Karibu, {user?.email || "Guest"} 🇰🇪</h1>
          <ul className="welcome-points" style={{ listStyle: "none", padding: 0 }}>
            <li>🇰🇪 Let's unite to build a peaceful Kenya.</li>
            <li>🛡️ Tujenge Kenya salama kwa pamoja — ripoti uhalifu sasa.</li>
            <li>📝 Use your role to protect and empower your community.</li>
          </ul>

          <div
            className="user-role-box"
            style={{
              marginTop: "2rem",
              backgroundColor: "rgba(255,255,255,0.1)",
              padding: "1.5rem",
              borderRadius: "10px",
            }}
          >
            <h3>Your Role: {user?.role?.toUpperCase()}</h3>
            <p>{roleDescriptions[user?.role]}</p>

            <div
              className="dashboard-actions"
              style={{
                marginTop: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <Link to="/submit-report" className="action-button">
                📝 Submit a Crime Report
              </Link>

              {user?.role === "law_enforcement" && (
                <Link to="/reports" className="action-button">
                  📑 View Reports
                </Link>
              )}

              {user?.role === "admin" && (
                <Link to="/manage-reports" className="action-button">
                  🛠️ Manage Reports
                </Link>
              )}

              <Link to="/update-profile" className="action-button">
                👤 Update Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
