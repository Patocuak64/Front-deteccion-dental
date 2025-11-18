// src/Page.jsx
import React, { useState } from "react";
import { DentalDetectionUI } from "./DentalDetectionUI.jsx";
import { AuthPanel } from "./AuthPanel.jsx";
import { HistoryPanel } from "./HistoryPanel.jsx";
import { ModelsPanel } from "./ModelsPanel.jsx"; 

const API_BASE = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(
  /\/+$/,
  ""
);

export function Page() {
  // Auth
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [email, setEmail] = useState(localStorage.getItem("user_email") || "");
  const [activeTab, setActiveTab] = useState("analyze"); 

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
  const [teethFdi, setTeethFdi] = useState(null);

  const [canSave, setCanSave] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(0);

  // ──────────────────────────────────
  // Auth callbacks
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
    // limpiamos estado de análisis por si acaso
    setFile(null);
    setImageSrc(null);
    setReportText("");
    setStats(null);
    setSummary(null);
    setDetections([]);
    setTeethFdi(null);
    setErr(null);
    setCanSave(false);
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
    setTeethFdi(null);
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
      url = `${API_BASE}/analyze`;
      headers["Authorization"] = `Bearer ${token}`;
    }

    const resp = await fetch(url, { method: "POST", headers, body: fd });

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
      setTeethFdi(data.teeth_fdi || null);
      setImageSrc(
        data.image_base64 ? `data:image/png;base64,${data.image_base64}` : null
      );

      setCanSave(true);
    } catch (e) {
      console.error(e);
      setErr(e.message || "Error procesando la imagen");
    } finally {
      setLoading(false);
    }
  };

  // ──────────────────────────────────
  // Guardar en historial
  // ──────────────────────────────────
  const onSaveToHistory = async () => {
    try {
      setErr(null);
      setSaving(true);

      const data = await callAnalyzeEndpoint({ save: true });

      setReportText(data.report_text || "");
      setStats(data.stats || null);
      setSummary(data.summary || null);
      setDetections(Array.isArray(data.detections) ? data.detections : []);
      setTeethFdi(data.teeth_fdi || null);
      setImageSrc(
        data.image_base64 ? `data:image/png;base64,${data.image_base64}` : null
      );

      setLastSavedAt(Date.now()); // refresca <HistoryPanel/>
    } catch (e) {
      console.error(e);
      setErr(e.message || "No se pudo guardar en tu historial");
    } finally {
      setSaving(false);
    }
  };

  // ──────────────────────────────────
  // Vista LOGIN
  // ──────────────────────────────────
  if (!token) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f172a",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: 1000,
            width: "100%",
            display: "grid",
            gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)",
            gap: 32,
            alignItems: "center",
          }}
        >
          <div>
            <h1 style={{ fontSize: 32, marginBottom: 16 }}>
              DentalSmart · detección de problemas dentales
            </h1>
            <p style={{ fontSize: 16, opacity: 0.9 }}>
              Crea una cuenta para guardar el historial de radiografías
              analizadas y comparar la evolución de tus pacientes.
            </p>
          </div>
          <AuthPanel onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  // ──────────────────────────────────
  // Vista PRINCIPAL (logueado)
  // ──────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#003366", color: "#fff" }}>
      {/* barra superior */}
      <header
        style={{
          background: "#0b213f",
          padding: "10px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#fff",
        }}
      >
        <div style={{ fontWeight: "bold" }}>DentalSmart</div>
        <div style={{ fontSize: 14 }}>
          Sesión iniciada como <b>{email}</b>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              marginLeft: 12,
              padding: "4px 10px",
              fontSize: 13,
              borderRadius: 4,
              border: "none",
              cursor: "pointer",
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Pestañas de navegación */}
      <div
        style={{
          background: "#0b213f",
          borderBottom: "2px solid #1e3a5f",
          display: "flex",
          gap: "4px",
          padding: "0 20px",
        }}
      >
        <button
          onClick={() => setActiveTab("analyze")}
          style={{
            padding: "14px 24px",
            background: activeTab === "analyze" ? "#003366" : "transparent",
            color: activeTab === "analyze" ? "#fff" : "#94a3b8",
            border: "none",
            borderBottom: activeTab === "analyze" ? "3px solid #3b82f6" : "3px solid transparent",
            cursor: "pointer",
            fontSize: "15px",
            fontWeight: activeTab === "analyze" ? "bold" : "normal",
            transition: "all 0.2s",
          }}
        >
          Analizar
        </button>
        <button
          onClick={() => setActiveTab("history")}
          style={{
            padding: "14px 24px",
            background: activeTab === "history" ? "#003366" : "transparent",
            color: activeTab === "history" ? "#fff" : "#94a3b8",
            border: "none",
            borderBottom: activeTab === "history" ? "3px solid #3b82f6" : "3px solid transparent",
            cursor: "pointer",
            fontSize: "15px",
            fontWeight: activeTab === "history" ? "bold" : "normal",
            transition: "all 0.2s",
          }}
        >
           Historial
        </button>
        <button
          onClick={() => setActiveTab("models")}
          style={{
            padding: "14px 24px",
            background: activeTab === "models" ? "#003366" : "transparent",
            color: activeTab === "models" ? "#fff" : "#94a3b8",
            border: "none",
            borderBottom: activeTab === "models" ? "3px solid #3b82f6" : "3px solid transparent",
            cursor: "pointer",
            fontSize: "15px",
            fontWeight: activeTab === "models" ? "bold" : "normal",
            transition: "all 0.2s",
          }}
        >
           Modelos
        </button>
      </div>

      {/*  Contenido condicional según pestaña */}
      {activeTab === "analyze" && (
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
          teethFdi={teethFdi}
          filename={file?.name}
        />
      )}

      {activeTab === "history" && (
        <div style={{ padding: 20 }}>
          <HistoryPanel token={token} lastSavedAt={lastSavedAt} />
        </div>
      )}

      {activeTab === "models" && (
        <div style={{ padding: 20 }}>
          <ModelsPanel token={token} />
        </div>
      )}
    </div>
  );
}