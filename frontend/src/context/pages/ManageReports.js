import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "../../axios";
import bgImage from "../../assets/badge-icon.png";

const styles = {
  container: {
    maxWidth: "800px",
    margin: "2rem auto",
    padding: "1rem",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  wrapper: {
    minHeight: "100vh",
    backgroundImage: `url(${bgImage})`,
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "top center",
    backgroundColor: "#f0f4f8",
    paddingTop: "4rem",
    paddingBottom: "4rem",
  },
  heading: {
    textAlign: "center",
    marginBottom: "2rem",
    fontSize: "2rem",
    color: "#333",
  },
  error: {
    color: "red",
    backgroundColor: "#ffe5e5",
    border: "1px solid red",
    padding: "0.75rem",
    marginBottom: "1rem",
    textAlign: "center",
    borderRadius: "8px",
  },
  reportCard: {
    backgroundColor: "#f7f9fc",
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "1.2rem",
    marginBottom: "1rem",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    transition: "all 0.3s ease",
  },
  paragraph: {
    margin: "0.5rem 0",
    fontSize: "1rem",
  },
  button: {
    marginRight: "1rem",
    marginTop: "0.5rem",
    padding: "0.5rem 1rem",
    border: "none",
    fontWeight: "bold",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background 0.3s ease",
  },
  resolvedBtn: {
    backgroundColor: "#4caf50",
    color: "white",
  },
  pendingBtn: {
    backgroundColor: "#ff9800",
    color: "white",
  },
  disabledBtn: {
    backgroundColor: "#ccc",
    color: "#666",
    cursor: "not-allowed",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "1rem",
    marginTop: "1rem",
  },
  pageBtnPrev: {
    padding: "0.4rem 0.8rem",
    fontSize: "1rem",
    fontWeight: "bold",
    borderRadius: "6px",
    border: "1px solid #1976d2",
    backgroundColor: "#2196f3",
    color: "#fff",
    cursor: "pointer",
  },
  pageBtnNext: {
    padding: "0.4rem 0.8rem",
    fontSize: "1rem",
    fontWeight: "bold",
    borderRadius: "6px",
    border: "1px solid #d32f2f",
    backgroundColor: "#f44336",
    color: "#fff",
    cursor: "pointer",
  },
  pageBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
};

const statusStyles = {
  resolved: {
    color: "#4caf50",
  },
  pending: {
    color: "#ff9800",
  },
  inProgress: {
    color: "#2196f3",
  },
};

const ManageReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [statusChoices, setStatusChoices] = useState([]);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 5;

  const fetchReports = useCallback(async () => {
    try {
      const response = await axios.get("/reports/all/");
      setReports(response.data);
    } catch (error) {
      setError("Failed to fetch reports. Please try again later.");
    }
  }, []);

  const fetchStatusChoices = useCallback(async () => {
    try {
      const response = await axios.get("/reports/status-choices/");
      setStatusChoices(response.data);
    } catch (error) {
      console.error("Failed to fetch status choices", error);
      setError("Failed to fetch status choices.");
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== "law_enforcement") {
      setError("You do not have permission to access this page.");
      setTimeout(() => navigate("/"), 2000);
    } else {
      fetchReports();
      fetchStatusChoices();
    }
  }, [user, navigate, fetchReports, fetchStatusChoices]);

  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      const response = await axios.patch(`/reports/${reportId}/`, {
        status: newStatus,
      });

      if (response.status === 200) {
        setReports((prevReports) =>
          prevReports.map((report) =>
            report.id === reportId ? { ...report, status: newStatus } : report
          )
        );
      } else {
        setError("Failed to update. Try again.");
      }
    } catch (error) {
      console.error("Update error:", error.response?.data || error.message);
      setError("Failed to update report status.");
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(reports.length / reportsPerPage);
  const indexOfLast = currentPage * reportsPerPage;
  const indexOfFirst = indexOfLast - reportsPerPage;
  const currentReports = reports.slice(indexOfFirst, indexOfLast);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.heading}>Manage Reports</h2>
        {error && <p style={styles.error}>{error}</p>}
        {currentReports.length > 0 ? (
          currentReports.map((report) => (
            <div key={report.id} style={styles.reportCard}>
              <p style={styles.paragraph}>
                <strong>Description:</strong> {report.description}
              </p>
              <p style={styles.paragraph}>
                <strong>Category:</strong> {report.category}
              </p>
              <p style={styles.paragraph}>
                <strong>Status:</strong>{" "}
                <span
                  style={{
                    fontWeight: "bold",
                    ...statusStyles[report.status],
                  }}
                >
                  {report.status}
                </span>
              </p>
              <select
                style={styles.button}
                value={report.status}
                onChange={(e) =>
                  handleStatusUpdate(report.id, e.target.value)
                }
              >
                {statusChoices
                  .filter((status) => status.value !== report.status) // Avoid reselection
                  .map((status) => (
                    <option
                      key={status.value}
                      value={status.value}
                      style={{
                        backgroundColor:
                          status.value === "resolved"
                            ? "#4caf50"
                            : status.value === "pending"
                            ? "#ff9800"
                            : "#2196f3",
                        color: "white",
                      }}
                    >
                      {status.label}
                    </option>
                  ))}
              </select>
            </div>
          ))
        ) : (
          <p>No reports available</p>
        )}

        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              onClick={handlePrev}
              style={{
                ...styles.pageBtnPrev,
                ...(currentPage === 1 && styles.pageBtnDisabled),
              }}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNext}
              style={{
                ...styles.pageBtnNext,
                ...(currentPage === totalPages && styles.pageBtnDisabled),
              }}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageReports;
