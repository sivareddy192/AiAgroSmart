import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Weather from './pages/Weather';
import CropRecommendation from './pages/CropRecommendation';
import SoilScanner from './pages/SoilScanner';
import History from './pages/History';
import Database from './pages/Database';
import CropDatabase from './pages/CropDatabase';
import ProtectedRoute from './components/ProtectedRoute';
import WeatherOnly from './pages/WeatherOnly';
import WeatherWithCrops from './pages/WeatherWithCrops';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/WeatherOnly" element={<WeatherOnly />} />
      <Route path="/WeatherWithCrops" element={<WeatherWithCrops />} />

      {/* Protected Routes */}
      <Route
        path="/weather"
        element={
          <ProtectedRoute>
            <Weather />
          </ProtectedRoute>
        }
      />

      <Route
        path="/crop-recommendation"
        element={
          <ProtectedRoute>
            <CropRecommendation />
          </ProtectedRoute>
        }
      />

      <Route
        path="/soil-scanner"
        element={
          <ProtectedRoute>
            <SoilScanner />
          </ProtectedRoute>
        }
      />

      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />

      <Route
        path="/database"
        element={
          <ProtectedRoute>
            <Database />
          </ProtectedRoute>
        }
      />

      <Route
        path="/crop-database"
        element={
          <ProtectedRoute>
            <CropDatabase />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
