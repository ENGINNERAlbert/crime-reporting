import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axios";
import backgroundImage from "../../assets/utumishi.png";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [userPage, setUserPage] = useState(1);
  const [reportPage, setReportPage] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(false); // 🔁 Refresh trigger
  const usersPerPage = 10;
  const reportsPerPage = 10;

  useEffect(() => {
    if (!user || user.role !== "admin") {
      alert("Access denied. You are not authorized to view this page.");
      navigate("/unauthorized");
      return;
    }

    const fetchData = async () => {
      try {
        const usersRes = await axiosInstance.get(`/users/?page=${userPage}&page_size=${usersPerPage}`);
        const reportsRes = await axiosInstance.get(`/reports/all/?page=${reportPage}&page_size=${reportsPerPage}`);
        setUsers(usersRes.data);
        setReports(reportsRes.data);
      } catch (err) {
        console.error(err);
        alert("Error loading data.");
      }
    };

    fetchData();
  }, [user, userPage, reportPage, refreshTrigger, navigate]); // ⬅️ Added refreshTrigger

  const handleRoleChange = async (userId, action) => {
    const newRole = action === "approve" ? "law_enforcement" : "citizen";
    try {
      await axiosInstance.patch(`/users/${userId}/`, { role: newRole });
      setRefreshTrigger((prev) => !prev); // 🔁 Trigger a refresh
      alert("User role updated.");
    } catch (err) {
      console.error(err);
      alert("Failed to update user role.");
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await axiosInstance.patch(`/reports/${reportId}/`, { status: newStatus });
      setRefreshTrigger((prev) => !prev); // 🔁 Trigger a refresh
      alert("Report status updated.");
    } catch (err) {
      console.error(err);
      alert("Failed to update report status.");
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin": return "red";
      case "law_enforcement": return "green";
      default: return "blue";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "orange";
      case "reviewed": return "blue";
      case "resolved": return "green";
      default: return "black";
    }
  };

  const statusOptions = ["pending", "reviewed", "resolved"];

  const handleNextUsers = () => setUserPage((prev) => prev + 1);
  const handleNextReports = () => setReportPage((prev) => prev + 1);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Admin Dashboard</h2>
      <div style={styles.dashboardGrid}>
        {/* Manage Users */}
        <div style={styles.column}>
          <h3 style={styles.sectionTitle}>Manage Users</h3>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Username</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Current Role</th>
                  <th style={styles.th}>Update To</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={styles.td}>{u.username}</td>
                    <td style={styles.td}>{u.email}</td>
                    <td
                      style={{
                        ...styles.td,
                        color: getRoleColor(u.role),
                        fontWeight: "bold",
                      }}
                    >
                      {u.role}
                    </td>
                    <td style={styles.td}>
                      {u.role === "admin" ? (
                        "-"
                      ) : u.role === "law_enforcement" ? (
                        <select
                          value=""
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          style={styles.select}
                        >
                          <option disabled value="">
                            -- Select Action --
                          </option>
                          <option value="reject">Revoke Law Enforcement</option>
                        </select>
                      ) : (
                        <select
                          value=""
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          style={styles.select}
                        >
                          <option disabled value="">
                            -- Select Action --
                          </option>
                          <option value="approve">Approve Law Enforcement</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={handleNextUsers} style={styles.nextButton}>Next</button>
        </div>

        {/* Manage Reports */}
        <div style={styles.column}>
          <h3 style={styles.sectionTitle}>Manage Reports</h3>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Current Status</th>
                  <th style={styles.th}>Update To</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td style={styles.td}>{r.description}</td>
                    <td style={styles.td}>{r.category}</td>
                    <td
                      style={{
                        ...styles.td,
                        color: getStatusColor(r.status),
                        fontWeight: "bold",
                      }}
                    >
                      {r.status}
                    </td>
                    <td style={styles.td}>
                      <select
                        value=""
                        onChange={(e) => handleStatusChange(r.id, e.target.value)}
                        style={styles.select}
                      >
                        <option disabled value="">
                          -- Select Status --
                        </option>
                        {statusOptions
                          .filter((status) => status !== r.status)
                          .map((status) => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={handleNextReports} style={styles.nextButton}>Next</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "2rem auto",
    padding: "1rem",
    fontFamily: "Segoe UI, sans-serif",
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    minHeight: "100vh",
  },
  heading: {
    textAlign: "center",
    fontSize: "2rem",
    marginBottom: "2rem",
    color: "#fff",
    textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
  },
  dashboardGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "2rem",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: "1rem",
    borderRadius: "10px",
  },
  column: {
    flex: "1 1 48%",
    minWidth: "300px",
  },
  sectionTitle: {
    fontSize: "1.3rem",
    marginBottom: "1rem",
    borderBottom: "2px solid #ccc",
    paddingBottom: "0.3rem",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
  },
  th: {
    border: "1px solid #ccc",
    backgroundColor: "#f8f8f8",
    padding: "12px",
    fontSize: "0.95rem",
    textAlign: "left",
  },
  td: {
    border: "1px solid #ccc",
    padding: "12px",
    fontSize: "0.95rem",
    wordWrap: "break-word",
  },
  select: {
    width: "100%",
    padding: "8px",
    fontSize: "0.95rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  nextButton: {
    marginTop: "1rem",
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default AdminDashboard;
