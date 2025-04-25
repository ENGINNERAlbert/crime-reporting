import React, { useState, useEffect } from 'react';
import { useAuth } from "../AuthContext";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import axios from "../../axios";

const ReportList = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [loadingReports, setLoadingReports] = useState(true);
  const [activeMarker, setActiveMarker] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 4;

  useEffect(() => {
    const fetchReports = async () => {
      try {
        if (!user) {
          setError("You must be logged in to view reports.");
          setLoadingReports(false);
          return;
        }

        const response = await axios.get("/reports/");
        console.log("Response data:", response.data);
        
        // Ensure only the reports array is set
        if (Array.isArray(response.data.reports)) {
          setReports(response.data.reports);
        } else {
          setReports([]);
          setError("Invalid report data format received.");
        }
      } catch (error) {
        if (error.response?.status === 401) {
          const confirmLogout = window.confirm("Session may have expired. Do you want to log in again?");
          if (confirmLogout) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = "/login";
          }
        } else {
          setError(error.message || "Failed to fetch reports.");
        }
      } finally {
        setLoadingReports(false);
      }
    };

    fetchReports();
  }, [user]);

  const handleStatusUpdate = async (reportId) => {
    try {
      if (!window.confirm("Are you sure you want to update the status of this report?")) return;

      const response = await axios.patch(`/reports/${reportId}/`, {
        status: 'Updated',
      });

      const updatedReport = response.data;
      setReports((prevReports) =>
        prevReports.map((report) =>
          report.id === reportId ? updatedReport : report
        )
      );
    } catch (error) {
      setError(error.message || "Failed to update report status.");
    }
  };

  const isValidLatLng = (lat, lng) =>
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    isFinite(lat) &&
    isFinite(lng);

  // Pagination Logic
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = Array.isArray(reports)
    ? reports.slice(indexOfFirstReport, indexOfLastReport)
    : [];
  const totalPages = Math.ceil(reports.length / reportsPerPage);

  return (
    <div style={{ padding: "1rem" }}>
      <h2 style={{ textAlign: "center" }}>Submitted Reports</h2>
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      {loadingReports ? (
        <p style={{ textAlign: "center" }}>Loading reports...</p>
      ) : currentReports.length > 0 ? (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1rem",
              marginTop: "1rem"
            }}
          >
            {currentReports.map((report) => {
              const lat = parseFloat(report.latitude);
              const lng = parseFloat(report.longitude);

              return (
                <div
                  key={report.id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    padding: "1rem",
                    background: "#f9f9f9",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
                  }}
                >
                  {report.title && <h3>{report.title}</h3>}
                  <p><strong>Description:</strong> {report.description}</p>
                  <p><strong>Category:</strong> {report.category}</p>
                  <p><strong>Status:</strong> {report.status}</p>
                  <p><strong>Submitted On:</strong> {new Date(report.created_at).toLocaleString()}</p>

                  {isValidLatLng(lat, lng) ? (
                    <>
                      <h4>📍 Report Location</h4>
                      <div style={{ marginBottom: "1rem" }}>
                        <GoogleMap
                          center={{ lat, lng }}
                          zoom={14}
                          mapContainerStyle={{
                            height: "250px",
                            width: "100%",
                            borderRadius: "10px"
                          }}
                          onClick={() => setActiveMarker(null)}
                        >
                          <Marker
                            position={{ lat, lng }}
                            onClick={() => setActiveMarker(report.id)}
                            label={{
                              text: report.title || report.category,
                              color: "#fff",
                              fontSize: "12px",
                              fontWeight: "bold"
                            }}
                          />
                          {activeMarker === report.id && (
                            <InfoWindow
                              position={{ lat, lng }}
                              onCloseClick={() => setActiveMarker(null)}
                            >
                              <div>
                                <h4>{report.title || report.category}</h4>
                                <p>{report.description}</p>
                              </div>
                            </InfoWindow>
                          )}
                        </GoogleMap>
                      </div>
                    </>
                  ) : (
                    <p style={{ color: "red" }}>❌ Invalid location data for this report.</p>
                  )}

                  {user && user.role === 'law_enforcement' && (
                    <button
                      onClick={() => handleStatusUpdate(report.id)}
                      style={{
                        backgroundColor: "#007bff",
                        color: "#fff",
                        border: "none",
                        padding: "0.5rem 1rem",
                        borderRadius: "5px",
                        cursor: "pointer"
                      }}
                    >
                      Update Status
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            {currentPage > 1 && (
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                style={{ marginRight: "10px" }}
              >
                Previous
              </button>
            )}
            {currentPage < totalPages && (
              <button onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
            )}
          </div>
        </>
      ) : (
        <p style={{ textAlign: "center" }}>No reports found.</p>
      )}
    </div>
  );
};

export default ReportList;
