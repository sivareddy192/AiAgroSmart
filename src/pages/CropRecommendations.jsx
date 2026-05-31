import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../utils/api.js';
import { FaSeedling } from 'react-icons/fa';

const CropRecommendation = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedWeather = localStorage.getItem('lastWeatherData');

    if (!savedWeather) {
      setError('No weather data found. Please check weather first.');
      setLoading(false);
      return;
    }

    const parsedWeather = JSON.parse(savedWeather);
    setWeatherData(parsedWeather);

    getCropRecommendations(parsedWeather);
  }, []);

  const getCropRecommendations = async (weather) => {
    try {
      const response = await axios.post(
        `${API_URL}/crop/recommend`,
        weather
      );

      if (response.data.success) {
        setCrops(response.data.crops);
      } else {
        setError('Failed to get crop recommendations');
      }
    } catch (err) {
      console.error(err);
      setError('Server error while fetching crop recommendations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading crop recommendations...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2><FaSeedling /> Crop Recommendations</h2>

      <p>
        <strong>Location:</strong> {weatherData.location}<br />
        <strong>Temperature:</strong> {weatherData.temperature}°C<br />
        <strong>Humidity:</strong> {weatherData.humidity}%<br />
        <strong>Rainfall:</strong> {weatherData.rainfall} mm
      </p>

      <h3>Suitable Crops:</h3>

      <ul>
        {crops.map((crop, index) => (
          <li key={index}>
            <strong>{crop.name}</strong> – {crop.reason}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CropRecommendation;
