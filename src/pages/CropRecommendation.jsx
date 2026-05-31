import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CropAnimation from '../components/CropAnimation';
import API_URL from '../utils/api.js';
import { getUserFromToken } from '../utils/auth';
import { authenticatedFetch } from '../utils/apiService';

import { 
  FaLeaf, 
  FaThermometerHalf, 
  FaTint, 
  FaCloudRain, 
  FaSeedling,
  FaExclamationTriangle,
  FaSpinner,
  FaCheckCircle,
  FaArrowLeft,
  FaInfoCircle,
  FaTimes
} from 'react-icons/fa';

const CropRecommendation = () => {
  const navigate = useNavigate();
  const user = getUserFromToken();

  const [weather, setWeather] = useState(null);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [soilType, setSoilType] = useState('Loamy');
  const [recommendationStatus, setRecommendationStatus] = useState('idle'); // idle, loading, success, error
  const [activeFlippedCard, setActiveFlippedCard] = useState(null); // track flipped card indices for detailed info
  const [sowingDates, setSowingDates] = useState({});

  const soilTypes = ['Loamy', 'Clay', 'Sandy', 'Clay Loam', 'Sandy Loam', 'Black Soil'];

  const handleSowingDateChange = (cropName, date) => {
    setSowingDates(prev => ({
      ...prev,
      [cropName]: date
    }));
  };

  const calculateTimeline = (crop, sowingDateStr) => {
    const sowingDate = sowingDateStr ? new Date(sowingDateStr) : new Date();
    if (isNaN(sowingDate.getTime())) return null;

    const duration = crop.growthDuration || 100;
    const harvestDate = new Date(sowingDate.getTime() + duration * 24 * 60 * 60 * 1000);
    const today = new Date();
    
    // Calculate progress percentage
    const totalMs = harvestDate.getTime() - sowingDate.getTime();
    const elapsedMs = today.getTime() - sowingDate.getTime();
    let percent = Math.max(0, Math.min(100, Math.round((elapsedMs / totalMs) * 100)));
    
    // Determine current growth stage & actions
    let stage = "Not Sown Yet";
    let instructions = "";
    if (percent === 0) {
      stage = "Preparing Field";
      instructions = "Prepare the soil beds, apply organic compost, and gather seeds for sowing.";
    } else if (percent > 0 && percent <= 20) {
      stage = "Germination / Seedling";
      instructions = "Keep soil consistently moist. Monitor for seedling diseases and keep pests at bay.";
    } else if (percent > 20 && percent <= 50) {
      stage = "Vegetative Stage";
      instructions = "High water demand. Feed crops with high-nitrogen fertilizers to encourage strong stems and leaves.";
    } else if (percent > 50 && percent <= 80) {
      stage = "Flowering / Yield Formation";
      instructions = "Peak water usage. Keep soil moist but not waterlogged. Add potassium-rich fertilizers.";
    } else if (percent > 80 && percent < 100) {
      stage = "Maturity / Ripening";
      instructions = "Slow down irrigation to encourage ripening and dry-off. Grains/pods should begin hardening.";
    } else {
      stage = "Harvest Ready!";
      instructions = crop.harvestingTips?.[0] || "Crop has matured. Harvest immediately under dry weather.";
    }

    return (
      <div className="planner-results">
        <div className="planner-dates">
          <div>
            <span>Est. Harvest</span>
            <strong>{harvestDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
          </div>
          <div>
            <span>Current Stage</span>
            <strong className="text-accent">{stage}</strong>
          </div>
        </div>
        
        <div className="planner-progress-bar-container">
          <div className="planner-progress-bar" style={{ width: `${percent}%` }} />
          <span className="planner-progress-percent">{percent}% Completed</span>
        </div>
        
        <p className="planner-tip">
          <strong>Tip:</strong> {instructions}
        </p>
      </div>
    );
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Load weather data from localStorage (saved when weather search is run)
  useEffect(() => {
    const savedWeather = localStorage.getItem('lastWeatherData');
    const savedFullWeather = localStorage.getItem('recentWeatherSearches');
    
    if (savedWeather) {
      setWeather(JSON.parse(savedWeather));
    } else if (savedFullWeather) {
      try {
        const fullSearches = JSON.parse(savedFullWeather);
        if (fullSearches.length > 0) {
          // Parse the most recent query parameters as proxy
          const mockCropWeather = {
            temperature: fullSearches[0].temp,
            humidity: 60, // Default proxy
            rainfall: 40,
            location: fullSearches[0].location || fullSearches[0].city,
            description: 'Clear sky'
          };
          setWeather(mockCropWeather);
        }
      } catch (err) {
        console.error("Error parsing recent searches:", err);
      }
    } else {
      setError('No recent weather telemetry found. Please check today\'s weather forecast first.');
      setRecommendationStatus('error');
    }
  }, []);

  // Fetch recommendations from API
  const getRecommendations = async () => {
    if (!weather) {
      setError('Please search a city weather first from the weather page');
      setRecommendationStatus('error');
      return;
    }

    setLoading(true);
    setError('');
    setRecommendationStatus('loading');
    setCrops([]);

    try {
      const response = await authenticatedFetch(`${API_URL}/crops/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          temperature: weather.temperature || weather.temp || 25,
          humidity: weather.humidity || 60,
          rainfall: weather.rainfall || 40,
          soilType: soilType,
          location: weather.location || 'Unknown Location'
        })
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Failed to generate recommendations');
      }

      if (resData.length > 0) {
        setCrops(resData);
        setRecommendationStatus('success');
      } else {
        setError('No matching crops found for this climate and soil combination.');
        setRecommendationStatus('error');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Server error occurred during recommendations calculation.');
      setRecommendationStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToWeather = () => {
    navigate('/weather');
  };

  if (!user) return null;

  return (
    <div className="recommendation-page-root">
      <Navbar />

      <div className="recommendation-content-wrapper">
        {/* Page Title & Back Row */}
        <div className="page-header-row">
          <button onClick={handleBackToWeather} className="btn-premium-outline">
            <FaArrowLeft />
            <span>Back to Weather</span>
          </button>
          <h1 className="text-gradient">AI Crop Recommendation System</h1>
        </div>

        {/* Inputs and Weather metrics */}
        <div className="advisor-setup-grid">
          {/* Weather telemetry card */}
          <div className="advisor-weather-card glass-card">
            <h3>☀️ Weather Telemetry</h3>
            {weather ? (
              <div className="telemetry-items">
                <div className="telemetry-item">
                  <FaThermometerHalf />
                  <div>
                    <span>Temperature</span>
                    <strong>{Math.round(weather.temperature || weather.temp)}°C</strong>
                  </div>
                </div>
                <div className="telemetry-item">
                  <FaTint />
                  <div>
                    <span>Humidity</span>
                    <strong>{weather.humidity || 60}%</strong>
                  </div>
                </div>
                <div className="telemetry-item">
                  <FaCloudRain />
                  <div>
                    <span>Rainfall</span>
                    <strong>{weather.rainfall || 0} mm</strong>
                  </div>
                </div>
                <div className="telemetry-item">
                  <FaLeaf />
                  <div>
                    <span>Field Location</span>
                    <strong>{weather.location}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="telemetry-empty">
                <FaExclamationTriangle className="text-yellow-500" />
                <p>No climate data recorded. Please search a city on the weather tab first.</p>
              </div>
            )}
          </div>

          {/* Soil configuration card */}
          <div className="advisor-soil-card glass-card">
            <h3>🌾 Soil Configuration</h3>
            <p className="soil-helper-text">Select the primary soil composition of your farming field:</p>
            <div className="soil-buttons-grid">
              {soilTypes.map(type => (
                <button
                  key={type}
                  type="button"
                  className={`soil-select-btn ${soilType === type ? 'active' : ''}`}
                  onClick={() => setSoilType(type)}
                >
                  {type}
                </button>
              ))}
            </div>

            <button
              onClick={getRecommendations}
              disabled={!weather || loading}
              className="btn-premium btn-advisor-submit"
            >
              {loading ? (
                <>
                  <FaSpinner className="spinner" />
                  <span>Analyzing Telemetry...</span>
                </>
              ) : (
                <>
                  <FaSeedling />
                  <span>Get Recommendations</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="recommendation-error-alert glass-card">
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
        )}

        {/* Results Flow */}
        <AnimatePresence>
          {recommendationStatus === 'success' && crops.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="recommendation-results-flow"
            >
              <div className="results-header">
                <h2>
                  <FaCheckCircle className="text-green-500 animate-float" />
                  <span>Recommended Crops ({crops.length})</span>
                </h2>
                <p>Ranked by suitability to your local climate conditions & soil type.</p>
              </div>

              <div className="responsive-grid crop-cards-grid">
                {crops.map((crop, index) => {
                  const isFlipped = activeFlippedCard === index;
                  return (
                    <motion.div
                      key={crop._id || index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.08 }}
                      className="crop-flip-card-container"
                    >
                      <div className={`crop-flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
                        {/* Front Side */}
                        <div className="crop-card-front glass-card">
                          <div className="crop-front-header">
                            <div>
                              <h3>{crop.name}</h3>
                              <span className="scientific-name">{crop.scientificName}</span>
                            </div>
                            <span className="match-pill">{crop.confidence}% Match</span>
                          </div>

                          <CropAnimation type={crop.animation || 'wheat'} />

                          <p className="crop-reason-text">
                            <strong>Note:</strong> {crop.reason}
                          </p>

                          <div className="crop-metric-mini-grid">
                            <div className="metric-mini-box">
                              <span>Season</span>
                              <strong>{crop.season?.join(', ') || 'Rabi'}</strong>
                            </div>
                            <div className="metric-mini-box">
                              <span>Water</span>
                              <strong>{crop.waterRequirements || 'Moderate'}</strong>
                            </div>
                            <div className="metric-mini-box">
                              <span>Growth Duration</span>
                              <strong>{crop.growthDuration} Days</strong>
                            </div>
                          </div>

                          <button 
                            onClick={() => setActiveFlippedCard(index)}
                            className="btn-flip-info"
                          >
                            <FaInfoCircle /> Learn Cultivation Tips
                          </button>
                        </div>

                        {/* Back Side (Cultivation info) */}
                        <div className="crop-card-back glass-card">
                          <div className="back-header">
                            <h3>🌿 {crop.name} Cultivation</h3>
                            <button className="btn-close-back" onClick={() => setActiveFlippedCard(null)}>
                              <FaTimes />
                            </button>
                          </div>

                          <div className="back-scroll-content">
                            <div className="cultivation-block">
                              <h4>Recommended Fertilizers</h4>
                              <div className="fertilizer-tags-row">
                                {crop.fertilizers?.map((f, i) => (
                                  <span key={i} className="fert-tag">{f}</span>
                                ))}
                              </div>
                            </div>

                            <div className="cultivation-block">
                              <h4>Pest & Disease Management</h4>
                              <p><strong>Pests:</strong> {crop.pests?.join(', ') || 'N/A'}</p>
                              <p><strong>Diseases:</strong> {crop.diseases?.join(', ') || 'N/A'}</p>
                            </div>

                            <div className="cultivation-block">
                              <h4>Harvesting Guidelines</h4>
                              <ul>
                                {crop.harvestingTips?.map((tip, i) => (
                                  <li key={i}>{tip}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="cultivation-block planner-block">
                              <h4>📅 Sowing & Harvest Planner</h4>
                              <div className="planner-input-group">
                                <label>Sowing Date:</label>
                                <input 
                                  type="date" 
                                  className="input-premium planner-date-input" 
                                  value={sowingDates[crop.name] || new Date().toISOString().split('T')[0]}
                                  onChange={(e) => handleSowingDateChange(crop.name, e.target.value)}
                                />
                              </div>
                              {calculateTimeline(crop, sowingDates[crop.name])}
                            </div>
                          </div>

                          <button 
                            onClick={() => setActiveFlippedCard(null)}
                            className="btn-premium-outline btn-back-flip"
                          >
                            Back to suitability
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .recommendation-page-root {
          min-height: 100vh;
          background-color: var(--bg-primary);
        }

        .recommendation-content-wrapper {
          max-width: 1300px;
          margin: 0 auto;
          padding: 2.5rem 2rem;
        }

        .page-header-row {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 3rem;
        }

        @media (max-width: 768px) {
          .page-header-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }

        .advisor-setup-grid {
          display: grid;
          grid-template-columns: 0.8fr 1.2fr;
          gap: 2.5rem;
          margin-bottom: 3rem;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .advisor-setup-grid {
            grid-template-columns: 1fr;
          }
        }

        .advisor-weather-card h3, .advisor-soil-card h3 {
          font-size: 1.4rem;
          color: var(--text-primary);
          margin-bottom: 1.2rem;
        }

        .telemetry-items {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .telemetry-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 0.8rem 1rem;
        }

        .telemetry-item svg {
          font-size: 1.4rem;
          color: var(--accent-primary);
        }

        .telemetry-item div {
          display: flex;
          flex-direction: column;
        }

        .telemetry-item span {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .telemetry-item strong {
          font-size: 1.05rem;
          color: var(--text-primary);
        }

        .telemetry-empty {
          text-align: center;
          padding: 2rem;
          color: var(--text-secondary);
        }

        .telemetry-empty svg {
          font-size: 2.2rem;
          margin-bottom: 0.75rem;
        }

        .soil-helper-text {
          font-size: 0.95rem;
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        .soil-buttons-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .soil-select-btn {
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 0.8rem;
          color: var(--text-secondary);
          cursor: pointer;
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 0.85rem;
          transition: var(--transition-fast);
        }

        .soil-select-btn:hover {
          border-color: var(--accent-primary);
          color: var(--text-primary);
        }

        .soil-select-btn.active {
          background: var(--accent-primary);
          border-color: var(--accent-primary);
          color: white;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.25);
        }

        .btn-advisor-submit {
          width: 100%;
          padding: 1rem;
        }

        .recommendation-error-alert {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 1.25rem;
          border-radius: 18px;
        }

        /* Crop flip card animation */
        .crop-cards-grid {
          margin-top: 2rem;
        }

        .crop-flip-card-container {
          perspective: 1200px;
          height: 520px;
        }

        /* Use parent hover to translate the inner card, keeping container stationary to prevent jitter/blinking loops */
        .crop-flip-card-container:hover .crop-flip-card-inner {
          transform: translateY(-5px) rotateY(0deg);
        }

        .crop-flip-card-container:hover .crop-flip-card-inner.flipped {
          transform: translateY(-5px) rotateY(180deg);
        }

        .crop-flip-card-container .crop-card-front:hover {
          transform: none;
        }

        .crop-flip-card-container .crop-card-back:hover {
          transform: rotateY(180deg); /* Preserve 180deg rotation on hover to prevent card from disappearing */
        }

        /* Responsive Mobile Overrides */
        @media (max-width: 768px) {
          .crop-flip-card-container:hover .crop-flip-card-inner {
            transform: none;
          }
          .crop-flip-card-container:hover .crop-flip-card-inner.flipped {
            transform: rotateY(180deg);
          }
        }

        .crop-flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transform-style: preserve-3d;
        }

        .crop-flip-card-inner.flipped {
          transform: rotateY(180deg);
        }

        .crop-card-front, .crop-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden; /* Prevent auto-scroll shifts inside the card when children inputs render */
          opacity: 1;
          visibility: visible;
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }

        .crop-card-back {
          transform: rotateY(180deg);
          background: var(--bg-secondary);
        }

        .crop-flip-card-inner.flipped .crop-card-front {
          pointer-events: none;
          opacity: 0;
          visibility: hidden;
        }

        .crop-flip-card-inner:not(.flipped) .crop-card-back {
          pointer-events: none;
          opacity: 0;
          visibility: hidden;
        }

        .crop-front-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .crop-front-header h3 {
          font-size: 1.4rem;
          color: var(--text-primary);
        }

        .scientific-name {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-style: italic;
        }

        .match-pill {
          background: var(--accent-light);
          color: var(--accent-primary);
          padding: 0.4rem 0.85rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.85rem;
        }

        .crop-reason-text {
          background: rgba(255, 255, 255, 0.02);
          border-left: 3px solid var(--accent-primary);
          padding: 0.8rem 1.1rem;
          border-radius: 12px;
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .crop-metric-mini-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }

        .metric-mini-box {
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          padding: 0.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .metric-mini-box span {
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        .metric-mini-box strong {
          font-size: 0.75rem;
          color: var(--text-primary);
        }

        .btn-flip-info {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          color: var(--text-primary);
          border-radius: 12px;
          padding: 0.75rem;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-flip-info:hover {
          border-color: var(--accent-primary);
          background: var(--accent-light);
          color: var(--accent-primary);
        }

        /* Back side details */
        .back-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 1rem;
        }

        .back-header h3 {
          font-size: 1.3rem;
          color: var(--text-primary);
        }

        .btn-close-back {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 1.1rem;
          cursor: pointer;
        }

        .back-scroll-content {
          flex: 1;
          overflow-y: auto;
          padding: 1.25rem 0;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .cultivation-block h4 {
          font-size: 0.95rem;
          color: var(--text-primary);
          margin-bottom: 0.6rem;
        }

        .cultivation-block p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 0.4rem;
        }

        .cultivation-block ul {
          padding-left: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .cultivation-block li {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .fertilizer-tags-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .fert-tag {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.15);
          color: var(--accent-primary);
          padding: 0.3rem 0.6rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .btn-back-flip {
          width: 100%;
        }

        /* Results Flow */
        .results-header {
          text-align: center;
          margin: 4rem auto 2.5rem;
        }

        .results-header h2 {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.65rem;
          font-size: 2.2rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .results-header p {
          color: var(--text-secondary);
        }

        .planner-block {
          background: rgba(255, 255, 255, 0.01);
          border: 1px dashed var(--glass-border);
          padding: 1rem;
          border-radius: 12px;
          margin-top: 0.5rem;
        }

        .planner-input-group {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .planner-input-group label {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .planner-date-input {
          padding: 0.4rem 0.8rem;
          font-size: 0.85rem;
          border-radius: 8px;
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          color: var(--text-primary);
          outline: none;
        }

        .planner-results {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          background: rgba(0, 0, 0, 0.2);
          padding: 0.85rem;
          border-radius: 10px;
        }

        .planner-dates {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
        }

        .planner-dates div {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .planner-dates span {
          color: var(--text-muted);
        }

        .planner-dates strong {
          color: var(--text-primary);
        }

        .planner-dates .text-accent {
          color: var(--accent-primary);
        }

        .planner-progress-bar-container {
          position: relative;
          height: 16px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--glass-border);
        }

        .planner-progress-bar {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          background: linear-gradient(90deg, var(--accent-primary) 0%, #34d399 100%);
          transition: width 0.5s ease-in-out;
        }

        .planner-progress-percent {
          position: relative;
          z-index: 2;
          font-size: 0.7rem;
          color: var(--text-primary);
          font-weight: 700;
        }

        .planner-tip {
          font-size: 0.75rem;
          color: var(--text-secondary);
          line-height: 1.4;
          margin: 0;
          border-left: 2px solid var(--accent-primary);
          padding-left: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default CropRecommendation;