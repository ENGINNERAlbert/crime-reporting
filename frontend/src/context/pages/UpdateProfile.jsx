import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const UpdateProfile = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [role, setRole] = useState(user?.role || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch user data from Firestore on component mount
  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setName(userData.name);
            setEmail(userData.email);
            setRole(userData.role);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      };

      fetchUserProfile();
    }
  }, [user]);

  // Handle form submission
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!name || !email || !role) {
      setError("Please fill in all the fields.");
      return;
    }

    setLoading(true);
    setError(""); // Clear error

    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        name: name,
        email: email,
        role: role,
      });

      setLoading(false);
      navigate("/dashboard"); // Redirect after successful update
    } catch (error) {
      setLoading(false);
      setError("Error updating profile, please try again.");
      console.error("Error updating user profile:", error);
    }
  };

  const styles = {
    container: {
      padding: "20px",
      backgroundColor: "#f4f4f4",
      borderRadius: "8px",
      width: "80%",
      maxWidth: "600px",
      margin: "auto",
    },
    title: {
      textAlign: "center",
      marginBottom: "20px",
    },
    formGroup: {
      marginBottom: "15px",
    },
    label: {
      display: "block",
      marginBottom: "5px",
    },
    input: {
      width: "100%",
      padding: "8px",
      border: "1px solid #ddd",
      borderRadius: "4px",
    },
    button: {
      width: "100%",
      padding: "10px",
      backgroundColor: "#4caf50",
      color: "white",
      border: "none",
      borderRadius: "4px",
      fontSize: "16px",
      cursor: "pointer",
    },
    buttonDisabled: {
      backgroundColor: "#aaa",
    },
    error: {
      color: "red",
      textAlign: "center",
      marginBottom: "15px",
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Update Profile</h1>
      {error && <p style={styles.error}>{error}</p>}

      <form onSubmit={handleUpdateProfile}>
        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="role">Role</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            style={styles.input}
          >
            <option value="citizen">Citizen</option>
            <option value="law_enforcement">Law Enforcement</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default UpdateProfile;
