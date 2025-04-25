import React, { useEffect, useState } from 'react';
import axios from '../../axios';
import { useAuth } from "../AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Label,
  LabelList
} from 'recharts';
import bgImage from '../../assets/analytics.png';

const AnalyticsDashboard = ({ refreshTrigger }) => {
  const { user } = useAuth();
  const [crimeStats, setCrimeStats] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statRes, summaryRes] = await Promise.all([
        axios.get('/analytics/crimestats/'),
        axios.get('/reports/summary/'),
      ]);
      setCrimeStats(statRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error("❌ Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  if (loading) return <div>Loading Analytics...</div>;

  const CATEGORY_COLORS = {
    'Assault': '#FF6B6B',
    'Robbery': '#FFD93D',
    'Homicide': '#6BCB77',
    'Burglary': '#4D96FF',
    'Kidnapping': '#A66DD4',
    'Fraud': '#FF8C42',
    'Other': '#F25F5C',
  };

  const STATUS_COLORS = ['#4DD599', '#FF6B6B', '#FFD93D', '#6C63FF', '#E67E22'];

  const styles = {
    dashboard: {
      minHeight: '100vh',
      padding: '2rem',
      backgroundImage: `url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: darkMode ? '#ffffff' : '#111111',
      backgroundColor: darkMode ? '#1e1e1e' : '#f5f5f5',
      transition: 'all 0.3s ease',
    },
    header: {
      fontSize: '2rem',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '2rem',
      backgroundColor: darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)',
      color: darkMode ? '#ffffff' : '#111111',
      padding: '1rem',
      borderRadius: '10px',
    },
    card: {
      backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
      padding: '1.5rem',
      borderRadius: '12px',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    },
    toggleBtn: {
      backgroundColor: darkMode ? '#333' : '#ddd',
      color: darkMode ? '#fff' : '#000',
      border: 'none',
      borderRadius: '20px',
      padding: '0.5rem 1.2rem',
      cursor: 'pointer',
      fontWeight: 'bold',
      marginBottom: '1rem',
      float: 'right',
      transition: 'all 0.3s ease',
    }
  };

  return (
    <div style={styles.dashboard}>
      <button style={styles.toggleBtn} onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>

      <h2 style={styles.header}>Analytics Dashboard</h2>

      {/* Status + Total Reports Section */}
      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '2fr 3fr' }}>
        <div style={{ ...styles.card, padding: '1rem' }}>
          <h3 className="text-lg font-semibold">Total Reports</h3>
          <p className="text-4xl font-bold">{summary.total_reports || 0}</p>
        </div>

        {user.role !== 'citizen' && (
          <div style={{ ...styles.card, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 className="text-lg font-semibold mb-2">Report Status Distribution</h3>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 2 }}>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={summary.reports_by_status}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ status }) => status}
                      labelLine={false}
                    >
                      {summary.reports_by_status.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} reports`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={{ flex: 1, marginLeft: '1rem' }}>
                <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Status Breakdown</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {summary.reports_by_status.map((entry, index) => {
                    const total = summary.reports_by_status.reduce((sum, item) => sum + item.count, 0);
                    const percent = ((entry.count / total) * 100).toFixed(1);
                    return (
                      <li key={entry.status} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            backgroundColor: STATUS_COLORS[index % STATUS_COLORS.length],
                            borderRadius: '50%',
                            marginRight: 8,
                          }}
                        />
                        <span style={{ fontWeight: 500 }}>{entry.status}:</span>
                        <span style={{ marginLeft: 4 }}>{entry.count} reports ({percent}%)</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Distribution */}
      <div style={{ ...styles.card, marginTop: '2rem' }}>
        <h3 className="text-lg font-semibold">Reports by Category</h3>
        {summary.reports_by_category?.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={summary.reports_by_category}>
              <XAxis
                dataKey="category"
                tick={{ fill: darkMode ? '#ffffff' : '#111111', fontWeight: 'bold' }}
              />
              <YAxis tick={{ fill: darkMode ? '#ffffff' : '#111111' }} />
              <Tooltip />
              <Bar dataKey="count">
                {summary.reports_by_category.map((entry, index) => (
                  <Cell
                    key={`bar-${index}`}
                    fill={CATEGORY_COLORS[entry.category] || '#82ca9d'}
                  />
                ))}
                <LabelList
                  dataKey="count"
                  position="top"
                  style={{ fill: darkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p>No category data available.</p>
        )}
      </div>

      {/* Crime Trends */}
      {user.role !== 'citizen' && (
        <div style={{ ...styles.card, marginTop: '2rem' }}>
          <h3 className="text-lg font-semibold mb-2">Crime Trends</h3>
          {crimeStats?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={crimeStats}>
                <XAxis
                  dataKey="incident_type"
                  tick={{ fill: darkMode ? '#ffffff' : '#111111', fontWeight: 'bold' }}
                />
                <YAxis tick={{ fill: darkMode ? '#ffffff' : '#111111' }} />
                <Tooltip />
                <Bar dataKey="total_reports">
                  {crimeStats.map((entry, index) => (
                    <Cell
                      key={`crime-${index}`}
                      fill={CATEGORY_COLORS[entry.incident_type] || '#ff8042'}
                    />
                  ))}
                  <LabelList
                    dataKey="total_reports"
                    position="top"
                    style={{ fill: darkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No crime trend data available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
