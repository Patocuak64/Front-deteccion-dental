// src/AuthPanel.jsx
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function extractErrorMessage(data, fallback = "Error") {
  if (!data) return fallback;
  if (typeof data.detail === "string") return data.detail;

  if (Array.isArray(data.detail)) {
    const msgs = data.detail.map((d) => d?.msg).filter(Boolean);
    if (msgs.length) return msgs.join(" | ");
  }
  return fallback;
}

export function AuthPanel({ onLogin }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [formEmail, setFormEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // LOGIN (OAuth2 password, form-urlencoded)
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const body = new URLSearchParams();
      body.append("username", formEmail);
      body.append("password", password);

      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = extractErrorMessage(data, "Error al iniciar sesión");
        throw new Error(msg);
      }

      const token = data.access_token;
      if (!token) throw new Error("Respuesta sin token");

      onLogin?.(token, formEmail);
      localStorage.setItem("token", token);
      localStorage.setItem("user_email", formEmail);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  // REGISTRO (JSON + login automático)
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const resReg = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formEmail, password }),
      });

      const dataReg = await resReg.json().catch(() => null);
      if (!resReg.ok) {
        const msg = extractErrorMessage(dataReg, "Error al registrar");
        throw new Error(msg);
      }

      const body = new URLSearchParams();
      body.append("username", formEmail);
      body.append("password", password);

      const resLogin = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });

      const dataLogin = await resLogin.json().catch(() => null);
      if (!resLogin.ok) {
        const msg = extractErrorMessage(
          dataLogin,
          "Error al iniciar sesión después de registrarte"
        );
        throw new Error(msg);
      }

      const token = dataLogin.access_token;
      if (!token) throw new Error("Respuesta sin token");

      onLogin?.(token, formEmail);
      localStorage.setItem("token", token);
      localStorage.setItem("user_email", formEmail);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#ffffff",
        padding: 24,
        borderRadius: 10,
        boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
        width: "100%",
        maxWidth: 420,
      }}
    >
      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={() => setMode("login")}
          style={{
            flex: 1,
            padding: "8px 0",
            fontSize: 14,
            background: mode === "login" ? "#0d6efd" : "#f1f1f1",
            color: mode === "login" ? "#fff" : "#000",
            borderRadius: 6,
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          style={{
            flex: 1,
            padding: "8px 0",
            fontSize: 14,
            background: mode === "register" ? "#0d6efd" : "#f1f1f1",
            color: mode === "register" ? "#fff" : "#000",
            borderRadius: 6,
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          Crear cuenta
        </button>
      </div>

      <form onSubmit={mode === "login" ? handleLogin : handleRegister}>
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 13, display: "block", marginBottom: 4 }}>
            Correo electrónico
          </label>
          <input
            type="email"
            required
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            placeholder="ejemplo@correo.com"
            style={{
              width: "100%",
              padding: 8,
              fontSize: 14,
              boxSizing: "border-box",
              borderRadius: 6,
              border: "1px solid #d4d4d4",
            }}
          />
          <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>
            Aquí va tu correo (por ejemplo, tu Gmail).
          </div>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 13, display: "block", marginBottom: 4 }}>
            Contraseña
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            style={{
              width: "100%",
              padding: 8,
              fontSize: 14,
              boxSizing: "border-box",
              borderRadius: 6,
              border: "1px solid #d4d4d4",
            }}
          />
          <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>
            Aquí va la contraseña que usarás para iniciar sesión.
          </div>
        </div>

        {error && (
          <div style={{ color: "#b00020", fontSize: 13, marginBottom: 8 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "8px 0",
            fontSize: 15,
            borderRadius: 6,
            border: "none",
            background: "#0d6efd",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {loading
            ? "Procesando..."
            : mode === "login"
            ? "Iniciar sesión"
            : "Registrarme"}
        </button>
      </form>
    </div>
  );
}
