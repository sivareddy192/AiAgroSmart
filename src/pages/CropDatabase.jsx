import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../utils/api.js';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { FaSearch, FaFilter, FaInfoCircle, FaThermometerHalf, FaCloudRain, FaTint, FaSpinner } from 'react-icons/fa';

const CropDatabase = () => {
  const [crops, setCrops] = useState([]);
  const [filteredCrops, setFilteredCrops] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCrops();
  }, []);

  useEffect(() => {
    let results = crops;
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      results = results.filter(crop =>
        crop.name.toLowerCase().includes(searchLower) ||
        (crop.scientificName && crop.scientificName.toLowerCase().includes(searchLower)) ||
        (crop.soilType && crop.soilType.some(soil => soil.toLowerCase().includes(searchLower)))
      );
    }
    
    // Apply season filter
    if (filter !== 'all') {
      results = results.filter(crop =>
        crop.season && crop.season.some(s => s.toLowerCase().includes(filter.toLowerCase()))
      );
    }
    
    setFilteredCrops(results);
  }, [search, filter, crops]);

  const fetchCrops = async () => {
    try {
      const response = await axios.get(`${API_URL}/crops`);
      setCrops(response.data);
      setFilteredCrops(response.data);
    } catch (error) {
      console.error('Error fetching crops:', error);
    } finally {
      setLoading(false);
    }
  };

  const seasons = ['all', 'Winter', 'Summer', 'Kharif', 'Rabi', 'Spring'];

  return (
    <div className="crop-db-page-root">
      <Navbar />

      <div className="db-content-wrapper">
        <div className="page-header-title">
          <h1 className="text-gradient">🌾 Crop Knowledge Database</h1>
          <p>Explore soil requirements, optimal temperatures, seasons, and farming guidelines for various crops.</p>
        </div>

        {/* Filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="db-filter-bar glass-card"
        >
          <div className="search-bar-wrapper">
            <FaSearch />
            <input
              type="text"
              placeholder="Search by crop name, scientific name, or soil suitability..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-premium"
            />
          </div>

          <div className="season-select-wrapper">
            <FaFilter />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="select-premium"
            >
              {seasons.map(s => (
                <option key={s} value={s}>
                  {s === 'all' ? 'All Seasons' : `${s} Season`}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {loading ? (
          <div className="db-loading-state">
            <FaSpinner className="spinner" />
            <p>Gathering agricultural datasets...</p>
          </div>
        ) : (
          <div className="responsive-grid crop-db-grid">
            {filteredCrops.map((crop, index) => (
              <motion.div
                key={crop._id || index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="crop-db-card glass-card"
              >
                <div className="crop-db-card-header">
                  <div className="crop-db-title">
                    <h3>{crop.name}</h3>
                    <span className="scientific-name">{crop.scientificName}</span>
                  </div>
                  <span className="duration-badge">{crop.growthDuration} Days</span>
                </div>

                <div className="crop-db-card-body">
                  {/* Stats requirements */}
                  <div className="crop-reqs-flow">
                    <div className="crop-req-item">
                      <FaThermometerHalf className="text-yellow-500" />
                      <div>
                        <span>Temperature</span>
                        <strong>{crop.suitableTemperature?.min}°C - {crop.suitableTemperature?.max}°C</strong>
                      </div>
                    </div>
                    <div className="crop-req-item">
                      <FaTint className="text-blue-400" />
                      <div>
                        <span>Humidity</span>
                        <strong>{crop.suitableHumidity?.min}% - {crop.suitableHumidity?.max}%</strong>
                      </div>
                    </div>
                    <div className="crop-req-item">
                      <FaCloudRain className="text-teal-400" />
                      <div>
                        <span>Rainfall</span>
                        <strong>{crop.suitableRainfall?.min}mm - {crop.suitableRainfall?.max}mm</strong>
                      </div>
                    </div>
                  </div>

                  <hr className="db-card-divider" />

                  {/* Soil & Season Tags */}
                  <div className="db-tags-section">
                    <span>Suitable Soils:</span>
                    <div className="db-tags-row">
                      {crop.soilType?.map(soil => (
                        <span key={soil} className="tag-db-soil">{soil}</span>
                      ))}
                    </div>
                  </div>

                  <div className="db-tags-section">
                    <span>Cultivation Season:</span>
                    <div className="db-tags-row">
                      {crop.season?.map(se => (
                        <span key={se} className="tag-db-season">{se}</span>
                      ))}
                    </div>
                  </div>

                  <div className="db-fertilizer-section">
                    <span>Recommended Fertilizers:</span>
                    <div className="fertilizer-pill-row">
                      {crop.fertilizers?.map(f => (
                        <span key={f} className="fert-pill">{f}</span>
                      ))}
                    </div>
                  </div>

                  <div className="pests-diseases-box">
                    <p><strong>Common Pests:</strong> {crop.pests?.join(', ') || 'None'}</p>
                    <p><strong>Diseases:</strong> {crop.diseases?.join(', ') || 'None'}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredCrops.length === 0 && (
          <div className="db-empty-state glass-card">
            <FaInfoCircle />
            <h3>No Crops Found</h3>
            <p>We couldn't find any crop matching your search criteria. Try modifying filters.</p>
          </div>
        )}
      </div>

      <style>{`
        .crop-db-page-root {
          min-height: 100vh;
          background-color: var(--bg-primary);
        }

        .db-content-wrapper {
          max-width: 1300px;
          margin: 0 auto;
          padding: 2.5rem 2rem;
        }

        .page-header-title {
          margin-bottom: 2.5rem;
        }

        .page-header-title h1 {
          font-size: 2.4rem;
          margin-bottom: 0.5rem;
        }

        .page-header-title p {
          color: var(--text-secondary);
        }

        .db-filter-bar {
          display: flex;
          gap: 1.5rem;
          padding: 1.5rem;
          margin-bottom: 2.5rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-bar-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          position: relative;
        }

        .search-bar-wrapper svg {
          position: absolute;
          left: 1.2rem;
          color: var(--text-muted);
        }

        .search-bar-wrapper .input-premium {
          padding-left: 3rem;
        }

        .season-select-wrapper {
          display: flex;
          align-items: center;
          position: relative;
        }

        .season-select-wrapper svg {
          position: absolute;
          left: 1.2rem;
          color: var(--text-muted);
          pointer-events: none;
        }

        .select-premium {
          background: rgba(12, 24, 21, 0.8);
          border: 1px solid var(--glass-border);
          border-radius: 14px;
          padding: 0.9rem 1.2rem 0.9rem 3rem;
          color: var(--text-primary);
          font-family: var(--font-body);
          font-size: 0.95rem;
          cursor: pointer;
          min-width: 200px;
          outline: none;
          appearance: none;
        }

        .select-premium:focus {
          border-color: var(--accent-primary);
        }

        .db-loading-state {
          text-align: center;
          padding: 5rem 2rem;
          color: var(--text-secondary);
        }

        .db-loading-state svg {
          font-size: 2.2rem;
          color: var(--accent-primary);
          margin-bottom: 1rem;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .crop-db-card {
          background: var(--glass-bg);
          border-color: var(--glass-border);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: var(--transition-smooth);
        }

        .crop-db-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .crop-db-title h3 {
          font-size: 1.35rem;
          color: var(--text-primary);
        }

        .duration-badge {
          background: var(--accent-light);
          color: var(--accent-primary);
          padding: 0.35rem 0.75rem;
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .crop-reqs-flow {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .crop-req-item {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        .crop-req-item svg {
          font-size: 1.15rem;
        }

        .crop-req-item div {
          display: flex;
          flex-direction: column;
        }

        .crop-req-item span {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .crop-req-item strong {
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .db-card-divider {
          border: 0;
          height: 1px;
          background: var(--glass-border);
          margin: 1.25rem 0;
        }

        .db-tags-section {
          margin-bottom: 0.85rem;
        }

        .db-tags-section span {
          font-size: 0.75rem;
          color: var(--text-muted);
          display: block;
          margin-bottom: 0.4rem;
        }

        .db-tags-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .tag-db-soil {
          background: rgba(59, 130, 246, 0.08);
          border: 1px solid rgba(59, 130, 246, 0.15);
          color: #93c5fd;
          padding: 0.25rem 0.6rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .tag-db-season {
          background: rgba(163, 230, 53, 0.08);
          border: 1px solid rgba(163, 230, 53, 0.15);
          color: #d9f99d;
          padding: 0.25rem 0.6rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .db-fertilizer-section {
          margin-bottom: 1rem;
        }

        .db-fertilizer-section span {
          font-size: 0.75rem;
          color: var(--text-muted);
          display: block;
          margin-bottom: 0.4rem;
        }

        .fertilizer-pill-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .fert-pill {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.15);
          color: var(--accent-primary);
          padding: 0.25rem 0.65rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .pests-diseases-box {
          background: rgba(0, 0, 0, 0.15);
          padding: 0.75rem 1rem;
          border-radius: 12px;
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
          margin-top: 1rem;
        }

        .db-empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.8rem;
        }

        .db-empty-state svg {
          font-size: 2.2rem;
          color: var(--accent-primary);
        }
      `}</style>
    </div>
  );
};

export default CropDatabase;