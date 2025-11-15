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
  const [modalImage, setModalImage] = useState(null);

  const loadHistory = async () => {
    if (!token) {
      setAnalyses([]);
      return;
    }
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`${API_BASE}/analyses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setAnalyses(data || []);
    } catch (e) {
      console.error(e);
      setErr(e.message || "Error al cargar historial");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [token, lastSavedAt]);

  // ─────────────────────────────────────
  // Formatear dientes FDI por tipo
  // ─────────────────────────────────────
  const formatFdiList = (teethFdi) => {
    if (!teethFdi) return "";

    const parts = [];

    if (teethFdi.Caries && teethFdi.Caries.length > 0) {
      parts.push("C: " + [...teethFdi.Caries].sort((a, b) => a - b).join(", "));
    }

    if (teethFdi.Diente_Retenido && teethFdi.Diente_Retenido.length > 0) {
      parts.push(
        "R: " + [...teethFdi.Diente_Retenido].sort((a, b) => a - b).join(", ")
      );
    }

    if (teethFdi.Perdida_Osea && teethFdi.Perdida_Osea.length > 0) {
      parts.push(
        "P: " + [...teethFdi.Perdida_Osea].sort((a, b) => a - b).join(", ")
      );
    }

    return parts.length > 0 ? parts.join(" | ") : "";
  };

  return (
    <div
      style={{
        background: "#ffffff",
        color: "#000",
        padding: 16,
        borderRadius: 8,
      }}
    >
      <h3>Historial de radiografías</h3>

      {loading && <p>Cargando historial...</p>}
      {err && <div style={{ color: "red" }}>{err}</div>}

      {!loading && !err && analyses.length === 0 && <p>No hay datos aún</p>}

      {!loading && !err && analyses.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Archivo</th>
              <th>Modelo</th>
              <th>Total</th>
              <th>Caries</th>
              <th>Retenido</th>
              <th>Ósea</th>
              <th>Dientes FDI</th>
              <th>Ver imagen</th>
            </tr>
          </thead>
          <tbody>
            {analyses.map((a) => {
              const img = a.image_base64
                ? `data:image/png;base64,${a.image_base64}`
                : null;

              const fechaStr =
                a.created_at_display ||
                (a.created_at
                  ? new Date(a.created_at).toLocaleString()
                  : "");

              return (
                <tr key={a.analysis_id}>
                  <td>{a.id}</td>
                  <td>{fechaStr}</td>
                  <td>{a.image_filename}</td>
                  <td>{a.model_used}</td>
                  <td>{a.total ?? a.total_detections}</td>
                  <td>{a.caries}</td>
                  <td>{a.retenido}</td>
                  <td>{a.osea ?? a.perdida}</td>
                  <td>{formatFdiList(a.teeth_fdi)}</td>
                  <td>
                    {img ? (
                      <button onClick={() => setModalImage(img)}>
                        Ver imagen
                      </button>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* MODAL */}
      {modalImage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
          onClick={() => setModalImage(null)}
        >
          <div
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 12,
              maxWidth: "90%",
              maxHeight: "90%",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={modalImage}
              style={{ maxWidth: "100%", borderRadius: 6 }}
              alt="Radiografía analizada"
            />

            <a
              href={modalImage}
              download="radiografia_analizada.png"
              style={{
                display: "inline-block",
                marginTop: 10,
                padding: "6px 14px",
                background: "#0066ff",
                color: "#fff",
                borderRadius: 6,
              }}
            >
              Descargar imagen
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
