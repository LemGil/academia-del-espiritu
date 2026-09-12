import { useEffect, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { logout } from "./services/authService";
import Login from "./portal/Login";
import App from "./App";
import PortalAppInner from "./portal/PortalAppInner";
import VerificarCertificado from "./components/VerificarCertificado";

const COLORS = {
  teal: "#1A3A4A",
  oro: "#C9A24A",
  marfil: "#F5F1E8",
  pergamino: "#D6D0C4",
};

export default function RootApp() {
  const { user, profile, loading, refresh } = useAuth();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    if (!loading) setAppReady(true);
  }, [loading]);

  async function handleLogin() {
    await refresh();
  }

  async function handleLogout() {
    await logout();
    await refresh();
  }

  if (loading || !appReady) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: COLORS.marfil,
      }}>
        <p style={{ color: "#888", fontStyle: "italic", fontSize: 15 }}>
          Cargando...
        </p>
      </div>
    );
  }

  // Public verification page
  const params = new URLSearchParams(window.location.search);
  const codigoVerif = params.get("codigo");
  if (codigoVerif) {
    return <VerificarCertificado codigo={codigoVerif} />;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Admin / Instructor → panel de administración
  if (profile && (profile.rol === "admin" || profile.rol === "instructor")) {
    return <App onLogout={handleLogout} />;
  }

  // Estudiante → portal del estudiante
  if (profile && profile.rol === "estudiante") {
    return <PortalAppInner profile={profile} user={user} onLogout={handleLogout} />;
  }

  // Logged in but no recognized profile
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: COLORS.marfil,
      padding: 20,
    }}>
      <div style={{
        background: "white",
        border: "1px solid #D6D0C4",
        borderTop: "4px solid #C9A24A",
        borderRadius: 4,
        padding: "40px 36px",
        textAlign: "center",
        maxWidth: 400,
      }}>
        <p style={{ fontSize: 16, color: COLORS.teal, marginBottom: 12 }}>
          {profile
            ? "Tu perfil no tiene acceso al portal."
            : "No se encontró un perfil asociado a tu cuenta."}
        </p>
        <p style={{ fontSize: 13, color: "#999", fontStyle: "italic", marginBottom: 24 }}>
          Contacta con el administrador de la academia.
        </p>
        <button
          onClick={handleLogout}
          style={{
            background: COLORS.oro,
            color: COLORS.teal,
            border: "none",
            padding: "10px 24px",
            borderRadius: 2,
            fontFamily: "'Cinzel', serif",
            fontSize: 11,
            letterSpacing: "2px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
