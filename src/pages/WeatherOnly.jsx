import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import Navbar from '../components/Navbar';

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
  FaCalendarAlt,
  FaEye,
  FaTemperatureHigh,
  FaTemperatureLow,
  FaArrowUp,
  FaArrowDown,
  FaSpinner,
  FaArrowLeft,
  FaInfoCircle
} from 'react-icons/fa';

const WeatherOnly = () => {
  const navigate = useNavigate();

  const API_KEY = "165ac561bb8fd08126ca6f2d23617262"; // Moving key to secure env vars is recommended in production

  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('current');
  const [recentSearches, setRecentSearches] = useState([]);

  const weatherIcons = {
    '01d': <FaSun className="weather-icon sun text-yellow-500 animate-spin-slow" />,
    '01n': <FaMoon className="weather-icon moon text-blue-300" />,
    '02d': <FaCloudSun className="weather-icon cloud-sun text-yellow-400" />,
    '02n': <FaCloudSun className="weather-icon cloud-moon" />,
    '03d': <FaCloud className="weather-icon cloud text-gray-300" />,
    '03n': <FaCloud className="weather-icon cloud" />,
    '04d': <FaCloud className="weather-icon cloud text-gray-400" />,
    '04n': <FaCloud className="weather-icon cloud" />,
    '09d': <FaCloudShowersHeavy className="weather-icon rain text-blue-400" />,
    '09n': <FaCloudShowersHeavy className="weather-icon rain" />,
    '10d': <FaCloudRain className="weather-icon rain-sun text-teal-400" />,
    '10n': <FaCloudRain className="weather-icon rain-moon" />,
    '11d': <FaBolt className="weather-icon thunder text-yellow-300" />,
    '11n': <FaBolt className="weather-icon thunder" />,
    '13d': <FaSnowflake className="weather-icon snow text-blue-100" />,
    '13n': <FaSnowflake className="weather-icon snow" />,
    '50d': <FaSmog className="weather-icon mist text-gray-400" />,
    '50n': <FaSmog className="weather-icon mist" />
  };

  // Get weather data from OpenWeather API
  const getWeather = async (cityName = city) => {
    const searchCity = cityName || city;
    if (!searchCity.trim()) {
      setError('Please enter a city name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();

      if (data.cod === "404") {
        setError("City not found");
        setWeather(null);
      } else {
        const processedWeather = {
          name: data.name,
          temp: Math.round(data.main.temp),
          description: data.weather[0].description,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
          pressure: data.main.pressure,
          feels_like: Math.round(data.main.feels_like),
          temp_min: Math.round(data.main.temp_min),
          temp_max: Math.round(data.main.temp_max),
          icon: data.weather[0].icon,
          country: data.sys.country,
          sunrise: data.sys.sunrise,
          sunset: data.sys.sunset,
          visibility: data.visibility
        };
        
        setWeather(processedWeather);

        // Save to recent searches
        const search = {
          city: searchCity,
          temp: processedWeather.temp,
          icon: processedWeather.icon,
          timestamp: new Date().toLocaleTimeString(),
          location: data.name
        };

        setRecentSearches(prev => {
          const filtered = prev.filter(s => s.city.toLowerCase() !== searchCity.toLowerCase());
          const updated = [search, ...filtered.slice(0, 4)];
          localStorage.setItem('recentWeatherSearches', JSON.stringify(updated));
          return updated;
        });

        // Get forecast data
        await getForecast(searchCity);
      }
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get forecast data
  const getForecast = async (cityName) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();

      if (data.cod === "200") {
        const dailyForecast = {};
        data.list.forEach(item => {
          const date = item.dt_txt.split(' ')[0];
          if (!dailyForecast[date]) {
            dailyForecast[date] = {
              temps: [],
              humidity: [],
              weather: [],
              windSpeed: [],
              date: date
            };
          }
          dailyForecast[date].temps.push(item.main.temp);
          dailyForecast[date].humidity.push(item.main.humidity);
          dailyForecast[date].weather.push(item.weather[0]);
          dailyForecast[date].windSpeed.push(item.wind.speed);
        });

        const forecastArray = Object.keys(dailyForecast).slice(0, 5).map(date => {
          const day = dailyForecast[date];
          const avgTemp = day.temps.reduce((a, b) => a + b, 0) / day.temps.length;
          const avgHumidity = day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length;
          const mainWeather = day.weather[0];

          return {
            date: date,
            temp: {
              avg: Math.round(avgTemp),
              min: Math.min(...day.temps),
              max: Math.max(...day.temps)
            },
            weather: {
              description: mainWeather.description,
              icon: mainWeather.icon,
              main: mainWeather.main
            },
            humidity: Math.round(avgHumidity),
            windSpeed: Math.round(day.windSpeed.reduce((a, b) => a + b, 0) / day.windSpeed.length)
          };
        });

        setForecast({
          success: true,
          city: {
            name: data.city.name,
            country: data.city.country
          },
          forecast: forecastArray
        });
      }
    } catch (err) {
      console.error("Forecast fetch error:", err);
    }
  };

  // Get location weather
  const getLocationWeather = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            const response = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
            );
            const data = await response.json();
            
            if (data.cod === 200) {
              const cityName = data.name;
              setCity(cityName);
              
              const processedWeather = {
                name: data.name,
                temp: Math.round(data.main.temp),
                description: data.weather[0].description,
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                pressure: data.main.pressure,
                feels_like: Math.round(data.main.feels_like),
                temp_min: Math.round(data.main.temp_min),
                temp_max: Math.round(data.main.temp_max),
                icon: data.weather[0].icon,
                country: data.sys.country,
                sunrise: data.sys.sunrise,
                sunset: data.sys.sunset,
                visibility: data.visibility
              };
              
              setWeather(processedWeather);
              setError('');
              await getForecast(cityName);
            }
          } catch (err) {
            setError('Failed to fetch location weather');
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          setError('Please enable location access or enter city manually');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('recentWeatherSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
    setCity('Mumbai');
    getWeather('Mumbai');
  }, []);

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="weather-page-root">
      <Navbar />

      <div className="db-content-wrapper">
        <div className="page-header-row">
          <button onClick={() => navigate("/")} className="btn-premium-outline">
            <FaArrowLeft /> Back to Home
          </button>
          <h1 className="text-gradient">🌦 Live Weather Intelligence</h1>
        </div>

        <div className="dashboard-grid-container">
          <div className="dashboard-left-pane">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="search-card-glass glass-card"
            >
              <h2 className="card-headline">Search Location</h2>
              <div className="search-form-row">
                <div className="search-input-wrapper">
                  <FaSearch className="search-icon-inline" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter city name..."
                    className="input-premium"
                    onKeyPress={(e) => e.key === 'Enter' && getWeather()}
                  />
                </div>
                <div className="search-buttons-group">
                  <button onClick={() => getWeather()} disabled={loading} className="btn-premium">
                    {loading ? <FaSpinner className="spinner" /> : <FaSearch />}
                    <span>Search</span>
                  </button>
                  <button onClick={getLocationWeather} disabled={loading} className="btn-premium-outline">
                    <FaLocationArrow />
                  </button>
                </div>
              </div>

              {error && <div className="dashboard-error">{error}</div>}

              {recentSearches.length > 0 && (
                <div className="recent-searches-block">
                  <h4>Recent Searches</h4>
                  <div className="recent-pills-row">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCity(search.city);
                          getWeather(search.city);
                        }}
                        className="recent-pill-btn"
                      >
                        <span>{search.city}</span>
                        <span className="pill-temp">{search.temp}°C</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            <AnimatePresence mode="wait">
              {weather && (
                <motion.div
                  key={weather.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="weather-main-display glass-card"
                >
                  <div className="weather-backdrop-glow" />
                  <div className="display-top-row">
                    <div>
                      <h3 className="weather-location-title">
                        <FaMapMarkerAlt /> {weather.name}, {weather.country}
                      </h3>
                      <p className="weather-desc-tag">{weather.description.toUpperCase()}</p>
                    </div>
                    <div className="large-weather-icon">
                      {weatherIcons[weather.icon] || <FaCloud />}
                    </div>
                  </div>

                  <div className="display-temp-row">
                    <span className="temp-large">{weather.temp}°C</span>
                    <span className="feels-like-tag">Feels like {weather.feels_like}°C</span>
                  </div>

                  <div className="dashboard-stats-grid">
                    <div className="dashboard-stat-box">
                      <FaThermometerHalf />
                      <div>
                        <span>High / Low</span>
                        <strong>{weather.temp_max}° / {weather.temp_min}°C</strong>
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

          <div className="dashboard-right-pane">
            {weather && (
              <div className="dashboard-tabs-card glass-card">
                <div className="tabs-header-row">
                  <button
                    className={`tab-link-btn ${activeTab === 'current' ? 'active' : ''}`}
                    onClick={() => setActiveTab('current')}
                  >
                    Environmental Metrics
                  </button>
                  <button
                    className={`tab-link-btn ${activeTab === 'forecast' ? 'active' : ''}`}
                    onClick={() => setActiveTab('forecast')}
                  >
                    5-Day Outlook
                  </button>
                </div>

                <div className="tab-content-wrapper">
                  {activeTab === 'current' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="metrics-tab-content">
                      <div className="metrics-list-grid">
                        <div className="metric-row-item">
                          <span>Atmospheric Pressure</span>
                          <strong>{weather.pressure} hPa</strong>
                        </div>
                        <div className="metric-row-item">
                          <span>Sunrise</span>
                          <strong>{formatTime(weather.sunrise)}</strong>
                        </div>
                        <div className="metric-row-item">
                          <span>Sunset</span>
                          <strong>{formatTime(weather.sunset)}</strong>
                        </div>
                        <div className="metric-row-item">
                          <span>Visibility</span>
                          <strong>{(weather.visibility / 1000).toFixed(1)} km</strong>
                        </div>
                      </div>

                      <div className="metrics-advisor-tip">
                        <FaInfoCircle />
                        <p>
                          This public dashboard shows real-time weather analytics. To receive AI-calculated crop recommendations and save telemetry searches in MongoDB, register a free farming account.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'forecast' && forecast && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="forecast-tab-content">
                      <div className="forecast-horizontal-flow">
                        {forecast.forecast.map((day, index) => (
                          <div key={index} className="forecast-slide-card">
                            <span className="forecast-day-label">{formatDate(day.date)}</span>
                            <div className="forecast-slide-icon">
                              {weatherIcons[day.weather.icon] || <FaCloud />}
                            </div>
                            <div className="forecast-slide-temps">
                              <span className="max-temp">{day.temp.max}°</span>
                              <span className="min-temp">{day.temp.min}°</span>
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
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .weather-page-root {
          min-height: 100vh;
          background-color: var(--bg-primary);
        }

        .db-content-wrapper {
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

        .dashboard-grid-container {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 2.5rem;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .dashboard-grid-container {
            grid-template-columns: 1fr;
          }
        }

        .dashboard-left-pane, .dashboard-right-pane {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .card-headline {
          color: var(--text-primary);
          font-size: 1.4rem;
          margin-bottom: 1.25rem;
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
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(12, 24, 21, 0.7) 100%);
          overflow: hidden;
        }

        .weather-backdrop-glow {
          position: absolute;
          width: 250px;
          height: 250px;
          background: var(--accent-primary);
          filter: blur(100px);
          opacity: 0.12;
          top: -20px;
          right: -20px;
          pointer-events: none;
        }

        .display-top-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
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
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .dashboard-stat-box {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .dashboard-stat-box svg {
          font-size: 1.5rem;
          color: var(--accent-primary);
        }

        .dashboard-stat-box div {
          display: flex;
          flex-direction: column;
        }

        .dashboard-stat-box span {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .dashboard-stat-box strong {
          font-size: 0.95rem;
          color: var(--text-primary);
        }

        /* Tabs Card */
        .tabs-header-row {
          display: flex;
          border-bottom: 1px solid var(--glass-border);
          margin-bottom: 2rem;
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
      `}</style>
    </div>
  );
};

export default WeatherOnly;