import React, { useRef, useState } from "react";

export function DentalDetectionUI({
  onAnalyze,
  onClear,
  onUpload,
  onSaveToHistory,     //  nuevo callback
  canSave = false,     //  hay resultado listo para guardar
  saving = false,      //  se está guardando en historial
  loading = false,
  error = null,
  annotatedImageSrc = null,
  reportText = "",
  stats = null,
  summary = null,
  detections = [],
  filename = "",
}) {
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [previewSrc, setPreviewSrc] = useState(null);
  const fileInputRef = useRef(null);

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Notificamos al padre
    if (typeof onUpload === "function") onUpload(file);

    // limpiamos vista local
    setPreviewSrc(null);

    const reader = new FileReader();
    reader.onload = (ev) => setPreviewSrc(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleAnalyzeClick = async () => {
    if (!onAnalyze) return;
    setLoadingAnalysis(true);
    try {
      await onAnalyze(); // el padre se encarga de llamar al backend
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleClearClick = () => {
    if (typeof onClear === "function") onClear();
    setPreviewSrc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isLoading = loading || loadingAnalysis;
  const canShowSaveButton = canSave && !isLoading;

  return (
    <div className="dental-ui-root">
      <style>{`
        .dental-ui-root {
          margin: 0;
          font-family: Arial, sans-serif;
          background-color: #003366;
          color: white;
          min-height: 100vh;
        }
        .header {
          background-color: #556677;
          padding: 20px;
          text-align: center;
          font-size: 1.5em;
        }
        .container {
          display: flex;
          flex-wrap: wrap;
          padding: 20px;
          gap: 20px;
        }
        .sidebar { flex: 1 1 300px; margin-right: 0; }
        .legend { margin-bottom: 20px; }
        .legend-item { display: flex; align-items: center; margin-bottom: 10px; font-size: 1.2em; }
        .circle { width: 20px; height: 20px; border-radius: 50%; margin-right: 10px; border: 2px solid rgba(255,255,255,0.35); }
        .red { background-color: #ff0000; }
        .green { background-color: #00ff00; }
        .cyan { background-color: #00ffff; }
        .buttons { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
        .btn {
          padding: 10px 20px;
          font-size: 1em;
          cursor: pointer;
          border: none;
          border-radius: 5px;
          transition: transform .06s ease, box-shadow .12s ease, opacity .12s ease;
        }
        .btn:active { transform: translateY(1px); }
        .analyze, .clear, .save-btn {
          background-color: #ffffff;
          color: #000000;
          box-shadow: 0 2px 6px rgba(0,0,0,.15);
        }
        .save-btn {
          background-color: #28a745;
          color: #ffffff;
        }
        .save-btn[disabled] {
          opacity: 0.6;
          cursor: default;
        }
        .main { flex: 3 1 600px; display: flex; gap: 20px; min-width: 300px; }
        .upload-section, .results-section {
          flex: 1;
          background-color: #f0f0f0;
          padding: 20px;
          border-radius: 5px;
          color: #000000;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .upload-box {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          border: 2px dashed #c7c7c7;
          border-radius: 8px;
          background: #ffffff;
          text-align: center;
          padding: 16px;
          width: 100%;
        }
        .upload-btn {
          background-color: #007bff;
          color: white;
          padding: 15px 30px;
          font-size: 1.1em;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: opacity .15s ease, transform .06s ease;
        }
        .upload-btn:hover { opacity: .95; }
        .upload-btn:active { transform: translateY(1px); }
        .results-box {
          flex: 1;
          background: #ffffff;
          border-radius: 8px;
          border: 1px solid #d7d7d7;
          padding: 12px;
          display: grid;
          grid-template-rows: auto auto 1fr;
          gap: 10px;
          overflow: hidden;
        }
        .img-wrap {
          width: 100%;
          max-height: 360px;
          overflow: auto;
          border: 1px solid #eee;
          border-radius: 6px;
        }
        .img-wrap img { width: 100%; height: auto; display: block; }
        .meta {
          font-size: 14px;
          color: #222;
          display: grid;
          gap: 4px;
        }
        .report {
          white-space: pre-wrap;
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
          font-size: 12px;
          color: #222;
          background: #fafafa;
          border: 1px solid #eee;
          border-radius: 6px;
          padding: 8px;
          max-height: 220px;
          overflow: auto;
        }
        .error {
          color: #b00020;
          background: #fde7e9;
          border: 1px solid #f5c2c7;
          padding: 8px;
          border-radius: 6px;
        }
        .loading { color: #0b5ed7; }
        .preview-wrap {
          margin-top: 10px;
          width: 100%;
          max-height: 260px;
          overflow: auto;
          border-radius: 6px;
          border: 1px solid #d0d0d0;
          background: #ffffff;
          padding: 8px;
        }
        .preview-wrap img {
          display: block;
          width: 100%;
          height: auto;
        }
        .progress {
          margin-top: 10px;
          width: 100%;
          height: 6px;
          background: #e0e0e0;
          border-radius: 3px;
          overflow: hidden;
        }
        .progress-inner {
          width: 40%;
          height: 100%;
          background: #007bff;
          animation: progressIndeterminate 1s linear infinite;
        }
        @keyframes progressIndeterminate {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
        h2 { margin: 0; color: #000000; }
        @media (max-width: 1024px) { .main { flex-direction: column; } }
      `}</style>

      <div className="header">Sistema de detección de problemas dentales</div>

      <div className="container">
        <aside className="sidebar">
          <section className="legend" aria-label="Leyenda de clases de detección">
            <div className="legend-item"><span className="circle red" />caries</div>
            <div className="legend-item"><span className="circle green" />diente retenido</div>
            <div className="legend-item"><span className="circle cyan" />perdida osea</div>
          </section>

          <div className="buttons">
            <button
              type="button"
              className="btn analyze"
              onClick={handleAnalyzeClick}
              disabled={isLoading}
            >
              {isLoading ? "analizando..." : "analizar radiografía"}
            </button>

            <button
              type="button"
              className="btn clear"
              onClick={handleClearClick}
              disabled={isLoading}
            >
              limpiar
            </button>

            {canShowSaveButton && (
              <button
                type="button"
                className="btn save-btn"
                onClick={onSaveToHistory}
                disabled={saving}
              >
                {saving ? "guardando..." : "Guardar en mi historial"}
              </button>
            )}
          </div>

          {filename && (
            <div style={{ fontSize: 12, opacity: 0.85 }}>
              archivo: <b>{filename}</b>
            </div>
          )}
          {error && <div className="error">{error}</div>}
        </aside>

        <main className="main">
          <section className="upload-section">
            <h2>SUBIR IMAGEN</h2>
            <div className="upload-box">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <button
                type="button"
                className="upload-btn"
                onClick={handlePickFile}
                disabled={isLoading}
              >
                {isLoading ? "Procesando..." : "Subir imagen"}
              </button>
              <p style={{ color: "#333", marginTop: 10, fontSize: 14 }}>
                JPG, PNG o DICOM exportado a imagen
              </p>

              {previewSrc && (
                <div className="preview-wrap">
                  <img src={previewSrc} alt="Radiografía seleccionada" />
                </div>
              )}

              {loadingAnalysis && (
                <div className="progress">
                  <div className="progress-inner" />
                </div>
              )}
            </div>
          </section>

          <section className="results-section">
            <h2>Resultados con detección</h2>
            <div className="results-box" aria-live="polite" aria-atomic="true">
              <div className="img-wrap">
                {annotatedImageSrc ? (
                  <img src={annotatedImageSrc} alt="Resultado anotado" />
                ) : (
                  <div style={{ color: "#777", padding: 12 }}>
                    {isLoading ? (
                      <span className="loading">Analizando imagen...</span>
                    ) : (
                      "Aquí verás la imagen anotada"
                    )}
                  </div>
                )}
              </div>

              <div className="meta">
                {summary && (
                  <>
                    <div><b>Total detecciones:</b> {summary.total ?? 0}</div>
                    {summary.per_class && (
                      <div>
                        <b>Por clase:</b>{" "}
                        {Object
                          .entries(summary.per_class)
                          .map(([k, v]) => `${k}=${v}`)
                          .join(" · ")}
                      </div>
                    )}
                  </>
                )}
                {!!detections?.length && (
                  <div style={{ fontSize: 12, color: "#333" }}>
                    <b>Detecciones:</b> {detections.length} &nbsp;|&nbsp;{" "}
                    {detections
                      .slice(0, 3)
                      .map(d => `${d.class_name} (${(d.confidence * 100).toFixed(0)}%)`)
                      .join(" · ")}
                    {detections.length > 3 ? "…" : ""}
                  </div>
                )}
              </div>

              {stats && (
                <div className="report">
                  <h3>Estadísticas detalladas</h3>
                  <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>
                    {typeof stats === "string"
                      ? stats
                      : JSON.stringify(stats, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
