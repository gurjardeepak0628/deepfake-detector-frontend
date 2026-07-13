import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/api";

function BinaryRain() {
  const columns = [
    { left: "4%", duration: "14s", delay: "0s" },
    { left: "12%", duration: "18s", delay: "2s" },
    { left: "88%", duration: "16s", delay: "1s" },
    { left: "95%", duration: "20s", delay: "3s" },
  ];
  const bits = Array.from({ length: 25 }, () =>
    Math.random().toString(2).slice(2, 7),
  ).join("\n");

  return (
    <div className="binary-bg">
      {columns.map((col, i) => (
        <div
          key={i}
          className="binary-col"
          style={{
            left: col.left,
            animationDuration: col.duration,
            animationDelay: col.delay,
          }}
        >
          {bits}
        </div>
      ))}
    </div>
  );
}

function ScanFrame() {
  return (
    <>
      <div className="scan-corner tl"></div>
      <div className="scan-corner tr"></div>
      <div className="scan-corner bl"></div>
      <div className="scan-corner br"></div>
      <div className="scan-label top-left">SCAN</div>
      <div className="scan-label bottom-right">v2.1</div>
    </>
  );
}

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <BinaryRain />
      <ScanFrame />

      <div className="auth-card">
        <div className="auth-logo">
          <div className="icon-circle">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#97C459"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12l4 4 10-10" />
            </svg>
          </div>
          <h1>DeepGuard AI</h1>
          <p>Real vs fake verification</p>
        </div>

        <h2>Sign in to your account</h2>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email address</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-link">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>

        <div className="auth-footer">
          <span className="status-dot"></span>
          AI ENGINE ONLINE — SECURED DETECTION ACTIVE
        </div>
      </div>
    </div>
  );
}

export default Login;
