import { useState } from "react";
import { login, register } from "../services/authService";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = {
  teal: "#1A3A4A",
  oro: "#C9A24A",
  marfil: "#F5F1E8",
  pergamino: "#D6D0C4",
};

export default function Login({ onLogin }) {
  const [modo, setModo] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMensaje("");

    if (modo === "login") {
      setLoading(true);
      const { error: err } = await login(email, password);
      if (err) {
        if (err.message === "Invalid login credentials") {
          setError("Correo o contraseña incorrectos.");
        } else {
          setError(err.message);
        }
        setLoading(false);
        return;
      }
      onLogin();
    } else {
      if (password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres.");
        return;
      }
      setLoading(true);
      const { error: err } = await register(email, password, nombre || undefined);
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      setMensaje("Cuenta creada. Revisa tu correo para confirmar (si aplica). Luego inicia sesión.");
      setModo("login");
      setLoading(false);
    }
  }

  function toggleModo() {
    setModo((prev) => (prev === "login" ? "registro" : "login"));
    setError("");
    setMensaje("");
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: COLORS.marfil,
      padding: 20,
    }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={modo}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          style={{
            background: "white",
            border: `1px solid ${COLORS.pergamino}`,
            borderTop: `4px solid ${COLORS.oro}`,
            borderRadius: 4,
            padding: "40px 36px",
            width: "100%",
            maxWidth: 400,
            boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
          }}
        >
        {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src="/logo-academia.png" alt="Academia del Espíritu Logo" style={{ maxWidth: 190, height: 'auto', marginBottom: 10 }} />
          <div style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 18,
            color: COLORS.teal,
            letterSpacing: "2px",
            textTransform: "uppercase",
            lineHeight: 1.5,
            marginBottom: 6,
          }}>
            Academia<br />del Espíritu
          </div>
            <div style={{
              fontSize: 12,
              color: COLORS.oro,
              fontFamily: "'Cinzel', serif",
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}>
              {modo === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Nombre (solo registro) */}
            {modo === "registro" && (
              <div style={{ marginBottom: 18 }}>
                <label style={{
                  display: "block",
                  fontSize: 11,
                  fontFamily: "'Cinzel', serif",
                  color: COLORS.teal,
                  letterSpacing: "1px",
                  marginBottom: 6,
                }}>
                  Tu nombre
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: María Pérez"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: `1px solid ${COLORS.pergamino}`,
                    borderRadius: 2,
                    fontSize: 14,
                    outline: "none",
                    background: COLORS.marfil,
                    color: COLORS.teal,
                    boxSizing: "border-box",
                    fontFamily: "'EB Garamond', Georgia, serif",
                  }}
                />
              </div>
            )}

            <div style={{ marginBottom: 18 }}>
              <label style={{
                display: "block",
                fontSize: 11,
                fontFamily: "'Cinzel', serif",
                color: COLORS.teal,
                letterSpacing: "1px",
                marginBottom: 6,
              }}>
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: `1px solid ${COLORS.pergamino}`,
                  borderRadius: 2,
                  fontSize: 14,
                  outline: "none",
                  background: COLORS.marfil,
                  color: COLORS.teal,
                  boxSizing: "border-box",
                  fontFamily: "'EB Garamond', Georgia, serif",
                }}
              />
            </div>

            <div style={{ marginBottom: modo === "login" ? 24 : 6 }}>
              <label style={{
                display: "block",
                fontSize: 11,
                fontFamily: "'Cinzel', serif",
                color: COLORS.teal,
                letterSpacing: "1px",
                marginBottom: 6,
              }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: `1px solid ${COLORS.pergamino}`,
                  borderRadius: 2,
                  fontSize: 14,
                  outline: "none",
                  background: COLORS.marfil,
                  color: COLORS.teal,
                  boxSizing: "border-box",
                  fontFamily: "'EB Garamond', Georgia, serif",
                }}
              />
            </div>

             {modo === "registro" && (
              <p style={{ fontSize: 11, color: "#666666", fontStyle: "italic", marginBottom: 24 }}>
                Mínimo 6 caracteres
              </p>
            )}

            {error && (
              <p style={{
                fontSize: 13,
                color: "#a32d2d",
                marginBottom: 16,
                fontStyle: "italic",
                textAlign: "center",
              }}>
                {error}
              </p>
            )}

            {mensaje && (
              <p style={{
                fontSize: 13,
                color: "#276749",
                marginBottom: 16,
                fontStyle: "italic",
                textAlign: "center",
              }}>
                {mensaje}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: COLORS.oro,
                color: COLORS.teal,
                border: "none",
                padding: "12px 0",
                borderRadius: 2,
                fontFamily: "'Cinzel', serif",
                fontSize: 12,
                letterSpacing: "2px",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = "0.85"; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.opacity = "1"; }}
            >
              {loading
                ? "Procesando..."
                : modo === "login" ? "Ingresar" : "Crear cuenta"}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: "center" }}>
            <span
              onClick={toggleModo}
              style={{
                fontSize: 12,
                color: COLORS.oro,
                cursor: "pointer",
                fontFamily: "'Cinzel', serif",
                letterSpacing: "1px",
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.teal; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.oro; }}
            >
              {modo === "login"
                ? "¿No tienes cuenta? Regístrate"
                : "¿Ya tienes cuenta? Inicia sesión"}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
