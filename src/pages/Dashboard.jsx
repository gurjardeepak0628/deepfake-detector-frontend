import React, { useState, useRef } from "react";
import API from "../utils/api";

function Dashboard() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setResult(null);
    const url = URL.createObjectURL(f);
    setPreview(url);
    setFileType(f.type.startsWith("video") ? "video" : "image");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await API.post("/detect", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      alert("Detection failed. Make sure backend is running.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setFileType(null);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="page-container">
      <h1 className="page-title">🔍 Deepfake Detection</h1>
      <p className="page-subtitle">
        Upload an image or video to check if it's real or AI-generated.
      </p>

      {/* Upload Box */}
      {!file && (
        <div
          className={`upload-box ${dragOver ? "drag-over" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
          <div className="upload-icon">📁</div>
          <h3>Drop your file here</h3>
          <p>or click to browse from your device</p>
          <div className="upload-types">
            {["JPG", "PNG", "MP4", "AVI", "MOV", "WEBM"].map((t) => (
              <span key={t} className="type-badge">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Preview */}
      {file && (
        <div className="preview-section">
          <div className="preview-header">
            <h4>📄 {file.name}</h4>
            <span className="file-info">
              {formatSize(file.size)} · {fileType}
            </span>
          </div>

          {fileType === "image" ? (
            <img src={preview} alt="preview" className="preview-media" />
          ) : (
            <video src={preview} controls className="preview-media" />
          )}

          {analyzing ? (
            <div className="analyzing-overlay">
              <div className="spinner" />
              <p>Analyzing with AI model... please wait</p>
            </div>
          ) : (
            !result && (
              <button className="btn-detect" onClick={handleAnalyze}>
                🧠 Analyze for Deepfake
              </button>
            )
          )}

          {result && (
            <div className={`result-card ${result.prediction.toLowerCase()}`}>
              <div className={`result-badge`}>
                {result.prediction === "FAKE" ? "⚠️" : "✅"} {result.prediction}
              </div>
              <div className="result-stats">
                <div className="stat-item">
                  <div className="stat-label">Confidence</div>
                  <div className="stat-value">{result.confidence}%</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Detection time</div>
                  <div className="stat-value">{result.detection_time}s</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">File type</div>
                  <div className="stat-value" style={{ fontSize: "16px" }}>
                    {fileType?.toUpperCase()}
                  </div>
                </div>
              </div>
              <div className="confidence-bar-wrap">
                <label>Confidence level — {result.confidence}%</label>
                <div className="confidence-bar">
                  <div
                    className="confidence-fill"
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
              </div>

              {result.reason && (
                <div
                  style={{
                    marginTop: "16px",
                    padding: "12px 14px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    fontSize: "13px",
                    color: "#9ca3af",
                    lineHeight: "1.5",
                  }}
                >
                  <strong style={{ color: "#d1d5db" }}>Reason: </strong>
                  {result.reason}
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleReset}
            style={{
              marginTop: "16px",
              background: "none",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#6b7280",
              padding: "9px 20px",
              cursor: "pointer",
              fontSize: "13px",
              width: "100%",
            }}
          >
            Upload another file
          </button>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
