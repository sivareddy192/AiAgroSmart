import React, { useEffect, useState } from "react";
import { getUserFromToken } from "../utils/auth";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { FaUser, FaEnvelope, FaHistory, FaArrowLeft, FaDatabase, FaShieldAlt } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import API_URL from "../utils/api.js";
import { authenticatedFetch } from "../utils/apiService";

const Database = () => {
  const user = getUserFromToken();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Fetch search history for stats
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await authenticatedFetch(`${API_URL}/history`);

        if (!res.ok) {
          throw new Error("Failed to fetch history");
        }

        const data = await res.json();
        setHistory(data);
      } catch (err) {
        console.error(err);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (!user) return null;

  // Process data for Recharts
  const weatherCount = history.filter(item => item.type === "weather").length;
  const cropCount = history.filter(item => item.type === "crop").length;

  const chartData = [
    { name: "Weather Queries", count: weatherCount, color: "#3b82f6" },
    { name: "Crop Advice", count: cropCount, color: "#10b981" }
  ];



  return (
    <div className="database-page-root">
      <Navbar />

      <div className="db-page-wrapper">
        {/* Back and Title Row */}
        <div className="db-header-row">
          <Link to="/" className="btn-premium-outline">
            <FaArrowLeft />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-gradient">📂 User Profile & Insights</h1>
        </div>

        {/* Dashboard Grid */}
        <div className="db-dashboard-grid">
          {/* User profile details */}
          <div className="profile-details-card glass-card">
            <div className="profile-avatar-large">
              <FaUser />
            </div>
            
            <h3 className="profile-name">Farming Account</h3>
            
            <div className="profile-info-rows">
              <div className="info-row">
                <FaEnvelope className="info-icon" />
                <div>
                  <span>Email Address</span>
                  <strong>{user.email}</strong>
                </div>
              </div>

              <div className="info-row">
                <FaShieldAlt className="info-icon" />
                <div>
                  <span>Security Status</span>
                  <strong className="status-secure">Secure (Passwords Hashed)</strong>
                </div>
              </div>

              <div className="info-row">
                <FaHistory className="info-icon" />
                <div>
                  <span>Total Queries Logged</span>
                  <strong>{loading ? "Calculating..." : history.length}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics telemetry */}
          <div className="analytics-card glass-card">
            <h3>📊 Search Telemetry Analysis</h3>
            
            {loading ? (
              <div className="chart-loading">
                <FaSpinner className="spinner" />
                <p>Generating telemetry graphs...</p>
              </div>
            ) : history.length > 0 ? (
              <div className="chart-container-row">
                {/* Bar chart */}
                <div className="chart-box">
                  <h4>Query Frequency Comparison</h4>
                  <div style={{ width: "100%", height: 200 }}>
                    <ResponsiveContainer>
                      <BarChart data={chartData}>
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <Tooltip contentStyle={{ background: "#0c1815", border: "1px solid var(--glass-border)", color: "#fff" }} />
                        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Summary boxes */}
                <div className="stats-metric-pane">
                  <div className="metric-stat-box border-blue">
                    <span className="text-blue-400">Weather Queries</span>
                    <strong>{weatherCount}</strong>
                  </div>
                  <div className="metric-stat-box border-green">
                    <span className="text-green-400">Advisor Runs</span>
                    <strong>{cropCount}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="chart-empty-state">
                <FaHistory />
                <h4>No Telemetry Recorded</h4>
                <p>Telemetry graphs will appear here once you run searches on the Weather or Crop pages.</p>
              </div>
            )}
          </div>
        </div>

        {/* Database Quick links */}
        <div className="db-knowledge-card glass-card">
          <h3><FaDatabase className="text-green-500 animate-float" /> Crop Knowledge Libraries</h3>
          <p>Read detailed descriptions, optimal temperature/humidity scopes, and disease guides for various crops.</p>
          <Link to="/crop-database" className="btn-premium btn-db-nav">
            <span>Open Crop Database</span>
            <FaArrowRight />
          </Link>
        </div>
      </div>

      <style>{`
        .database-page-root {
          min-height: 100vh;
          background-color: var(--bg-primary);
        }

        .db-page-wrapper {
          max-width: 1300px;
          margin: 0 auto;
          padding: 2.5rem 2rem;
        }

        .db-header-row {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 3rem;
        }

        @media (max-width: 768px) {
          .db-header-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }

        .db-dashboard-grid {
          display: grid;
          grid-template-columns: 0.8fr 1.2fr;
          gap: 2.5rem;
          margin-bottom: 2.5rem;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .db-dashboard-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Profile card */
        .profile-details-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 3rem 2rem;
        }

        .profile-avatar-large {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--accent-light);
          border: 1px solid var(--accent-primary);
          color: var(--accent-primary);
          font-size: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          animation: float 5s ease-in-out infinite;
        }

        .profile-name {
          font-size: 1.5rem;
          color: var(--text-primary);
          margin-bottom: 2rem;
        }

        .profile-info-rows {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          width: 100%;
        }

        .info-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--glass-border);
          border-radius: 14px;
          padding: 1rem;
          text-align: left;
        }

        .info-icon {
          font-size: 1.3rem;
          color: var(--accent-primary);
        }

        .info-row div {
          display: flex;
          flex-direction: column;
        }

        .info-row span {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .info-row strong {
          font-size: 0.95rem;
          color: var(--text-primary);
          word-break: break-all;
        }

        .status-secure {
          color: var(--success) !important;
        }

        /* Analytics Card */
        .analytics-card h3 {
          font-size: 1.4rem;
          color: var(--text-primary);
          margin-bottom: 2rem;
        }

        .chart-loading {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--text-secondary);
        }

        .chart-loading svg {
          font-size: 2rem;
          color: var(--accent-primary);
          margin-bottom: 1rem;
        }

        .chart-container-row {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 2rem;
          align-items: center;
        }

        @media (max-width: 640px) {
          .chart-container-row {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        .chart-box h4 {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 1.25rem;
          text-align: center;
        }

        .stats-metric-pane {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .metric-stat-box {
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 1.25rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .metric-stat-box.border-blue {
          border-left: 4px solid #3b82f6;
        }

        .metric-stat-box.border-green {
          border-left: 4px solid #10b981;
        }

        .metric-stat-box span {
          font-size: 0.8rem;
          font-weight: 700;
        }

        .text-blue-400 {
          color: #60a5fa;
        }

        .text-green-400 {
          color: #34d399;
        }

        .metric-stat-box strong {
          font-size: 1.8rem;
          color: var(--text-primary);
        }

        .chart-empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .chart-empty-state svg {
          font-size: 2.5rem;
          color: var(--text-muted);
        }

        /* Knowledge Library Card */
        .db-knowledge-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          padding: 2.5rem;
        }

        @media (max-width: 768px) {
          .db-knowledge-card {
            flex-direction: column;
            text-align: center;
            padding: 2rem 1.5rem;
          }
        }

        .db-knowledge-card h3 {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 1.4rem;
          color: var(--text-primary);
        }

        .db-knowledge-card p {
          color: var(--text-secondary);
          font-size: 0.95rem;
          flex: 1;
        }

        .btn-db-nav {
          white-space: nowrap;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
};

// Simple spinner definition
const FaSpinner = ({ className }) => (
  <svg className={`spinner ${className}`} viewBox="0 0 24 24" fill="none" style={{ width: '24px', height: '24px' }}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const FaArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: '16px', height: '16px' }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

export default Database;
