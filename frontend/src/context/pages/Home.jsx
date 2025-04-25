import React from "react";
import { Link } from "react-router-dom";
import peaceBanner from "../../assets/peace-banner.png";
// ✅ Import the background image

const Home = () => {
  const containerStyle = {
    backgroundImage: `url(${peaceBanner})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
  };

  const overlayStyle = {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: "2rem",
    borderRadius: "8px",
    maxWidth: "900px",
    width: "100%",
    color: "#fff",
    textAlign: "center",
  };

  const buttonStyle = {
    backgroundColor: "#ffd700",
    color: "#000",
    border: "none",
    padding: "0.7rem 1.2rem",
    fontSize: "1rem",
    borderRadius: "4px",
    cursor: "pointer",
    margin: "0.5rem",
    textDecoration: "none",
  };

  return (
    <div style={containerStyle}>
      <div style={overlayStyle}>
        <h1>Welcome to the Crime Reporting platform</h1>
        <p>
          Empowering <span style={{ color: "#00c853", fontWeight: "bold" }}>Kenyans</span> to report and visualize crime in real time. 
          This platform enhances <strong>transparency</strong>, <strong>security</strong>, and promotes 
          <strong> patriotism</strong> by ensuring your voice counts in building a safer nation.
        </p>

        <h2>Key Features</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li><strong>📌 Location Mapping:</strong> Pinpoint and track incidents on an interactive map.</li>
          <li><strong>🔐 Secure Reporting:</strong> Your identity and reports are protected and verified.</li>
          <li><strong>📊 Visual Analytics:</strong> View charts and trends to stay informed.</li>
          <li><strong>⚖️ Role-Based Access:</strong> Citizens, law enforcement, and admins with custom access.</li>
        </ul>

        <div>
          <Link to="/register">
            <button style={buttonStyle}>Get Started</button>
          </Link>
          <Link to="/login">
            <button style={buttonStyle}>Login</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
