import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api/";

const getAuthHeaders = () => {
  const token = localStorage.getItem("firebaseToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchReports = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}reports/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }
};

export const createReport = async (reportData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}reports/`, reportData, {
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating report:", error);
    throw error;
  }
};
