import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import Navbar from '../components/Navbar';
import CropAnimation from '../components/CropAnimation';
import { getUserFromToken } from "../utils/auth";
import API_URL from "../utils/api.js";
import { authenticatedFetch } from "../utils/apiService";

import { 
  FaThermometerHalf, 
  FaTint, 
  FaWind, 
  FaCloudRain, 
  FaMapMarkerAlt,
  FaSun,
  FaMoon,
  FaCloud,
  FaCloudSun,
  FaCloudShowersHeavy,
  FaSnowflake,
  FaBolt,
  FaSmog,
  FaSearch,
  FaLocationArrow,
  FaSpinner,
  FaInfoCircle
} from 'react-icons/fa';

const getCurrentSeasonDetails = () => {
  const month = new Date().getMonth(); // 0 = Jan, 11 = Dec
  
  // Rabi (Winter): Nov, Dec, Jan, Feb
  if (month === 10 || month === 11 || month === 0 || month === 1) {
    return {
      name: "Rabi (Winter)",
      description: "Rabi crops require a cool climate for sowing and warm climate during seed germination. They need moderate watering.",
      bestCrops: ["Wheat", "Barley", "Potato", "Onion", "Cabbage", "Carrot", "Lettuce"],
      seasonMatchKeys: ["rabi", "winter", "autumn", "spring"],
      color: "#3b82f6"
    };
  }
  // Kharif (Monsoon/Summer): Jun, Jul, Aug, Sep
  else if (month >= 5 && month <= 8) {
    return {
      name: "Kharif (Monsoon/Summer)",
      description: "Kharif crops require high temperatures, wet weather, and heavy rainfall. They are sown at the beginning of the monsoon.",
      bestCrops: ["Rice", "Maize", "Tomato"],
      seasonMatchKeys: ["kharif", "summer", "monsoon", "rainy"],
      color: "#10b981"
    };
  }
  // Zaid / Transition (Spring/Summer): Mar, Apr, May, Oct
  else {
    return {
      name: "Zaid (Spring / Transition)",
      description: "Zaid crops require warm dry weather for major vegetative growth and longer day-lengths. Sown in transition months.",
      bestCrops: ["Tomato", "Potato", "Lettuce", "Carrot", "Cabbage", "Onion"],
      seasonMatchKeys: ["spring", "autumn", "summer"],
      color: "#eab308"
    };
  }
};

const Weather = () => {
  const navigate = useNavigate();
  const user = getUserFromToken();

  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('current');
  const [recentSearches, setRecentSearches] = useState([]);
  
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const currentSeason = getCurrentSeasonDetails();

  // Crop Recommendation States
  const [crops, setCrops] = useState([]);

  // Auto-refresh telemetry every 3 minutes
  useEffect(() => {
    if (!weather || !weather.location) return;

    const autoRefreshInterval = setInterval(() => {
      console.log("Auto-refreshing real-time weather for", weather.location);
      getWeather(weather.location);
      setLastUpdated(new Date());
    }, 3 * 60 * 1000); // 3 minutes

    return () => clearInterval(autoRefreshInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weather?.location]);
  const [cropLoading, setCropLoading] = useState(false);
  const [cropError, setCropError] = useState('');
  const [soilType, setSoilType] = useState('Loamy');

  const soilTypes = ['Loamy', 'Clay', 'Sandy', 'Clay Loam', 'Sandy Loam', 'Black Soil'];

  const weatherIcons = {
    '01d': <FaSun className="weather-icon-svg sun text-yellow-500 animate-spin-slow" />,
    '01n': <FaMoon className="weather-icon-svg moon text-blue-300" />,
    '02d': <FaCloudSun className="weather-icon-svg cloud-sun text-yellow-400" />,
    '02n': <FaCloudSun className="weather-icon-svg cloud-moon text-blue-200" />,
    '03d': <FaCloud className="weather-icon-svg cloud text-gray-300" />,
    '03n': <FaCloud className="weather-icon-svg cloud text-gray-400" />,
    '04d': <FaCloud className="weather-icon-svg cloud text-gray-400" />,
    '04n': <FaCloud className="weather-icon-svg cloud text-gray-500" />,
    '09d': <FaCloudShowersHeavy className="weather-icon-svg rain text-blue-400" />,
    '09n': <FaCloudShowersHeavy className="weather-icon-svg rain text-blue-500" />,
    '10d': <FaCloudRain className="weather-icon-svg rain-sun text-teal-400" />,
    '10n': <FaCloudRain className="weather-icon-svg rain-moon text-teal-600" />,
    '11d': <FaBolt className="weather-icon-svg thunder text-yellow-300" />,
    '11n': <FaBolt className="weather-icon-svg thunder text-yellow-500" />,
    '13d': <FaSnowflake className="weather-icon-svg snow text-blue-100" />,
    '13n': <FaSnowflake className="weather-icon-svg snow text-blue-200" />,
    '50d': <FaSmog className="weather-icon-svg mist text-gray-400" />,
    '50n': <FaSmog className="weather-icon-svg mist text-gray-500" />
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Fetch weather data from backend API
  const getWeather = async (cityName = city) => {
    const searchCity = cityName || city;
    if (!searchCity.trim()) {
      setError('Please enter a city name');
      return;
    }

    setLoading(true);
    setError('');
    setCrops([]);

    try {
      const response = await authenticatedFetch(`${API_URL}/weather/current`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ city: searchCity })
      });
      
      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "City not found");
      }

      const weatherData = {
        temperature: resData.temperature,
        humidity: resData.humidity,
        rainfall: resData.data.rain ? resData.data.rain['1h'] || resData.data.rain['3h'] || 0 : 0,
        location: resData.location,
        description: resData.description,
        icon: resData.icon,
        feels_like: resData.data.main.feels_like,
        temp_min: resData.data.main.temp_min,
        temp_max: resData.data.main.temp_max,
        windSpeed: resData.windSpeed,
        pressure: resData.pressure,
        visibility: resData.visibility || 10000,
        sunrise: resData.sunrise,
        sunset: resData.sunset
      };

      setWeather(weatherData);

      // Save as recent search in localstorage
      setRecentSearches(prev => {
        const filtered = prev.filter(s => s.city.toLowerCase() !== searchCity.toLowerCase());
        const updated = [{ city: searchCity, temp: Math.round(weatherData.temperature), icon: weatherData.icon }, ...filtered.slice(0, 4)];
        localStorage.setItem('recentWeatherSearches', JSON.stringify(updated));
        return updated;
      });

      // Get 5-day forecast
      await getForecast(searchCity);

    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch weather data');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  // Get forecast
  const getForecast = async (cityName) => {
    try {
      const response = await authenticatedFetch(`${API_URL}/weather/forecast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ city: cityName })
      });
      const resData = await response.json();
      if (response.ok && resData.success) {
        setForecast(resData.forecast);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Get location weather using coords
  const getLocationWeather = () => {
    if (navigator.geolocation) {
      setLoading(true);
      setError('');
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await authenticatedFetch(`${API_URL}/weather/current`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ lat: latitude, lon: longitude })
          });
          const resData = await response.json();
          if (!response.ok) throw new Error(resData.error);
          
          const weatherData = {
            temperature: resData.temperature,
            humidity: resData.humidity,
            rainfall: resData.data.rain ? resData.data.rain['1h'] || resData.data.rain['3h'] || 0 : 0,
            location: resData.location,
            description: resData.description,
            icon: resData.icon,
            feels_like: resData.data.main.feels_like,
            temp_min: resData.data.main.temp_min,
            temp_max: resData.data.main.temp_max,
            windSpeed: resData.windSpeed,
            pressure: resData.pressure,
            visibility: resData.visibility || 10000,
            sunrise: resData.sunrise,
            sunset: resData.sunset
          };

          setWeather(weatherData);
          setCity(resData.data.name);

          // Get forecast using coords
          const forecastResponse = await authenticatedFetch(`${API_URL}/weather/forecast`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ lat: latitude, lon: longitude })
          });
          const forecastResData = await forecastResponse.json();
          if (forecastResponse.ok && forecastResData.success) {
            setForecast(forecastResData.forecast);
          }
        } catch (err) {
          console.error(err);
          setError("Failed to query location weather. Loading default city.");
          fallbackToDefaultWeather();
        } finally {
          setLoading(false);
        }
      }, (error) => {
        console.error("Geolocation error:", error);
        setError("Location access denied or unavailable. Loading default city.");
        setLoading(false);
        fallbackToDefaultWeather();
      });
    } else {
      setError("Geolocation is not supported by your browser. Loading default city.");
      fallbackToDefaultWeather();
    }
  };

  const fallbackToDefaultWeather = () => {
    const saved = localStorage.getItem('recentWeatherSearches');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length > 0) {
        getWeather(parsed[0].city);
        return;
      }
    }
    getWeather('Mumbai');
  };

  // Get crop recommendations from backend
  const fetchCropRecommendations = async () => {
    if (!weather) return;
    setCropLoading(true);
    setCropError('');
    setCrops([]);

    try {
      const response = await authenticatedFetch(`${API_URL}/crops/recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          temperature: weather.temperature,
          humidity: weather.humidity,
          rainfall: weather.rainfall || 0,
          soilType: soilType,
          location: weather.location
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch crop advisor recommendations");
      }
      setCrops(data);
    } catch (err) {
      console.error(err);
      setCropError(err.message || "Failed to generate crop recommendations");
    } finally {
      setCropLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'crops' && weather) {
      fetchCropRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, soilType]);

  useEffect(() => {
    const saved = localStorage.getItem('recentWeatherSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
    // Automatically trigger hyperlocal weather tracking on page load
    getLocationWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = (ts) => {
    return new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) return null;

  return (
    <div className="weather-dashboard-root">
      <Navbar />

      <div className="dashboard-grid-container">
        {/* Left pane: search and conditions */}
        <div className="dashboard-left-pane">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="search-card-glass glass-card"
          >
            <h2 className="card-headline">🌍 Hyperlocal Weather Intelligence</h2>
            <form onSubmit={(e) => { e.preventDefault(); getWeather(); }} className="search-form-row">
              <div className="search-input-wrapper">
                <FaSearch className="search-icon-inline" />
                <input 
                  type="text"
                  placeholder="Enter city (e.g. Delhi, Hyderabad)..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="input-premium"
                />
              </div>
              <div className="search-buttons-group">
                <button type="submit" disabled={loading} className="btn-premium">
                  {loading ? <FaSpinner className="spinner" /> : <FaSearch />}
                  <span>Search</span>
                </button>
                <button type="button" onClick={getLocationWeather} className="btn-premium-outline">
                  <FaLocationArrow />
                </button>
              </div>
            </form>

            {error && <div className="dashboard-error">{error}</div>}

            {recentSearches.length > 0 && (
              <div className="recent-searches-block">
                <h4>Recent Queries</h4>
                <div className="recent-pills-row">
                  {recentSearches.map((item, idx) => (
                    <button 
                      key={idx}
                      onClick={() => { setCity(item.city); getWeather(item.city); }}
                      className="recent-pill-btn"
                    >
                      <span>{item.city}</span>
                      <span className="pill-temp">{item.temp}°C</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Current weather primary display */}
          <AnimatePresence mode="wait">
            {weather && (
              <motion.div
                key={weather.location}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="weather-main-display glass-card"
              >
                {/* Weather animated backdrop overlay */}
                <div className="weather-backdrop-glow" />
                
                <div className="display-top-row">
                  <div>
                    <h3 className="weather-location-title">
                      <FaMapMarkerAlt /> {weather.location}
                    </h3>
                    <div className="live-indicator-tag">
                      <span className="pulsing-red-dot" />
                      <span>LIVE TELEMETRY ACTIVE</span>
                      <span className="updated-time">({lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
                    </div>
                    <p className="weather-desc-tag">{weather.description.toUpperCase()}</p>
                  </div>
                  <div className="large-weather-icon">
                    {weatherIcons[weather.icon] || <FaCloud />}
                  </div>
                </div>

                <div className="display-temp-row">
                  <span className="temp-large">{Math.round(weather.temperature)}°C</span>
                  <span className="feels-like-tag">Feels like {Math.round(weather.feels_like)}°C</span>
                </div>

                <div className="dashboard-stats-grid">
                  <div className="dashboard-stat-box">
                    <FaThermometerHalf />
                    <div>
                      <span>High / Low</span>
                      <strong>{Math.round(weather.temp_max)}° / {Math.round(weather.temp_min)}°</strong>
                    </div>
                  </div>
                  <div className="dashboard-stat-box">
                    <FaTint />
                    <div>
                      <span>Humidity</span>
                      <strong>{weather.humidity}%</strong>
                    </div>
                  </div>
                  <div className="dashboard-stat-box">
                    <FaCloudRain />
                    <div>
                      <span>Precipitation</span>
                      <strong>{weather.rainfall} mm</strong>
                    </div>
                  </div>
                  <div className="dashboard-stat-box">
                    <FaWind />
                    <div>
                      <span>Wind Speed</span>
                      <strong>{weather.windSpeed} m/s</strong>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right pane: Tabs and details */}
        <div className="dashboard-right-pane">
          {weather && (
            <div className="dashboard-tabs-card glass-card">
              <div className="tabs-header-row">
                <button 
                  onClick={() => setActiveTab('current')} 
                  className={`tab-link-btn ${activeTab === 'current' ? 'active' : ''}`}
                >
                  Weather Metrics
                </button>
                <button 
                  onClick={() => setActiveTab('forecast')} 
                  className={`tab-link-btn ${activeTab === 'forecast' ? 'active' : ''}`}
                >
                  5-Day Forecast
                </button>
                <button 
                  onClick={() => setActiveTab('crops')} 
                  className={`tab-link-btn ${activeTab === 'crops' ? 'active' : ''}`}
                >
                  🌱 AI Crop Advisor
                </button>
              </div>

              <div className="tab-content-wrapper">
                {/* Metrics Tab */}
                {activeTab === 'current' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="metrics-tab-content">
                    <div className="metrics-list-grid">
                      <div className="metric-row-item">
                        <span>Barometric Pressure</span>
                        <strong>{weather.pressure} hPa</strong>
                      </div>
                      <div className="metric-row-item">
                        <span>Visibility Range</span>
                        <strong>{(weather.visibility / 1000).toFixed(1)} km</strong>
                      </div>
                      <div className="metric-row-item">
                        <span>Sunrise</span>
                        <strong>{formatTime(weather.sunrise)}</strong>
                      </div>
                      <div className="metric-row-item">
                        <span>Sunset</span>
                        <strong>{formatTime(weather.sunset)}</strong>
                      </div>
                    </div>

                    <div className="metrics-advisor-tip">
                      <FaInfoCircle />
                      <p>
                        Current humidity levels at {weather.humidity}% and temperatures at {Math.round(weather.temperature)}°C 
                        are key factors in determining crop transpirational needs. Head over to the **AI Crop Advisor** tab to discover optimized crops.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Forecast Tab */}
                {activeTab === 'forecast' && forecast && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="forecast-tab-content">
                    <div className="forecast-horizontal-flow">
                      {forecast.map((day, idx) => (
                        <div key={idx} className="forecast-slide-card">
                          <span className="forecast-day-label">
                            {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })}
                          </span>
                          <div className="forecast-slide-icon">
                            {weatherIcons[day.weather.icon] || <FaCloud />}
                          </div>
                          <div className="forecast-slide-temps">
                            <span className="max-temp">{Math.round(day.temp.max)}°</span>
                            <span className="min-temp">{Math.round(day.temp.min)}°</span>
                          </div>
                          <p className="forecast-slide-desc">{day.weather.description}</p>
                          <div className="forecast-slide-sub">
                            <span>💧 {day.humidity}%</span>
                            <span>💨 {day.windSpeed}m/s</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Crops Recommendations Tab */}
                {activeTab === 'crops' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="crops-tab-content">
                    
                    {/* Dynamic Agricultural Season Intelligence Banner */}
                    <div className="season-intelligence-card glass-card" style={{ marginBottom: '2rem', borderLeft: `4px solid ${currentSeason.color}` }}>
                      <div className="season-card-header">
                        <span className="season-pill-badge" style={{ backgroundColor: `${currentSeason.color}20`, color: currentSeason.color }}>
                          🌾 CURRENT ACTIVE SEASON: {currentSeason.name.toUpperCase()}
                        </span>
                      </div>
                      <p className="season-desc-text" style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        {currentSeason.description}
                      </p>
                      <div className="season-crops-row" style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Prime Seasonal Crops:</span>
                        {currentSeason.bestCrops.map(cropName => (
                          <span 
                            key={cropName} 
                            style={{ 
                              fontSize: '0.75rem', 
                              padding: '0.25rem 0.6rem', 
                              borderRadius: '6px', 
                              backgroundColor: 'rgba(255,255,255,0.03)', 
                              border: '1px solid var(--glass-border)',
                              color: 'var(--text-primary)',
                              fontWeight: 600
                            }}
                          >
                            {cropName}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="soil-select-section">
                      <label>Select Your Field Soil Type:</label>
                      <div className="soil-type-flex-pills">
                        {soilTypes.map(t => (
                          <button
                            key={t}
                            onClick={() => setSoilType(t)}
                            className={`soil-pill ${soilType === t ? 'active' : ''}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {cropLoading ? (
                      <div className="tab-loading-state">
                        <FaSpinner className="spinner" />
                        <p>Analyzing climatic limits & soil variables...</p>
                      </div>
                    ) : cropError ? (
                      <div className="tab-error-state">{cropError}</div>
                    ) : crops.length > 0 ? (
                      <div className="recommended-crops-flow">
                        {crops.map((crop, idx) => {
                          // Check if crop matches current season
                          const isPerfectSeason = crop.season && crop.season.some(s => 
                            currentSeason.seasonMatchKeys.includes(s.toLowerCase())
                          );

                          return (
                            <motion.div 
                              key={crop._id || idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.08 }}
                              className="recommended-crop-card"
                            >
                              <div className="crop-card-header">
                                <div>
                                  <h4>{crop.name}</h4>
                                  <span className="crop-scientific-name">{crop.scientificName}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  {isPerfectSeason && (
                                    <span className="season-perfect-tag">
                                      🏆 Perfect Season
                                    </span>
                                  )}
                                  <span className="crop-match-badge">{crop.confidence}% Match</span>
                                </div>
                              </div>

                              <CropAnimation type={crop.animation || 'wheat'} />

                              <div className="crop-card-body">
                                <p className="crop-suit-reason"><strong>Advisor Note:</strong> {crop.reason}</p>
                                <div className="crop-conditions-row">
                                  <div className="crop-condition-tag">
                                    <span>Season</span>
                                    <strong>{crop.season?.join(', ') || 'N/A'}</strong>
                                  </div>
                                  <div className="crop-condition-tag">
                                    <span>Water Needs</span>
                                    <strong>{crop.waterRequirements}</strong>
                                  </div>
                                  <div className="crop-condition-tag">
                                    <span>Growth Duration</span>
                                    <strong>{crop.growthDuration} Days</strong>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="tab-empty-state">No matching crops discovered for the current parameters.</div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .weather-dashboard-root {
          min-height: 100vh;
          background-color: var(--bg-primary);
        }

        .dashboard-grid-container {
          max-width: 1300px;
          margin: 0 auto;
          padding: 2.5rem 2rem;
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 2.5rem;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .dashboard-grid-container {
            grid-template-columns: 1fr;
            padding: 1.5rem;
          }
        }

        .dashboard-left-pane, .dashboard-right-pane {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .card-headline {
          color: var(--text-primary);
          font-size: 1.6rem;
          margin-bottom: 1.5rem;
        }

        .search-form-row {
          display: flex;
          gap: 0.75rem;
        }

        .search-input-wrapper {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
        }

        .search-icon-inline {
          position: absolute;
          left: 1.2rem;
          color: var(--text-muted);
          pointer-events: none;
        }

        .search-input-wrapper .input-premium {
          padding-left: 3rem;
        }

        .search-buttons-group {
          display: flex;
          gap: 0.5rem;
        }

        .dashboard-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: #fca5a5;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          font-size: 0.85rem;
          margin-top: 1rem;
        }

        .recent-searches-block {
          margin-top: 1.5rem;
          padding-top: 1.25rem;
          border-top: 1px solid var(--glass-border);
        }

        .recent-searches-block h4 {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
        }

        .recent-pills-row {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .recent-pill-btn {
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          padding: 0.45rem 0.85rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: var(--transition-fast);
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-family: var(--font-body);
          font-size: 0.85rem;
          font-weight: 600;
        }

        .recent-pill-btn:hover {
          color: var(--text-primary);
          border-color: var(--accent-primary);
        }

        .pill-temp {
          color: var(--accent-primary);
        }

        /* Weather Main Card */
        .weather-main-display {
          position: relative;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(12, 24, 21, 0.75) 100%);
          overflow: hidden;
        }

        .weather-backdrop-glow {
          position: absolute;
          width: 250px;
          height: 250px;
          background: var(--accent-primary);
          filter: blur(100px);
          opacity: 0.15;
          top: -20px;
          right: -20px;
          pointer-events: none;
          z-index: 0;
        }

        .display-top-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          z-index: 10;
          position: relative;
          margin-bottom: 2rem;
        }

        .weather-location-title {
          font-size: 1.8rem;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.35rem;
        }

        .weather-desc-tag {
          font-size: 0.85rem;
          color: var(--accent-primary);
          font-weight: 800;
          letter-spacing: 0.05em;
        }

        .large-weather-icon {
          font-size: 3.5rem;
        }

        .display-temp-row {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          z-index: 10;
          position: relative;
          margin-bottom: 2.5rem;
        }

        .temp-large {
          font-size: 4.5rem;
          font-family: var(--font-display);
          font-weight: 800;
          line-height: 1;
        }

        .feels-like-tag {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .dashboard-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
          z-index: 10;
          position: relative;
        }

        .dashboard-stat-box {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 1rem 1.2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .dashboard-stat-box svg {
          font-size: 1.6rem;
          color: var(--accent-primary);
        }

        .dashboard-stat-box div {
          display: flex;
          flex-direction: column;
        }

        .dashboard-stat-box span {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .dashboard-stat-box strong {
          font-size: 1.05rem;
          color: var(--text-primary);
        }

        /* Tabs Card */
        .tabs-header-row {
          display: flex;
          border-bottom: 1px solid var(--glass-border);
          margin-bottom: 2rem;
          overflow-x: auto;
        }

        .tab-link-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          padding: 1rem 1.5rem;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: var(--transition-fast);
          border-bottom: 2px solid transparent;
          white-space: nowrap;
        }

        .tab-link-btn:hover {
          color: var(--text-primary);
        }

        .tab-link-btn.active {
          color: var(--accent-primary);
          border-bottom-color: var(--accent-primary);
        }

        .metrics-list-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        @media (max-width: 640px) {
          .metrics-list-grid {
            grid-template-columns: 1fr;
          }
        }

        .metric-row-item {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          border: 1px solid var(--glass-border);
          padding: 1rem;
        }

        .metric-row-item span {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .metric-row-item strong {
          font-size: 1.2rem;
          color: var(--text-primary);
        }

        .metrics-advisor-tip {
          display: flex;
          gap: 1rem;
          background: rgba(16, 185, 129, 0.06);
          border: 1px solid rgba(16, 185, 129, 0.15);
          border-radius: 16px;
          padding: 1.25rem;
        }

        .metrics-advisor-tip svg {
          color: var(--accent-primary);
          font-size: 1.5rem;
          flex-shrink: 0;
          margin-top: 0.1rem;
        }

        .metrics-advisor-tip p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        /* Forecast Card Styling */
        .forecast-horizontal-flow {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          padding-bottom: 1rem;
        }

        .forecast-slide-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--glass-border);
          border-radius: 18px;
          padding: 1.25rem;
          min-width: 140px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.6rem;
          transition: var(--transition-smooth);
        }

        .forecast-slide-card:hover {
          background: rgba(255,255,255,0.05);
          border-color: var(--accent-primary);
          transform: translateY(-3px);
        }

        .forecast-day-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .forecast-slide-icon {
          font-size: 2.2rem;
          margin: 0.25rem 0;
        }

        .forecast-slide-temps {
          display: flex;
          gap: 0.5rem;
          font-size: 0.95rem;
          font-weight: 700;
        }

        .max-temp {
          color: var(--text-primary);
        }

        .min-temp {
          color: var(--text-muted);
        }

        .forecast-slide-desc {
          font-size: 0.75rem;
          color: var(--accent-primary);
          font-weight: 700;
          text-transform: capitalize;
        }

        .forecast-slide-sub {
          display: flex;
          gap: 0.6rem;
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        .crop-suggestion {
          font-size: 0.65rem;
          background: var(--bg-tertiary);
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          color: var(--text-secondary);
          margin-top: 0.5rem;
        }

        /* Crops advisor tab */
        .soil-select-section {
          margin-bottom: 2rem;
        }

        .soil-select-section label {
          display: block;
          margin-bottom: 0.8rem;
          font-weight: 700;
          color: var(--text-primary);
          font-size: 0.95rem;
        }

        .soil-type-flex-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .soil-pill {
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          padding: 0.5rem 1rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: var(--transition-fast);
          font-family: var(--font-body);
          font-size: 0.85rem;
          font-weight: 600;
        }

        .soil-pill:hover {
          border-color: var(--accent-primary);
          color: var(--text-primary);
        }

        .soil-pill.active {
          background: var(--accent-primary);
          border-color: var(--accent-primary);
          color: white;
        }

        .tab-loading-state, .tab-empty-state, .tab-error-state {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--text-secondary);
        }

        .tab-loading-state svg {
          font-size: 2rem;
          color: var(--accent-primary);
          margin-bottom: 1rem;
        }

        .recommended-crops-flow {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .recommended-crop-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          padding: 1.5rem;
          transition: var(--transition-smooth);
        }

        .recommended-crop-card:hover {
          border-color: var(--glass-border-hover);
        }

        .crop-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .crop-card-header h4 {
          font-size: 1.3rem;
          color: var(--text-primary);
        }

        .crop-scientific-name {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-style: italic;
        }

        .crop-match-badge {
          background: var(--accent-light);
          color: var(--accent-primary);
          padding: 0.4rem 0.8rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.85rem;
        }

        .crop-suit-reason {
          background: rgba(255, 255, 255, 0.02);
          padding: 0.8rem 1.1rem;
          border-radius: 12px;
          border-left: 3px solid var(--accent-primary);
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 1.2rem;
        }

        .crop-conditions-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.85rem;
        }

        .crop-condition-tag {
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          padding: 0.6rem;
          border-radius: 10px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .crop-condition-tag span {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .crop-condition-tag strong {
          font-size: 0.8rem;
          color: var(--text-primary);
        }

        .live-indicator-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;
          padding: 0.25rem 0.5rem;
          font-size: 0.65rem;
          font-weight: 800;
          color: #fca5a5;
          letter-spacing: 0.05em;
          margin-bottom: 0.6rem;
        }

        .pulsing-red-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #ef4444;
          box-shadow: 0 0 8px #ef4444;
          animation: pulse-dot 1.5s infinite;
        }

        .updated-time {
          font-size: 0.6rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 0.5; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.25); }
        }

        .season-perfect-tag {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid var(--accent-primary);
          color: var(--accent-primary);
          padding: 0.35rem 0.75rem;
          border-radius: 8px;
          font-weight: 800;
          font-size: 0.7rem;
          letter-spacing: 0.05em;
          text-shadow: 0 0 8px rgba(16, 185, 129, 0.25);
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.08);
        }
        
        .season-intelligence-card {
          padding: 1.5rem;
          background: rgba(12, 24, 21, 0.5);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          transition: none !important;
          transform: none !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }
        
        .season-intelligence-card:hover {
          border-color: var(--glass-border) !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
          transform: none !important;
        }

        .season-pill-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          padding: 0.35rem 0.75rem;
          border-radius: 8px;
        }

        /* Mobile / Phone optimizations (<= 768px) */
        @media (max-width: 768px) {
          .dashboard-grid-container {
            width: 100%;
            max-width: 100%;
            padding: 1rem;
            margin: 0 auto;
            gap: 1.5rem;
            box-sizing: border-box;
          }

          .dashboard-left-pane, .dashboard-right-pane {
            width: 100%;
            min-width: 0;
            box-sizing: border-box;
          }

          .weather-dashboard-root .glass-card {
            width: 100%;
            padding: 1.25rem;
            box-sizing: border-box;
          }
          
          .card-headline {
            font-size: 1.35rem;
            margin-bottom: 1.2rem;
          }
          
          .weather-location-title {
            font-size: 1.5rem;
          }
          
          .temp-large {
            font-size: 3.5rem;
          }
          
          .large-weather-icon {
            font-size: 2.8rem;
          }
          
          .dashboard-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }
          
          .dashboard-stat-box {
            padding: 0.75rem 1rem;
            gap: 0.75rem;
          }
          
          .dashboard-stat-box svg {
            font-size: 1.35rem;
          }
          
          .dashboard-stat-box strong {
            font-size: 0.95rem;
          }

          .live-indicator-tag {
            flex-wrap: wrap;
            gap: 0.35rem;
          }
          
          .tabs-header-row::-webkit-scrollbar,
          .forecast-horizontal-flow::-webkit-scrollbar {
            display: none;
          }
          
          .tabs-header-row,
          .forecast-horizontal-flow {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          
          .tab-link-btn {
            padding: 0.85rem 1rem;
            font-size: 0.85rem;
          }
          
          .forecast-slide-card {
            min-width: 125px;
            padding: 1rem;
          }
          
          .recommended-crop-card {
            padding: 1.2rem;
          }
          
          .season-intelligence-card {
            padding: 1.2rem;
          }
        }
        
        @media (max-width: 580px) {
          .search-form-row {
            width: 100%;
            flex-direction: column;
            gap: 0.75rem;
            box-sizing: border-box;
          }
          
          .search-input-wrapper {
            width: 100%;
          }
          
          .search-buttons-group {
            width: 100%;
            display: flex;
            gap: 0.5rem;
          }
          
          .search-buttons-group button {
            flex: 1;
            justify-content: center;
          }
          
          .display-top-row {
            align-items: center;
          }
          
          .dashboard-stats-grid {
            grid-template-columns: 1fr;
          }
          
          .crop-card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          
          .crop-card-header > div:last-child {
            display: flex;
            flex-wrap: wrap;
            gap: 0.4rem;
            width: 100%;
            justify-content: flex-start;
            margin-top: 0.2rem;
          }
          
          .crop-conditions-row {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
          
          .crop-condition-tag {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            padding: 0.65rem 1rem;
          }
          
          .crop-condition-tag span {
            font-size: 0.75rem;
          }
          
          .crop-condition-tag strong {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Weather;