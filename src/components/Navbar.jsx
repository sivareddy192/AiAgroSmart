import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getUserFromToken } from "../utils/auth";
import { motion, AnimatePresence } from "framer-motion";
import API_URL from '../utils/api';
import {
  FaSeedling,
  FaCloudSun,
  FaDatabase,
  FaHistory,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaMicrochip
} from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();
  const user = getUserFromToken();
  const token = localStorage.getItem("token");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });
      } catch (err) {
        console.error("Logout API error:", err);
      }
    }
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const navItems = [
    { path: "/", label: "Home", icon: <FaSeedling /> },
    { path: "/weather", label: "Weather", icon: <FaCloudSun /> },
    { path: "/soil-scanner", label: "Soil Scanner", icon: <FaMicrochip /> },
    { path: "/database", label: "User Database", icon: <FaDatabase /> },
    { path: "/history", label: "Search History", icon: <FaHistory /> }
  ];

  return (
    <header className="navbar-container">
      <div className="navbar-wrapper">
        {/* LOGO */}
        <NavLink to="/" className="navbar-logo" onClick={() => setMobileMenuOpen(false)}>
          <FaSeedling className="logo-icon-spin" />
          <span className="logo-text">Agro<span className="logo-accent">Smart</span></span>
        </NavLink>

        {/* DESKTOP NAV LINKS */}
        <nav className="desktop-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link-item ${isActive ? "active" : ""}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* AUTH SECTION */}
        <div className="auth-desktop">
          {!token ? (
            <>
              <NavLink to="/login" className="btn-login-outline">
                <FaSignInAlt />
                <span>Login</span>
              </NavLink>
              <NavLink to="/register" className="btn-register-premium">
                <FaUserPlus />
                <span>Register</span>
              </NavLink>
            </>
          ) : (
            <div className="user-profile-nav">
              <span className="user-badge">{user?.email?.split("@")[0]}</span>
              <button onClick={handleLogout} className="btn-logout">
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-toggle-btn"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mobile-drawer"
          >
            <div className="mobile-drawer-links">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `mobile-link-item ${isActive ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}

              <hr className="mobile-divider" />

              {!token ? (
                <div className="mobile-auth-buttons">
                  <NavLink
                    to="/login"
                    className="mobile-btn-outline"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FaSignInAlt />
                    <span>Login</span>
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="mobile-btn-premium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FaUserPlus />
                    <span>Register</span>
                  </NavLink>
                </div>
              ) : (
                <div className="mobile-user-actions">
                  <div className="mobile-user-email">Logged in: {user?.email}</div>
                  <button onClick={handleLogout} className="mobile-btn-logout">
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .navbar-container {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: rgba(5, 11, 10, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--glass-border);
          transition: var(--transition-smooth);
        }

        .navbar-wrapper {
          max-width: 1300px;
          margin: 0 auto;
          padding: 1.1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          text-decoration: none;
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.6rem;
          color: var(--text-primary);
        }

        .logo-icon-spin {
          color: var(--accent-primary);
          font-size: 1.9rem;
          animation: float 4s ease-in-out infinite;
        }

        .logo-text {
          letter-spacing: -0.03em;
        }

        .logo-accent {
          color: var(--accent-primary);
        }

        /* Desktop Nav */
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        @media (max-width: 900px) {
          .desktop-nav {
            display: none;
          }
        }

        .nav-link-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.2rem;
          border-radius: 12px;
          text-decoration: none;
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.95rem;
          transition: var(--transition-smooth);
        }

        .nav-link-item svg {
          font-size: 1.1rem;
        }

        .nav-link-item:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.04);
          transform: translateY(-1px);
        }

        .nav-link-item.active {
          color: var(--accent-primary);
          background: var(--accent-light);
        }

        /* Desktop Auth */
        .auth-desktop {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        @media (max-width: 900px) {
          .auth-desktop {
            display: none;
          }
        }

        .btn-login-outline {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.55rem 1.1rem;
          border-radius: 12px;
          color: var(--text-primary);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          border: 1px solid var(--glass-border);
          transition: var(--transition-smooth);
        }

        .btn-login-outline:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--text-primary);
        }

        .btn-register-premium {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.55rem 1.1rem;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
          color: white;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
          transition: var(--transition-smooth);
        }

        .btn-register-premium:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.35);
        }

        .user-profile-nav {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        .user-badge {
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          color: var(--accent-primary);
          padding: 0.4rem 0.8rem;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 700;
        }

        .btn-logout {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.55rem 1.1rem;
          border-radius: 12px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: var(--danger);
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .btn-logout:hover {
          background: var(--danger);
          color: white;
          transform: translateY(-1px);
        }

        /* Mobile Menu */
        .mobile-toggle-btn {
          display: none;
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: 1.5rem;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        @media (max-width: 900px) {
          .mobile-toggle-btn {
            display: block;
          }
        }

        .mobile-drawer {
          display: flex;
          flex-direction: column;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--glass-border);
          padding: 1rem 2rem;
        }

        .mobile-drawer-links {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .mobile-link-item {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 0.8rem 1.2rem;
          border-radius: 12px;
          text-decoration: none;
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 1rem;
          transition: var(--transition-fast);
        }

        .mobile-link-item.active {
          color: var(--accent-primary);
          background: var(--accent-light);
        }

        .mobile-divider {
          border: 0;
          height: 1px;
          background: var(--glass-border);
          margin: 0.5rem 0;
        }

        .mobile-auth-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .mobile-btn-outline {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.8rem;
          border-radius: 12px;
          border: 1px solid var(--glass-border);
          color: var(--text-primary);
          text-decoration: none;
          font-weight: 600;
        }

        .mobile-btn-premium {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.8rem;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
          color: white;
          text-decoration: none;
          font-weight: 600;
        }

        .mobile-user-actions {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          align-items: center;
        }

        .mobile-user-email {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .mobile-btn-logout {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.8rem;
          border-radius: 12px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: var(--danger);
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>
    </header>
  );
};

export default Navbar;
