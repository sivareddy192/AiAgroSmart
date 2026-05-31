import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CropAnimation from '../components/CropAnimation';
import API_URL from '../utils/api';
import { authenticatedFetch } from '../utils/apiService';
import { getUserFromToken } from '../utils/auth';

import { 
  FaCamera, 
  FaSpinner, 
  FaMicrochip, 
  FaTachometerAlt, 
  FaSeedling,
  FaArrowLeft,
  FaCheckCircle,
  FaDatabase
} from 'react-icons/fa';

const SoilScanner = () => {
  const navigate = useNavigate();
  const user = getUserFromToken();

  const [nVal, setNVal] = useState(50);
  const [pVal, setPVal] = useState(50);
  const [kVal, setKVal] = useState(50);
  const [phVal, setPhVal] = useState(6.5);
  const [moisture, setMoisture] = useState(45);

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [weather, setWeather] = useState(null);
  const [bestCrop, setBestCrop] = useState(null);
  const [diagnostics, setDiagnostics] = useState(null);
  const [error, setError] = useState('');

  // Camera integration state
  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = React.useRef(null);

  // Custom visual scan states
  const [capturedImage, setCapturedImage] = useState(null);
  const [detectedSoil, setDetectedSoil] = useState('');
  const [analyzerStatus, setAnalyzerStatus] = useState('');

  const startCamera = async () => {
    try {
      setCameraError('');
      setCapturedImage(null);
      setDetectedSoil('');
      setError('');
      // Request video with environmental facing mode (rear camera if available)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      setStream(mediaStream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("Webcam/Camera access denied or unavailable. Running in digital scan mode.");
      setCameraActive(true); // Enable fallback simulation layout
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const resetScanner = () => {
    setBestCrop(null);
    setDiagnostics(null);
    setCapturedImage(null);
    setDetectedSoil('');
    setError('');
    // Re-verify stream status
    if (stream) {
      // Re-link existing stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } else {
      startCamera();
    }
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Load weather telemetry proxy from localStorage
  useEffect(() => {
    const savedWeather = localStorage.getItem('lastWeatherData');
    if (savedWeather) {
      setWeather(JSON.parse(savedWeather));
    } else {
      // Default fallback weather
      setWeather({
        temperature: 24,
        humidity: 62,
        rainfall: 600,
        location: 'Local Field'
      });
    }
  }, []);

  // Handle active camera unmount cleanup
  useEffect(() => {
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runSoilScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    setBestCrop(null);
    setDiagnostics(null);
    setError('');

    let capturedImg = null;
    let computedSoil = 'Loamy Soil';
    let databaseSoil = 'Loamy';
    let estimatedN = nVal;
    let estimatedP = pVal;
    let estimatedK = kVal;
    let estimatedPH = phVal;
    let estimatedMoisture = moisture;

    // Capture snapshot if camera active and stream exists
    if (cameraActive && videoRef.current && !cameraError && stream) {
      try {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        capturedImg = canvas.toDataURL('image/jpeg');
        setCapturedImage(capturedImg);

        // Perform color analysis on captured pixels
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        let rSum = 0, gSum = 0, bSum = 0;
        const step = 40; // Sample every 10 pixels to optimize performance
        let count = 0;
        for (let i = 0; i < data.length; i += step) {
          rSum += data[i];
          gSum += data[i+1];
          bSum += data[i+2];
          count++;
        }
        const rAvg = rSum / count;
        const gAvg = gSum / count;
        const bAvg = bSum / count;

        console.log(`Analyzing soil average RGB: R=${Math.round(rAvg)}, G=${Math.round(gAvg)}, B=${Math.round(bAvg)}`);

        // Soil type classification from camera color feed
        if (rAvg > gAvg + 15 && rAvg > bAvg + 15) {
          // Reddish tones
          computedSoil = 'Red Soil';
          databaseSoil = 'Sandy Loam';
          estimatedN = 35;
          estimatedP = 40;
          estimatedK = 50;
          estimatedPH = 6.2;
          estimatedMoisture = 22;
        } else if (rAvg < 85 && gAvg < 85 && bAvg < 85) {
          // Dark tones
          computedSoil = 'Black Soil';
          databaseSoil = 'Clay Loam';
          estimatedN = 75;
          estimatedP = 45;
          estimatedK = 80;
          estimatedPH = 7.6;
          estimatedMoisture = 55;
        } else if (rAvg > 145 && gAvg > 125 && bAvg > 90) {
          // Yellowish sandy tones
          computedSoil = 'Sandy Soil';
          databaseSoil = 'Sandy Loam';
          estimatedN = 25;
          estimatedP = 30;
          estimatedK = 35;
          estimatedPH = 5.8;
          estimatedMoisture = 15;
        } else if (rAvg > 95 && gAvg > 95 && bAvg > 85 && Math.abs(rAvg - gAvg) < 15) {
          // Dense grey/brown clay tones
          computedSoil = 'Clay Soil';
          databaseSoil = 'Clay';
          estimatedN = 55;
          estimatedP = 60;
          estimatedK = 65;
          estimatedPH = 6.8;
          estimatedMoisture = 68;
        } else {
          // Normal balanced loam brown
          computedSoil = 'Loamy Soil';
          databaseSoil = 'Loamy';
          estimatedN = 65;
          estimatedP = 55;
          estimatedK = 60;
          estimatedPH = 6.5;
          estimatedMoisture = 45;
        }
        setDetectedSoil(computedSoil);
      } catch (err) {
        console.error("Snapshot analysis failed", err);
      }
    } else {
      // Fallback: Digital simulation classification using manually adjusted sliders
      if (phVal < 5.8) {
        databaseSoil = moisture < 35 ? 'Sandy Loam' : 'Sandy Loam';
        computedSoil = moisture < 35 ? 'Sandy Soil' : 'Sandy Loam';
      } else if (phVal > 7.2) {
        databaseSoil = 'Clay Loam';
        computedSoil = 'Black Soil';
      } else {
        databaseSoil = moisture > 55 ? 'Clay' : (nVal > 60 ? 'Clay Loam' : 'Loamy');
        computedSoil = moisture > 55 ? 'Clay Soil' : (nVal > 60 ? 'Clay Loam' : 'Loamy Soil');
      }
      setDetectedSoil(computedSoil);
    }

    // Set up linear interpolation loop for slider indicators
    const nStart = nVal;
    const pStart = pVal;
    const kStart = kVal;
    const phStart = phVal;
    const mStart = moisture;

    const totalSteps = 20; // 3 seconds scan divided by 150ms steps
    let currentStep = 0;

    const scanInterval = setInterval(() => {
      currentStep++;
      const ratio = currentStep / totalSteps;
      setScanProgress(Math.min(100, Math.round(ratio * 100)));

      // Lerp sliders
      setNVal(Math.round(nStart + (estimatedN - nStart) * ratio));
      setPVal(Math.round(pStart + (estimatedP - pStart) * ratio));
      setKVal(Math.round(kStart + (estimatedK - kStart) * ratio));
      setPhVal(parseFloat((phStart + (estimatedPH - phStart) * ratio).toFixed(1)));
      setMoisture(Math.round(mStart + (estimatedMoisture - mStart) * ratio));

      // Telemetry matrix messages
      if (ratio < 0.25) {
        setAnalyzerStatus('📡 CAPTURING CAMERA TELEMETRY...');
      } else if (ratio < 0.5) {
        setAnalyzerStatus('🧬 ANALYZING SOIL COLOR SPECTRUM...');
      } else if (ratio < 0.75) {
        setAnalyzerStatus(`🧪 CLASSIFYING SOIL: ${computedSoil.toUpperCase()}`);
      } else {
        setAnalyzerStatus('🧠 RUNNING AI CROP SUITABILITY MODEL...');
      }

      if (currentStep >= totalSteps) {
        clearInterval(scanInterval);
      }
    }, 150);

    // Wait for the scanning sweep animations to finish
    await new Promise(resolve => setTimeout(resolve, 3200));

    try {
      const response = await authenticatedFetch(`${API_URL}/crops/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temperature: weather?.temperature || weather?.temp || 24,
          humidity: weather?.humidity || 60,
          rainfall: weather?.rainfall || 500,
          soilType: databaseSoil,
          location: `${weather?.location || 'Scanned Area'} (Soil Scanner)`
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze soil properties');
      }

      if (data && data.length > 0) {
        setBestCrop(data[0]); // Crop with best suitability score
        setDiagnostics({
          soilType: computedSoil,
          phRating: estimatedPH < 6.0 ? 'Acidic' : (estimatedPH > 7.0 ? 'Alkaline' : 'Neutral / Ideal'),
          nutrientStatus: (estimatedN + estimatedP + estimatedK) > 180 ? 'Rich Nutrients' : 'Moderate Nutrients',
          moistureLevel: estimatedMoisture < 30 ? 'Dry / Low' : (estimatedMoisture > 60 ? 'Wet / Hydrated' : 'Optimal Moisture')
        });
      } else {
        setError('No ideal crops found matching this specific soil chemistry. Adjust parameters to scan again.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error occurred querying the crop database.');
    } finally {
      setIsScanning(false);
    }
  };

  if (!user) return null;

  return (
    <div className="soil-scanner-page-root">
      <Navbar />

      <div className="scanner-content-wrapper">
        <div className="page-header-row">
          <button onClick={() => navigate('/')} className="btn-premium-outline">
            <FaArrowLeft /> <span>Back to Dashboard</span>
          </button>
          <h1 className="text-gradient">AI Soil Chemistry & Crop Scanner</h1>
        </div>

        <div className="scanner-grid-layout">
          {/* Left panel: Chemical & Nutrient Sliders */}
          <div className="scanner-left-pane glass-card">
            <h3>🔬 Chemical Soil Properties</h3>
            <p className="pane-helper-text">Adjust sliders below to input scanned chemical parameters manually, or start the camera scanner above to auto-detect:</p>

            <div className="nutrient-sliders-stack">
              <div className="slider-group">
                <div className="slider-labels">
                  <span>Nitrogen (N)</span>
                  <strong>{nVal} ppm</strong>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={nVal} 
                  onChange={(e) => setNVal(parseInt(e.target.value))}
                  className="range-input-n"
                  disabled={isScanning}
                />
              </div>

              <div className="slider-group">
                <div className="slider-labels">
                  <span>Phosphorus (P)</span>
                  <strong>{pVal} ppm</strong>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={pVal} 
                  onChange={(e) => setPVal(parseInt(e.target.value))}
                  className="range-input-p"
                  disabled={isScanning}
                />
              </div>

              <div className="slider-group">
                <div className="slider-labels">
                  <span>Potassium (K)</span>
                  <strong>{kVal} ppm</strong>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={kVal} 
                  onChange={(e) => setKVal(parseInt(e.target.value))}
                  className="range-input-k"
                  disabled={isScanning}
                />
              </div>

              <div className="slider-group">
                <div className="slider-labels">
                  <span>Soil pH Level</span>
                  <strong>{phVal} pH</strong>
                </div>
                <input 
                  type="range" 
                  min="3.5" 
                  max="9.0" 
                  step="0.1" 
                  value={phVal} 
                  onChange={(e) => setPhVal(parseFloat(e.target.value))}
                  className="range-input-ph"
                  disabled={isScanning}
                />
              </div>

              <div className="slider-group">
                <div className="slider-labels">
                  <span>Moisture Level</span>
                  <strong>{moisture}%</strong>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={moisture} 
                  onChange={(e) => setMoisture(parseInt(e.target.value))}
                  className="range-input-moisture"
                  disabled={isScanning}
                />
              </div>
            </div>

            <button 
              onClick={runSoilScan} 
              disabled={isScanning} 
              className="btn-premium btn-scan-trigger"
            >
              {isScanning ? (
                <>
                  <FaSpinner className="spinner" />
                  <span>Scanning Field Soil ({scanProgress}%)</span>
                </>
              ) : (
                <>
                  <FaCamera />
                  <span>Start AI Soil Diagnostics</span>
                </>
              )}
            </button>
          </div>

          {/* Right panel: Active Scanner Viewport & Matching Results */}
          <div className="scanner-right-pane">
            <div className="viewport-hud-card glass-card">
              {/* Scan viewport frame */}
              <div className={`scanner-hud-viewport ${isScanning ? 'active-scan' : ''}`}>
                <div className="hud-corner-tl" />
                <div className="hud-corner-tr" />
                <div className="hud-corner-bl" />
                <div className="hud-corner-br" />

                {/* Camera stream video feed - always in DOM, styled display */}
                <video 
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="scanner-video-feed"
                  style={{ display: cameraActive && !capturedImage && !cameraError ? 'block' : 'none' }}
                />

                {/* Captured Image display */}
                {capturedImage && (
                  <img 
                    src={capturedImage} 
                    alt="Captured Soil Snapshot" 
                    className="scanner-video-feed"
                  />
                )}

                {/* Scan guide target crosshair */}
                {cameraActive && !capturedImage && !isScanning && !cameraError && (
                  <div className="scan-target-reticle">
                    <div className="reticle-circle" />
                    <span>ALIGN SOIL TARGET</span>
                  </div>
                )}

                {isScanning && (
                  <>
                    <div className="laser-sweep-beam" />
                    <div className="scanner-hud-overlay">
                      <div className="hud-matrix-effect" />
                      <span>{analyzerStatus}</span>
                      <strong>{detectedSoil ? `${detectedSoil.toUpperCase()} | ` : ''}N: {nVal} | P: {pVal} | K: {kVal}</strong>
                    </div>
                  </>
                )}

                {/* Case 1: Camera Offline */}
                {!cameraActive && !isScanning && !bestCrop && (
                  <div className="viewport-empty-state">
                    <FaCamera className="icon-pulse" style={{ color: 'var(--accent-primary)' }} />
                    <h4>AI Camera Scanner is Offline</h4>
                    <p className="camera-err-msg">Start the live camera scanner to capture soil colors and automatically determine composition.</p>
                    <button 
                      onClick={startCamera} 
                      className="btn-premium"
                      style={{ marginTop: '1.25rem' }}
                    >
                      Turn On Camera Scanner
                    </button>
                  </div>
                )}

                {/* Case 2: Camera access failed / Digital simulation fallback */}
                {cameraActive && cameraError && !isScanning && !bestCrop && (
                  <div className="viewport-empty-state">
                    <FaMicrochip className="icon-pulse" />
                    <h4>Digital Simulation Mode</h4>
                    <p className="camera-err-msg">{cameraError}</p>
                    <button 
                      onClick={startCamera} 
                      className="btn-premium-outline"
                      style={{ marginTop: '1rem', color: '#fff' }}
                    >
                      Retry Connection
                    </button>
                  </div>
                )}

                {/* Case 3: Scan Complete Results Overlay */}
                {bestCrop && !isScanning && (
                  <div className="viewport-success-animation glass-overlay">
                    <div className="crop-match-radar">
                      <CropAnimation type={bestCrop.animation || 'wheat'} />
                    </div>
                    <div className="crop-radar-tag">
                      <FaCheckCircle className="text-green-500" />
                      <span>TARGET ACQUIRED: {bestCrop.name.toUpperCase()}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                      <button 
                        onClick={resetScanner} 
                        className="btn-premium"
                        style={{ padding: '0.4rem 1.2rem', fontSize: '0.8rem', borderRadius: '10px' }}
                      >
                        Scan Again
                      </button>
                      {cameraActive && !cameraError && (
                        <button 
                          onClick={stopCamera} 
                          className="btn-premium-outline"
                          style={{ padding: '0.4rem 1.2rem', fontSize: '0.8rem', borderRadius: '10px' }}
                        >
                          Close Camera
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              {isScanning && (
                <div className="scanner-hud-bar-container">
                  <div className="scanner-hud-bar" style={{ width: `${scanProgress}%` }} />
                </div>
              )}
            </div>

            {/* Results Block */}
            <AnimatePresence>
              {bestCrop && !isScanning && diagnostics && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="scanner-results-container glass-card"
                >
                  <div className="results-badge">
                    <h3>🏆 Best Matched Crop</h3>
                    <span className="scanned-suitability-pill">{bestCrop.confidence}% Suitability</span>
                  </div>

                  <div className="scanned-info-header">
                    <h2>{bestCrop.name}</h2>
                    <span className="scientific-italic">{bestCrop.scientificName}</span>
                  </div>

                  <p className="scanned-match-reason">
                    <strong>AI Recommendation:</strong> Based on the soil classification as <strong>{diagnostics.soilType}</strong> ({diagnostics.nutrientStatus}, {diagnostics.phRating} pH, and {diagnostics.moistureLevel}), combined with local environmental conditions, <strong>{bestCrop.name}</strong> will thrive here. {bestCrop.reason}
                  </p>

                  <div className="scanned-diagnostics-grid">
                    <div className="diagnostic-badge">
                      <FaTachometerAlt />
                      <div>
                        <span>pH Rating</span>
                        <strong>{diagnostics.phRating}</strong>
                      </div>
                    </div>
                    <div className="diagnostic-badge">
                      <FaSeedling />
                      <div>
                        <span>Soil Type</span>
                        <strong>{diagnostics.soilType}</strong>
                      </div>
                    </div>
                    <div className="diagnostic-badge">
                      <FaDatabase />
                      <div>
                        <span>Growth Phase</span>
                        <strong>{bestCrop.growthDuration} Days</strong>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <div className="scanner-error-card glass-card">
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .soil-scanner-page-root {
          min-height: 100vh;
          background-color: var(--bg-primary);
        }

        .scanner-content-wrapper {
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

        .scanner-grid-layout {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 2.5rem;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .scanner-grid-layout {
            grid-template-columns: 1fr;
          }
        }

        .scanner-left-pane h3 {
          font-size: 1.4rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .pane-helper-text {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
        }

        .nutrient-sliders-stack {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .slider-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .slider-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
        }

        .slider-labels span {
          color: var(--text-secondary);
        }

        .slider-labels strong {
          color: var(--accent-primary);
        }

        /* Color ranges inputs */
        .range-input-n, .range-input-p, .range-input-k, .range-input-ph, .range-input-moisture {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          background: rgba(255,255,255,0.05);
          border-radius: 3px;
          outline: none;
        }

        .range-input-n::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }

        .range-input-p::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ec4899;
          cursor: pointer;
        }

        .range-input-k::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #eab308;
          cursor: pointer;
        }

        .range-input-ph::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #a855f7;
          cursor: pointer;
        }

        .range-input-moisture::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #14b8a6;
          cursor: pointer;
        }

        .btn-scan-trigger {
          width: 100%;
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          font-weight: 700;
        }

        .viewport-hud-card {
          padding: 1.5rem;
          margin-bottom: 2rem;
          background: rgba(12,24,21,0.8);
        }

        .scanner-hud-viewport {
          position: relative;
          height: 320px;
          background: rgba(0, 0, 0, 0.7);
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(16, 185, 129, 0.15);
          transition: border-color 0.5s ease;
        }

        .scanner-hud-viewport.active-scan {
          border-color: var(--accent-primary);
          box-shadow: inset 0 0 30px rgba(16, 185, 129, 0.15);
        }

        /* HUD Corners styling */
        .hud-corner-tl, .hud-corner-tr, .hud-corner-bl, .hud-corner-br {
          position: absolute;
          width: 18px;
          height: 18px;
          border: 2px solid rgba(16, 185, 129, 0.4);
          pointer-events: none;
          z-index: 10;
        }

        .hud-corner-tl { top: 12px; left: 12px; border-right: none; border-bottom: none; }
        .hud-corner-tr { top: 12px; right: 12px; border-left: none; border-bottom: none; }
        .hud-corner-bl { bottom: 12px; left: 12px; border-right: none; border-top: none; }
        .hud-corner-br { bottom: 12px; right: 12px; border-left: none; border-top: none; }

        /* Reticle crosshair overlay */
        .scan-target-reticle {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          z-index: 8;
          pointer-events: none;
        }

        .reticle-circle {
          width: 60px;
          height: 60px;
          border: 2px dashed var(--accent-primary);
          border-radius: 50%;
          animation: spin-slow 15s linear infinite;
        }

        .scan-target-reticle span {
          font-size: 0.65rem;
          color: var(--accent-primary);
          font-weight: 800;
          letter-spacing: 0.1em;
          text-shadow: 0 0 4px rgba(0,0,0,0.8);
        }

        /* Sweeping laser light */
        .laser-sweep-beam {
          position: absolute;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, transparent 0%, var(--accent-primary) 50%, transparent 100%);
          box-shadow: 0 0 15px var(--accent-primary);
          animation: sweep 2.5s ease-in-out infinite alternate;
          z-index: 12;
        }

        @keyframes sweep {
          0% { top: 15px; }
          100% { top: 300px; }
        }

        .scanner-hud-overlay {
          position: absolute;
          bottom: 20px;
          left: 20px;
          display: flex;
          flex-direction: column;
          z-index: 15;
        }

        .scanner-hud-overlay span {
          font-size: 0.65rem;
          color: var(--accent-primary);
          font-weight: 800;
          letter-spacing: 0.1em;
          animation: blink 1s steps(2, start) infinite;
          text-shadow: 0 0 4px rgba(0,0,0,0.8);
        }

        .scanner-hud-overlay strong {
          font-size: 0.85rem;
          color: var(--text-primary);
          font-family: monospace;
          margin-top: 0.25rem;
          text-shadow: 0 0 4px rgba(0,0,0,0.8);
        }

        @keyframes blink {
          to { visibility: hidden; }
        }

        .viewport-empty-state {
          text-align: center;
          color: var(--text-secondary);
          padding: 2rem;
          z-index: 10;
        }

        .viewport-empty-state svg {
          font-size: 3rem;
          color: var(--accent-primary);
          margin-bottom: 1rem;
        }

        .icon-pulse {
          animation: icon-glow 2s infinite ease-in-out;
        }

        @keyframes icon-glow {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(255,255,255,0)); }
          50% { transform: scale(1.05); filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.3)); }
        }

        .viewport-success-animation {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .crop-match-radar {
          transform: scale(1.1);
        }

        .crop-radar-tag {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 12px;
          padding: 0.4rem 1rem;
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--accent-primary);
          letter-spacing: 0.05em;
        }

        .scanner-hud-bar-container {
          height: 4px;
          background: rgba(255,255,255,0.03);
          border-radius: 2px;
          overflow: hidden;
          margin-top: 1rem;
        }

        .scanner-hud-bar {
          height: 100%;
          background: var(--accent-primary);
          transition: width 0.15s ease-out;
        }

        .scanner-results-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .results-badge {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .results-badge h3 {
          font-size: 1.1rem;
          color: var(--text-primary);
        }

        .scanned-suitability-pill {
          background: var(--accent-light);
          color: var(--accent-primary);
          font-size: 0.8rem;
          font-weight: 700;
          padding: 0.3rem 0.75rem;
          border-radius: 10px;
        }

        .scanned-info-header h2 {
          font-size: 1.8rem;
          color: var(--text-primary);
        }

        .scientific-italic {
          font-size: 0.9rem;
          color: var(--text-muted);
          font-style: italic;
        }

        .scanned-match-reason {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0;
          background: rgba(255,255,255,0.01);
          padding: 0.85rem;
          border-radius: 10px;
          border-left: 3px solid var(--accent-primary);
        }

        .scanned-diagnostics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-top: 0.5rem;
        }

        .diagnostic-badge {
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .diagnostic-badge svg {
          font-size: 1.2rem;
          color: var(--accent-primary);
        }

        .diagnostic-badge div {
          display: flex;
          flex-direction: column;
        }

        .diagnostic-badge span {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .diagnostic-badge strong {
          font-size: 0.85rem;
          color: var(--text-primary);
        }

        .scanner-error-card {
          padding: 1.25rem;
          border-color: rgba(239, 68, 68, 0.25);
          background: rgba(239, 68, 68, 0.05);
          color: #fca5a5;
          font-size: 0.9rem;
        }

        .scanner-video-feed {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 1;
        }

        .glass-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(5, 11, 10, 0.75);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 5;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .camera-err-msg {
          font-size: 0.8rem;
          color: var(--text-secondary);
          max-width: 300px;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default SoilScanner;
