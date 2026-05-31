import React, { useState } from "react";
import axios from "axios";
import crops from "../data/cropData";
import { motion } from "framer-motion";

// 🔑 OpenWeather API Key (YOUR KEY ADDED)
const API_KEY = "165ac561bb8fd08126ca6f2d23617262";

const CropRecommendation = () => {
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [weather, setWeather] = useState(null);
  const [recommendedCrops, setRecommendedCrops] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWeatherAndRecommend = async () => {
    if (!city || !region) {
      alert("Please enter city and select region");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );

      const temp = response.data.main.temp;
      const humidity = response.data.main.humidity;
      const rainfall =
        response.data.rain && response.data.rain["1h"] ? "High" : "Low";

      setWeather({ temp, humidity, rainfall });

      // 🌱 Crop filtering logic
      const filtered = crops.filter((crop) => {
        const minTemp = parseInt(crop.idealTemp.split("-")[0]);
        return (
          crop.region === region &&
          temp >= minTemp
        );
      });

      setRecommendedCrops(filtered);
    } catch (error) {
      alert("Invalid city or API error");
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">
        🌱 Crop Recommendation System
      </h2>

      {/* Inputs */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Enter City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="p-3 border rounded"
        />

        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="p-3 border rounded"
        >
          <option value="">Select Region</option>
          <option value="Coastal">Coastal</option>
          <option value="Dry/Arid">Dry / Arid</option>
          <option value="Plains">Plains</option>
          <option value="Hilly">Hilly</option>
          <option value="Tropical">Tropical</option>
        </select>

        <button
          onClick={fetchWeatherAndRecommend}
          className="bg-green-600 text-white rounded p-3 hover:bg-green-700"
        >
          {loading ? "Loading..." : "Get Crop Recommendation"}
        </button>
      </div>

      {/* Weather Display */}
      {weather && (
        <div className="bg-blue-50 p-4 rounded mb-6">
          <p>🌡️ Temperature: {weather.temp}°C</p>
          <p>💧 Humidity: {weather.humidity}%</p>
          <p>🌧️ Rainfall: {weather.rainfall}</p>
        </div>
      )}

      {/* Crop Results */}
      <div className="grid md:grid-cols-3 gap-4">
        {recommendedCrops.length > 0 ? (
          recommendedCrops.map((crop, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="p-4 border rounded shadow"
            >
              <h3 className="text-xl font-semibold">
                {crop.icon} {crop.name}
              </h3>
              <p className="text-gray-600 text-sm">{crop.reason}</p>
              <p className="text-sm">🌡️ {crop.idealTemp}</p>
              <p className="text-sm">💧 {crop.idealHumidity}</p>
              <p className="text-sm">🌧️ {crop.idealRainfall}</p>
            </motion.div>
          ))
        ) : (
          weather && <p>No suitable crops found</p>
        )}
      </div>
    </div>
  );
};

export default CropRecommendation;
