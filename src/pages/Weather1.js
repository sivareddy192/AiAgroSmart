import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from "react-router-dom";

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
  FaSeedling,
  FaSpinner,
  FaCheck,
  FaInfoCircle,
  FaArrowRight,
  FaMountain,
  FaWater,
  FaTree,
  FaLeaf
} from 'react-icons/fa';

const Weather = () => {
  const navigate = useNavigate();

  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('current');
  const [recentSearches, setRecentSearches] = useState([]);
  const [cropRecommendations, setCropRecommendations] = useState(null);
  const [cropLoading, setCropLoading] = useState(false);
  const [soilType, setSoilType] = useState('Loamy');
  const [recommendationType, setRecommendationType] = useState('location'); // 'location' or 'soil'

  const soilTypes = ['Alluvial', 'Black', 'Red', 'Laterite', 'Sandy', 'Clayey', 'Loamy'];

  const weatherIcons = {
    '01d': <FaSun className="weather-icon sun" />,
    '01n': <FaMoon className="weather-icon moon" />,
    '02d': <FaCloudSun className="weather-icon cloud-sun" />,
    '02n': <FaCloudSun className="weather-icon cloud-moon" />,
    '03d': <FaCloud className="weather-icon cloud" />,
    '03n': <FaCloud className="weather-icon cloud" />,
    '04d': <FaCloud className="weather-icon cloud" />,
    '04n': <FaCloud className="weather-icon cloud" />,
    '09d': <FaCloudShowersHeavy className="weather-icon rain" />,
    '09n': <FaCloudShowersHeavy className="weather-icon rain" />,
    '10d': <FaCloudRain className="weather-icon rain-sun" />,
    '10n': <FaCloudRain className="weather-icon rain-moon" />,
    '11d': <FaBolt className="weather-icon thunder" />,
    '11n': <FaBolt className="weather-icon thunder" />,
    '13d': <FaSnowflake className="weather-icon snow" />,
    '13n': <FaSnowflake className="weather-icon snow" />,
    '50d': <FaSmog className="weather-icon mist" />,
    '50n': <FaSmog className="weather-icon mist" />
  };

  // Your location-based crop recommendation logic
  const recommendCropsByLocation = ({ location, temperature, humidity, rainfall }) => {
    const crops = [];
    const loc = location.toLowerCase();

    // 🌊 Coastal regions
    if (
      loc.includes('kerala') ||
      loc.includes('tamil nadu') ||
      loc.includes('goa') ||
      loc.includes('mumbai') ||
      loc.includes('chennai') ||
      loc.includes('coastal')
    ) {
      if (humidity > 60) {
        crops.push(
          { 
            name: 'Rice', 
            reason: 'High humidity and coastal climate',
            icon: '🌾',
            region: 'Coastal',
            idealTemp: '20-30°C',
            idealHumidity: '>60%',
            idealRainfall: 'High'
          },
          { 
            name: 'Coconut', 
            reason: 'Thrives in coastal regions',
            icon: '🥥',
            region: 'Coastal',
            idealTemp: '25-35°C',
            idealHumidity: '60-90%',
            idealRainfall: 'High'
          },
          { 
            name: 'Banana', 
            reason: 'Warm and humid conditions',
            icon: '🍌',
            region: 'Coastal',
            idealTemp: '20-35°C',
            idealHumidity: '>60%',
            idealRainfall: 'Moderate-High'
          }
        );
      }
    }

    // 🌵 Dry / Semi-arid regions
    if (
      loc.includes('rajasthan') ||
      loc.includes('telangana') ||
      loc.includes('karnataka') ||
      loc.includes('dry') ||
      loc.includes('arid')
    ) {
      if (rainfall < 50) {
        crops.push(
          { 
            name: 'Millets', 
            reason: 'Low water requirement',
            icon: '🌾',
            region: 'Dry/Arid',
            idealTemp: '25-35°C',
            idealHumidity: '<50%',
            idealRainfall: 'Low'
          },
          { 
            name: 'Pulses', 
            reason: 'Drought resistant crops',
            icon: '🌱',
            region: 'Dry/Arid',
            idealTemp: '15-30°C',
            idealHumidity: '40-70%',
            idealRainfall: 'Low-Moderate'
          },
          { 
            name: 'Cotton', 
            reason: 'Suitable for dry climates',
            icon: '🧵',
            region: 'Dry/Arid',
            idealTemp: '21-37°C',
            idealHumidity: '<70%',
            idealRainfall: 'Moderate'
          }
        );
      }
    }

    // 🌾 Fertile plains
    if (
      loc.includes('punjab') ||
      loc.includes('haryana') ||
      loc.includes('uttar pradesh') ||
      loc.includes('plains') ||
      loc.includes('fertile')
    ) {
      if (temperature >= 15 && temperature <= 30) {
        crops.push(
          { 
            name: 'Wheat', 
            reason: 'Cool to moderate temperature',
            icon: '🌾',
            region: 'Plains',
            idealTemp: '15-25°C',
            idealHumidity: '<60%',
            idealRainfall: 'Moderate'
          },
          { 
            name: 'Sugarcane', 
            reason: 'Fertile soil and irrigation',
            icon: '🎋',
            region: 'Plains',
            idealTemp: '20-35°C',
            idealHumidity: '60-85%',
            idealRainfall: 'High'
          },
          { 
            name: 'Rice', 
            reason: 'Plenty of water availability',
            icon: '🌾',
            region: 'Plains',
            idealTemp: '20-35°C',
            idealHumidity: '>70%',
            idealRainfall: 'High'
          }
        );
      }
    }

    // ⛰ Hilly regions
    if (
      loc.includes('himachal') ||
      loc.includes('uttarakhand') ||
      loc.includes('hills') ||
      loc.includes('mountain')
    ) {
      crops.push(
        { 
          name: 'Apple', 
          reason: 'Cool climate crop',
          icon: '🍎',
          region: 'Hilly',
          idealTemp: '10-20°C',
          idealHumidity: '60-80%',
          idealRainfall: 'Moderate'
        },
        { 
          name: 'Potato', 
          reason: 'Grows well in hilly regions',
          icon: '🥔',
          region: 'Hilly',
          idealTemp: '15-25°C',
          idealHumidity: '50-80%',
          idealRainfall: 'Moderate'
        },
        { 
          name: 'Barley', 
          reason: 'Cold tolerant crop',
          icon: '🌾',
          region: 'Hilly',
          idealTemp: '12-25°C',
          idealHumidity: '30-65%',
          idealRainfall: 'Moderate'
        }
      );
    }

    // 🌴 Tropical regions fallback
    if (crops.length === 0) {
      if (temperature > 25 && humidity > 50) {
        crops.push(
          { 
            name: 'Maize', 
            reason: 'Adaptable to tropical climate',
            icon: '🌽',
            region: 'Tropical',
            idealTemp: '18-32°C',
            idealHumidity: '50-70%',
            idealRainfall: 'Moderate'
          },
          { 
            name: 'Groundnut', 
            reason: 'Warm weather crop',
            icon: '🥜',
            region: 'Tropical',
            idealTemp: '25-35°C',
            idealHumidity: '50-70%',
            idealRainfall: 'Low-Moderate'
          }
        );
      }
    }

    // Add fallback crops if still none found
    if (crops.length === 0) {
      crops.push(
        { 
          name: 'Pulses', 
          reason: 'Adaptable to various conditions',
          icon: '🌱',
          region: 'General',
          idealTemp: '15-30°C',
          idealHumidity: '40-70%',
          idealRainfall: 'Moderate'
        },
        { 
          name: 'Vegetables', 
          reason: 'Suitable for current conditions',
          icon: '🥬',
          region: 'General',
          idealTemp: '15-30°C',
          idealHumidity: '40-80%',
          idealRainfall: 'Moderate'
        }
      );
    }

    return crops;
  };

  // Your soil-based crop recommendation logic
  const recommendCropsBySoil = ({ soilType, temperature, rainfall }) => {
    let crops = [];

    switch (soilType.toLowerCase()) {
      case 'alluvial':
        crops = [
          { 
            name: 'Rice', 
            reason: 'High fertility and good water retention',
            icon: '🌾',
            soilType: 'Alluvial',
            idealTemp: '20-35°C',
            idealRainfall: 'High'
          },
          { 
            name: 'Wheat', 
            reason: 'Ideal nutrient-rich soil',
            icon: '🌾',
            soilType: 'Alluvial',
            idealTemp: '15-25°C',
            idealRainfall: 'Moderate'
          },
          { 
            name: 'Sugarcane', 
            reason: 'Requires fertile soil',
            icon: '🎋',
            soilType: 'Alluvial',
            idealTemp: '20-35°C',
            idealRainfall: 'High'
          },
          { 
            name: 'Maize', 
            reason: 'Well-drained and fertile',
            icon: '🌽',
            soilType: 'Alluvial',
            idealTemp: '18-32°C',
            idealRainfall: 'Moderate'
          }
        ];
        break;

      case 'black':
        crops = [
          { 
            name: 'Cotton', 
            reason: 'High moisture retention soil',
            icon: '🧵',
            soilType: 'Black',
            idealTemp: '21-37°C',
            idealRainfall: 'Moderate'
          },
          { 
            name: 'Soybean', 
            reason: 'Clay-rich soil support',
            icon: '🌱',
            soilType: 'Black',
            idealTemp: '20-30°C',
            idealRainfall: 'Moderate'
          },
          { 
            name: 'Groundnut', 
            reason: 'Performs well in black soil',
            icon: '🥜',
            soilType: 'Black',
            idealTemp: '25-35°C',
            idealRainfall: 'Low-Moderate'
          },
          { 
            name: 'Sugarcane', 
            reason: 'Moisture-holding capacity',
            icon: '🎋',
            soilType: 'Black',
            idealTemp: '20-35°C',
            idealRainfall: 'High'
          }
        ];
        break;

      case 'red':
        crops = [
          { 
            name: 'Millets', 
            reason: 'Low water requirement',
            icon: '🌾',
            soilType: 'Red',
            idealTemp: '25-35°C',
            idealRainfall: 'Low'
          },
          { 
            name: 'Pulses', 
            reason: 'Nitrogen-fixing crops',
            icon: '🌱',
            soilType: 'Red',
            idealTemp: '15-30°C',
            idealRainfall: 'Low-Moderate'
          },
          { 
            name: 'Groundnut', 
            reason: 'Grows in low fertility soil',
            icon: '🥜',
            soilType: 'Red',
            idealTemp: '25-35°C',
            idealRainfall: 'Low-Moderate'
          },
          { 
            name: 'Potato', 
            reason: 'Adaptable crop',
            icon: '🥔',
            soilType: 'Red',
            idealTemp: '15-25°C',
            idealRainfall: 'Moderate'
          }
        ];
        break;

      case 'laterite':
        crops = [
          { 
            name: 'Tea', 
            reason: 'Thrives in acidic soil',
            icon: '🍵',
            soilType: 'Laterite',
            idealTemp: '15-30°C',
            idealRainfall: 'High'
          },
          { 
            name: 'Coffee', 
            reason: 'Well-drained laterite soil',
            icon: '☕',
            soilType: 'Laterite',
            idealTemp: '15-25°C',
            idealRainfall: 'Moderate-High'
          },
          { 
            name: 'Cashew', 
            reason: 'Low nutrient requirement',
            icon: '🥜',
            soilType: 'Laterite',
            idealTemp: '20-35°C',
            idealRainfall: 'Moderate'
          },
          { 
            name: 'Rubber', 
            reason: 'Laterite suitability',
            icon: '🌳',
            soilType: 'Laterite',
            idealTemp: '25-35°C',
            idealRainfall: 'High'
          }
        ];
        break;

      case 'sandy':
        crops = [
          { 
            name: 'Groundnut', 
            reason: 'Fast drainage suitable',
            icon: '🥜',
            soilType: 'Sandy',
            idealTemp: '25-35°C',
            idealRainfall: 'Low-Moderate'
          },
          { 
            name: 'Watermelon', 
            reason: 'Requires loose soil',
            icon: '🍉',
            soilType: 'Sandy',
            idealTemp: '25-35°C',
            idealRainfall: 'Low'
          },
          { 
            name: 'Carrot', 
            reason: 'Root development is better',
            icon: '🥕',
            soilType: 'Sandy',
            idealTemp: '15-25°C',
            idealRainfall: 'Moderate'
          },
          { 
            name: 'Cucumber', 
            reason: 'Light soil preference',
            icon: '🥒',
            soilType: 'Sandy',
            idealTemp: '25-35°C',
            idealRainfall: 'Moderate'
          }
        ];
        break;

      case 'clayey':
        crops = [
          { 
            name: 'Rice', 
            reason: 'Water retention helps paddy cultivation',
            icon: '🌾',
            soilType: 'Clayey',
            idealTemp: '20-35°C',
            idealRainfall: 'High'
          },
          { 
            name: 'Jute', 
            reason: 'Waterlogged soil crop',
            icon: '🌿',
            soilType: 'Clayey',
            idealTemp: '25-35°C',
            idealRainfall: 'High'
          },
          { 
            name: 'Sugarcane', 
            reason: 'High water demand crop',
            icon: '🎋',
            soilType: 'Clayey',
            idealTemp: '20-35°C',
            idealRainfall: 'High'
          }
        ];
        break;

      case 'loamy':
        crops = [
          { 
            name: 'Wheat', 
            reason: 'Balanced soil texture',
            icon: '🌾',
            soilType: 'Loamy',
            idealTemp: '15-25°C',
            idealRainfall: 'Moderate'
          },
          { 
            name: 'Vegetables', 
            reason: 'Best soil for farming',
            icon: '🥬',
            soilType: 'Loamy',
            idealTemp: '15-30°C',
            idealRainfall: 'Moderate'
          },
          { 
            name: 'Fruits', 
            reason: 'Good aeration and fertility',
            icon: '🍎',
            soilType: 'Loamy',
            idealTemp: '15-30°C',
            idealRainfall: 'Moderate'
          },
          { 
            name: 'Pulses', 
            reason: 'Optimal nutrient balance',
            icon: '🌱',
            soilType: 'Loamy',
            idealTemp: '15-30°C',
            idealRainfall: 'Moderate'
          }
        ];
        break;

      default:
        crops = [
          { 
            name: 'Millets', 
            reason: 'Hardy crop for uncertain soil',
            icon: '🌾',
            soilType: 'General',
            idealTemp: '25-35°C',
            idealRainfall: 'Low'
          }
        ];
    }

    // Optional weather refinement
    if (temperature > 35) {
      crops = crops.filter(c =>
        !['Wheat', 'Potato'].includes(c.name)
      );
    }

    if (rainfall < 40) {
      crops = crops.filter(c =>
        !['Rice', 'Sugarcane'].includes(c.name)
      );
    }

    return crops;
  };

  // Get crop recommendations based on selected type
  const getCropRecommendations = () => {
    if (!weather) {
      alert('Please get weather data first');
      return;
    }

    setCropLoading(true);
    setCropRecommendations(null);

    const { temperature, humidity, rainfall, location } = weather;
    
    let crops = [];

    if (recommendationType === 'location') {
      // Use location-based recommendation logic
      crops = recommendCropsByLocation({
        location,
        temperature,
        humidity,
        rainfall: rainfall || 0
      });
    } else {
      // Use soil-based recommendation logic
      crops = recommendCropsBySoil({
        soilType,
        temperature,
        rainfall: rainfall || 0
      });
    }

    // Add match percentage and other info
    const cropsWithInfo = crops.map(crop => ({
      ...crop,
      matchPercentage: calculateMatchPercentage(crop, temperature, humidity, rainfall || 0),
      recommendationType: recommendationType
    }));

    setTimeout(() => {
      setCropRecommendations({
        success: true,
        crops: cropsWithInfo,
        weatherConditions: {
          temperature: Math.round(temperature),
          humidity: Math.round(humidity),
          rainfall: rainfall || 0,
          soilType: soilType,
          location: location
        },
        recommendationType: recommendationType
      });
      setCropLoading(false);
    }, 1000);
  };

  const calculateMatchPercentage = (crop, temp, humidity, rainfall) => {
    let score = 75; // Base score
    
    // Temperature scoring
    if (crop.name === 'Rice' && temp >= 20 && temp <= 30) score += 15;
    if (crop.name === 'Wheat' && temp >= 15 && temp <= 25) score += 15;
    if (crop.name === 'Sugarcane' && temp >= 20 && temp <= 35) score += 15;
    if (crop.name === 'Cotton' && temp >= 21 && temp <= 37) score += 15;
    if (crop.name === 'Millets' && temp >= 25 && temp <= 35) score += 15;
    if (crop.name === 'Maize' && temp >= 18 && temp <= 32) score += 15;
    if (crop.name === 'Groundnut' && temp >= 25 && temp <= 35) score += 15;
    if (crop.name === 'Potato' && temp >= 15 && temp <= 25) score += 15;
    if (crop.name === 'Apple' && temp >= 10 && temp <= 20) score += 15;
    if (crop.name === 'Tea' && temp >= 15 && temp <= 30) score += 15;
    if (crop.name === 'Coffee' && temp >= 15 && temp <= 25) score += 15;
    
    // Soil bonus (for soil-based recommendations)
    if (crop.soilType && crop.soilType.toLowerCase() === soilType.toLowerCase()) score += 10;
    
    // Humidity bonus (for location-based recommendations)
    if (crop.idealHumidity) {
      if (crop.idealHumidity.includes('>') && humidity > 60) score += 10;
      if (crop.idealHumidity.includes('<') && humidity < 50) score += 10;
    }
    
    return Math.min(95, Math.max(60, score)); // Keep between 60-95%
  };

  // Get weather data
  const getWeather = async (e) => {
    e?.preventDefault();
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Sample weather data based on location
      let sampleWeatherData;
      
      if (city.toLowerCase().includes('mumbai') || city.toLowerCase().includes('goa') || city.toLowerCase().includes('chennai')) {
        // Coastal cities
        sampleWeatherData = {
          temperature: 28,
          humidity: 78,
          rainfall: 60,
          location: `${city}, Coastal Region`,
          description: 'humid and warm',
          icon: '10d',
          feels_like: 30,
          temp_min: 26,
          temp_max: 30,
          windSpeed: 3.5,
          pressure: 1013,
          visibility: 10000,
          sunrise: 1673942400,
          sunset: 1673985600
        };
      } else if (city.toLowerCase().includes('rajasthan') || city.toLowerCase().includes('telangana')) {
        // Dry regions
        sampleWeatherData = {
          temperature: 35,
          humidity: 40,
          rainfall: 10,
          location: `${city}, Dry Region`,
          description: 'hot and dry',
          icon: '01d',
          feels_like: 37,
          temp_min: 30,
          temp_max: 38,
          windSpeed: 4.2,
          pressure: 1008,
          visibility: 12000,
          sunrise: 1673942400,
          sunset: 1673985600
        };
      } else if (city.toLowerCase().includes('punjab') || city.toLowerCase().includes('haryana')) {
        // Plains
        sampleWeatherData = {
          temperature: 22,
          humidity: 55,
          rainfall: 35,
          location: `${city}, Plains Region`,
          description: 'pleasant and clear',
          icon: '02d',
          feels_like: 23,
          temp_min: 20,
          temp_max: 25,
          windSpeed: 2.5,
          pressure: 1015,
          visibility: 15000,
          sunrise: 1673942400,
          sunset: 1673985600
        };
      } else if (city.toLowerCase().includes('himachal') || city.toLowerCase().includes('uttarakhand')) {
        // Hilly regions
        sampleWeatherData = {
          temperature: 18,
          humidity: 65,
          rainfall: 45,
          location: `${city}, Hilly Region`,
          description: 'cool and breezy',
          icon: '03d',
          feels_like: 16,
          temp_min: 15,
          temp_max: 20,
          windSpeed: 3.8,
          pressure: 1020,
          visibility: 8000,
          sunrise: 1673942400,
          sunset: 1673985600
        };
      } else {
        // Default
        sampleWeatherData = {
          temperature: 25,
          humidity: 60,
          rainfall: 40,
          location: `${city}, General Region`,
          description: 'partly cloudy',
          icon: '02d',
          feels_like: 26,
          temp_min: 22,
          temp_max: 28,
          windSpeed: 3.5,
          pressure: 1013,
          visibility: 10000,
          sunrise: 1673942400,
          sunset: 1673985600
        };
      }
      
      setWeather(sampleWeatherData);
      
      // Save to recent searches
      const search = {
        city: city,
        temp: Math.round(sampleWeatherData.temperature),
        icon: sampleWeatherData.icon,
        timestamp: new Date().toLocaleTimeString(),
        location: sampleWeatherData.location
      };

      setRecentSearches(prev => {
        const filtered = prev.filter(s => s.city.toLowerCase() !== city.toLowerCase());
        const updated = [search, ...filtered.slice(0, 4)];
        localStorage.setItem('recentWeatherSearches', JSON.stringify(updated));
        return updated;
      });

      // Sample forecast
      const sampleForecast = {
        success: true,
        city: { name: city },
        forecast: [
          { date: new Date(Date.now() + 86400000).toISOString().split('T')[0], temp: { avg: 26, min: 23, max: 29 }, weather: { description: 'sunny', icon: '01d' }, humidity: 60, windSpeed: 3.2 },
          { date: new Date(Date.now() + 172800000).toISOString().split('T')[0], temp: { avg: 27, min: 24, max: 30 }, weather: { description: 'partly cloudy', icon: '02d' }, humidity: 65, windSpeed: 3.5 },
          { date: new Date(Date.now() + 259200000).toISOString().split('T')[0], temp: { avg: 25, min: 22, max: 28 }, weather: { description: 'light rain', icon: '10d' }, humidity: 75, windSpeed: 4.0 },
          { date: new Date(Date.now() + 345600000).toISOString().split('T')[0], temp: { avg: 24, min: 21, max: 27 }, weather: { description: 'cloudy', icon: '04d' }, humidity: 70, windSpeed: 3.8 },
          { date: new Date(Date.now() + 432000000).toISOString().split('T')[0], temp: { avg: 26, min: 23, max: 29 }, weather: { description: 'clear', icon: '01d' }, humidity: 62, windSpeed: 3.0 }
        ]
      };
      
      setForecast(sampleForecast);
      
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getLocationWeather = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Sample data for location
            const sampleWeatherData = {
              temperature: 22,
              humidity: 70,
              rainfall: 25,
              location: 'Your Location, General Region',
              description: 'clear sky',
              icon: '01d',
              feels_like: 23,
              temp_min: 20,
              temp_max: 25,
              windSpeed: 2.5,
              pressure: 1015,
              visibility: 10000
            };
            
            setWeather(sampleWeatherData);
            setCity('Your Location');
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
    }
  };

  useEffect(() => {
    // Load recent searches
    const saved = localStorage.getItem('recentWeatherSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
    
    // Load default city
    setCity('Mumbai');
  }, []);

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="weather-page">
      <div className="page">
        <h1 className="page-title">Real-time Weather & Crop Advice System</h1>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="weather-container"
        >
          {/* Search Section */}
          <div className="weather-search-section">
            <form onSubmit={getWeather} className="weather-search-form">
              <div className="search-input-group">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city name (e.g., Mumbai, Rajasthan, Punjab)..."
                  className="search-input"
                />
              </div>
              <div className="search-buttons">
                <button type="submit" className="btn btn-search" disabled={loading}>
                  {loading ? (
                    <>
                      <FaSpinner className="spinner" /> Loading...
                    </>
                  ) : (
                    <>
                      <FaSearch /> Get Weather
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  className="btn btn-location"
                  onClick={getLocationWeather}
                  disabled={loading}
                >
                  <FaLocationArrow /> Use My Location
                </button>
              </div>
            </form>

            {recentSearches.length > 0 && (
              <div className="recent-searches">
                <h4>Recent Searches:</h4>
                <div className="recent-cards">
                  {recentSearches.map((search, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="recent-card"
                      onClick={() => {
                        setCity(search.city);
                        getWeather();
                      }}
                    >
                      <div className="recent-city">{search.city}</div>
                      <div className="recent-temp">{search.temp}°C</div>
                      <div className="recent-icon">
                        {weatherIcons[search.icon] || <FaCloud />}
                      </div>
                      <div className="recent-time">{search.timestamp}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="error-message"
            >
              {error}
            </motion.div>
          )}

          {/* Weather Display */}
          <AnimatePresence>
            {weather && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="weather-display"
              >
                {/* Tabs */}
                <div className="weather-tabs">
                  <button
                    className={`tab-btn ${activeTab === 'current' ? 'active' : ''}`}
                    onClick={() => setActiveTab('current')}
                  >
                    Current Weather
                  </button>
                  <button
                    className={`tab-btn ${activeTab === 'forecast' ? 'active' : ''}`}
                    onClick={() => setActiveTab('forecast')}
                  >
                    5-Day Forecast
                  </button>
                  <button
                    className={`tab-btn ${activeTab === 'crops' ? 'active' : ''}`}
                    onClick={() => setActiveTab('crops')}
                  >
                    Crop Recommendations
                  </button>
                </div>

                {/* Current Weather Tab */}
                {activeTab === 'current' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="current-weather"
                  >
                    <div className="current-weather-header">
                      <div className="location-info">
                        <h2 className="location">
                          <FaMapMarkerAlt /> {weather.location}
                        </h2>
                        <p className="weather-description">
                          {weather.description.charAt(0).toUpperCase() + weather.description.slice(1)}
                        </p>
                        <p className="update-time">
                          Updated: {new Date().toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="temperature-display">
                        <div className="temp-main">
                          {Math.round(weather.temperature)}°C
                        </div>
                        <div className="temp-feels">
                          Feels like {Math.round(weather.feels_like || weather.temperature)}°C
                        </div>
                      </div>
                      <div className="weather-icon-large">
                        {weatherIcons[weather.icon] || <FaCloud />}
                      </div>
                    </div>

                    <div className="weather-stats-grid">
                      <div className="stat-card">
                        <FaThermometerHalf className="stat-icon" />
                        <div className="stat-content">
                          <div className="stat-label">Temperature</div>
                          <div className="stat-value">
                            {Math.round(weather.temperature)}°C
                          </div>
                        </div>
                      </div>
                      
                      <div className="stat-card">
                        <FaTint className="stat-icon" />
                        <div className="stat-content">
                          <div className="stat-label">Humidity</div>
                          <div className="stat-value">{weather.humidity}%</div>
                        </div>
                      </div>
                      
                      <div className="stat-card">
                        <FaCloudRain className="stat-icon" />
                        <div className="stat-content">
                          <div className="stat-label">Rainfall</div>
                          <div className="stat-value">
                            {weather.rainfall || 0} mm
                          </div>
                        </div>
                      </div>
                      
                      <div className="stat-card">
                        <FaWind className="stat-icon" />
                        <div className="stat-content">
                          <div className="stat-label">Wind Speed</div>
                          <div className="stat-value">{weather.windSpeed} m/s</div>
                        </div>
                      </div>
                      
                      <div className="stat-card">
                        <FaArrowUp className="stat-icon" />
                        <div className="stat-content">
                          <div className="stat-label">Pressure</div>
                          <div className="stat-value">{weather.pressure} hPa</div>
                        </div>
                      </div>
                      
                      <div className="stat-card">
                        <FaEye className="stat-icon" />
                        <div className="stat-content">
                          <div className="stat-label">Visibility</div>
                          <div className="stat-value">
                            {(weather.visibility / 1000).toFixed(1)} km
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Get Crop Recommendations Button */}
                    <div className="crop-advice-cta">
                      <h3><FaSeedling /> Get Smart Crop Recommendations</h3>
                      <p>Based on current weather and soil conditions:</p>
                      <div className="weather-summary">
                        <div className="summary-item">
                          <span className="label">Location:</span>
                          <span className="value">{weather.location}</span>
                        </div>
                        <div className="summary-item">
                          <span className="label">Temperature:</span>
                          <span className="value">{Math.round(weather.temperature)}°C</span>
                        </div>
                        <div className="summary-item">
                          <span className="label">Humidity:</span>
                          <span className="value">{weather.humidity}%</span>
                        </div>
                        <div className="summary-item">
                          <span className="label">Rainfall:</span>
                          <span className="value">{weather.rainfall || 0} mm</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveTab('crops')}
                        className="btn btn-crop-advice"
                      >
                        <FaArrowRight /> View Crop Recommendations
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Forecast Tab */}
                {activeTab === 'forecast' && forecast && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="forecast-container"
                  >
                    <h3 className="forecast-title">
                      <FaCalendarAlt /> 5-Day Forecast for {forecast.city.name}
                    </h3>
                    
                    <div className="forecast-grid">
                      {forecast.forecast.map((day, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          className="forecast-card"
                        >
                          <div className="forecast-date">{formatDate(day.date)}</div>
                          <div className="forecast-icon">
                            {weatherIcons[day.weather.icon] || <FaCloud />}
                          </div>
                          <div className="forecast-temp">
                            <div className="temp-high">
                              <FaTemperatureHigh /> {Math.round(day.temp.max)}°C
                            </div>
                            <div className="temp-low">
                              <FaTemperatureLow /> {Math.round(day.temp.min)}°C
                            </div>
                          </div>
                          <div className="forecast-desc">
                            {day.weather.description}
                          </div>
                          <div className="forecast-details">
                            <span className="detail-item">
                              <FaTint /> {day.humidity}%
                            </span>
                            <span className="detail-item">
                              <FaWind /> {day.windSpeed} m/s
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Crop Recommendations Tab */}
                {activeTab === 'crops' && weather && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="crop-recommendations-container"
                  >
                    <div className="crop-recommendations-header">
                      <h2><FaSeedling /> Smart Crop Recommendations</h2>
                      <p className="conditions-summary">
                        Based on {weather.location}: {Math.round(weather.temperature)}°C, {weather.humidity}% humidity, {weather.rainfall || 0}mm rainfall
                      </p>
                      <div className="region-badge">
                        {weather.location.includes('Coastal') && '🌊 Coastal Region'}
                        {weather.location.includes('Dry') && '🌵 Dry Region'}
                        {weather.location.includes('Plains') && '🌾 Plains Region'}
                        {weather.location.includes('Hilly') && '⛰ Hilly Region'}
                        {weather.location.includes('General') && '🌍 General Region'}
                      </div>
                    </div>

                    <div className="recommendation-type-selector">
                      <h3>Choose Recommendation Type:</h3>
                      <div className="type-buttons">
                        <button
                          className={`type-btn ${recommendationType === 'location' ? 'active' : ''}`}
                          onClick={() => setRecommendationType('location')}
                        >
                          <FaMapMarkerAlt /> Location-Based
                          <span className="type-desc">Based on regional climate patterns</span>
                        </button>
                        <button
                          className={`type-btn ${recommendationType === 'soil' ? 'active' : ''}`}
                          onClick={() => setRecommendationType('soil')}
                        >
                          <FaLeaf /> Soil-Based
                          <span className="type-desc">Based on soil type characteristics</span>
                        </button>
                      </div>
                    </div>

                    <div className="soil-selection">
                      <h3>Select Soil Type:</h3>
                      <div className="soil-buttons">
                        {soilTypes.map(type => (
                          <button
                            key={type}
                            className={`soil-btn ${soilType === type ? 'active' : ''}`}
                            onClick={() => setSoilType(type)}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                      <p className="current-selection">
                        Currently: <strong>{recommendationType === 'location' ? 'Location-Based' : 'Soil-Based'}</strong> recommendations with <strong>{soilType}</strong> soil
                      </p>
                    </div>

                    <div className="get-recommendations-btn">
                      <button 
                        onClick={getCropRecommendations}
                        disabled={cropLoading}
                        className="btn btn-get-recommendations"
                      >
                        {cropLoading ? (
                          <>
                            <FaSpinner className="spinner" /> Analyzing Conditions...
                          </>
                        ) : recommendationType === 'location' ? (
                          <>
                            <FaMapMarkerAlt /> Get Location-Based Recommendations
                          </>
                        ) : (
                          <>
                            <FaLeaf /> Get Soil-Based Recommendations
                          </>
                        )}
                      </button>
                    </div>

                    {/* Crop Recommendations Results */}
                    {cropRecommendations && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="crop-results"
                      >
                        <div className="results-header">
                          <h3>
                            <FaCheck /> {cropRecommendations.recommendationType === 'location' ? 'Location-Based' : 'Soil-Based'} Recommended Crops
                            <span className="results-count">({cropRecommendations.crops.length} crops)</span>
                          </h3>
                          <p className="results-summary">
                            {cropRecommendations.recommendationType === 'location' 
                              ? `Based on ${cropRecommendations.weatherConditions.location} analysis`
                              : `Based on ${cropRecommendations.weatherConditions.soilType} soil analysis`
                            }
                          </p>
                        </div>

                        <div className="crops-grid">
                          {cropRecommendations.crops.map((crop, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                              className="crop-card"
                            >
                              <div className="crop-header">
                                <div className="crop-icon">{crop.icon}</div>
                                <div className="crop-title">
                                  <h4 className="crop-name">{crop.name}</h4>
                                  <div className="crop-category">
                                    {cropRecommendations.recommendationType === 'location' 
                                      ? <span className="crop-region">{crop.region}</span>
                                      : <span className="crop-soil">{crop.soilType} Soil</span>
                                    }
                                  </div>
                                </div>
                                <div className="match-badge">
                                  {crop.matchPercentage}%
                                </div>
                              </div>
                              
                              <div className="crop-content">
                                <p className="crop-reason">
                                  <FaInfoCircle /> {crop.reason}
                                </p>
                                
                                <div className="crop-requirements">
                                  <h5>Ideal Conditions:</h5>
                                  <div className="requirements-grid">
                                    <div className="requirement">
                                      <div className="req-label">Temperature</div>
                                      <div className="req-value">{crop.idealTemp}</div>
                                    </div>
                                    <div className="requirement">
                                      <div className="req-label">{crop.idealHumidity ? 'Humidity' : 'Rainfall'}</div>
                                      <div className="req-value">{crop.idealHumidity || crop.idealRainfall}</div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="crop-match">
                                  <div className="match-bar">
                                    <div 
                                      className="match-fill"
                                      style={{ width: `${crop.matchPercentage}%` }}
                                    ></div>
                                  </div>
                                  <div className="match-text">Match Score</div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        <div className="recommendation-notes">
                          <h4><FaInfoCircle /> Important Notes:</h4>
                          <ul>
                            {cropRecommendations.recommendationType === 'location' ? (
                              <>
                                <li>Coastal regions favor humidity-loving crops like Rice and Coconut</li>
                                <li>Dry regions are suitable for drought-resistant crops like Millets and Pulses</li>
                                <li>Plains regions are ideal for Wheat, Sugarcane, and Rice with irrigation</li>
                                <li>Hilly regions support cool climate crops like Apple and Potato</li>
                              </>
                            ) : (
                              <>
                                <li><strong>Alluvial:</strong> Fertile soil ideal for Rice, Wheat, Sugarcane</li>
                                <li><strong>Black:</strong> Moisture-retaining soil for Cotton, Soybean, Groundnut</li>
                                <li><strong>Red:</strong> Low fertility soil suitable for Millets, Pulses, Groundnut</li>
                                <li><strong>Laterite:</strong> Acidic soil perfect for Tea, Coffee, Cashew</li>
                                <li><strong>Sandy:</strong> Fast-draining soil for Groundnut, Watermelon, Carrot</li>
                                <li><strong>Clayey:</strong> Water-retaining soil for Rice, Jute, Sugarcane</li>
                                <li><strong>Loamy:</strong> Best overall soil for most crops</li>
                              </>
                            )}
                            <li>Always consult local agricultural experts before planting</li>
                            <li>Consider soil testing for accurate fertilizer recommendations</li>
                            <li>Monitor weather forecasts for any significant changes</li>
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        <button
  onClick={() => navigate("/")}
  style={{
    padding: "10px 18px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #10B981, #34D399)",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: "1rem"
  }}
>
  ← Back to Home
</button>

      </div>

      <style>{`
        .weather-page {
          min-height: 100vh;
          padding: 1rem;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .weather-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .weather-search-section {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .weather-search-form {
          display: grid;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .search-input-group {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
        }

        .search-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border: 2px solid #e0e6ed;
          border-radius: 10px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #2d5a5f;
          box-shadow: 0 0 0 3px rgba(45, 90, 95, 0.1);
        }

        .search-buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-search {
          background: #2d5a5f;
          color: white;
          flex: 1;
        }

        .btn-location {
          background: #667eea;
          color: white;
          flex: 1;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .recent-searches {
          margin-top: 1rem;
        }

        .recent-searches h4 {
          margin-bottom: 1rem;
          color: #2d5a5f;
        }

        .recent-cards {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          padding: 0.5rem;
        }

        .recent-card {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 1rem;
          min-width: 120px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .recent-card:hover {
          transform: translateY(-5px);
          background: white;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .recent-city {
          font-weight: 600;
          color: #2d5a5f;
          margin-bottom: 0.5rem;
        }

        .recent-temp {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ff6b6b;
          margin-bottom: 0.5rem;
        }

        .recent-icon {
          font-size: 2rem;
          color: #FFD700;
          margin-bottom: 0.5rem;
        }

        .recent-time {
          font-size: 0.8rem;
          color: #666;
        }

        .error-message {
          background: #ffebee;
          color: #c62828;
          padding: 1rem;
          border-radius: 10px;
          margin-bottom: 1rem;
          text-align: center;
          border-left: 4px solid #c62828;
        }

        .weather-display {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .weather-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          border-bottom: 2px solid #e0e6ed;
          padding-bottom: 1rem;
        }

        .tab-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          background: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #666;
        }

        .tab-btn:hover {
          background: rgba(45, 90, 95, 0.1);
          color: #2d5a5f;
        }

        .tab-btn.active {
          background: #2d5a5f;
          color: white;
        }

        .current-weather-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 2px solid #e0e6ed;
        }

        @media (max-width: 768px) {
          .current-weather-header {
            flex-direction: column;
            text-align: center;
            gap: 1.5rem;
          }
        }

        .location-info h2 {
          font-size: 2rem;
          color: #2d5a5f;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .weather-description {
          color: #666;
          margin-bottom: 0.5rem;
          text-transform: capitalize;
        }

        .update-time {
          color: #888;
          font-size: 0.9rem;
        }

        .temperature-display {
          text-align: center;
        }

        .temp-main {
          font-size: 3rem;
          font-weight: 800;
          color: #ff6b6b;
          line-height: 1;
        }

        .temp-feels {
          color: #666;
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        .weather-icon-large {
          font-size: 4rem;
          color: #FFD700;
        }

        .weather-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          font-size: 1.5rem;
          color: #2d5a5f;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #666;
          margin-bottom: 0.25rem;
        }

        .stat-value {
          font-size: 1.2rem;
          font-weight: 600;
          color: #2d5a5f;
        }

        .crop-advice-cta {
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
          color: white;
          border-radius: 15px;
          padding: 2rem;
          text-align: center;
          margin-top: 2rem;
        }

        .crop-advice-cta h3 {
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .crop-advice-cta p {
          opacity: 0.9;
          margin-bottom: 1.5rem;
        }

        .weather-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          padding: 1rem;
          border-radius: 10px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .summary-item .label {
          font-weight: 500;
        }

        .summary-item .value {
          font-weight: 700;
          font-size: 1.1rem;
        }

        .btn-crop-advice {
          background: white;
          color: #4CAF50;
          font-size: 1.1rem;
          padding: 1rem 2rem;
        }

        .forecast-container {
          margin-top: 1rem;
        }

        .forecast-title {
          color: #2d5a5f;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .forecast-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .forecast-card {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s ease;
        }

        .forecast-card:hover {
          background: white;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .forecast-date {
          font-weight: 600;
          color: #2d5a5f;
          margin-bottom: 1rem;
        }

        .forecast-icon {
          font-size: 2rem;
          color: #FFD700;
          margin: 1rem 0;
        }

        .temp-high, .temp-low {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin: 0.5rem 0;
          font-size: 0.9rem;
        }

        .temp-high {
          color: #ff6b6b;
        }

        .temp-low {
          color: #667eea;
        }

        .forecast-desc {
          color: #666;
          font-size: 0.8rem;
          margin: 1rem 0;
          text-transform: capitalize;
        }

        .forecast-details {
          display: flex;
          justify-content: space-around;
          font-size: 0.7rem;
          color: #888;
        }

        /* Crop Recommendations Styles */
        .crop-recommendations-container {
          margin-top: 1rem;
        }

        .crop-recommendations-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .crop-recommendations-header h2 {
          color: #2d5a5f;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .conditions-summary {
          color: #666;
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }

        .region-badge {
          display: inline-block;
          background: rgba(76, 175, 80, 0.1);
          color: #2e7d32;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.9rem;
          border: 2px solid #4CAF50;
        }

        .recommendation-type-selector {
          background: #f8f9fa;
          border-radius: 15px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .recommendation-type-selector h3 {
          color: #2d5a5f;
          margin-bottom: 1rem;
        }

        .type-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .type-btn {
          background: white;
          border: 2px solid #e0e6ed;
          border-radius: 10px;
          padding: 1.5rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .type-btn:hover {
          border-color: #4CAF50;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .type-btn.active {
          background: #4CAF50;
          color: white;
          border-color: #4CAF50;
        }

        .type-btn svg {
          font-size: 2rem;
        }

        .type-desc {
          font-size: 0.8rem;
          opacity: 0.8;
          margin-top: 0.5rem;
        }

        .soil-selection {
          background: #f8f9fa;
          border-radius: 15px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .soil-selection h3 {
          color: #2d5a5f;
          margin-bottom: 1rem;
        }

        .soil-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .soil-btn {
          padding: 0.5rem 1rem;
          border: 2px solid #e0e6ed;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .soil-btn:hover {
          border-color: #4CAF50;
          background: rgba(76, 175, 80, 0.05);
        }

        .soil-btn.active {
          background: #4CAF50;
          color: white;
          border-color: #4CAF50;
        }

        .current-selection {
          color: #666;
          font-size: 0.9rem;
          background: white;
          padding: 0.75rem;
          border-radius: 8px;
          border-left: 4px solid #4CAF50;
        }

        .get-recommendations-btn {
          text-align: center;
          margin-bottom: 2rem;
        }

        .btn-get-recommendations {
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
          color: white;
          padding: 1rem 2rem;
          font-size: 1.1rem;
        }

        .crop-results {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .results-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .results-header h3 {
          color: #2d5a5f;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .results-count {
          background: #e8f5e9;
          color: #2e7d32;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 1rem;
          margin-left: 0.5rem;
        }

        .results-summary {
          color: #666;
          max-width: 600px;
          margin: 0 auto;
        }

        .crops-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin: 2rem 0;
        }

        .crop-card {
          background: #f8f9fa;
          border-radius: 15px;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .crop-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }

        .crop-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .crop-icon {
          font-size: 2rem;
        }

        .crop-title {
          flex: 1;
        }

        .crop-name {
          color: #2d5a5f;
          font-size: 1.2rem;
          margin: 0 0 0.25rem 0;
        }

        .crop-category span {
          font-size: 0.8rem;
          color: #666;
          background: rgba(45, 90, 95, 0.1);
          padding: 0.25rem 0.5rem;
          border-radius: 10px;
          display: inline-block;
        }

        .match-badge {
          background: #4CAF50;
          color: white;
          padding: 0.5rem 0.75rem;
          border-radius: 15px;
          font-size: 1rem;
          font-weight: 700;
          min-width: 60px;
          text-align: center;
        }

        .crop-content {
          margin-top: 1rem;
        }

        .crop-reason {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 1rem;
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .crop-requirements {
          margin-bottom: 1.5rem;
        }

        .crop-requirements h5 {
          color: #2d5a5f;
          margin-bottom: 0.75rem;
        }

        .requirements-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
        }

        .requirement {
          background: white;
          padding: 0.5rem;
          border-radius: 8px;
          text-align: center;
        }

        .req-label {
          font-size: 0.7rem;
          color: #666;
          margin-bottom: 0.25rem;
        }

        .req-value {
          font-size: 0.9rem;
          font-weight: 600;
          color: #2d5a5f;
        }

        .crop-match {
          margin-top: 1rem;
        }

        .match-bar {
          height: 8px;
          background: #e0e6ed;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .match-fill {
          height: 100%;
          background: linear-gradient(90deg, #4CAF50 0%, #45a049 100%);
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .match-text {
          text-align: center;
          font-size: 0.8rem;
          color: #666;
          font-weight: 500;
        }

        .recommendation-notes {
          background: #e8f5e9;
          border-radius: 15px;
          padding: 1.5rem;
          margin-top: 2rem;
        }

        .recommendation-notes h4 {
          color: #2e7d32;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .recommendation-notes ul {
          list-style: none;
          padding: 0;
        }

        .recommendation-notes li {
          padding: 0.5rem 0;
          padding-left: 1.5rem;
          position: relative;
          color: #666;
          font-size: 0.9rem;
        }

        .recommendation-notes li:before {
          content: '•';
          position: absolute;
          left: 0;
          color: #4CAF50;
          font-weight: bold;
        }

        @media (max-width: 768px) {
          .search-buttons {
            flex-direction: column;
          }
          
          .weather-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .forecast-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .crops-grid {
            grid-template-columns: 1fr;
          }
          
          .requirements-grid {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
          
          .soil-buttons {
            justify-content: center;
          }
          
          .weather-summary {
            grid-template-columns: 1fr;
          }
          
          .type-buttons {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .weather-stats-grid {
            grid-template-columns: 1fr;
          }
          
          .forecast-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Weather;