import React, { useState, useEffect } from "react";
import API from "../utils/api";

function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [detections, setDetections] = useState([]);
  const [activeTab, setActiveTab] = useState("stats");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, u, d] = await Promise.all([
        API.get("/admin/stats"),
        API.get("/admin/users"),
        API.get("/admin/detections"),
      ]);
      setStats(s.data);
      setUsers(u.data);
      setDetections(d.data);
    } catch (err) {
      alert("Admin access denied or server error.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Delete user "${userName}"? This cannot be undone.`))
      return;
    setDeletingId(`user-${userId}`);
    try {
      await API.delete(`/admin/users/${userId}`);
      await fetchAll();
    } catch (err) {
      alert("Failed to delete user.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteDetection = async (detectionId) => {
    if (!window.confirm("Delete this detection record? This cannot be undone."))
      return;
    setDeletingId(`detection-${detectionId}`);
    try {
      await API.delete(`/admin/detections/${detectionId}`);
      await fetchAll();
    } catch (err) {
      alert("Failed to delete detection.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredDetections =
    filter === "ALL"
      ? detections
      : detections.filter((d) => d.prediction === filter);

  const formatDate = (dt) => new Date(dt).toLocaleString();

  const deleteBtnStyle = {
    padding: "5px 12px",
    borderRadius: "6px",
    border: "1px solid rgba(212,83,126,0.4)",
    background: "rgba(212,83,126,0.12)",
    color: "#ED93B1",
    fontSize: "11px",
    fontWeight: "600",
    cursor: "pointer",
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "80px", color: "#5f7a5e" }}>
        <div className="spinner" style={{ margin: "0 auto 16px" }} />
        Loading admin data...
      </div>
    );

  return (
    <div className="page-container">
      <h1 className="page-title">🛡️ Admin Dashboard</h1>
      <p className="page-subtitle">
        Complete system overview — all users and detections.
      </p>

      {/* Stats Cards */}
      {stats && (
        <div className="stats-row" style={{ marginBottom: "28px" }}>
          <div className="stats-card">
            <div className="num color-purple">{stats.total_users}</div>
            <div className="lbl">Total Users</div>
          </div>
          <div className="stats-card">
            <div className="num color-purple">{stats.total_detections}</div>
            <div className="lbl">Total Scans</div>
          </div>
          <div className="stats-card">
            <div className="num color-red">{stats.total_fake}</div>
            <div className="lbl">Deepfakes Found</div>
          </div>
          <div className="stats-card">
            <div className="num color-green">{stats.total_real}</div>
            <div className="lbl">Real Files</div>
          </div>
          <div className="stats-card">
            <div className="num color-purple">{stats.fake_rate}%</div>
            <div className="lbl">Fake Rate</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {["stats", "users", "detections"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              background:
                activeTab === tab ? "#3B6D11" : "rgba(255,255,255,0.05)",
              color: activeTab === tab ? "#EAF3DE" : "#5f7a5e",
              transition: "all 0.2s",
            }}
          >
            {tab === "stats"
              ? "📊 Overview"
              : tab === "users"
                ? "👥 Users"
                : "📋 All Detections"}
          </button>
        ))}
        <button
          onClick={fetchAll}
          style={{
            marginLeft: "auto",
            padding: "8px 16px",
            borderRadius: "8px",
            border: "1px solid rgba(29,158,117,0.3)",
            cursor: "pointer",
            fontSize: "12px",
            background: "transparent",
            color: "#5DCAA5",
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "stats" && stats && (
        <div className="table-card" style={{ padding: "24px" }}>
          <h3
            style={{ color: "#97C459", marginBottom: "16px", fontSize: "15px" }}
          >
            System Summary
          </h3>
          <div style={{ display: "grid", gap: "12px" }}>
            {[
              ["Total registered users", stats.total_users],
              ["Total detections performed", stats.total_detections],
              ["Deepfakes detected", stats.total_fake],
              ["Real files verified", stats.total_real],
              ["Overall fake detection rate", `${stats.fake_rate}%`],
              [
                "Average per user",
                stats.total_users > 0
                  ? (stats.total_detections / stats.total_users).toFixed(1) +
                    " scans"
                  : "0",
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 16px",
                  background: "rgba(29,158,117,0.05)",
                  borderRadius: "8px",
                  border: "1px solid rgba(29,158,117,0.1)",
                }}
              >
                <span style={{ fontSize: "13px", color: "#8aa088" }}>
                  {label}
                </span>
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: "700",
                    color: "#97C459",
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="table-card">
          <table className="history-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Total Scans</th>
                <th>Fakes</th>
                <th>Reals</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: "center",
                      color: "#4b5563",
                      padding: "40px",
                    }}
                  >
                    No users yet.
                  </td>
                </tr>
              ) : (
                users.map((u, i) => (
                  <tr key={u.id}>
                    <td style={{ color: "#4b5563" }}>{i + 1}</td>
                    <td style={{ color: "#97C459", fontWeight: "600" }}>
                      {u.name}
                    </td>
                    <td style={{ fontSize: "12px", color: "#6b7280" }}>
                      {u.email}
                    </td>
                    <td style={{ fontSize: "12px", color: "#6b7280" }}>
                      {formatDate(u.created_at)}
                    </td>
                    <td style={{ fontWeight: "700", color: "#e0e8de" }}>
                      {u.total_detections}
                    </td>
                    <td>
                      <span className="badge badge-fake">{u.fake_count}</span>
                    </td>
                    <td>
                      <span className="badge badge-real">{u.real_count}</span>
                    </td>
                    <td>
                      <button
                        style={deleteBtnStyle}
                        disabled={deletingId === `user-${u.id}`}
                        onClick={() => handleDeleteUser(u.id, u.name)}
                      >
                        {deletingId === `user-${u.id}` ? "..." : "🗑️ Delete"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Detections Tab */}
      {activeTab === "detections" && (
        <>
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            {["ALL", "FAKE", "REAL"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "5px 14px",
                  borderRadius: "20px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "600",
                  background:
                    filter === f
                      ? f === "FAKE"
                        ? "rgba(212,83,126,0.2)"
                        : f === "REAL"
                          ? "rgba(29,158,117,0.2)"
                          : "rgba(139,92,246,0.2)"
                      : "rgba(255,255,255,0.05)",
                  color:
                    filter === f
                      ? f === "FAKE"
                        ? "#ED93B1"
                        : f === "REAL"
                          ? "#5DCAA5"
                          : "#a78bfa"
                      : "#5f7a5e",
                }}
              >
                {f === "ALL"
                  ? `All (${detections.length})`
                  : f === "FAKE"
                    ? `⚠️ Fake (${detections.filter((d) => d.prediction === "FAKE").length})`
                    : `✅ Real (${detections.filter((d) => d.prediction === "REAL").length})`}
              </button>
            ))}
          </div>
          <div className="table-card">
            <table className="history-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>File</th>
                  <th>Type</th>
                  <th>Result</th>
                  <th>Confidence</th>
                  <th>Time</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDetections.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        textAlign: "center",
                        color: "#4b5563",
                        padding: "40px",
                      }}
                    >
                      No detections found.
                    </td>
                  </tr>
                ) : (
                  filteredDetections.map((d, i) => (
                    <tr key={d.id}>
                      <td style={{ color: "#4b5563" }}>{i + 1}</td>
                      <td>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "#97C459",
                            fontWeight: "600",
                          }}
                        >
                          {d.name}
                        </div>
                        <div style={{ fontSize: "11px", color: "#4b5563" }}>
                          {d.email}
                        </div>
                      </td>
                      <td
                        style={{
                          maxWidth: "140px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontSize: "12px",
                        }}
                      >
                        {d.filename}
                      </td>
                      <td
                        style={{
                          fontSize: "11px",
                          color: "#6b7280",
                          textTransform: "uppercase",
                        }}
                      >
                        {d.file_type}
                      </td>
                      <td>
                        <span
                          className={`badge badge-${d.prediction.toLowerCase()}`}
                        >
                          {d.prediction === "FAKE" ? "⚠️ " : "✅ "}
                          {d.prediction}
                        </span>
                      </td>
                      <td style={{ fontWeight: "700" }}>{d.confidence}%</td>
                      <td style={{ fontSize: "12px" }}>{d.detection_time}s</td>
                      <td style={{ fontSize: "11px", color: "#6b7280" }}>
                        {formatDate(d.created_at)}
                      </td>
                      <td>
                        <button
                          style={deleteBtnStyle}
                          disabled={deletingId === `detection-${d.id}`}
                          onClick={() => handleDeleteDetection(d.id)}
                        >
                          {deletingId === `detection-${d.id}`
                            ? "..."
                            : "🗑️ Delete"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default Admin;
