import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axios';

const AllReportsPage = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    try {
      const response = await axiosInstance.get('reports/all/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token || !['admin', 'law_enforcement'].includes(user?.role)) {
      navigate('/unauthorized');
    } else {
      fetchReports();
    }
  }, [token, user, navigate, fetchReports]);

  if (loading) return <p className="text-center">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-4">All Incident Reports</h1>
      {reports.length === 0 ? (
        <p>No reports found.</p>
      ) : (
        <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Title</th>
              <th className="p-3">Description</th>
              <th className="p-3">Location</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{report.id}</td>
                <td className="p-3">{report.title}</td>
                <td className="p-3">{report.description}</td>
                <td className="p-3">{report.location}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusClass(report.status)}`}>
                    {report.status}
                  </span>
                </td>
                <td className="p-3">{new Date(report.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const getStatusClass = (status) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'reviewed': return 'bg-blue-100 text-blue-800';
    case 'resolved': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default AllReportsPage;
