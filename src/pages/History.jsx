import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getUserFromToken } from "../utils/auth";
import Navbar from "../components/Navbar";
import { FaArrowLeft, FaHistory, FaCloudSun, FaSeedling, FaCalendarAlt, FaMapMarkerAlt, FaThermometerHalf, FaTint, FaChevronRight, FaTrash } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import API_URL from "../utils/api.js";
import { authenticatedFetch } from "../utils/apiService";

const History = () => {
  const navigate = useNavigate();
  const user = getUserFromToken();

  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all"); // all, weather, crop

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Fetch search history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await authenticatedFetch(`${API_URL}/history`);

        if (!res.ok) {
          throw new Error("Failed to fetch history");
        }

        const data = await res.json();
        setHistory(data);
        setFilteredHistory(data);
      } catch (err) {
        console.error(err);
        setHistory([]);
        setFilteredHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const deleteLog = async (id) => {
    if (!window.confirm("Are you sure you want to delete this search log?")) return;
    try {
      const res = await authenticatedFetch(`${API_URL}/history/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setHistory(prev => prev.filter(item => item._id !== id));
      } else {
        alert("Failed to delete the log entry");
      }
    } catch (err) {
      console.error("Delete log error:", err);
    }
  };

  // Filter history
  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredHistory(history);
    } else {
      setFilteredHistory(history.filter(item => item.type === activeFilter));
    }
  }, [activeFilter, history]);

  if (!user) return null;

  return (
    <div className="history-page-root">
      <Navbar />

      <div className="history-content-wrapper">
        {/* Title and Back button */}
        <div className="history-header-row">
          <Link to="/" className="btn-premium-outline">
            <FaArrowLeft />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-gradient">⏱️ Your Search Logs</h1>
        </div>

        {/* Filters and Search logs */}
        <div className="history-logs-container glass-card">
          <div className="history-filters-row">
            <button 
              onClick={() => setActiveFilter("all")} 
              className={`filter-btn ${activeFilter === "all" ? "active" : ""}`}
            >
              All Logs
            </button>
            <button 
              onClick={() => setActiveFilter("weather")} 
              className={`filter-btn ${activeFilter === "weather" ? "active" : ""}`}
            >
              <FaCloudSun /> Weather
            </button>
            <button 
              onClick={() => setActiveFilter("crop")} 
              className={`filter-btn ${activeFilter === "crop" ? "active" : ""}`}
            >
              <FaSeedling /> Crop Advice
            </button>
          </div>

          {loading ? (
            <div className="history-loading">
              <FaSpinner className="spinner" />
              <p>Gathering logs from secure database...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="history-empty-state">
              <FaHistory className="animate-float" />
              <h3>No searches found</h3>
              <p>Your previous weather analytics and crop recommendations will appear here.</p>
            </div>
          ) : (
            <div className="history-list-flow">
              <AnimatePresence mode="popLayout">
                {filteredHistory.map((item, idx) => (
                  <motion.div
                    key={item._id || idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="history-log-item-card"
                  >
                    <div className="item-icon-col" style={{ 
                      backgroundColor: item.type === "weather" ? "rgba(59, 130, 246, 0.08)" : "rgba(16, 185, 129, 0.08)",
                      color: item.type === "weather" ? "#3b82f6" : "#10b981"
                    }}>
                      {item.type === "weather" ? <FaCloudSun /> : <FaSeedling />}
                    </div>

                    <div className="item-details-col">
                      <div className="item-header-meta">
                        <span className="item-type-label">
                          {item.type === "weather" ? "Weather Query" : "AI Crop Recommendation"}
                        </span>
                        <span className="item-date-label">
                          <FaCalendarAlt /> {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <h3 className="item-query-title">
                        <FaMapMarkerAlt /> {item.query}
                      </h3>

                      {item.result && (
                        <div className="item-result-preview">
                          {item.type === "weather" ? (
                            <div className="weather-preview-row">
                              <span><FaThermometerHalf /> {Math.round(item.result.temperature)}°C</span>
                              <span><FaTint /> {item.result.humidity}%</span>
                              <span className="preview-desc">{item.result.description}</span>
                            </div>
                          ) : (
                            <div className="crop-preview-col">
                              <span><strong>Crops Recommended:</strong> {item.result.recommendedCrops?.join(", ") || "None"}</span>
                              <div className="crop-params-row">
                                <span>Temp: {Math.round(item.result.temperature)}°C</span>
                                <span>Humidity: {item.result.humidity}%</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="history-actions">
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteLog(item._id); }} 
                        className="btn-delete-log"
                        title="Delete log entry"
                      >
                        <FaTrash />
                      </button>
                      <FaChevronRight className="chevron-icon" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .history-page-root {
          min-height: 100vh;
          background-color: var(--bg-primary);
        }

        .history-content-wrapper {
          max-width: 1300px;
          margin: 0 auto;
          padding: 2.5rem 2rem;
        }

        .history-header-row {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 3rem;
        }

        @media (max-width: 768px) {
          .history-header-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }

        .history-logs-container {
          background: var(--glass-bg);
          border-color: var(--glass-border);
          padding: 2.5rem;
        }

        .history-filters-row {
          display: flex;
          gap: 0.5rem;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 1.25rem;
          margin-bottom: 2rem;
          overflow-x: auto;
        }

        .filter-btn {
          background: none;
          border: 1px solid transparent;
          color: var(--text-secondary);
          padding: 0.6rem 1.2rem;
          border-radius: 12px;
          cursor: pointer;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 0.9rem;
          transition: var(--transition-fast);
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .filter-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.03);
        }

        .filter-btn.active {
          background: var(--accent-light);
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }

        .history-loading {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--text-secondary);
        }

        .history-loading svg {
          font-size: 2rem;
          color: var(--accent-primary);
          margin-bottom: 1rem;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .history-empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.8rem;
        }

        .history-empty-state svg {
          font-size: 2.5rem;
          color: var(--text-muted);
        }

        /* Logs flow */
        .history-list-flow {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .history-log-item-card {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid var(--glass-border);
          border-radius: 18px;
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          transition: var(--transition-smooth);
        }

        .history-log-item-card:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: var(--glass-border-hover);
        }

        .item-icon-col {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          flex-shrink: 0;
        }

        .item-details-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .item-header-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .item-type-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .item-date-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .item-query-title {
          font-size: 1.2rem;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .item-result-preview {
          background: rgba(0, 0, 0, 0.12);
          border-radius: 10px;
          padding: 0.6rem 1rem;
          margin-top: 0.25rem;
        }

        .weather-preview-row {
          display: flex;
          gap: 1rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
          flex-wrap: wrap;
        }

        .weather-preview-row svg {
          color: var(--accent-primary);
        }

        .preview-desc {
          color: var(--accent-primary);
          font-weight: 700;
          text-transform: capitalize;
        }

        .crop-preview-col {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .crop-params-row {
          display: flex;
          gap: 1rem;
          color: var(--text-muted);
          font-size: 0.75rem;
        }

        .chevron-icon {
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        .history-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .btn-delete-log {
          background: none;
          border: none;
          color: rgba(239, 68, 68, 0.4);
          cursor: pointer;
          font-size: 1rem;
          padding: 0.5rem;
          border-radius: 8px;
          transition: var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-delete-log:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }
      `}</style>
    </div>
  );
};

// Simple spinner
const FaSpinner = ({ className }) => (
  <svg className={`spinner ${className}`} viewBox="0 0 24 24" fill="none" style={{ width: '24px', height: '24px' }}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

export default History;
