// src/ModelsPanel.jsx
import { useEffect, useState } from "react";

const API_BASE = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

export function ModelsPanel({ token }) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("cards"); 
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/models/available`);
      if (!res.ok) throw new Error("Error al cargar modelos");
      const data = await res.json();
      setModels(data.models);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      production: { bg: "#10b981", text: " PRODUCCIÓN" },
      experimental: { bg: "#f59e0b", text: " EXPERIMENTAL" },
      incomplete: { bg: "#ef4444", text: " INCOMPLETO" }
    };
    const badge = badges[status] || badges.experimental;
    return (
      <span style={{
        background: badge.bg,
        color: "white",
        padding: "4px 12px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "bold"
      }}>
        {badge.text}
      </span>
    );
  };

  const formatPercent = (value) => (value * 100).toFixed(1) + "%";
  const formatHours = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", fontSize: "18px", color: "#fff" }}>Cargando modelos...</div>;
  }

  if (error) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#ef4444" }}>Error: {error}</div>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ margin: "0 0 10px 0", fontSize: "28px", color: "#fff" }}> Modelos de IA Disponibles</h2>
        <p style={{ margin: "0", color: "#94a3b8", fontSize: "14px" }}>
          Comparación de modelos YOLO entrenados • Dataset: 19,308 imágenes
        </p>
      </div>

      {/* Vista Toggle */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={() => setView("cards")}
          style={{
            padding: "10px 20px",
            background: view === "cards" ? "#3b82f6" : "#1e3a5f",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
           Tarjetas
        </button>
        <button
          onClick={() => setView("table")}
          style={{
            padding: "10px 20px",
            background: view === "table" ? "#3b82f6" : "#1e3a5f",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
           Tabla Comparativa
        </button>
      </div>

      {/* Vista de Tarjetas */}
      {view === "cards" && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "20px"
        }}>
          {models.map((model) => (
            <div key={model.id} style={{
              border: model.is_active ? "3px solid #10b981" : "2px solid #1e3a5f",
              borderRadius: "16px",
              padding: "24px",
              background: "#0b213f",
              boxShadow: model.is_active ? "0 8px 24px rgba(16, 185, 129, 0.3)" : "0 4px 12px rgba(0,0,0,0.3)"
            }}>
              {/* Header de tarjeta */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <h3 style={{ margin: 0, fontSize: "20px", color: "#fff" }}>{model.name}</h3>
                  {model.is_active && <span style={{ fontSize: "24px" }}>✓</span>}
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "12px" }}>
                  {getStatusBadge(model.status)}
                  <span style={{ color: "#94a3b8", fontSize: "14px" }}>{model.architecture} • {model.epochs} epochs</span>
                </div>
              </div>

              {/* Métricas principales */}
              <div style={{
                background: "#1e3a5f",
                padding: "16px",
                borderRadius: "12px",
                marginBottom: "16px"
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <MetricBox
                    label="mAP50"
                    value={formatPercent(model.metrics.map50)}
                    highlight={model.metrics.map50 >= 0.7}
                  />
                  <MetricBox
                    label="mAP50-95"
                    value={formatPercent(model.metrics.map50_95)}
                    highlight={model.metrics.map50_95 >= 0.5}
                  />
                  <MetricBox label="Precision" value={formatPercent(model.metrics.precision)} />
                  <MetricBox label="Recall" value={formatPercent(model.metrics.recall)} />
                </div>
              </div>

              {/* Métricas por clase */}
              <div style={{ marginBottom: "16px" }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#94a3b8" }}>Rendimiento por Clase:</h4>
                {Object.entries(model.per_class_metrics).map(([className, metrics]) => (
                  <div key={className} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: "1px solid #1e3a5f",
                    fontSize: "13px",
                    color: "#e2e8f0"
                  }}>
                    <span style={{ fontWeight: "bold" }}>{className}</span>
                    <span>P: {formatPercent(metrics.precision)} | R: {formatPercent(metrics.recall)} | mAP: {formatPercent(metrics.map50)}</span>
                  </div>
                ))}
              </div>

              {/* Descripción */}
              <p style={{ fontSize: "13px", color: "#94a3b8", fontStyle: "italic", marginBottom: "16px" }}>
                {model.description}
              </p>

              {/* Estado activo */}
              {model.is_active && (
                <div style={{
                  padding: "12px",
                  background: "#065f46",
                  color: "#d1fae5",
                  borderRadius: "8px",
                  textAlign: "center",
                  fontWeight: "bold"
                }}>
                  ✓ Modelo activo actual
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Vista de Tabla */}
      {view === "table" && (
        <div style={{ overflowX: "auto", background: "#0b213f", borderRadius: "16px", padding: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #1e3a5f" }}>
                <th style={tableHeaderStyle}>Modelo</th>
                <th style={tableHeaderStyle}>Arquitectura</th>
                <th style={tableHeaderStyle}>mAP50</th>
                <th style={tableHeaderStyle}>mAP50-95</th>
                <th style={tableHeaderStyle}>Precision</th>
                <th style={tableHeaderStyle}>Recall</th>
                <th style={tableHeaderStyle}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {[...models].sort((a, b) => b.metrics.map50 - a.metrics.map50).map((model) => (
                <tr key={model.id} style={{
                  borderBottom: "1px solid #1e3a5f",
                  background: model.is_active ? "#065f46" : "transparent"
                }}>
                  <td style={tableCellStyle}>
                    {model.is_active && <span style={{ marginRight: "8px" }}>✓</span>}
                    <strong>{model.name}</strong>
                  </td>
                  <td style={tableCellStyle}>{model.architecture}</td>
                  <td style={{...tableCellStyle, fontWeight: "bold", color: model.metrics.map50 >= 0.7 ? "#10b981" : "#e2e8f0"}}>
                    {formatPercent(model.metrics.map50)}

                  </td>
                  <td style={tableCellStyle}>{formatPercent(model.metrics.map50_95)}</td>
                  <td style={tableCellStyle}>{formatPercent(model.metrics.precision)}</td>
                  <td style={tableCellStyle}>{formatPercent(model.metrics.recall)}</td>
                  <td style={tableCellStyle}>{getStatusBadge(model.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Componente auxiliar para métricas
function MetricBox({ label, value, highlight }) {
  return (
    <div>
      <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "4px" }}>{label}</div>
      <div style={{
        fontSize: "18px",
        fontWeight: "bold",
        color: highlight ? "#10b981" : "#e2e8f0"
      }}>
        {value}
        {highlight && " "}
      </div>
    </div>
  );
}

// Estilos de tabla
const tableHeaderStyle = {
  padding: "12px",
  textAlign: "left",
  fontSize: "13px",
  fontWeight: "bold",
  color: "#e2e8f0"
};

const tableCellStyle = {
  padding: "16px 12px",
  fontSize: "14px",
  color: "#e2e8f0"
};