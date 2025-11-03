import React, { useState } from "react";
import {DentalDetectionUI} from "./DentalDetectionUI.jsx";

const API_BASE =
  (import.meta.env.VITE_API_URL|| "http://127.0.0.1:8000").replace(/\/+$/, "");

export function Page() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [reportText, setReportText] = useState("");
  const [stats, setStats] = useState(null);
  const [summary, setSummary] = useState(null);
  const [detections, setDetections] = useState([]);

  const onUpload = (f) => {
    setFile(f);
    setErr(null);
    // si quieres auto-analizar al subir:
    // onAnalyze();
  };

  const onAnalyze = async () => {
    try {
      setErr(null);
      if (!file) {
        setErr("Primero sube una imagen.");
        return;
      }
      setLoading(true);

      const fd = new FormData();
      fd.append("file", file);
      fd.append("confidence", "0.25");
      fd.append("return_image", "true");
      fd.append("save", "false");

      const resp = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        body: fd,
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(`HTTP ${resp.status} - ${text || resp.statusText}`);
      }

      const data = await resp.json();

      setReportText(data.report_text || "");
      setStats(data.stats || null);
      setSummary(data.summary || null);
      setDetections(Array.isArray(data.detections) ? data.detections : []);
      setImageSrc(data.image_base64 ? `data:image/png;base64,${data.image_base64}` : null);
    } catch (e) {
      console.error(e);
      setErr(e.message || "Error procesando la imagen");
    } finally {
      setLoading(false);
    }
  };

  const onClear = () => {
    setFile(null);
    setImageSrc(null);
    setReportText("");
    setStats(null);
    setSummary(null);
    setDetections([]);
    setErr(null);
  };

  return (
    <DentalDetectionUI
      onAnalyze={onAnalyze}
      onClear={onClear}
      onUpload={onUpload}
      loading={loading}
      error={err}
      annotatedImageSrc={imageSrc}
      reportText={reportText}
      stats={stats}
      summary={summary}
      detections={detections}
      filename={file?.name}
    />
  );
}
