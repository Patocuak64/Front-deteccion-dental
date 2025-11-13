// src/HistoryPanel.jsx
import { useEffect, useState } from "react";

const API_BASE = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(
  /\/+$/,
  ""
);

export function HistoryPanel({ token, lastSavedAt }) {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const loadHistory = async () => {
    if (!token) return;
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`${API_BASE}/analyses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Error HTTP ${res.status}`);
      }
      const data = await res.json();
      // asumimos que data es un array
      setAnalyses(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error cargando historial:", e);
      setErr(e.message || "No se pudo cargar el historial.");
    } finally {
      setLoading(false);
    }
  };

  // Cargar al montar y cada vez que haya un nuevo guardado
  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, lastSavedAt]);

  if (!token) {
    return (
      <div>
        <h3>Historial de radiografías</h3>
        <p>Inicia sesión para ver tu historial.</p>
      </div>
    );
  }

  return (
    <div>
      <h3>Historial de radiografías</h3>

      <button
        type="button"
        onClick={loadHistory}
        disabled={loading}
        style={{ marginBottom: 10, padding: "4px 10px", fontSize: 13 }}
      >
        {loading ? "Actualizando..." : "Actualizar historial"}
      </button>

      {err && (
        <div style={{ color: "#b00020", fontSize: 13, marginBottom: 8 }}>
          {err}
        </div>
      )}

      {!loading && analyses.length === 0 && !err && (
        <p>No hay análisis guardados todavía.</p>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {analyses.map((a) => {
          const id = a.id ?? a.analysis_id ?? a.uuid ?? a.pk;
          const createdRaw = a.created_at || a.createdAt || a.timestamp;
          const createdStr = createdRaw
            ? new Date(createdRaw).toLocaleString()
            : "Fecha desconocida";

          const fileName = a.file_name || a.filename || `Análisis ${id ?? "?"}`;

          // Si el backend algún día expone una URL de imagen, la mostramos:
          const imgUrl =
            a.image_url ||
            a.annotated_image_url ||
            a.image_path?.startsWith("http")
              ? a.image_path
              : null;

          return (
            <div
              key={id || Math.random()}
              style={{
                border: "1px solid #ddd",
                borderRadius: 6,
                padding: 8,
                background: "#fafafa",
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                {fileName}
              </div>
              <div style={{ fontSize: 12, marginBottom: 4 }}>{createdStr}</div>

              {a.summary && (
                <div style={{ fontSize: 13, marginBottom: 4 }}>
                  <b>Resumen:</b> {a.summary}
                </div>
              )}

              {a.stats && (
                <div style={{ fontSize: 12, marginBottom: 4 }}>
                  <b>Stats:</b>{" "}
                  {typeof a.stats === "string"
                    ? a.stats
                    : JSON.stringify(a.stats)}
                </div>
              )}

              {imgUrl && (
                <div
                  style={{
                    marginTop: 6,
                    maxHeight: 180,
                    overflow: "auto",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    background: "#fff",
                  }}
                >
                  <img
                    src={imgUrl}
                    alt={fileName}
                    style={{ width: "100%", display: "block" }}
                  />
                </div>
              )}

              {/* Bloque de depuración: ver TODO lo que manda el backend */}
              <details style={{ marginTop: 6 }}>
                <summary style={{ fontSize: 12, cursor: "pointer" }}>
                  Ver JSON completo
                </summary>
                <pre
                  style={{
                    fontSize: 11,
                    whiteSpace: "pre-wrap",
                    background: "#fff",
                    borderRadius: 4,
                    border: "1px solid #eee",
                    padding: 6,
                    marginTop: 4,
                  }}
                >
                  {JSON.stringify(a, null, 2)}
                </pre>
              </details>
            </div>
          );
        })}
      </div>
    </div>
  );
}
