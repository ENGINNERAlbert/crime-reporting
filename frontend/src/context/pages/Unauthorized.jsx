import React from "react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  const redirectToHome = () => {
    navigate("/"); // Redirect user to homepage
  };

  return (
    <div className="unauthorized-page" style={styles.container}>
      <h1 style={styles.heading}>Access Denied</h1>
      <p style={styles.message}>
        You are logged in, but your account does not have the required permissions to access this page.
      </p>
      <p style={styles.note}>
        Access is restricted based on your assigned role during registration. Please contact the administrator if you believe this is an error.
      </p>
      <button onClick={redirectToHome} style={styles.button}>
        Go to Home
      </button>
    </div>
  );
};

const styles = {
  container: {
    padding: "3rem",
    textAlign: "center",
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#f9f9f9",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
  heading: {
    color: "#d32f2f",
    marginBottom: "1rem",
  },
  message: {
    fontSize: "1.1rem",
    marginBottom: "0.5rem",
  },
  note: {
    fontSize: "0.95rem",
    color: "#555",
    marginBottom: "2rem",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default Unauthorized;
