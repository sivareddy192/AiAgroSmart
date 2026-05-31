import React from 'react';
import { motion } from 'framer-motion';
import { FaSeedling, FaTree, FaSun, FaTint, FaAppleAlt, FaCarrot, FaPepperHot } from 'react-icons/fa';

const CropAnimation = ({ type }) => {
  const animations = {
    wheat: {
      icon: <FaSeedling />,
      color: '#fbbf24',
      bgColor: 'rgba(251, 191, 36, 0.08)',
      borderColor: 'rgba(251, 191, 36, 0.2)',
      glowColor: 'rgba(251, 191, 36, 0.4)',
      animation: {
        y: [0, -12, 0],
        rotate: [0, 4, -4, 0],
        transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
      }
    },
    rice: {
      icon: <FaTint />,
      color: '#38bdf8',
      bgColor: 'rgba(56, 189, 248, 0.08)',
      borderColor: 'rgba(56, 189, 248, 0.2)',
      glowColor: 'rgba(56, 189, 248, 0.4)',
      animation: {
        scale: [1, 1.15, 1],
        y: [0, -6, 0],
        transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
      }
    },
    maize: {
      icon: <FaTree />,
      color: '#a3e635',
      bgColor: 'rgba(163, 230, 53, 0.08)',
      borderColor: 'rgba(163, 230, 53, 0.2)',
      glowColor: 'rgba(163, 230, 53, 0.4)',
      animation: {
        scaleY: [1, 1.1, 1],
        y: [0, -8, 0],
        transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
      }
    },
    cotton: {
      icon: <FaSun />,
      color: '#f8fafc',
      bgColor: 'rgba(248, 250, 252, 0.08)',
      borderColor: 'rgba(248, 250, 252, 0.2)',
      glowColor: 'rgba(248, 250, 252, 0.4)',
      animation: {
        rotate: [0, 360],
        transition: { duration: 15, repeat: Infinity, ease: "linear" }
      }
    },
    sugarcane: {
      icon: <FaTree />,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.08)',
      borderColor: 'rgba(16, 185, 129, 0.2)',
      glowColor: 'rgba(16, 185, 129, 0.4)',
      animation: {
        skewX: [0, 5, -5, 0],
        rotate: [0, 2, -2, 0],
        transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
      }
    },
    vegetables: {
      icon: <FaCarrot />,
      color: '#f97316',
      bgColor: 'rgba(249, 115, 22, 0.08)',
      borderColor: 'rgba(249, 115, 22, 0.2)',
      glowColor: 'rgba(249, 115, 22, 0.4)',
      animation: {
        rotate: [0, 8, -8, 0],
        y: [0, -4, 0],
        transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
      }
    },
    fruits: {
      icon: <FaAppleAlt />,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.08)',
      borderColor: 'rgba(239, 68, 68, 0.2)',
      glowColor: 'rgba(239, 68, 68, 0.4)',
      animation: {
        scale: [1, 1.12, 1],
        rotate: [0, -5, 5, 0],
        transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
      }
    },
    spices: {
      icon: <FaPepperHot />,
      color: '#dc2626',
      bgColor: 'rgba(220, 38, 38, 0.08)',
      borderColor: 'rgba(220, 38, 38, 0.2)',
      glowColor: 'rgba(220, 38, 38, 0.4)',
      animation: {
        y: [0, -10, 0],
        rotate: [0, 15, -15, 0],
        transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
      }
    },
    default: {
      icon: <FaSeedling />,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.08)',
      borderColor: 'rgba(16, 185, 129, 0.2)',
      glowColor: 'rgba(16, 185, 129, 0.4)',
      animation: {
        scale: [1, 1.1, 1],
        transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
      }
    }
  };

  const config = animations[type] || animations.default;

  return (
    <div 
      className="crop-anim-box" 
      style={{ 
        backgroundColor: config.bgColor,
        borderColor: config.borderColor,
        boxShadow: `0 8px 32px ${config.bgColor}, inset 0 0 16px ${config.bgColor}`
      }}
    >
      {/* 3D Ring Orbit */}
      <div className="orbit-ring" style={{ borderColor: config.borderColor }}></div>
      <div className="orbit-ring-secondary" style={{ borderColor: config.borderColor }}></div>

      <motion.div
        animate={config.animation}
        className="crop-icon-wrapper"
        style={{
          color: config.color,
          filter: `drop-shadow(0 0 15px ${config.glowColor})`
        }}
      >
        {config.icon}
      </motion.div>

      <style>{`
        .crop-anim-box {
          border-radius: 24px;
          border: 1px solid var(--glass-border);
          overflow: hidden;
          margin: 1.5rem 0;
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          perspective: 1000px;
        }

        .crop-icon-wrapper {
          font-size: 4.5rem;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .orbit-ring {
          position: absolute;
          width: 130px;
          height: 130px;
          border: 1px dashed;
          border-radius: 50%;
          transform: rotateX(70deg) rotateY(10deg);
          animation: spin-slow 15s linear infinite;
          opacity: 0.6;
          z-index: 2;
        }

        .orbit-ring-secondary {
          position: absolute;
          width: 150px;
          height: 150px;
          border: 1px dotted;
          border-radius: 50%;
          transform: rotateX(65deg) rotateY(-20deg);
          animation: spin-slow 25s linear infinite reverse;
          opacity: 0.4;
          z-index: 1;
        }

        .crop-anim-box::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.05) 50%, transparent 100%);
          z-index: 3;
          animation: shine 4s ease-in-out infinite;
          transform: translateX(-100%);
        }

        @keyframes shine {
          0% { transform: translateX(-100%); }
          50%, 100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default CropAnimation;