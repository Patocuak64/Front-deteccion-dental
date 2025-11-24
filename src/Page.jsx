// src/Page.jsx
import React, { useState } from "react";
import { AuthPanel } from "./AuthPanel.jsx";
import { HistoryPanel } from "./HistoryPanel.jsx";
import { ModelsPanel } from "./ModelsPanel.jsx"; 
import { StepIndicator } from "./StepIndicator.jsx";
import { StepUpload } from "./StepUpload.jsx";
import { StepResults } from "./StepResults.jsx";
import { StepActions } from "./StepActions.jsx";
import { Toast } from "./Toast.jsx";

const API_BASE = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(
  /\/+$/,
  ""
);

export function Page() {
  // Auth
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [email, setEmail] = useState(localStorage.getItem("user_email") || "");
  const [activeTab, setActiveTab] = useState("analyze"); 

  // Sistema de pasos
  const [currentStep, setCurrentStep] = useState(1); // 1: Upload, 2: Results, 3: Actions

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

  const [lastSavedAt, setLastSavedAt] = useState(0);

  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  // Definición de pasos
  const steps = [
    { label: "Subir Imagen" },
    { label: "Ver Resultados" },
    { label: "Guardar y Descargar" },
  ];

  // ──────────────────────────────────
  // Auth callbacks
  // ──────────────────────────────────
  const handleLogin = (newToken, userEmail) => {
    setToken(newToken);
    setEmail(userEmail);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user_email", userEmail);
    showToast("¡Sesión iniciada correctamente!", "success");
  };

  const handleLogout = () => {
    setToken("");
    setEmail("");
    localStorage.removeItem("token");
    localStorage.removeItem("user_email");
    
    // Limpiar estado
    resetAnalysis();
    showToast("Sesión cerrada", "info");
  };

  // ──────────────────────────────────
  // Reiniciar análisis completo
  // ──────────────────────────────────
  const resetAnalysis = () => {
    setFile(null);
    setImageSrc(null);
    setReportText("");
    setStats(null);
    setSummary(null);
    setDetections([]);
    setTeethFdi(null);
    setErr(null);
    setCurrentStep(1);
  };

  // ──────────────────────────────────
  // Paso 1: Subir imagen
  // ──────────────────────────────────
  const handleUploadNext = async (uploadedFile) => {
    setFile(uploadedFile);
    setErr(null);
    
    // Inmediatamente llamar al análisis
    setLoading(true);
    try {
      await performAnalysis(uploadedFile);
      setCurrentStep(2);
      showToast("¡Imagen analizada exitosamente!", "success");
    } catch (e) {
      console.error(e);
      setErr(e.message || "Error procesando la imagen");
      showToast(e.message || "Error al analizar la imagen", "error");
    } finally {
      setLoading(false);
    }
  };

  // ──────────────────────────────────
  // Llamada genérica al backend
  // ──────────────────────────────────
  const performAnalysis = async (fileToAnalyze, shouldSave = false) => {
    if (!fileToAnalyze) {
      throw new Error("No hay imagen para analizar");
    }

    const fd = new FormData();
    fd.append("file", fileToAnalyze);
    fd.append("confidence", "0.25");
    fd.append("return_image", "true");
    if (shouldSave) fd.append("save", "true");

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

    const data = await resp.json();

    // Actualizar estados
    setReportText(data.report_text || "");
    setStats(data.stats || null);
    setSummary(data.summary || null);
    setDetections(Array.isArray(data.detections) ? data.detections : []);
    setTeethFdi(data.teeth_fdi || null);
    setImageSrc(
      data.image_base64 ? `data:image/png;base64,${data.image_base64}` : null
    );

    return data;
  };

  // ──────────────────────────────────
  // Paso 2: Ver resultados → siguiente
  // ──────────────────────────────────
  const handleResultsNext = () => {
    setCurrentStep(3);
  };

  const handleResultsBack = () => {
    setCurrentStep(1);
    resetAnalysis();
  };

  // ──────────────────────────────────
  // Paso 3: Guardar en historial
  // ──────────────────────────────────
  const handleSaveToHistory = async () => {
    if (!token) {
      showToast("Debes iniciar sesión para guardar en el historial", "warning");
      return;
    }

    try {
      setSaving(true);
      await performAnalysis(file, true);
      setLastSavedAt(Date.now());
      showToast("¡Análisis guardado en tu historial exitosamente!", "success");
    } catch (e) {
      console.error(e);
      showToast(e.message || "Error al guardar en el historial", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleStartNew = () => {
    resetAnalysis();
    showToast("Listo para un nuevo análisis", "info");
  };

  // ──────────────────────────────────
  // Cambiar de pestaña
  // ──────────────────────────────────
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "analyze") {
      resetAnalysis();
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
      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
          duration={4000}
        />
      )}

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
        <div style={{ fontWeight: "bold", fontSize: "18px" }}>DentalSmart</div>
        <div style={{ fontSize: 14 }}>
          Sesión iniciada como <b>{email}</b>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              marginLeft: 12,
              padding: "6px 14px",
              fontSize: 13,
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              background: "#ef4444",
              color: "#fff",
              fontWeight: "500",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#dc2626";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#ef4444";
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
          onClick={() => handleTabChange("analyze")}
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
          onClick={() => handleTabChange("history")}
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
          onClick={() => handleTabChange("models")}
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

      {/* Contenido condicional según pestaña */}
      {activeTab === "analyze" && (
        <>
          {/* Indicador de pasos */}
          <StepIndicator currentStep={currentStep} steps={steps} />

          {/* Paso 1: Subir imagen */}
          {currentStep === 1 && (
            <StepUpload onNext={handleUploadNext} loading={loading} />
          )}

          {/* Paso 2: Ver resultados */}
          {currentStep === 2 && (
            <StepResults
              annotatedImageSrc={imageSrc}
              reportText={reportText}
              stats={stats}
              summary={summary}
              detections={detections}
              teethFdi={teethFdi}
              loading={loading}
              onNext={handleResultsNext}
              onBack={handleResultsBack}
            />
          )}

          {/* Paso 3: Guardar y descargar */}
          {currentStep === 3 && (
            <StepActions
              annotatedImageSrc={imageSrc}
              onSaveToHistory={handleSaveToHistory}
              onStartNew={handleStartNew}
              saving={saving}
              isLoggedIn={!!token}
            />
          )}
        </>
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
















