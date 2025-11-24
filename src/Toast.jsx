// src/Toast.jsx
import React, { useEffect } from "react";

export function Toast({ message, type = "success", duration = 3000, onClose }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getStyle = () => {
    const baseStyle = {
      position: "fixed",
      top: "20px",
      right: "20px",
      padding: "16px 24px",
      borderRadius: "12px",
      boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
      color: "#ffffff",
      fontSize: "15px",
      fontWeight: "500",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      zIndex: 10000,
      animation: "slideInRight 0.3s ease-out",
      minWidth: "300px",
      maxWidth: "500px",
    };

    const styles = {
      success: {
        ...baseStyle,
        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        border: "2px solid #34d399",
      },
      error: {
        ...baseStyle,
        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
        border: "2px solid #f87171",
      },
      info: {
        ...baseStyle,
        background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
        border: "2px solid #60a5fa",
      },
      warning: {
        ...baseStyle,
        background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        border: "2px solid #fbbf24",
      },
    };

    return styles[type] || styles.success;
  };

  const getIcon = () => {
    const icons = {
      success: "✓",
      error: "✕",
      info: "ℹ",
      warning: "⚠",
    };
    return icons[type] || icons.success;
  };

  return (
    <>
      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <div style={getStyle()}>
        <span style={{ fontSize: "24px" }}>{getIcon()}</span>
        <span style={{ flex: 1 }}>{message}</span>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "none",
            color: "#ffffff",
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(255,255,255,0.3)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "rgba(255,255,255,0.2)";
          }}
        >
          ×
        </button>
      </div>
    </>
  );
}
