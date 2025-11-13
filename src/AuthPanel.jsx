// src/AuthPanel.jsx
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function extractErrorMessage(data, fallback = "Error") {
  if (!data) return fallback;

  // FastAPI típico: {"detail": "..."} o {"detail":[{"msg": "..."}]}
  if (typeof data.detail === "string") return data.detail;

  if (Array.isArray(data.detail)) {
    const msgs = data.detail
      .map((d) => d?.msg)
      .filter(Boolean);
    if (msgs.length) return msgs.join(" | ");
  }

  return fallback;
}

export function AuthPanel({ token, email, onLogin, onLogout }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [formEmail, setFormEmail] = useState(email || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔐 LOGIN → usa form-urlencoded (username + password)
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
        const msg = extractErrorMessage(
          data,
          "Error al iniciar sesión"
        );
        throw new Error(msg);
      }

      const token = data.access_token;
      if (!token) throw new Error("Respuesta sin token");

      // Guardar estado y localStorage
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

  // 🧾 REGISTRO → sigue siendo JSON
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1) registrar usuario
      const resReg = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formEmail,
          password,
        }),
      });

      const dataReg = await resReg.json().catch(() => null);
      if (!resReg.ok) {
        const msg = extractErrorMessage(
          dataReg,
          "Error al registrar"
        );
        throw new Error(msg);
      }

      // 2) loguear automáticamente tras registrar
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

  const handleLogoutClick = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_email");
    onLogout?.();
  };

  // ✅ Si ya está logueado, solo mostramos info + botón "Cerrar sesión"
  if (token) {
    return (
      <div style={{ marginBottom: 20 }}>
        <p style={{ margin: 0, fontSize: 14 }}>
          Sesión iniciada como <b>{email}</b>
        </p>
        <button
          type="button"
          style={{ marginTop: 8, padding: "6px 12px", fontSize: 14 }}
          onClick={handleLogoutClick}
        >
          Cerrar sesión
        </button>
      </div>
    );
  }

  // 🧾 Formulario login / registro
  return (
    <div
      style={{
        marginBottom: 20,
        background: "#f0f0f0",
        padding: 12,
        borderRadius: 6,
        color: "#000",
      }}
    >
      <div style={{ marginBottom: 8, display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={() => setMode("login")}
          style={{
            padding: "4px 8px",
            fontSize: 14,
            background: mode === "login" ? "#007bff" : "#ffffff",
            color: mode === "login" ? "#fff" : "#000",
            borderRadius: 4,
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
            padding: "4px 8px",
            fontSize: 14,
            background: mode === "register" ? "#007bff" : "#ffffff",
            color: mode === "register" ? "#fff" : "#000",
            borderRadius: 4,
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          Crear cuenta
        </button>
      </div>

      <form onSubmit={mode === "login" ? handleLogin : handleRegister}>
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontSize: 13 }}>
            Correo (puede ser Gmail)
            <input
              type="email"
              required
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              style={{ width: "100%", padding: 6, marginTop: 4, fontSize: 14 }}
            />
          </label>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontSize: 13 }}>
            Contraseña
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: 6, marginTop: 4, fontSize: 14 }}
            />
          </label>
        </div>

        {error && (
          <div style={{ color: "#b00020", fontSize: 13, marginBottom: 4 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ padding: "6px 12px", fontSize: 14 }}
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
