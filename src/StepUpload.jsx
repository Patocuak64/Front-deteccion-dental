// src/StepUpload.jsx
import React, { useRef, useState } from "react";

export function StepUpload({ onNext, loading }) {
  const [previewSrc, setPreviewSrc] = useState(null);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreviewSrc(null);

    const reader = new FileReader();
    reader.onload = (ev) => setPreviewSrc(ev.target.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleContinue = () => {
    if (file) {
      onNext?.(file);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.iconWrapper}>
          <span style={styles.icon}>📤</span>
        </div>

        <h2 style={styles.title}>Subir Radiografía Dental</h2>
        <p style={styles.description}>
          Selecciona una imagen de radiografía panorámica dental para analizar.
          <br />
          Formatos soportados: JPG, PNG o DICOM exportado a imagen
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        <button
          type="button"
          onClick={handlePickFile}
          disabled={loading}
          style={{
            ...styles.uploadButton,
            ...(loading && styles.uploadButtonDisabled),
          }}
        >
          {loading ? "Procesando..." : "📁 Seleccionar Imagen"}
        </button>

        {previewSrc && (
          <div style={styles.previewContainer}>
            <div style={styles.previewLabel}>Vista previa:</div>
            <div style={styles.previewWrapper}>
              <img src={previewSrc} alt="Vista previa" style={styles.previewImage} />
            </div>

            {file && (
              <div style={styles.fileInfo}>
                <span style={styles.fileName}>📄 {file.name}</span>
                <span style={styles.fileSize}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            )}
          </div>
        )}

        {file && !loading && (
          <button type="button" onClick={handleContinue} style={styles.continueButton}>
            Continuar al Análisis →
          </button>
        )}

        {loading && (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>Cargando imagen...</p>
          </div>
        )}
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
    maxWidth: "700px",
    width: "100%",
    background: "#ffffff",
    borderRadius: "20px",
    padding: "50px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    textAlign: "center",
  },
  iconWrapper: {
    marginBottom: "20px",
  },
  icon: {
    fontSize: "80px",
    display: "inline-block",
    animation: "bounce 2s ease-in-out infinite",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: "16px",
    margin: 0,
  },
  description: {
    fontSize: "16px",
    color: "#64748b",
    marginBottom: "30px",
    lineHeight: "1.6",
  },
  uploadButton: {
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "#ffffff",
    padding: "18px 40px",
    fontSize: "18px",
    fontWeight: "bold",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
  },
  uploadButtonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  previewContainer: {
    marginTop: "30px",
    animation: "fadeIn 0.5s ease-in",
  },
  previewLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#64748b",
    marginBottom: "12px",
  },
  previewWrapper: {
    border: "3px solid #e2e8f0",
    borderRadius: "12px",
    overflow: "hidden",
    background: "#f8fafc",
    padding: "10px",
    maxHeight: "400px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    maxWidth: "100%",
    maxHeight: "380px",
    width: "auto",
    height: "auto",
    borderRadius: "8px",
  },
  fileInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "12px",
    padding: "12px 16px",
    background: "#f1f5f9",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#475569",
  },
  fileName: {
    fontWeight: "600",
  },
  fileSize: {
    color: "#94a3b8",
  },
  continueButton: {
    marginTop: "24px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#ffffff",
    padding: "16px 36px",
    fontSize: "16px",
    fontWeight: "bold",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)",
  },
  loadingContainer: {
    marginTop: "24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    color: "#64748b",
    fontSize: "14px",
    margin: 0,
  },
};

// Agregar keyframes en un style tag global
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}
