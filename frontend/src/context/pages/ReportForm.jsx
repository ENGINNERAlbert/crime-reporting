import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../AuthContext";
import axios from "../../axios";
import './ReportForm.css';

const ReportForm = () => {
  const { user } = useAuth();
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [locationData, setLocationData] = useState({ latitude: null, longitude: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const locationFetchedRef = useRef(false); // ⚡ Prevent re-fetching

  // 🔁 Get location once, quickly and reliably
  useEffect(() => {
    if (!locationFetchedRef.current && "geolocation" in navigator) {
      locationFetchedRef.current = true;

      const geoOptions = {
        enableHighAccuracy: true,
        timeout: 5000, // fail fast
        maximumAge: 10000, // use recent cached location if available
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationData({
            latitude: parseFloat(position.coords.latitude.toFixed(6)),
            longitude: parseFloat(position.coords.longitude.toFixed(6)),
          });
        },
        (err) => {
          console.error("Location error:", err);
          setError("Unable to fetch location. Please allow location access.");
        },
        geoOptions
      );
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in to submit a report.");
      return;
    }

    if (!locationData.latitude || !locationData.longitude) {
      setError("Location is not available. Please enable location access.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const reportData = {
        description,
        category,
        latitude: parseFloat(locationData.latitude.toFixed(6)),
        longitude: parseFloat(locationData.longitude.toFixed(6)),
        user: user.user_id,
      };

      const response = await axios.post("/reports/", reportData);

      console.log("Report submitted successfully:", response.data);
      setSuccess(true);
      setDescription("");
      setCategory("other");

      // ✅ Refresh location again after submit for the next report
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationData({
            latitude: parseFloat(position.coords.latitude.toFixed(6)),
            longitude: parseFloat(position.coords.longitude.toFixed(6)),
          });
        },
        (err) => {
          console.error("Location error after submit:", err);
        }
      );

    } catch (err) {
      console.error("Error submitting report:", err);
      setError(err.response?.data?.message || "Error submitting report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-form">
      <div className="report-form-container">
        <h2 className="form-title">Submit a Crime Report</h2>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">Report submitted successfully!</p>}

        <form onSubmit={handleSubmit} className="form">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the incident"
            required
            className="input-field"
          />

          <label htmlFor="category">Category:</label>
          <select
            id="category"
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field"
          >
            <option value="theft">Theft</option>
            <option value="assault">Assault</option>
            <option value="fraud">Fraud</option>
            <option value="vandalism">Vandalism</option>
            <option value="other">Other</option>
          </select>

          {locationData.latitude && locationData.longitude ? (
            <p className="location-info">
              📍 Location: {locationData.latitude}, {locationData.longitude}
            </p>
          ) : (
            <p className="location-error">Fetching location...</p>
          )}

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportForm;
