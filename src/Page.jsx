import React, { useState } from "react";
import { DentalDetectionUI } from "./DentalDetectionUI.jsx";
import { AuthPanel } from "./AuthPanel.jsx";
import { HistoryPanel } from "./HistoryPanel.jsx";

const API_BASE = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(
  /\/+$/,
  ""
);

export function Page() {
  // Auth
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [email, setEmail] = useState(localStorage.getItem("user_email") || "");

  // Análisis
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const [imageSrc, setImageSrc] = useState(null);
  const [reportText, setReportText] = useState("");
  const [stats, setStats] = useState(null);
  const [summary, setSummary] = useState(null);
  const [detections, setDetections] = useState([]);

  const [canSave, setCanSave] = useState(false); // hay resultado listo para guardar
  const [lastSavedAt, setLastSavedAt] = useState(0); // 👈 para refrescar historial

  // ──────────────────────────────────
  // Callbacks de autenticación
  // ──────────────────────────────────
  const handleLogin = (newToken, userEmail) => {
    setToken(newToken);
    setEmail(userEmail);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user_email", userEmail);
  };

  const handleLogout = () => {
    setToken("");
    setEmail("");
    localStorage.removeItem("token");
    localStorage.removeItem("user_email");
  };

  // ──────────────────────────────────
  // Carga / limpieza de archivo
  // ──────────────────────────────────
  const onUpload = (f) => {
    setFile(f);
    setErr(null);
    setCanSave(false);
  };

  const onClear = () => {
    setFile(null);
    setImageSrc(null);
    setReportText("");
    setStats(null);
    setSummary(null);
    setDetections([]);
    setErr(null);
    setCanSave(false);
  };

  // ──────────────────────────────────
  // Llamada genérica al backend
  // ──────────────────────────────────
  const callAnalyzeEndpoint = async ({ save }) => {
    if (!file) {
      throw new Error("Primero sube una imagen.");
    }

    if (save && !token) {
      throw new Error("Debes iniciar sesión para guardar en tu historial.");
    }

    const fd = new FormData();
    fd.append("file", file);
    fd.append("confidence", "0.25");
    fd.append("return_image", "true");
    if (save) fd.append("save", "true");

    let url = `${API_BASE}/analyze-public`;
    const headers = {};

    if (token) {
      // Si hay token usamos el endpoint protegido
      url = `${API_BASE}/analyze`;
      headers["Authorization"] = `Bearer ${token}`;
    }

    const resp = await fetch(url, {
      method: "POST",
      headers,
      body: fd,
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(text || `Error HTTP ${resp.status}`);
    }

    return resp.json();
  };

  // ──────────────────────────────────
  // Analizar (solo ver resultados)
  // ──────────────────────────────────
  const onAnalyze = async () => {
    try {
      setErr(null);
      setLoading(true);
      setCanSave(false);

      const data = await callAnalyzeEndpoint({ save: false });

      setReportText(data.report_text || "");
      setStats(data.stats || null);
      setSummary(data.summary || null);
      setDetections(Array.isArray(data.detections) ? data.detections : []);
      setImageSrc(
        data.image_base64 ? `data:image/png;base64,${data.image_base64}` : null
      );

      setCanSave(true); // ahora sí se puede guardar en historial
    } catch (e) {
      console.error(e);
      setErr(e.message || "Error procesando la imagen");
    } finally {
      setLoading(false);
    }
  };

  // ──────────────────────────────────
  // Guardar en historial (botón aparte)
  // ──────────────────────────────────
  const onSaveToHistory = async () => {
    try {
      setErr(null);
      setSaving(true);

      const data = await callAnalyzeEndpoint({ save: true });

      //  refrescar vista con los datos devueltos
      setReportText(data.report_text || "");
      setStats(data.stats || null);
      setSummary(data.summary || null);
      setDetections(Array.isArray(data.detections) ? data.detections : []);
      setImageSrc(
        data.image_base64 ? `data:image/png;base64,${data.image_base64}` : null
      );

      //  Disparamos un "evento" de que hubo un guardado nuevo
      setLastSavedAt(Date.now());
    } catch (e) {
      console.error(e);
      setErr(e.message || "No se pudo guardar en tu historial");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Panel de autenticación arriba */}
      <div style={{ padding: 12 }}>
        <AuthPanel
          token={token}
          email={email}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
      </div>

      {/* UI principal del análisis */}
      <DentalDetectionUI
        onAnalyze={onAnalyze}
        onClear={onClear}
        onUpload={onUpload}
        onSaveToHistory={onSaveToHistory}
        loading={loading}
        saving={saving}
        canSave={canSave}
        error={err}
        annotatedImageSrc={imageSrc}
        reportText={reportText}
        stats={stats}
        summary={summary}
        detections={detections}
        filename={file?.name}
      />

      {/* Historial solo visible si hay usuario logueado */}
      {token && (
        <div style={{ padding: 20 }}>
          <HistoryPanel token={token} lastSavedAt={lastSavedAt} />
        </div>
      )}
    </div>
  );
}
