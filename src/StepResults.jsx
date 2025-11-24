// src/StepResults.jsx
import React from "react";

export function StepResults({
  annotatedImageSrc,
  reportText,
  stats,
  summary,
  detections,
  teethFdi,
  loading,
  onNext,
  onBack,
}) {
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <h2 style={styles.loadingTitle}>Analizando Radiografía...</h2>
        <p style={styles.loadingText}>
          Nuestro modelo de IA está procesando la imagen y detectando anomalías dentales
        </p>
        <div style={styles.progressBar}>
          <div style={styles.progressFill} />
        </div>
      </div>
    );
  }

  const totalDetections = summary?.total ?? 0;
  const perClass = summary?.per_class || {};
  const cariesCount = perClass["Caries"] || 0;
  const retenidosCount = perClass["Diente_Retenido"] || 0;
  const oseaCount = perClass["Perdida_Osea"] || 0;

  const cariesFdi = teethFdi?.Caries || [];
  const retenidosFdi = teethFdi?.Diente_Retenido || [];
  const oseaFdi = teethFdi?.Perdida_Osea || [];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Resultados del Análisis</h2>
          <p style={styles.subtitle}>
            Detección completada • {totalDetections} anomalía(s) encontrada(s)
          </p>
        </div>
      </div>

      <div style={styles.content}>
        {/* Columna izquierda: Imagen anotada */}
        <div style={styles.imageSection}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionIcon}>🔍</span>
            <h3 style={styles.sectionTitle}>Radiografía Anotada</h3>
          </div>
          <div style={styles.imageWrapper}>
            {annotatedImageSrc ? (
              <img src={annotatedImageSrc} alt="Resultado anotado" style={styles.image} />
            ) : (
              <div style={styles.noImage}>No se pudo procesar la imagen</div>
            )}
          </div>

          {/* Leyenda de colores */}
          <div style={styles.legend}>
            <div style={styles.legendItem}>
              <span style={{ ...styles.legendDot, background: "#ef4444" }} />
              <span>Caries</span>
            </div>
            <div style={styles.legendItem}>
              <span style={{ ...styles.legendDot, background: "#10b981" }} />
              <span>Diente Retenido</span>
            </div>
            <div style={styles.legendItem}>
              <span style={{ ...styles.legendDot, background: "#06b6d4" }} />
              <span>Pérdida Ósea</span>
            </div>
          </div>
        </div>

        {/* Columna derecha: Métricas y detalles */}
        <div style={styles.detailsSection}>
          {/* Resumen numérico */}
          <div style={styles.statsGrid}>
            <div style={{ ...styles.statCard, borderColor: "#3b82f6" }}>
              <div style={styles.statNumber}>{totalDetections}</div>
              <div style={styles.statLabel}>Total Detecciones</div>
            </div>
            <div style={{ ...styles.statCard, borderColor: "#ef4444" }}>
              <div style={styles.statNumber}>{cariesCount}</div>
              <div style={styles.statLabel}>Caries</div>
            </div>
            <div style={{ ...styles.statCard, borderColor: "#10b981" }}>
              <div style={styles.statNumber}>{retenidosCount}</div>
              <div style={styles.statLabel}>Dientes Retenidos</div>
            </div>
            <div style={{ ...styles.statCard, borderColor: "#06b6d4" }}>
              <div style={styles.statNumber}>{oseaCount}</div>
              <div style={styles.statLabel}>Pérdida Ósea</div>
            </div>
          </div>

          {/* Dientes afectados (FDI) */}
          {teethFdi && (cariesFdi.length > 0 || retenidosFdi.length > 0 || oseaFdi.length > 0) && (
            <div style={styles.fdiSection}>
              <div style={styles.sectionHeader}>
                <span style={styles.sectionIcon}>🦷</span>
                <h3 style={styles.sectionTitle}>Dientes Afectados (Sistema FDI)</h3>
              </div>

              {cariesFdi.length > 0 && (
                <div style={styles.fdiGroup}>
                  <div style={{ ...styles.fdiLabel, color: "#ef4444" }}>• Caries:</div>
                  <div style={styles.fdiBadges}>
                    {cariesFdi.sort((a, b) => a - b).map((fdi) => (
                      <span key={fdi} style={{ ...styles.fdiBadge, borderColor: "#fca5a5", background: "#fee2e2" }}>
                        {fdi}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {retenidosFdi.length > 0 && (
                <div style={styles.fdiGroup}>
                  <div style={{ ...styles.fdiLabel, color: "#10b981" }}>• Dientes Retenidos:</div>
                  <div style={styles.fdiBadges}>
                    {retenidosFdi.sort((a, b) => a - b).map((fdi) => (
                      <span key={fdi} style={{ ...styles.fdiBadge, borderColor: "#6ee7b7", background: "#d1fae5" }}>
                        {fdi}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {oseaFdi.length > 0 && (
                <div style={styles.fdiGroup}>
                  <div style={{ ...styles.fdiLabel, color: "#06b6d4" }}>• Pérdida Ósea:</div>
                  <div style={styles.fdiBadges}>
                    {oseaFdi.sort((a, b) => a - b).map((fdi) => (
                      <span key={fdi} style={{ ...styles.fdiBadge, borderColor: "#67e8f9", background: "#cffafe" }}>
                        {fdi}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reporte textual */}
          {reportText && (
            <div style={styles.reportSection}>
              <div style={styles.sectionHeader}>
                <span style={styles.sectionIcon}>📋</span>
                <h3 style={styles.sectionTitle}>Reporte del Análisis</h3>
              </div>
              <div style={styles.reportBox}>
                <pre style={styles.reportText}>{reportText}</pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botones de navegación */}
      <div style={styles.navigation}>
        <button type="button" onClick={onBack} style={styles.backButton}>
          ← Volver a Subir Imagen
        </button>
        <button type="button" onClick={onNext} style={styles.nextButton}>
          Continuar para Guardar →
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px 40px",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "500px",
    padding: "40px",
  },
  spinner: {
    width: "60px",
    height: "60px",
    border: "6px solid #e2e8f0",
    borderTop: "6px solid #3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "24px",
  },
  loadingTitle: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#ffffff",
    margin: "0 0 12px 0",
  },
  loadingText: {
    fontSize: "16px",
    color: "#94a3b8",
    maxWidth: "500px",
    textAlign: "center",
    lineHeight: "1.6",
    margin: "0 0 30px 0",
  },
  progressBar: {
    width: "300px",
    height: "6px",
    background: "#1e3a5f",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    width: "40%",
    background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
    animation: "progress 1.5s ease-in-out infinite",
  },
  header: {
    marginBottom: "30px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#ffffff",
    margin: "0 0 8px 0",
  },
  subtitle: {
    fontSize: "16px",
    color: "#94a3b8",
    margin: 0,
  },
  content: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: "30px",
    marginBottom: "30px",
  },
  imageSection: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  },
  detailsSection: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "16px",
  },
  sectionIcon: {
    fontSize: "24px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#1e293b",
    margin: 0,
  },
  imageWrapper: {
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    overflow: "hidden",
    background: "#f8fafc",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "400px",
  },
  image: {
    maxWidth: "100%",
    height: "auto",
    display: "block",
  },
  noImage: {
    color: "#94a3b8",
    fontSize: "16px",
  },
  legend: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: "16px",
    padding: "12px",
    background: "#f8fafc",
    borderRadius: "8px",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#475569",
    fontWeight: "500",
  },
  legendDot: {
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.5)",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "16px",
  },
  statCard: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center",
    borderLeft: "4px solid",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },
  statNumber: {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: "4px",
  },
  statLabel: {
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "500",
  },
  fdiSection: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },
  fdiGroup: {
    marginTop: "12px",
  },
  fdiLabel: {
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "8px",
  },
  fdiBadges: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  fdiBadge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "8px",
    border: "2px solid",
    fontSize: "14px",
    fontWeight: "bold",
    color: "#1e293b",
  },
  reportSection: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },
  reportBox: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "16px",
    maxHeight: "200px",
    overflowY: "auto",
  },
  reportText: {
    fontSize: "13px",
    color: "#475569",
    margin: 0,
    whiteSpace: "pre-wrap",
    fontFamily: "ui-monospace, monospace",
    lineHeight: "1.6",
  },
  navigation: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    marginTop: "20px",
  },
  backButton: {
    padding: "14px 28px",
    fontSize: "16px",
    fontWeight: "600",
    background: "#ffffff",
    color: "#475569",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  nextButton: {
    padding: "14px 28px",
    fontSize: "16px",
    fontWeight: "600",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)",
    transition: "all 0.3s ease",
  },
};

// Agregar animaciones
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes progress {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(350%); }
    }
  `;
  if (!document.querySelector('style[data-step-results]')) {
    styleSheet.setAttribute('data-step-results', 'true');
    document.head.appendChild(styleSheet);
  }
}
