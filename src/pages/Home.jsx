import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getUserFromToken } from "../utils/auth";
import farm1 from "../assets/farm1.jpg";
import farm2 from "../assets/farm2.jpeg";

import {
  FaCloudSun,
  FaSeedling,
  FaArrowRight,
  FaPlay,
  FaStar,
  FaChevronRight,
  FaCheckCircle,
  FaCalendarAlt,
  FaTimes,
  FaWater,
  FaBug,
  FaClock,
  FaYoutube,
  FaLeaf,
  FaThermometerHalf,
  FaMicrochip
} from "react-icons/fa";

const heroBackgrounds = [farm1, farm2];

const Home = () => {
  const [currentCropIndex, setCurrentCropIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFarmingTips, setShowFarmingTips] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);

  // Background slider
  useEffect(() => {
    const bgInterval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % heroBackgrounds.length);
    }, 6000);
    return () => clearInterval(bgInterval);
  }, []);

  // Crop slider timer
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentCropIndex((prev) => (prev + 1) % crops.length);
        setIsAnimating(false);
      }, 500);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const farmingTips = [
    {
      id: 1,
      title: "Water Conservation",
      icon: <FaWater />,
      color: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
      tips: [
        "Water plants early morning or late evening to reduce evaporation",
        "Use drip irrigation systems for efficient water usage",
        "Collect rainwater in barrels for irrigation",
        "Mulch around plants to retain soil moisture"
      ]
    },
    {
      id: 2,
      title: "Pest Control",
      icon: <FaBug />,
      color: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
      tips: [
        "Plant marigolds to naturally repel pests",
        "Use neem oil as organic pesticide",
        "Introduce beneficial insects like ladybugs",
        "Practice crop rotation to break pest cycles"
      ]
    },
    {
      id: 3,
      title: "Soil Health",
      icon: <FaSeedling />,
      color: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
      tips: [
        "Test soil pH every 2-3 months",
        "Add compost regularly to improve soil structure",
        "Practice no-till farming to preserve soil microbes",
        "Use cover crops during off-season"
      ]
    },
    {
      id: 4,
      title: "Seasonal Planning",
      icon: <FaCalendarAlt />,
      color: "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)",
      tips: [
        "Plan crop rotation based on seasons",
        "Start seeds indoors 4-6 weeks before last frost",
        "Use succession planting for continuous harvest",
        "Monitor weather patterns for planting decisions"
      ]
    }
  ];

  const crops = [
    {
      emoji: "🌾",
      name: "Wheat",
      description: "Best grown in cool, temperate climates with well-drained soil",
      season: "Rabi Season",
      temp: "15-25°C",
      color: "#fbbf24",
      gradient: "linear-gradient(135deg, #fbbf24, #f59e0b)"
    },
    {
      emoji: "🌽",
      name: "Corn",
      description: "Thrives in warm weather with plenty of sunlight",
      season: "Kharif Season",
      temp: "21-30°C",
      color: "#84cc16",
      gradient: "linear-gradient(135deg, #84cc16, #65a30d)"
    },
    {
      emoji: "🍚",
      name: "Rice",
      description: "Requires flooded fields and high temperatures",
      season: "Kharif Season",
      temp: "20-35°C",
      color: "#06b6d4",
      gradient: "linear-gradient(135deg, #06b6d4, #0891b2)"
    },
    {
      emoji: "🥔",
      name: "Potato",
      description: "Cool season crop, sensitive to high temperatures",
      season: "Rabi Season",
      temp: "15-20°C",
      color: "#8b5cf6",
      gradient: "linear-gradient(135deg, #a78bfa, #8b5cf6)"
    }
  ];

  const features = [
    {
      icon: <FaCloudSun />,
      title: "Live Weather Intelligence",
      desc: "Real-time hyperlocal weather forecasts with AI-powered insights",
      color: "#3b82f6",
      gradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.02) 100%)",
      borderColor: "rgba(59, 130, 246, 0.2)",
      stats: "99% Accuracy",
      link: "/WeatherOnly"
    },
    {
      icon: <FaSeedling />,
      title: "Smart Crop Advisor",
      desc: "AI recommends perfect crops based on soil, weather, and market trends",
      color: "#10b981",
      gradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.02) 100%)",
      borderColor: "rgba(16, 185, 129, 0.2)",
      stats: "50+ Crops Supported",
      link: "/WeatherWithCrops"
    },
    {
      icon: <FaMicrochip />,
      title: "AI Soil Scanner",
      desc: "Spectroscopic scans of Nitrogen, Phosphorus, Potassium & moisture to find the best crop",
      color: "#a855f7",
      gradient: "linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(168, 85, 247, 0.02) 100%)",
      borderColor: "rgba(168, 85, 247, 0.2)",
      stats: "Interactive 3D Scanning HUD",
      link: "/soil-scanner"
    }
  ];

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Farm Owner, Punjab",
      text: "Increased my wheat yield by 40% using AgroSmart's weather predictions!",
      rating: 5,
      avatarBg: "#10b981"
    },
    {
      name: "Dr. Priya Sharma",
      role: "Agricultural Scientist",
      text: "The most accurate weather-based crop recommendation system I've seen.",
      rating: 5,
      avatarBg: "#3b82f6"
    },
    {
      name: "Amit Patel",
      role: "Organic Farmer",
      text: "Saved 30% on water usage with smart irrigation suggestions. Game changer!",
      rating: 5,
      avatarBg: "#f59e0b"
    }
  ];

  const quickActions = [
    { icon: "🌦️", label: "Check Today's Weather", action: "View Forecast", link: "/WeatherOnly" },
    { icon: "🌱", label: "Get Crop Advice", action: "Get Recommendations", link: "/WeatherWithCrops" },
    { icon: "💡", label: "Farming Tips", action: "Learn More", onClick: () => setShowFarmingTips(true) }
  ];

  return (
    <div className="home-root">
      <Navbar />

      {/* Floating Leaf Particles */}
      <div className="leaf-particle p1">🍃</div>
      <div className="leaf-particle p2">🌾</div>
      <div className="leaf-particle p3">💧</div>
      <div className="leaf-particle p4">☀️</div>

      {/* Hero Section */}
      <section className="hero-section">
        {/* Background Image Slider */}
        <div className="hero-bg-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={bgIndex}
              className="hero-bg-slide"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.35, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              style={{ backgroundImage: `url(${heroBackgrounds[bgIndex]})` }}
            />
          </AnimatePresence>
          <div className="hero-glow-overlay" />
        </div>

        <div className="hero-grid-wrapper">
          {/* Hero Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-content"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="hero-badge"
            >
              <FaStar className="badge-star-icon" />
              <span>AI-Powered Precision Farming</span>
            </motion.div>

            <h1 className="hero-headline">
              Grow Smarter, <br />
              <span className="text-gradient">Harvest Bountiful</span>
            </h1>

            <p className="hero-subtext">
              Transform your farming with real-time weather intelligence and AI-powered
              crop recommendations. Experience <span className="highlight-green">40% higher yields</span> and <span className="highlight-green">30% lower costs</span>.
            </p>

            <div className="hero-button-group">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-premium"
              >
                <Link to="/weather" className="btn-link-reset">
                  <FaPlay className="btn-play-icon" />
                  <span>Start Free Trial</span>
                </Link>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-premium-outline"
              >
                <Link to="/crop-recommendation" className="btn-link-reset">
                  <FaSeedling />
                  <span>View Crop Recommendations</span>
                </Link>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowVideoModal(true)}
                className="btn-video"
              >
                <FaYoutube className="btn-youtube-icon" />
                <span>Watch Demo</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Hero Right Widget (3D Interactive Slide Card) */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hero-widget-pane perspective-container"
          >
            <motion.div
              whileHover={{ rotateY: 8, rotateX: -6, z: 20 }}
              transition={{ duration: 0.4 }}
              className="widget-glass-card tilt-card-3d"
            >
              <div className="widget-header">
                <div className="widget-header-title">
                  <FaSeedling className="widget-icon" />
                  <span>Smart Crop Cycle</span>
                </div>
                <div className="widget-timer-bar">
                  <motion.div
                    key={currentCropIndex}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 8, ease: "linear" }}
                    className="timer-progress"
                  />
                </div>
              </div>

              <div className="widget-content">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentCropIndex}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="crop-slide-item"
                  >
                    <div
                      className="crop-emoji-bg"
                      style={{ background: crops[currentCropIndex].gradient }}
                    >
                      {crops[currentCropIndex].emoji}
                    </div>

                    <div className="crop-details">
                      <h3>{crops[currentCropIndex].name}</h3>
                      <p>{crops[currentCropIndex].description}</p>

                      <div className="crop-meta-row">
                        <div className="meta-tag">
                          <FaCalendarAlt />
                          <span>{crops[currentCropIndex].season}</span>
                        </div>
                        <div className="meta-tag">
                          <FaThermometerHalf />
                          <span>{crops[currentCropIndex].temp}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Dots indicator */}
                <div className="crop-slide-dots">
                  {crops.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentCropIndex(idx)}
                      className={`slide-dot ${idx === currentCropIndex ? "active" : ""}`}
                      style={{ background: idx === currentCropIndex ? crops[idx].color : "rgba(255,255,255,0.2)" }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header-block">
          <h2 className="section-title text-gradient">Smart Farming Features</h2>
          <p className="section-desc">Powered by machine learning and real-time environment telemetry.</p>
        </div>

        <div className="features-grid">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              whileHover={{ y: -8, borderColor: feat.color }}
              className="feature-card glass-card"
              style={{ background: feat.gradient, borderColor: feat.borderColor }}
            >
              <Link to={feat.link} className="feature-link-container">
                <div className="feature-icon" style={{ color: feat.color }}>
                  {feat.icon}
                </div>
                <h3>{feat.title}</h3>
                <p>{feat.desc}</p>
                <div className="feature-footer">
                  <span className="feature-badge" style={{ backgroundColor: `${feat.color}20`, color: feat.color }}>
                    {feat.stats}
                  </span>
                  <FaArrowRight className="feature-arrow" style={{ color: feat.color }} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions-section">
        <div className="section-header-block">
          <h2 className="section-title text-gradient">Quick Actions</h2>
          <p className="section-desc">Get started in seconds</p>
        </div>

        <div className="actions-grid">
          {quickActions.map((act, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ y: -4, borderColor: "var(--accent-primary)" }}
              onClick={act.onClick || undefined}
              className="action-card-glass"
              style={{ cursor: "pointer" }}
            >
              <div className="action-icon">{act.icon}</div>
              <h3>{act.label}</h3>
              {act.link ? (
                <Link to={act.link} className="action-btn-link">
                  <span>{act.action}</span>
                  <FaChevronRight />
                </Link>
              ) : (
                <button className="action-btn-link" onClick={act.onClick}>
                  <span>{act.action}</span>
                  <FaChevronRight />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="section-header-block">
          <h2 className="section-title text-gradient">Trusted by Researchers & Farmers</h2>
        </div>

        <div className="testimonials-marquee-container">
          <div className="testimonials-marquee-track">
            {/* Set 1 */}
            {testimonials.map((test, i) => (
              <div
                key={`test-1-${i}`}
                className="testimonial-card glass-card marquee-card"
              >
                <div className="testimonial-header">
                  <div className="testimonial-avatar" style={{ backgroundColor: test.avatarBg }}>
                    {test.name[0]}
                  </div>
                  <div>
                    <h4>{test.name}</h4>
                    <span>{test.role}</span>
                  </div>
                </div>
                <p className="testimonial-body">"{test.text}"</p>
                <div className="testimonial-rating">
                  {[...Array(test.rating)].map((_, idx) => (
                    <FaStar key={idx} className="star-filled" />
                  ))}
                </div>
              </div>
            ))}
            {/* Set 2 (Seamless loop copy) */}
            {testimonials.map((test, i) => (
              <div
                key={`test-2-${i}`}
                className="testimonial-card glass-card marquee-card"
              >
                <div className="testimonial-header">
                  <div className="testimonial-avatar" style={{ backgroundColor: test.avatarBg }}>
                    {test.name[0]}
                  </div>
                  <div>
                    <h4>{test.name}</h4>
                    <span>{test.role}</span>
                  </div>
                </div>
                <p className="testimonial-body">"{test.text}"</p>
                <div className="testimonial-rating">
                  {[...Array(test.rating)].map((_, idx) => (
                    <FaStar key={idx} className="star-filled" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="cta-glass-banner"
        >
          <h2>Ready to Transform Your Farming?</h2>
          <p>Join thousands of smart farmers using AgroSmart today to optimize yields.</p>
          <div className="cta-button-row">
            <Link to="/weather" className="btn-premium">
              Start Free Trial
            </Link>
            <Link to="/crop-recommendation" className="btn-premium-outline">
              Get Crop Advice
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <FaSeedling className="footer-logo-icon" />
            <h3>AgroSmart</h3>
            <p>AI-Powered Agriculture Analytics Platform.</p>
          </div>
          <div className="footer-links-col">
            <h4>Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/weather">Weather Dashboard</Link>
            <Link to="/crop-recommendation">Crop Advice</Link>
            <Link to="/database">Details Database</Link>
          </div>
          <div className="footer-info-col">
            <h4>Security & Standards</h4>
            <p>All user searches and profile metrics are encrypted and rate-limited. Passwords hashed using bcryptjs.</p>
          </div>
        </div>
        <div className="footer-copyright">
          <span>© {new Date().getFullYear()} AgroSmart Platform. All rights reserved.</span>
        </div>
      </footer>

      {/* Video Modal Popup */}
      <AnimatePresence>
        {showVideoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowVideoModal(false)}
            className="modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="modal-card video-card"
            >
              <div className="modal-header">
                <h3><FaYoutube /> Demo Video: Precision Agriculture</h3>
                <button className="close-btn" onClick={() => setShowVideoModal(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className="video-iframe-wrapper">
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="Precision Agriculture Demonstration"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Farming Tips Modal Popup */}
      <AnimatePresence>
        {showFarmingTips && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFarmingTips(false)}
            className="modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="modal-card tips-card"
            >
              <div className="modal-header">
                <h3><FaSeedling /> Expert Farming Tips</h3>
                <button className="close-btn" onClick={() => setShowFarmingTips(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className="tips-modal-grid">
                {farmingTips.map((tip) => (
                  <div key={tip.id} className="tip-box">
                    <div className="tip-box-header" style={{ background: tip.color }}>
                      {tip.icon}
                      <h4>{tip.title}</h4>
                    </div>
                    <ul className="tip-box-list">
                      {tip.tips.map((item, idx) => (
                        <li key={idx}><FaCheckCircle className="check-icon" /> {item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .home-root {
          min-height: 100vh;
          position: relative;
          background-color: var(--bg-primary);
          overflow: hidden;
        }

        /* Particles */
        .leaf-particle {
          position: absolute;
          font-size: 2.2rem;
          opacity: 0.12;
          pointer-events: none;
          z-index: 1;
        }
        .leaf-particle.p1 { top: 15%; left: 8%; animation: float 7s ease-in-out infinite; }
        .leaf-particle.p2 { top: 45%; right: 10%; animation: float 9s ease-in-out infinite reverse; }
        .leaf-particle.p3 { bottom: 20%; left: 12%; animation: float 8s ease-in-out infinite; }
        .leaf-particle.p4 { bottom: 10%; right: 15%; animation: float 6s ease-in-out infinite; }

        /* Hero */
        .hero-section {
          min-height: 80vh;
          display: flex;
          align-items: center;
          position: relative;
          padding: 6rem 2rem 4rem;
        }

        .hero-bg-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          z-index: 0;
        }

        .hero-bg-slide {
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          position: absolute;
        }

        .hero-glow-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 75% 35%, rgba(16, 185, 129, 0.18) 0%, var(--bg-primary) 70%);
          z-index: 1;
        }

        .hero-grid-wrapper {
          max-width: 1300px;
          margin: 0 auto;
          width: 100%;
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 4rem;
          align-items: center;
          z-index: 10;
          position: relative;
        }

        @media (max-width: 1024px) {
          .hero-grid-wrapper {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 3rem;
          }
        }

        .hero-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 1.5rem;
        }

        @media (max-width: 1024px) {
          .hero-content {
            align-items: center;
          }
        }

        .hero-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: var(--accent-primary);
          font-weight: 700;
          font-size: 0.85rem;
        }

        .badge-star-icon {
          animation: spin-slow 8s linear infinite;
        }

        .hero-headline {
          font-size: 4rem;
          line-height: 1.1;
          color: var(--text-primary);
        }

        @media (max-width: 640px) {
          .hero-headline {
            font-size: 2.8rem;
          }
        }

        .hero-subtext {
          font-size: 1.15rem;
          line-height: 1.6;
          color: var(--text-secondary);
          max-width: 600px;
        }

        .highlight-green {
          color: var(--accent-primary);
          font-weight: 700;
        }

        .hero-button-group {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-top: 1rem;
        }

        @media (max-width: 1024px) {
          .hero-button-group {
            justify-content: center;
          }
        }

        .btn-link-reset {
          text-decoration: none;
          color: inherit;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-play-icon {
          font-size: 0.85rem;
        }

        .btn-video {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 14px;
          padding: 0.8rem 1.8rem;
          color: #fca5a5;
          font-family: var(--font-display);
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-smooth);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-video:hover {
          background: #ef4444;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(239, 68, 68, 0.35);
        }

        .btn-youtube-icon {
          font-size: 1.10rem;
        }

        /* 3D Widget Card */
        .hero-widget-pane {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .widget-glass-card {
          background: rgba(12, 24, 21, 0.7);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border: 1px solid var(--glass-border);
          border-radius: 32px;
          padding: 2.2rem;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(255,255,255,0.02);
          position: relative;
        }

        .widget-header {
          margin-bottom: 1.8rem;
        }

        .widget-header-title {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          color: var(--text-primary);
          font-weight: 700;
          font-size: 1.15rem;
          margin-bottom: 0.75rem;
        }

        .widget-icon {
          color: var(--accent-primary);
        }

        .widget-timer-bar {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          overflow: hidden;
        }

        .timer-progress {
          height: 100%;
          background: var(--accent-primary);
        }

        .crop-slide-item {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .crop-emoji-bg {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          flex-shrink: 0;
        }

        .crop-details h3 {
          font-size: 1.4rem;
          color: var(--text-primary);
          margin-bottom: 0.35rem;
        }

        .crop-details p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.4;
          margin-bottom: 0.8rem;
        }

        .crop-meta-row {
          display: flex;
          gap: 0.6rem;
        }

        .meta-tag {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          padding: 0.3rem 0.65rem;
          border-radius: 8px;
          font-size: 0.75rem;
          color: var(--text-primary);
        }

        .crop-slide-dots {
          display: flex;
          gap: 0.5rem;
          margin-top: 1.8rem;
          justify-content: center;
        }

        .slide-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .slide-dot.active {
          transform: scale(1.3);
        }

        /* Sections General */
        .section-header-block {
          text-align: center;
          max-width: 700px;
          margin: 0 auto 3.5rem;
        }

        .section-title {
          font-size: 2.8rem;
          margin-bottom: 0.8rem;
        }

        .section-desc {
          color: var(--text-secondary);
          font-size: 1.1rem;
        }

        /* Features Section */
        .features-section {
          padding: 6rem 2rem;
          max-width: 1300px;
          margin: 0 auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
          gap: 2.5rem;
        }

        @media (max-width: 640px) {
          .features-grid {
            grid-template-columns: 1fr;
          }
        }

        .feature-link-container {
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          height: 100%;
          justify-content: space-between;
        }

        .feature-icon {
          font-size: 2.8rem;
          margin-bottom: 1.5rem;
        }

        .feature-card h3 {
          font-size: 1.5rem;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
        }

        .feature-card p {
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .feature-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
        }

        .feature-badge {
          padding: 0.35rem 0.85rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .feature-arrow {
          font-size: 1.15rem;
          transition: transform 0.3s ease;
        }

        .feature-card:hover .feature-arrow {
          transform: translateX(6px);
        }

        /* Quick Actions */
        .quick-actions-section {
          padding: 6rem 2rem;
          max-width: 1300px;
          margin: 0 auto;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }

        .action-card-glass {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 24px;
          padding: 2rem;
          text-align: center;
          transition: var(--transition-smooth);
        }

        .action-card-glass:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 30px rgba(16, 185, 129, 0.12);
        }

        .action-icon {
          font-size: 3rem;
          margin-bottom: 1.2rem;
        }

        .action-card-glass h3 {
          font-size: 1.25rem;
          color: var(--text-primary);
          margin-bottom: 1.2rem;
        }

        .action-btn-link {
          background: none;
          border: none;
          color: var(--accent-primary);
          text-decoration: none;
          font-weight: 700;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          justify-content: center;
          width: 100%;
          cursor: pointer;
        }

        .action-btn-link:hover svg {
          transform: translateX(4px);
        }

        .action-btn-link svg {
          font-size: 0.8rem;
          transition: transform 0.2s ease;
        }

        /* Testimonials */
        .testimonials-section {
          padding: 6rem 2rem;
          max-width: 1300px;
          margin: 0 auto;
        }

        .testimonials-marquee-container {
          overflow: hidden;
          width: 100%;
          position: relative;
          padding: 1.5rem 0;
          display: flex;
          mask-image: linear-gradient(to right, transparent, white 15%, white 85%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, white 15%, white 85%, transparent);
        }

        .testimonials-marquee-track {
          display: flex;
          width: max-content;
          animation: scroll-marquee 28s linear infinite;
        }

        .testimonials-marquee-container:hover .testimonials-marquee-track {
          animation-play-state: paused;
        }

        .marquee-card {
          width: 360px;
          margin-right: 2rem;
          flex-shrink: 0;
          transition: var(--transition-fast) !important;
        }

        .marquee-card:hover {
          transform: scale(1.02) !important;
          border-color: var(--accent-primary) !important;
        }

        @keyframes scroll-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .testimonial-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.2rem;
        }

        .testimonial-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          color: white;
          font-weight: 800;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .testimonial-header h4 {
          font-size: 1.15rem;
          color: var(--text-primary);
        }

        .testimonial-header span {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .testimonial-body {
          color: var(--text-secondary);
          font-style: italic;
          line-height: 1.5;
          margin-bottom: 1rem;
        }

        .testimonial-rating {
          color: #fbbf24;
          display: flex;
          gap: 0.25rem;
        }

        /* CTA */
        .cta-section {
          padding: 6rem 2rem;
          max-width: 1300px;
          margin: 0 auto;
        }

        .cta-glass-banner {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(12, 24, 21, 0.8) 100%);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: 32px;
          padding: 4rem 2rem;
          text-align: center;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .cta-glass-banner h2 {
          font-size: 2.6rem;
          color: var(--text-primary);
        }

        .cta-glass-banner p {
          color: var(--text-secondary);
          font-size: 1.1rem;
          max-width: 600px;
        }

        .cta-button-row {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        /* Modals */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 2rem;
        }

        .modal-card {
          background: var(--bg-secondary);
          border: 1px solid var(--glass-border);
          border-radius: 28px;
          box-shadow: 0 30px 70px rgba(0,0,0,0.6);
          overflow: hidden;
          width: 100%;
          display: flex;
          flex-direction: column;
        }

        .video-card {
          max-width: 800px;
        }

        .tips-card {
          max-width: 900px;
        }

        .modal-header {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--glass-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 1.4rem;
          color: var(--text-primary);
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 1.25rem;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .close-btn:hover {
          color: var(--danger);
        }

        .video-iframe-wrapper {
          position: relative;
          padding-bottom: 56.25%; /* 16:9 */
          height: 0;
          overflow: hidden;
        }

        .video-iframe-wrapper iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }

        .tips-modal-grid {
          padding: 2rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
          gap: 1.5rem;
          max-height: 70vh;
          overflow-y: auto;
        }

        @media (max-width: 640px) {
          .tips-modal-grid {
            grid-template-columns: 1fr;
          }
        }

        .tip-box {
          background: var(--bg-tertiary);
          border-radius: 18px;
          border: 1px solid var(--glass-border);
          overflow: hidden;
        }

        .tip-box-header {
          padding: 1rem 1.5rem;
          color: white;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .tip-box-header h4 {
          font-size: 1.1rem;
          margin: 0;
        }

        .tip-box-list {
          list-style: none;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .tip-box-list li {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .check-icon {
          color: var(--accent-primary);
          margin-top: 0.15rem;
          flex-shrink: 0;
        }

        /* Footer */
        .footer-container {
          background: var(--bg-secondary);
          border-top: 1px solid var(--glass-border);
          padding: 4rem 2rem 2rem;
        }

        .footer-grid {
          max-width: 1300px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr;
          gap: 4rem;
        }

        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }

        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: flex-start;
        }

        .footer-logo-icon {
          color: var(--accent-primary);
          font-size: 2.2rem;
        }

        .footer-brand h3 {
          font-size: 1.4rem;
          color: var(--text-primary);
        }

        .footer-brand p {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .footer-links-col {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .footer-links-col h4 {
          font-size: 1.1rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .footer-links-col a {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.9rem;
          transition: var(--transition-fast);
        }

        .footer-links-col a:hover {
          color: var(--accent-primary);
          padding-left: 3px;
        }

        .footer-info-col {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .footer-info-col h4 {
          font-size: 1.1rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .footer-info-col p {
          color: var(--text-secondary);
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .footer-copyright {
          max-width: 1300px;
          margin: 3rem auto 0;
          padding-top: 1.5rem;
          border-top: 1px solid var(--glass-border);
          text-align: center;
          color: var(--text-muted);
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  );
};

export default Home;