// src/StepActions.jsx
import React, { useState } from "react";

export function StepActions({
  annotatedImageSrc,
  onSaveToHistory,
  onStartNew,
  saving,
  isLoggedIn,
}) {
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await onSaveToHistory?.();
    setSaved(true);
  };

  const handleDownload = () => {
    if (!annotatedImageSrc) return;

    const link = document.createElement("a");
    link.href = annotatedImageSrc;
    link.download = `radiografia_analizada_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Icono de éxito */}
        <div style={styles.successIcon}>
          <span style={styles.checkmark}>✓</span>
        </div>

        <h2 style={styles.title}>¡Análisis Completado!</h2>
        <p style={styles.description}>
          Tu radiografía ha sido procesada exitosamente. Ahora puedes guardar los resultados
          en tu historial o descargar la imagen anotada.
        </p>

        {/* Vista previa pequeña */}
        {annotatedImageSrc && (
          <div style={styles.previewWrapper}>
            <img src={annotatedImageSrc} alt="Vista previa" style={styles.previewImage} />
          </div>
        )}

        {/* Acciones principales */}
        <div style={styles.actionsGrid}>
          {isLoggedIn && (
            <div style={styles.actionCard}>
              <div style={styles.actionIcon}>💾</div>
              <h3 style={styles.actionTitle}>Guardar en Historial</h3>
              <p style={styles.actionDescription}>
                Guarda este análisis en tu historial personal para futuras consultas
              </p>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || saved}
                style={{
                  ...styles.actionButton,
                  ...(saved && styles.actionButtonSuccess),
                  ...((saving || saved) && styles.actionButtonDisabled),
                }}
              >
                {saving ? (
                  <>
                    <span style={styles.spinner} />
                    Guardando...
                  </>
                ) : saved ? (
                  <>
                    ✓ Guardado Exitosamente
                  </>
                ) : (
                  "Guardar Análisis"
                )}
              </button>
            </div>
          )}

          <div style={styles.actionCard}>
            <div style={styles.actionIcon}>📥</div>
            <h3 style={styles.actionTitle}>Descargar Imagen</h3>
            <p style={styles.actionDescription}>
              Descarga la radiografía con las anotaciones de detección
            </p>
            <button
              type="button"
              onClick={handleDownload}
              style={styles.actionButton}
            >
              Descargar PNG
            </button>
          </div>
        </div>

        {/* Mensaje de éxito al guardar */}
        {saved && (
          <div style={styles.successMessage}>
            <span style={styles.successIcon2}>✓</span>
            <div>
              <div style={styles.successTitle}>¡Análisis guardado correctamente!</div>
              <div style={styles.successText}>
                Puedes encontrarlo en la pestaña "Historial"
              </div>
            </div>
          </div>
        )}

        {!isLoggedIn && (
          <div style={styles.infoMessage}>
            <span style={styles.infoIcon}>ℹ️</span>
            <div style={styles.infoText}>
              Inicia sesión para poder guardar tus análisis en el historial
            </div>
          </div>
        )}

        {/* Botón para nuevo análisis */}
        <button type="button" onClick={onStartNew} style={styles.newAnalysisButton}>
          🔄 Analizar Nueva Radiografía
        </button>

        {/* Estadísticas rápidas */}
        <div style={styles.quickStats}>
          <div style={styles.statItem}>
            <span style={styles.statIcon}>⚡</span>
            <span style={styles.statText}>Análisis completado en segundos</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statIcon}>🎯</span>
            <span style={styles.statText}>Detección precisa con IA</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statIcon}>🦷</span>
            <span style={styles.statText}>Sistema FDI estándar</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "calc(100vh - 200px)",
    padding: "40px 20px",
  },
  content: {
    maxWidth: "900px",
    width: "100%",
    background: "#ffffff",
    borderRadius: "20px",
    padding: "50px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    textAlign: "center",
  },
  successIcon: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    margin: "0 auto 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 30px rgba(16, 185, 129, 0.3)",
    animation: "scaleIn 0.5s ease-out",
  },
  checkmark: {
    fontSize: "50px",
    color: "#ffffff",
    fontWeight: "bold",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: "12px",
    margin: 0,
  },
  description: {
    fontSize: "16px",
    color: "#64748b",
    marginBottom: "30px",
    lineHeight: "1.6",
    maxWidth: "600px",
    margin: "12px auto 30px",
  },
  previewWrapper: {
    margin: "30px auto",
    maxWidth: "500px",
    border: "3px solid #e2e8f0",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  },
  previewImage: {
    width: "100%",
    height: "auto",
    display: "block",
  },
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
    marginTop: "30px",
  },
  actionCard: {
    background: "#f8fafc",
    border: "2px solid #e2e8f0",
    borderRadius: "16px",
    padding: "30px",
    transition: "all 0.3s ease",
  },
  actionIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  actionTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: "8px",
    margin: "0 0 8px 0",
  },
  actionDescription: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "20px",
    lineHeight: "1.5",
  },
  actionButton: {
    width: "100%",
    padding: "14px 24px",
    fontSize: "16px",
    fontWeight: "bold",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  actionButtonSuccess: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
  },
  actionButtonDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid #ffffff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    display: "inline-block",
  },
  successMessage: {
    marginTop: "24px",
    padding: "20px",
    background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
    border: "2px solid #6ee7b7",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    animation: "slideDown 0.5s ease-out",
  },
  successIcon2: {
    fontSize: "32px",
    color: "#059669",
  },
  successTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#065f46",
    textAlign: "left",
    marginBottom: "4px",
  },
  successText: {
    fontSize: "14px",
    color: "#047857",
    textAlign: "left",
  },
  infoMessage: {
    marginTop: "24px",
    padding: "16px",
    background: "#dbeafe",
    border: "2px solid #93c5fd",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  infoIcon: {
    fontSize: "24px",
  },
  infoText: {
    fontSize: "14px",
    color: "#1e40af",
    textAlign: "left",
  },
  newAnalysisButton: {
    marginTop: "30px",
    padding: "14px 32px",
    fontSize: "16px",
    fontWeight: "600",
    background: "#ffffff",
    color: "#475569",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  quickStats: {
    marginTop: "40px",
    paddingTop: "30px",
    borderTop: "2px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-around",
    flexWrap: "wrap",
    gap: "20px",
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  statIcon: {
    fontSize: "20px",
  },
  statText: {
    fontSize: "14px",
    color: "#64748b",
    fontWeight: "500",
  },
};

// Agregar animaciones
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes scaleIn {
      from {
        transform: scale(0);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
    @keyframes slideDown {
      from {
        transform: translateY(-20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  if (!document.querySelector('style[data-step-actions]')) {
    styleSheet.setAttribute('data-step-actions', 'true');
    document.head.appendChild(styleSheet);
  }
}
