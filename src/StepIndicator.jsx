// src/StepIndicator.jsx
import React from "react";

export function StepIndicator({ currentStep, steps }) {
  return (
    <div style={styles.container}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <React.Fragment key={stepNumber}>
            {/* Círculo del paso */}
            <div style={styles.stepWrapper}>
              <div
                style={{
                  ...styles.circle,
                  ...(isActive && styles.circleActive),
                  ...(isCompleted && styles.circleCompleted),
                }}
              >
                {isCompleted ? "✓" : stepNumber}
              </div>
              <div
                style={{
                  ...styles.label,
                  ...(isActive && styles.labelActive),
                }}
              >
                {step.label}
              </div>
            </div>

            {/* Línea conectora */}
            {index < steps.length - 1 && (
              <div
                style={{
                  ...styles.line,
                  ...(isCompleted && styles.lineCompleted),
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px 20px",
    background: "#0b213f",
    borderBottom: "2px solid #1e3a5f",
  },
  stepWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  circle: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    background: "#1e3a5f",
    border: "3px solid #334155",
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "bold",
    transition: "all 0.3s ease",
  },
  circleActive: {
    background: "#3b82f6",
    border: "3px solid #60a5fa",
    color: "#ffffff",
    boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
    transform: "scale(1.1)",
  },
  circleCompleted: {
    background: "#10b981",
    border: "3px solid #34d399",
    color: "#ffffff",
  },
  label: {
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "500",
    textAlign: "center",
    transition: "all 0.3s ease",
  },
  labelActive: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  line: {
    height: "3px",
    width: "80px",
    background: "#334155",
    margin: "0 10px",
    marginBottom: "30px",
    transition: "all 0.3s ease",
  },
  lineCompleted: {
    background: "#10b981",
  },
};
