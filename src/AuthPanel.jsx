// src/AuthPanel.jsx
import { useState } from "react";
import { validateEmail } from "./utils/emailValidator";

const API_BASE = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

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
  
  // Estados para validación en tiempo real
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Validar email cuando cambia
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setFormEmail(value);
    
    if (emailTouched && value) {
      const validation = validateEmail(value);
      setEmailError(validation.error || "");
    }
  };

  // Marcar como tocado cuando pierde el foco
  const handleEmailBlur = () => {
    setEmailTouched(true);
    if (formEmail) {
      const validation = validateEmail(formEmail);
      setEmailError(validation.error || "");
    }
  };

  // Validar antes de enviar
  const validateForm = () => {
    // Validar email
    const emailValidation = validateEmail(formEmail);
    if (!emailValidation.isValid) {
      setError(emailValidation.error);
      setEmailError(emailValidation.error);
      return false;
    }

    // Validar contraseña
    if (!password || password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    return true;
  };

  // LOGIN (OAuth2 password, form-urlencoded)
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validar formulario
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Usar el email normalizado (lowercase, trimmed)
      const emailValidation = validateEmail(formEmail);
      const normalizedEmail = emailValidation.email;

      const body = new URLSearchParams();
      body.append("username", normalizedEmail);
      body.append("password", password);

      const res = await fetch(`${API_BASE}/auth/login`, {
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

      onLogin?.(token, normalizedEmail);
      localStorage.setItem("token", token);
      localStorage.setItem("user_email", normalizedEmail);
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
    
    // Validar formulario
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Usar el email normalizado
      const emailValidation = validateEmail(formEmail);
      const normalizedEmail = emailValidation.email;

      const resReg = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      const dataReg = await resReg.json().catch(() => null);
      if (!resReg.ok) {
        const msg = extractErrorMessage(dataReg, "Error al registrar");
        throw new Error(msg);
      }

      const body = new URLSearchParams();
      body.append("username", normalizedEmail);
      body.append("password", password);

      const resLogin = await fetch(`${API_BASE}/auth/login`, {
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

      onLogin?.(token, normalizedEmail);
      localStorage.setItem("token", token);
      localStorage.setItem("user_email", normalizedEmail);
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
          onClick={() => {
            setMode("login");
            setError("");
            setEmailError("");
          }}
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
          onClick={() => {
            setMode("register");
            setError("");
            setEmailError("");
          }}
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
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            placeholder="ejemplo@correo.com"
            style={{
              width: "100%",
              padding: 8,
              fontSize: 14,
              boxSizing: "border-box",
              borderRadius: 6,
              border: `1px solid ${emailError ? "#dc3545" : "#d4d4d4"}`,
              outline: emailError ? "2px solid #dc354520" : "none",
            }}
          />
          
          {/* Mensaje de error del email */}
          {emailError && emailTouched && (
            <div style={{ 
              fontSize: 12, 
              color: "#dc3545", 
              marginTop: 4,
              fontWeight: 500 
            }}>
              ⚠️ {emailError}
            </div>
          )}
          
          {/* Ayuda contextual */}
          {!emailError && (
            <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>
              Ejemplo: usuario@gmail.com
            </div>
          )}
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
            Mínimo 6 caracteres
          </div>
        </div>

        {error && (
          <div style={{ 
            color: "#b00020", 
            fontSize: 13, 
            marginBottom: 8,
            padding: "8px 12px",
            background: "#ffebee",
            borderRadius: 6,
            border: "1px solid #ef5350"
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (emailTouched && !!emailError)}
          style={{
            width: "100%",
            padding: "10px 0",
            fontSize: 15,
            borderRadius: 6,
            border: "none",
            background: (loading || (emailTouched && emailError)) ? "#94a3b8" : "#0d6efd",
            color: "#fff",
            cursor: (loading || (emailTouched && emailError)) ? "not-allowed" : "pointer",
            fontWeight: "600",
            transition: "all 0.2s ease",
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