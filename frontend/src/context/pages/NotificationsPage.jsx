import React, { useEffect, useState } from 'react';
import axios from "../../axios";
import { useNavigate } from 'react-router-dom';
import { CheckCheck, BellDot } from 'lucide-react';
import bgImage from '../../assets/notification.jpg';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const NOTIFICATIONS_PER_PAGE = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get('/notifications/');
        setNotifications(res.data);
      } catch (error) {
        console.error('Error fetching notifications', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [navigate]);

  const handleMarkAsRead = async (id) => {
    try {
      await axios.patch(`/notifications/${id}/`, { is_read: true });
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const renderNotificationLink = (notification) => {
    if (notification.notification_type === 'crime_trend') {
      return (
        <button
          onClick={() => navigate('/analytics')}
          className="text-blue-500 hover:underline text-sm"
        >
          View Analytics
        </button>
      );
    }

    if (notification.related_report) {
      return (
        <button
          onClick={() => navigate(`/reports/${notification.related_report.id}`)}
          className="text-blue-500 hover:underline text-sm"
        >
          View Related Report
        </button>
      );
    }

    return null;
  };

  const startIndex = (currentPage - 1) * NOTIFICATIONS_PER_PAGE;
  const currentNotifications = notifications.slice(startIndex, startIndex + NOTIFICATIONS_PER_PAGE);
  const totalPages = Math.ceil(notifications.length / NOTIFICATIONS_PER_PAGE);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  if (loading) return <div className="p-4">Loading notifications...</div>;

  return (
    <div
      className="h-screen w-screen flex items-center justify-center"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div
        className="w-[50%] max-w-2xl bg-white bg-opacity-90 rounded-xl p-6 max-h-[80vh] overflow-y-auto shadow-xl"
        style={{
          width: '50%', 
          padding: '2rem', 
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          borderRadius: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          maxHeight: '80vh',
        }}
      >
        <h1
          className="text-2xl font-bold mb-6 text-center"
          style={{
            fontSize: '2rem', 
            fontWeight: 'bold', 
            marginBottom: '1.5rem', 
            textAlign: 'center'
          }}
        >
          Notifications
        </h1>

        {notifications.length === 0 ? (
          <p className="text-center">No notifications to show.</p>
        ) : (
          <div className="space-y-4">
            {currentNotifications.map((note) => (
              <div
                key={note.id}
                className={`border rounded-xl p-4 shadow-sm transition ${
                  !note.is_read ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'
                }`}
                style={{
                  padding: '1.5rem',
                  backgroundColor: !note.is_read ? 'rgba(219, 234, 254, 0.7)' : 'rgb(248, 250, 252)',
                  borderRadius: '10px',
                  border: '1px solid #ccc',
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <h2
                    className="text-md font-semibold text-gray-800"
                    style={{
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      color: '#333',
                    }}
                  >
                    {note.notification_type.replace(/_/g, ' ')}
                  </h2>
                  {!note.is_read ? (
                    <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium">
                      <BellDot className="w-4 h-4" /> New
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                      <CheckCheck className="w-4 h-4" /> Read
                    </span>
                  )}
                </div>
                <p className="text-gray-700" style={{ color: '#4A4A4A' }}>{note.message}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(note.timestamp).toLocaleString()}
                </p>

                <div className="flex items-center justify-between mt-3">
                  {renderNotificationLink(note)}

                  {!note.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(note.id)}
                      className="text-sm text-green-600 hover:underline"
                      style={{
                        fontSize: '0.9rem', 
                        color: '#388E3C', 
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {notifications.length > NOTIFICATIONS_PER_PAGE && (
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded font-medium ${
                currentPage === 1
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
              style={{
                padding: '0.6rem 1.2rem',
                backgroundColor: '#8E24AA',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              ← Previous
            </button>

            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded font-medium ${
                currentPage === totalPages
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
              style={{
                padding: '0.6rem 1.2rem',
                backgroundColor: '#388E3C',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
