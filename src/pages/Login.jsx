import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { FaSeedling, FaLock, FaEnvelope, FaSignInAlt, FaExclamationTriangle } from "react-icons/fa";
import API_URL from "../utils/api.js";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid credentials");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      navigate("/weather");
    } catch (err) {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page bg-gradient-radial">
      {/* Decorative Blur Spheres */}
      <div className="auth-glow-sphere sphere-1"></div>
      <div className="auth-glow-sphere sphere-2"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="auth-card-glass glass-card"
      >
        <div className="auth-header">
          <Link to="/" className="auth-logo-link">
            <FaSeedling className="auth-logo animate-float" />
          </Link>
          <h2>Welcome Back</h2>
          <p>Login to continue smart farming</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="auth-error-box"
          >
            <FaExclamationTriangle />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="input-field-group">
            <FaEnvelope className="field-icon" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-premium"
              required
            />
          </div>

          <div className="input-field-group">
            <FaLock className="field-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-premium"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-premium"
            disabled={loading}
            style={{ width: "100%", marginTop: "1rem" }}
          >
            {loading ? (
              <span>Logging in...</span>
            ) : (
              <>
                <FaSignInAlt />
                <span>Login</span>
              </>
            )}
          </motion.button>
        </form>

        <p className="auth-switch-text">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </motion.div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          padding: 2rem;
          overflow: hidden;
        }

        .auth-glow-sphere {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.15;
          z-index: 0;
          pointer-events: none;
        }

        .sphere-1 {
          width: 300px;
          height: 300px;
          background: var(--accent-primary);
          top: 15%;
          left: 20%;
        }

        .sphere-2 {
          width: 400px;
          height: 400px;
          background: var(--accent-secondary);
          bottom: 10%;
          right: 15%;
        }

        .auth-card-glass {
          width: 100%;
          max-width: 420px;
          z-index: 10;
          position: relative;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .auth-logo-link {
          text-decoration: none;
          display: inline-block;
        }

        .auth-logo {
          font-size: 3.5rem;
          color: var(--accent-primary);
          margin-bottom: 0.5rem;
        }

        .auth-header h2 {
          color: var(--text-primary);
          font-size: 2rem;
          margin-bottom: 0.35rem;
        }

        .auth-header p {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .auth-error-box {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 12px;
          padding: 0.8rem 1.2rem;
          color: #fca5a5;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .input-field-group {
          position: relative;
          display: flex;
          align-items: center;
        }

        .field-icon {
          position: absolute;
          left: 1.2rem;
          color: var(--text-muted);
          pointer-events: none;
        }

        .input-field-group .input-premium {
          padding-left: 3rem;
        }

        .auth-switch-text {
          text-align: center;
          margin-top: 2rem;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .auth-switch-text a {
          color: var(--accent-primary);
          font-weight: 700;
          text-decoration: none;
          transition: var(--transition-fast);
        }

        .auth-switch-text a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default Login;
